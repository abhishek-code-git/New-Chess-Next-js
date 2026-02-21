import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "ChessMaster",
  description: "Play chess online, improve your skills, and earn real rewards.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
