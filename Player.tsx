"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { playlists as ALL_PLAYLISTS, type Track } from "@/lib/tracks";
import { YT } from "@/lib/youtube-types";

// ---------------------------------------------------------------------------
// Engine: owns the single YT.Player instance and all playback state.
// The player's iframe DOM node is created once and reparented between the
// desktop and mobile artwork slots depending on viewport, so there is only
// ever one live YouTube embed (never a hidden/duplicate player).
// ---------------------------------------------------------------------------

type PlaybackStatus = "idle" | "cued" | "playing" | "paused" | "buffering";

type EngineState = {
  playlistIndex: number;
  trackIndex: number;
  status: PlaybackStatus;
  currentTime: number;
  duration: number;
};

type EngineApi = EngineState & {
  playlists: typeof ALL_PLAYLISTS;
  currentTrack: Track | null;
  mountRef: (el: HTMLDivElement | null) => void;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (seconds: number) => void;
  selectPlaylist: (index: number) => void;
  selectTrack: (index: number) => void;
};

const PlayerContext = createContext<EngineApi | null>(null);

function playableIndex(playlistIndex: number, fromTrackIndex: number, direction: 1 | -1) {
  const tracks = ALL_PLAYLISTS[playlistIndex].tracks;
  const n = tracks.length;
  for (let step = 1; step <= n; step++) {
    const idx = ((fromTrackIndex + direction * step) % n + n) % n;
    if (tracks[idx].videoId) return idx;
  }
  return fromTrackIndex;
}

function firstPlayableIndex(playlistIndex: number) {
  const tracks = ALL_PLAYLISTS[playlistIndex].tracks;
  const idx = tracks.findIndex((t) => t.videoId);
  return idx === -1 ? 0 : idx;
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [playlistIndex, setPlaylistIndex] = useState(0);
  const [trackIndex, setTrackIndex] = useState(() => firstPlayableIndex(0));
  const [status, setStatus] = useState<PlaybackStatus>("idle");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const ytPlayerRef = useRef<YT.Player | null>(null);
  const mountNodeRef = useRef<HTMLDivElement | null>(null); // the persistent iframe host
  const activeSlotRef = useRef<HTMLDivElement | null>(null); // wherever it's currently attached
  const tickRef = useRef<number | null>(null);

  const currentTrack = ALL_PLAYLISTS[playlistIndex]?.tracks[trackIndex] ?? null;

  // Create the persistent mount node once.
  useEffect(() => {
    const node = document.createElement("div");
    node.style.width = "100%";
    node.style.height = "100%";
    mountNodeRef.current = node;
  }, []);

  // Load the YouTube IFrame API once.
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      initPlayer();
      return;
    }
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => initPlayer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function initPlayer() {
    if (!mountNodeRef.current || ytPlayerRef.current) return;
    const host = document.createElement("div");
    mountNodeRef.current.appendChild(host);

    ytPlayerRef.current = new window.YT.Player(host, {
      width: "100%",
      height: "100%",
      playerVars: { playsinline: 1, controls: 1, modestbranding: 1, rel: 0 },
      events: {
        onReady: () => {
          const track = ALL_PLAYLISTS[playlistIndex].tracks[trackIndex];
          if (track?.videoId) {
            ytPlayerRef.current?.cueVideoById(track.videoId);
            setStatus("cued");
          }
        },
        onStateChange: (e) => {
          switch (e.data) {
            case YT.PlayerState.PLAYING:
              setStatus("playing");
              setDuration(ytPlayerRef.current?.getDuration() ?? 0);
              break;
            case YT.PlayerState.PAUSED:
              setStatus("paused");
              break;
            case YT.PlayerState.BUFFERING:
              setStatus("buffering");
              break;
            case YT.PlayerState.ENDED:
              goRelative(1);
              break;
            default:
              break;
          }
        },
        onError: (e) => {
          // Track got pulled or embedding disabled after ship — skip forward.
          console.warn("[player] video error", { code: e.data, videoId: currentTrack?.videoId });
          if (typeof window !== "undefined" && "gtag" in window) {
            // @ts-expect-error optional analytics hook, present only if wired up
            window.gtag?.("event", "youtube_playback_error", {
              code: e.data,
              video_id: currentTrack?.videoId,
            });
          }
          goRelative(1);
        },
      },
    });
  }

  // Progress ticker while playing.
  useEffect(() => {
    if (status !== "playing") {
      if (tickRef.current) cancelAnimationFrame(tickRef.current);
      return;
    }
    const tick = () => {
      const t = ytPlayerRef.current?.getCurrentTime();
      if (typeof t === "number") setCurrentTime(t);
      tickRef.current = requestAnimationFrame(tick);
    };
    tickRef.current = requestAnimationFrame(tick);
    return () => {
      if (tickRef.current) cancelAnimationFrame(tickRef.current);
    };
  }, [status]);

  function goRelative(direction: 1 | -1) {
    const idx = playableIndex(playlistIndex, trackIndex, direction);
    loadTrack(playlistIndex, idx, true);
  }

  function loadTrack(pIdx: number, tIdx: number, autoplay: boolean) {
    setPlaylistIndex(pIdx);
    setTrackIndex(tIdx);
    setCurrentTime(0);
    const track = ALL_PLAYLISTS[pIdx].tracks[tIdx];
    if (!track?.videoId || !ytPlayerRef.current) {
      setStatus("idle");
      return;
    }
    if (autoplay) {
      ytPlayerRef.current.loadVideoById(track.videoId);
    } else {
      ytPlayerRef.current.cueVideoById(track.videoId);
      setStatus("cued");
    }
  }

  const api: EngineApi = {
    playlists: ALL_PLAYLISTS,
    playlistIndex,
    trackIndex,
    status,
    currentTime,
    duration,
    currentTrack,
    mountRef: useCallback((el: HTMLDivElement | null) => {
      // Reparent the persistent iframe host into whichever slot mounted.
      activeSlotRef.current = el;
      if (el && mountNodeRef.current && el !== mountNodeRef.current.parentElement) {
        el.appendChild(mountNodeRef.current);
      }
    }, []),
    play: () => ytPlayerRef.current?.playVideo(),
    pause: () => ytPlayerRef.current?.pauseVideo(),
    toggle: () => {
      if (status === "playing") ytPlayerRef.current?.pauseVideo();
      else ytPlayerRef.current?.playVideo();
    },
    next: () => goRelative(1),
    prev: () => goRelative(-1),
    seek: (seconds: number) => ytPlayerRef.current?.seekTo(seconds, true),
    selectPlaylist: (index: number) => loadTrack(index, firstPlayableIndex(index), true),
    selectTrack: (index: number) => loadTrack(playlistIndex, index, true),
  };

  return <PlayerContext.Provider value={api}>{children}</PlayerContext.Provider>;
}

