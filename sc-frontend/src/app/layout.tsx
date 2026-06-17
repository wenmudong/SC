import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/Navbar";
import FloatingAvatar from "@/components/FloatingAvatar";
import Providers from "@/components/Providers";
import { getUserLanguage } from "@/lib/auth";

// 使用本地字体，避免Docker构建时无法访问Google Fonts的问题
const geistSans = localFont({
  src: "../../node_modules/geist/dist/fonts/geist-sans/Geist-Regular.woff2",
  variable: "--font-geist-sans",
  display: "swap",
  fallback: ["system-ui", "arial", "sans-serif"],
});

const geistMono = localFont({
  src: "../../node_modules/geist/dist/fonts/geist-mono/GeistMono-Regular.woff2",
  variable: "--font-geist-mono",
  display: "swap",
  fallback: ["monospace"],
});

export const metadata: Metadata = {
  title: "SuperCenter",
  description: "Personal website",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const language = await getUserLanguage();

  return (
    <html
      lang={language}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers initialLanguage={language}>
          <div className="mx-auto w-full max-w-screen-sm px-8 md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-2xl">
            <Navbar />
            <main className="pb-8">{children}</main>
          </div>
          {/* 悬浮头像放在容器外面，完全脱离文档流 */}
          <FloatingAvatar />
        </Providers>
      </body>
    </html>
  );
}
