import { PieceProvider } from "./components/PieceContext";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import localFont from "next/font/local";
import type { Metadata, Viewport } from "next";

const geist = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BoardVerse",
    template: "%s | BoardVerse",
  },
  description: "Gioca, allenati e misura i tuoi progressi negli scacchi.",
  icons: { icon: "/logo_scacchi.svg" },
  applicationName: "BoardVerse",
  category: "games",
  openGraph: {
    type: "website",
    locale: "it_IT",
    siteName: "BoardVerse",
    title: "BoardVerse",
    description: "Gioca, allenati e misura i tuoi progressi negli scacchi.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f7f6" },
    { media: "(prefers-color-scheme: dark)", color: "#06100f" },
  ],
};

/**
 * Root layout component for the application.
 *
 * @param children - The React node(s) to be rendered within the layout.
 * @returns The root HTML structure including metadata and context providers.
 *
 * @remarks
 * - Sets up the HTML document structure with language, viewport, theme color, and favicon.
 * - Wraps the application content with `PieceProvider` for context management.
 * - Renders a `Toaster` component for notifications.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" data-scroll-behavior="smooth">
      <body className={`${geist.variable} font-sans antialiased`}>
        <Toaster />
        <PieceProvider>
          {children}
        </PieceProvider>
      </body>
    </html>
  );
}
