import Navbar from "../../components/landing/Navbar";
import Hero from "../../components/landing/Hero";
import Features from "../../components/landing/Features";
import CTA from "../../components/landing/CTA";
import Footer from "../../components/landing/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen font-sans selection:bg-[#CD1C18] selection:text-white dark">
      {/* Set 'dark' class natively so landing page matches the maroon aesthetic */}
      <Navbar />
      <main>
        <Hero />
        <Features />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
