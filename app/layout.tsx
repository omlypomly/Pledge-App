import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pledge. — Accountability Challenges with Real Stakes",
  description:
    "Put your money where your goals are. Join friend groups, stake money, hit milestones, and win the prize pool.",
  keywords: ["accountability", "challenges", "fitness goals", "money stake", "friend groups"],
  openGraph: {
    title: "Pledge.",
    description: "Accountability challenges with real financial stakes",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#91C687",
          colorBackground: "#263228",
          colorInputBackground: "#2d3f2e",
          borderRadius: "0.75rem",
        },
      }}
    >
      <html lang="en" className="dark">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#303D31] text-white`}
        >
          {children}
          <Toaster
            theme="dark"
            position="top-right"
            toastOptions={{
              style: {
                background: "#2d3f2e",
                border: "1px solid rgba(145,198,135,0.3)",
                color: "white",
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
