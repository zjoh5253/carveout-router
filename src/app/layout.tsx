import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Carveout Router",
  description: "Route M&A deal documents to the right buyer contacts",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
