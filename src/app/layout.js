import "./globals.css";
import Providers from "@/app/state/providers";
import Header from "@/app/components/header/Header";
import Search from "@/app/components/search/Search";
import Footer from "@/app/components/footer/Footer";
import FetchDetails from "@/app/components/account/FetchDetails"
export const metadata = {
  title: {
    default: "Typo — Smart, Minimalist & Fast Typing Speed Test",
    template: "%s | Typo"
  },
  description: "Typo is a modern, ultra-fast, and minimalist typing speed test application. Track your WPM, accuracy, raw speed, and global leaderboard rankings.",
  keywords: [
    "typing test",
    "typing speed test",
    "WPM test",
    "words per minute",
    "type practice",
    "touch typing",
    "typo",
    "keyboard speed test"
  ],
  authors: [{ name: "Typo" }],
  creator: "Typo",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://typo.piyx.me"),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://typo.piyx.me",
    title: "Typo — Smart, Minimalist & Fast Typing Speed Test",
    description: "Measure and elevate your typing speed with real-time statistics, custom tests, and global leaderboards.",
    siteName: "Typo"
  },
  twitter: {
    card: "summary_large_image",
    title: "Typo — Smart, Minimalist & Fast Typing Speed Test",
    description: "Measure and elevate your typing speed with real-time statistics, custom tests, and global leaderboards."
  }
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <FetchDetails />
          <Search />
          <main className="min-h-screen flex flex-col">
            <Header />
            <div className="flex-1">{children}</div>
            <Footer />
          </main>
        </Providers>
      </body>
    </html>
  );
}
