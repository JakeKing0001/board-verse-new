import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/about", "/challenge", "/gameMode", "/online", "/register"],
      disallow: [
        "/api/",
        "/chessboard",
        "/chooseTime",
        "/friends",
        "/profile",
        "/settingsProfile",
        "/statistics",
      ],
    },
  };
}
