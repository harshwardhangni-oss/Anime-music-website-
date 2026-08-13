import { SceneBackground } from "@/components/SceneBackground";
import { TopRow } from "@/components/TopRow";
import { MusicPlayer, PlaylistTabs, PlayerProvider } from "@/components/Player";

export default function Home() {
  return (
    <main className="relative flex min-h-dvh flex-1 flex-col items-center justify-between overflow-hidden">
      <SceneBackground />
      <TopRow />

      <PlayerProvider>
        <div
          className="mt-auto flex w-full flex-col items-center"
          style={{
            paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
            paddingLeft: "max(1rem, env(safe-area-inset-left))",
            paddingRight: "max(1rem, env(safe-area-inset-right))",
          }}
        >
          <PlaylistTabs />
          <MusicPlayer />
        </div>
      </PlayerProvider>
    </main>
  );
}
