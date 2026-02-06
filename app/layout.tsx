import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import AdminFooterLink from "@/components/AdminFooterLink";
import ShootingStarTrail from "@/components/ShootingStarTrail";

export const metadata: Metadata = {
  title: "Orvex Console Operators",
  description: "Deploy on testnet. Earn Command Points. Rise through operator ranks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-poppins">
        <Providers>
          <ShootingStarTrail />
          {children}
          <AdminFooterLink />
        </Providers>
      </body>
    </html>
  );
}