function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}

// ---------------------------------------------------------------------------
// Module-scope subcomponents — declared here, not inside MusicPlayer, so
// they keep a stable identity across renders and the vinyl's spin animation
// never restarts.
// ---------------------------------------------------------------------------

function formatTime(s: number) {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function Vinyl({ size }: { size: number }) {
  const { mountRef, status } = usePlayer();
  return (
    <div
      className="relative shrink-0 self-start rounded-full ring-1 ring-white/15"
      style={{ width: size, height: size }}
    >
      <div
        ref={mountRef}
        className="h-full w-full overflow-hidden rounded-full [&_iframe]:h-full [&_iframe]:w-full"
        style={{
          animation: "spin 8s linear infinite",
          animationPlayState: status === "playing" ? "running" : "paused",
        }}
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/70 ring-2 ring-white/40"
        aria-hidden
      />
    </div>
  );
}

function TrackInfo({ titleClass, artistClass }: { titleClass: string; artistClass: string }) {
  const { currentTrack } = usePlayer();
  return (
    <div className="min-w-0 flex-1">
      <p className={`truncate ${titleClass}`}>{currentTrack?.title ?? "Nothing cued"}</p>
      <p className={`truncate ${artistClass}`}>
        {currentTrack ? `${currentTrack.artist} — ${currentTrack.film}` : "Add a track to begin"}
      </p>
    </div>
  );
}

function SeekBar({ className = "" }: { className?: string }) {
  const { currentTime, duration, seek } = usePlayer();
  const railRef = useRef<HTMLDivElement | null>(null);
  const [dragRatio, setDragRatio] = useState<number | null>(null);

  const ratio = dragRatio ?? (duration > 0 ? currentTime / duration : 0);

  const ratioFromEvent = (e: React.PointerEvent) => {
    const rail = railRef.current;
    if (!rail) return 0;
    const rect = rail.getBoundingClientRect();
    return Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragRatio(ratioFromEvent(e));
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragRatio === null) return;
    setDragRatio(ratioFromEvent(e));
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragRatio === null) return;
    const r = ratioFromEvent(e);
    seek(r * duration);
    setDragRatio(null);
  };

  return (
    <div
      className={`group relative flex h-6 w-full touch-none items-center ${className}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <div ref={railRef} className="relative h-[3px] w-full rounded-full bg-white/15">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]"
          style={{ width: `${ratio * 100}%` }}
        />
        <div
          className="absolute top-1/2 h-3 w-3 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white opacity-0 shadow transition-opacity group-hover:opacity-100"
          style={{ left: `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
}

function ElapsedDuration({ className = "" }: { className?: string }) {
  const { currentTime, duration } = usePlayer();
  return (
    <span className={`tabular-nums text-[10.5px] text-white/60 ${className}`}>
      {formatTime(currentTime)} / {formatTime(duration)}
    </span>
  );
}

function IconButton({
  onClick,
  label,
  size = 20,
  children,
}: {
  onClick: () => void;
  label: string;
  size?: number;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex items-center justify-center rounded-full text-white/80 transition hover:text-white active:scale-95"
      style={{ width: Math.max(size, 44), height: Math.max(size, 44) }}
    >
      {children}
    </button>
  );
}

function PlayButton({ size }: { size: number }) {
  const { status, toggle } = usePlayer();
  const playing = status === "playing";
  return (
    <button
      type="button"
      aria-label={playing ? "Pause" : "Play"}
      onClick={toggle}
      className="flex shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[var(--accent)] to-[var(--accent-dark)] ring-1 ring-white/25 transition active:scale-95"
      style={{
        width: size,
        height: size,
        boxShadow: "0 8px 24px -6px var(--accent)",
      }}
    >
      {playing ? <PauseIcon /> : <PlayIcon />}
    </button>
  );
}

function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
function PauseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
      <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
    </svg>
  );
}
function PrevIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
    </svg>
  );
}
function NextIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 6h2v12h-2zM6 6l8.5 6L6 18z" />
    </svg>
  );
}

