import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ConcertPrep",
  description: "Discover the songs you should know before your next concert.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}