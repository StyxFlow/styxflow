import "./globals.css";
import Navbar from "@/components/shared/Navbar";
import { qurova, runtime, outfit } from "@/lib/fonts";
import { Poiret_One } from 'next/font/google'

const poiretOne = Poiret_One({
  weight: ['400'],
  variable: '--font-body',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">  
      <body
        className={`${qurova.variable} ${runtime.variable} ${outfit.variable} ${poiretOne.variable} antialiased`}
      >
        <Navbar />
        <main className="font-body font-bold">{children}</main>
      </body>
    </html>
  );
}