function Transport({ playSize = 44 }: { playSize?: number }) {
  const { prev, next } = usePlayer();
  return (
    <div className="flex items-center gap-1.5">
      <IconButton label="Previous track" onClick={prev}>
        <PrevIcon />
      </IconButton>
      <PlayButton size={playSize} />
      <IconButton label="Next track" onClick={next}>
        <NextIcon />
      </IconButton>
    </div>
  );
}

const glassPill =
  "border border-white/10 bg-gradient-to-b from-white/[0.15] to-white/[0.055] backdrop-blur-3xl backdrop-saturate-[1.7] shadow-[0_16px_48px_-12px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.2)]";

function DesktopPlayer() {
  return (
    <div className={`hidden sm:flex w-full items-center gap-4 rounded-full p-3 pr-5 ${glassPill}`}>
      <Vinyl size={80} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <TrackInfo titleClass="text-[15px] font-semibold text-white" artistClass="text-[12.5px] text-white/70" />
        <div className="flex items-center gap-3">
          <SeekBar className="flex-1" />
          <ElapsedDuration />
        </div>
      </div>
      <Transport playSize={44} />
    </div>
  );
}

function MobilePlayer() {
  return (
    <div className={`sm:hidden flex w-full flex-col gap-3 rounded-[26px] p-4 ${glassPill}`}>
      <div className="flex items-center gap-3">
        <Vinyl size={64} />
        <TrackInfo titleClass="text-[15px] font-semibold text-white" artistClass="text-[12.5px] text-white/70" />
      </div>
      <SeekBar />
      <div className="flex items-center justify-between">
        <ElapsedDuration />
        <Transport playSize={52} />
        <span className="w-[70px]" aria-hidden />
      </div>
    </div>
  );
}

export function MusicPlayer() {
  return (
    <div className="w-full max-w-xl">
      <DesktopPlayer />
      <MobilePlayer />
    </div>
  );
}

export function PlaylistTabs() {
  const { playlists, playlistIndex, selectPlaylist } = usePlayer();
  return (
    <div className="mb-3 flex w-full max-w-xl flex-wrap justify-center gap-2">
      {playlists.map((pl, i) => (
        <button
          key={pl.id}
          onClick={() => selectPlaylist(i)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
            i === playlistIndex
              ? "bg-white/20 text-white"
              : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/90"
          }`}
        >
          {pl.name}
        </button>
      ))}
    </div>
  );
}
