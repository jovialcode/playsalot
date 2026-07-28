import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "playsalot",
  description: "Play board games online with friends",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
