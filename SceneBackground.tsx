const GRAIN_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'>
      <filter id='n'>
        <feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/>
      </filter>
      <rect width='100%' height='100%' filter='url(#n)'/>
    </svg>`
  );

export function SceneBackground() {
  return (
    <>
      <div className="hero-bg fixed inset-0 -z-20 bg-cover bg-center" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/80" />
      </div>
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url("${GRAIN_SVG}")`,
          mixBlendMode: "overlay",
          opacity: 0.3,
        }}
        aria-hidden
      />
    </>
  );
}
