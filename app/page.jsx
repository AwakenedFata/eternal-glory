"use client";

import Navbar from "@/components/Navbar";
import HeroSection from "./hero/HeroSection";
import AboutSection from "./about/AboutSection";
import VerifySection from "./verify/VerifySection";
import ShopSection from "./shop/ShopSection";
import Footer from "@/components/Footer";


export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar/>
      <main>
        <HeroSection />
        <AboutSection />
        <VerifySection />
        <ShopSection />
      </main>
      <Footer />
    </div>
  );
}
