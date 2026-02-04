import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Orvex Operators Backend",
  description: "Task submission and operator review API",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
