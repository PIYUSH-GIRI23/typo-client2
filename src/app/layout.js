import "./globals.css";

export const metadata = {
  title: "Typo - Typing Speed Test",
  description: "Improve your typing speed with Typo",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-white">
        {children}
      </body>
    </html>
  );
}
