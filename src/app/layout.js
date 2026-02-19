import "./globals.css";
import Providers from "@/app/state/providers";

export const metadata = {
  title: "Typo - Typing Speed Test",
  description: "Improve your typing speed with Typo",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
