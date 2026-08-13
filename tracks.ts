export type Track = {
  id: string;
  title: string;
  artist: string;
  film: string;
  year: number;
  duration: number; // seconds, shown before the player has loaded real duration
  /**
   * YouTube video ID. LEFT BLANK ON PURPOSE.
   *
   * These are commercial anime openings/endings from major-label artists
   * (RADWIMPS, LiSA, YOASOBI, King Gnu, Ikimono Gakari, etc). Per the build
   * spec: only add songs you have the right to use, or that stream from the
   * rights holder's own YouTube upload with embedding enabled — and warn
   * before adding anything that looks copyrighted rather than searching for
   * or adding it automatically.
   *
   * To finish wiring a track: find the official/rights-holder upload on
   * YouTube yourself, confirm embedding is enabled, and paste the 11-char
   * video ID here. Tracks with an empty videoId are skipped by the player
   * and rendered as "unavailable" in the playlist UI.
   */
  videoId: string;
};

export type Playlist = {
  id: string;
  name: string;
  tracks: Track[];
};

export const playlists: Playlist[] = [
  {
    id: "shinkai",
    name: "Makoto Shinkai Cinematic Masterpieces",
    tracks: [
      { id: "t01", title: "Grand Escape", artist: "RADWIMPS ft. Toko Miura", film: "Weathering with You", year: 2019, duration: 274, videoId: "" },
      { id: "t02", title: "Sparkle", artist: "RADWIMPS", film: "Your Name.", year: 2016, duration: 456, videoId: "" },
      { id: "t03", title: "Suzume", artist: "RADWIMPS ft. Toaka", film: "Suzume", year: 2022, duration: 289, videoId: "" },
      { id: "t04", title: "Nandemonaiya", artist: "RADWIMPS", film: "Your Name.", year: 2016, duration: 292, videoId: "" },
      { id: "t05", title: "Is There Still Anything That Love Can Do?", artist: "RADWIMPS", film: "Weathering with You", year: 2019, duration: 247, videoId: "" },
    ],
  },
  {
    id: "naruto-aot",
    name: "Naruto & Attack on Titan Legends",
    tracks: [
      { id: "t06", title: "Blue Bird", artist: "Ikimono Gakari", film: "Naruto Shippuden", year: 2007, duration: 234, videoId: "" },
      { id: "t07", title: "Silhouette", artist: "KANA-BOON", film: "Naruto Shippuden", year: 2012, duration: 233, videoId: "" },
      { id: "t08", title: "GO!!!", artist: "FLOW", film: "Naruto", year: 2005, duration: 259, videoId: "" },
      { id: "t09", title: "Guren no Yumiya", artist: "Linked Horizon", film: "Attack on Titan", year: 2013, duration: 269, videoId: "" },
      { id: "t10", title: "The Rumbling", artist: "SiM", film: "Attack on Titan", year: 2022, duration: 240, videoId: "" },
      { id: "t11", title: "My War (Boku no Sensou)", artist: "Shinsei Kamattechan", film: "Attack on Titan", year: 2021, duration: 233, videoId: "" },
      { id: "t12", title: "Shinzou wo Sasageyo!", artist: "Linked Horizon", film: "Attack on Titan", year: 2014, duration: 269, videoId: "" },
    ],
  },
  {
    id: "modern-hits",
    name: "Modern Hits & Hype Openings",
    tracks: [
      { id: "t13", title: "Otonoke", artist: "Creepy Nuts", film: "Dandadan", year: 2024, duration: 233, videoId: "" },
      { id: "t14", title: "Bling-Bang-Bang-Born", artist: "Creepy Nuts", film: "Mashle: Magic and Muscles", year: 2024, duration: 213, videoId: "" },
      { id: "t15", title: "KICK BACK", artist: "Kenshi Yonezu", film: "Chainsaw Man", year: 2022, duration: 190, videoId: "" },
      { id: "t16", title: "Idol", artist: "YOASOBI", film: "Oshi no Ko", year: 2023, duration: 219, videoId: "" },
      { id: "t17", title: "SPECIALZ", artist: "King Gnu", film: "Jujutsu Kaisen", year: 2023, duration: 234, videoId: "" },
      { id: "t18", title: "Kaikai Kitan", artist: "Eve", film: "Jujutsu Kaisen", year: 2020, duration: 238, videoId: "" },
      { id: "t19", title: "Gurenge", artist: "LiSA", film: "Demon Slayer", year: 2019, duration: 224, videoId: "" },
      { id: "t20", title: "The Hero!!", artist: "JAM Project", film: "One Punch Man", year: 2015, duration: 246, videoId: "" },
    ],
  },
  {
    id: "classics",
    name: "All-Time Anime Classics",
    tracks: [
      { id: "t21", title: "A Cruel Angel's Thesis", artist: "Yoko Takahashi", film: "Neon Genesis Evangelion", year: 1995, duration: 259, videoId: "" },
      { id: "t22", title: "Unravel", artist: "TK from Ling Tosite Sigure", film: "Tokyo Ghoul", year: 2014, duration: 240, videoId: "" },
      { id: "t23", title: "Tank!", artist: "The Seatbelts", film: "Cowboy Bebop", year: 1998, duration: 259, videoId: "" },
      { id: "t24", title: "Again", artist: "YUI", film: "Fullmetal Alchemist: Brotherhood", year: 2009, duration: 220, videoId: "" },
      { id: "t25", title: "Hikaru Nara", artist: "Goose house", film: "Your Lie in April", year: 2014, duration: 235, videoId: "" },
      { id: "t26", title: "COLORS", artist: "FLOW", film: "Code Geass", year: 2006, duration: 254, videoId: "" },
      { id: "t27", title: "Crossing Field", artist: "LiSA", film: "Sword Art Online", year: 2012, duration: 239, videoId: "" },
      { id: "t28", title: "We Are!", artist: "Hiroshi Kitadani", film: "One Piece", year: 1999, duration: 259, videoId: "" },
      { id: "t29", title: "Butter-Fly", artist: "Koji Wada", film: "Digimon Adventure", year: 1999, duration: 263, videoId: "" },
      { id: "t30", title: "God knows...", artist: "Aya Hirano", film: "The Melancholy of Haruhi Suzumiya", year: 2006, duration: 271, videoId: "" },
    ],
  },
];
