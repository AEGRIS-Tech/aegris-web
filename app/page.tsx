import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import DashboardPreview from "./components/DashboardPreview";
import Footer from "./components/Footer";
import Platform from "./components/Platform";
import Stats from "./components/Stats";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Platform />
      <Features />
      <Stats />
      <DashboardPreview />
      <Footer />

  
    </>
  );
}