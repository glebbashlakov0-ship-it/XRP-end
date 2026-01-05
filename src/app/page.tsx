import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import ProtocolArchitecture from "@/components/landing/ProtocolArchitecture";
import RoiCalculator from "@/components/landing/RoiCalculator";
import Testimonials from "@/components/landing/Testimonials";
import KeyFeatures from "@/components/landing/KeyFeatures";
import TrustedBy from "@/components/landing/TrustedBy";
import Security from "@/components/landing/Security";
import News from "@/components/landing/News";
import FinalCta from "@/components/landing/FinalCta";
import Footer from "@/components/landing/Footer";
import RestakingSpotlight from "@/components/landing/RestakingSpotlight";

export default function Page() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <RestakingSpotlight />
        <HowItWorks />
        <ProtocolArchitecture />
        <RoiCalculator />
        <Testimonials />
        <KeyFeatures />
        <TrustedBy />
        <Security />
        <News />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
