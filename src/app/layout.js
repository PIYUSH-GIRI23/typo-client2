import "./globals.css";
import Providers from "@/app/state/providers";
import Header from "@/app/components/header/Header";
import Search from "@/app/components/search/Search";
import Footer from "@/app/components/footer/Footer";
import FetchDetails from "@/app/components/account/FetchDetails"
import {stopRedis} from "@/app/init/redis.js";

// Handle graceful shutdown for Redis when the server is stopped
if (typeof window === "undefined") {
  process.on("SIGINT", async () => {
    console.log("Received SIGINT, shutting down gracefully...");
    await stopRedis();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    console.log("Received SIGTERM, shutting down gracefully...");
    await stopRedis();
    process.exit(0);
  });
}
export const metadata = {
  title: "Typo - Typing Speed Test",
  description: "Improve your typing speed with Typo",
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
