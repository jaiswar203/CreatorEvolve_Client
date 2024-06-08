import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import StoreProvider from "./StoreProvide";
import { Toaster } from "@/components/ui/toaster";
import SideBar from "@/components/sidebar/Sidebar";

const manrope = Manrope({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CreatorEvolve",
  description: "AI productivity toolkit for developers",
};

export default function RootLayout({
  children,
  
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/assets/icon.ico" sizes="any" />
      </head>
      <body className={manrope.className}>
        <StoreProvider>
          <SideBar>
            {children}
          </SideBar>
        </StoreProvider>
        <Toaster />
      </body>
    </html>
  );
}
