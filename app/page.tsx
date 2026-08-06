import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import DashboardPreview from "./components/DashboardPreview";
import Footer from "./components/Footer";
import Platform from "./components/Platform";
import Stats from "./components/Stats";
import Map from "./components/Map";
import { supabase } from "@/lib/supabase";
import GlobeSection from "./components/Globe";
import AIDemo from "./components/AIDemo";
import AIChat from "./components/AIChat";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <GlobeSection />
      <Map />
      <Platform />
      <Features />
      <Stats />
      <DashboardPreview />
      <AIDemo />
      <AIChat />
      <Footer />

  
    </>
  );
}