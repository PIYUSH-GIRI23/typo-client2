import "./globals.css";
import Providers from "@/app/state/providers";
import Header from "@/app/components/header/Header";
import Search from "@/app/components/search/Search";
import Footer from "@/app/components/footer/Footer";

export const metadata = {
  title: "Typo - Typing Speed Test",
  description: "Improve your typing speed with Typo",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
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
