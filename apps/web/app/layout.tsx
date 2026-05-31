import type { Metadata } from "next";
import "./globals.css";
import { ThemeToggle } from "@/components/theme-toggle";
import { themeBootScript } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Dungeoneers of Digital Nomadia",
  description:
    "A premium-feeling compendium for monsters, classes, and the social combat chaos of Dungeoneers of Digital Nomadia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body>
        <div className="app-root">{children}</div>
        <ThemeToggle />
      </body>
    </html>
  );
}
