import { PieceProvider } from "./components/PieceContext";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossOrigin="anonymous"></link>
        <meta name="theme-color" content="#165016"/>
        <link rel="icon" href="/logo_scacchi.svg" type="image/svg" />
      </head>
      <body>
        <div><Toaster/></div>
        <PieceProvider>
          {children}
        </PieceProvider>
      </body>
    </html>
  );
}
