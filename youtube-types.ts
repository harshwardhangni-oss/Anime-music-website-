export {};

declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady?: () => void;
  }
}

// Minimal shape of the parts of the YT namespace this app uses.
export namespace YT {
  export enum PlayerState {
    UNSTARTED = -1,
    ENDED = 0,
    PLAYING = 1,
    PAUSED = 2,
    BUFFERING = 3,
    CUED = 5,
  }

  export interface OnStateChangeEvent {
    data: PlayerState;
    target: Player;
  }

  export interface OnErrorEvent {
    data: number;
    target: Player;
  }

  export interface PlayerEvents {
    onReady?: (event: { target: Player }) => void;
    onStateChange?: (event: OnStateChangeEvent) => void;
    onError?: (event: OnErrorEvent) => void;
  }

  export interface PlayerVars {
    autoplay?: 0 | 1;
    controls?: 0 | 1;
    playsinline?: 0 | 1;
    modestbranding?: 0 | 1;
    rel?: 0 | 1;
    origin?: string;
  }

  export class Player {
    constructor(
      elementId: string | HTMLElement,
      options: {
        videoId?: string;
        width?: string | number;
        height?: string | number;
        playerVars?: PlayerVars;
        events?: PlayerEvents;
      }
    );
    playVideo(): void;
    pauseVideo(): void;
    seekTo(seconds: number, allowSeekAhead: boolean): void;
    loadVideoById(videoId: string): void;
    cueVideoById(videoId: string): void;
    getCurrentTime(): number;
    getDuration(): number;
    getPlayerState(): PlayerState;
    destroy(): void;
  }
}
