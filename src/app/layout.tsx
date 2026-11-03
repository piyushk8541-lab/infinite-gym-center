import type { Metadata } from "next";
import "./globals.css";
import { DemoBanner } from "@/components/layout/demo-banner";

export const metadata: Metadata = {
  title: {
    default: "INFINITE GYM CENTER | Train Smarter. Go Infinite.",
    template: "%s | INFINITE GYM CENTER",
  },
  description:
    "Premium American fitness club management, membership and smart session booking platform. Train smarter, get stronger, go infinite.",
  keywords: ["gym", "fitness", "membership", "booking", "personal training", "Infinite Gym Center"],
  openGraph: {
    title: "INFINITE GYM CENTER",
    description: "Premium gym management, membership and smart booking platform.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ink-950 font-sans antialiased">
        <DemoBanner />
        {children}
      </body>
    </html>
  );
}
