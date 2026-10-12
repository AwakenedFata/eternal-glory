"use client";

import Navbar from "@/components/Navbar";
import HeroSection from "./hero/HeroSection";
import AboutSection from "./about/AboutSection";
import VerifySection from "./verify/VerifySection";
import ShopSection from "./shop/ShopSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#ffffff] text-[#000000]">
      <Navbar />
      <main>
        <HeroSection />
        {/* Divider line between Home and About as seen in Lovable design */}
        <div className="w-full border-b border-[#000000]/15" />
        <AboutSection />
        <VerifySection />
        <ShopSection />
      </main>
      <Footer />
    </div>
  );
}
