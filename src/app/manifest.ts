import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BoardVerse",
    short_name: "BoardVerse",
    description: "Partite, challenge e progressi per chi ama gli scacchi.",
    start_url: "/",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#166534",
    icons: [
      {
        src: "/logo_scacchi.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
