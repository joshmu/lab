import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lab - Experiments Registry",
  description: "A collection of web development experiments and explorations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
      </body>
    </html>
  );
}
