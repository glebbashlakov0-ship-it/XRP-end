import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import ProtocolArchitecture from "@/components/landing/ProtocolArchitecture";
import RoiCalculator from "@/components/landing/RoiCalculator";
import QuoteBlock from "@/components/landing/QuoteBlock";
import KeyFeatures from "@/components/landing/KeyFeatures";
import TrustedBy from "@/components/landing/TrustedBy";
import Security from "@/components/landing/Security";
import News from "@/components/landing/News";
import FinalCta from "@/components/landing/FinalCta";
import Footer from "@/components/landing/Footer";

export default function Page() {
  return (
    <div className="bg-white">
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <ProtocolArchitecture />
        <RoiCalculator />
        <QuoteBlock />
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
