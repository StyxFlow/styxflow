import "./globals.css";
import Navbar from "@/components/shared/Navbar";
import { qurova, runtime, outfit, markScript as mScript } from "@/lib/fonts";
import { Poiret_One, Marck_Script } from "next/font/google";

const poiretOne = Poiret_One({
  weight: ["400"],
  variable: "--font-body",
});

const markScript = Marck_Script({
  weight: ["400"],
  variable: "--font-mark",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${qurova.variable} ${runtime.variable} ${outfit.variable}  ${markScript.variable} ${poiretOne.variable} ${mScript.variable} antialiased`}
      >
        <Navbar />
        <main className="font-body font-bold">{children}</main>
      </body>
    </html>
  );
}
