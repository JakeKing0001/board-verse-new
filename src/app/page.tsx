import type { Metadata } from "next";
import React from "react";
import MainPage from "./components/MainPage";

export const metadata: Metadata = {
  title: "Scacchi online e allenamento",
  description: "Gioca a scacchi, risolvi challenge e segui i tuoi progressi con BoardVerse.",
};

/**
 * The main entry point for the home page of the application.
 * 
 * Renders the {@link MainPage} component as the primary content.
 *
 * @returns {JSX.Element} The rendered home page component.
 */
export default function HomePage() {
  return <>
    <MainPage />
  </>
}
