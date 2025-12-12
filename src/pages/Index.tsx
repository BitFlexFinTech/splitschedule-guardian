import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import PricingSection from "@/components/landing/PricingSection";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>SplitSchedule - Co-Parenting Made Simple | Custody Calendar & More</title>
        <meta
          name="description"
          content="SplitSchedule is the all-in-one co-parenting platform for shared custody scheduling, expense tracking, and secure communication. Keep your children first."
        />
        <meta name="keywords" content="co-parenting, custody calendar, shared parenting, expense tracking, custody schedule" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <HeroSection />
          <FeaturesSection />
          <PricingSection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
