import localFont from "next/font/local";
import { Outfit } from "next/font/google";

export const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-body",
});
export const markScript = Outfit({
  subsets: ["latin"],
  variable: "--font-mark",
});

export const qurova = localFont({
  src: [
    {
      path: "../assets/fonts/qurova-font/QurovademoRegular-DYgy0.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/fonts/qurova-font/QurovademoMedium-pg4LZ.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../assets/fonts/qurova-font/QurovademoBold-Zp2aK.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-logo",
});

export const runtime = localFont({
  src: [
    {
      path: "../assets/fonts/runtime-font/RuntimeRegular-m2Odx.otf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-heading",
});
