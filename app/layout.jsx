import { Anton, Manrope } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const anton = Anton({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "Eternal Glory — Faith Worn Daily",
  description: "Eternal Glory is a Christian clothing brand created to express faith through everyday clothing. Verify your piece and shop our official stores.",
  openGraph: {
    title: "Eternal Glory — Faith Worn Daily",
    description: "A Christian clothing brand created to express faith through everyday clothing. Verify your piece with the serial number on your hang tag.",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${anton.variable} ${manrope.variable}`}>
      
      <head>
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js" strategy="beforeInteractive" />
      </head>
      <body>{children}</body>
    </html>
  );
}
