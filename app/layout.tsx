import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import AdminFooterLink from "@/components/AdminFooterLink";

export const metadata: Metadata = {
  title: "Orvex Operators",
  description: "Complete tasks, earn rewards",
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
          {children}
          <AdminFooterLink />
        </Providers>
      </body>
    </html>
  );
}
