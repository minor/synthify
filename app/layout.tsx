import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { EdgeStoreProvider } from "./lib/edgestore";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Synthify – synthetic data at your fingertips",
  description:
    "Easily generate synthetic data for your projects using state-of-the-art language models",
  openGraph: {
    title: "Synthify – synthetic data at your fingertips",
    description:
      "Easily generate synthetic data for your projects using state-of-the-art language models",
    images: "/synthify-cover.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <EdgeStoreProvider>{children}</EdgeStoreProvider>
      </body>
    </html>
  );
}
