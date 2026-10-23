import React from 'react';
import LandingNavbar from '../../components/landing/LandingNavbar';
import Hero from '../../components/landing/Hero';
import FeaturesGrid from '../../components/landing/FeaturesGrid';
import HowItWorks from '../../components/landing/HowItWorks';
import LandingFooter from '../../components/landing/LandingFooter';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col text-slate-100">
      <LandingNavbar />
      <main className="flex-1">
        <Hero />
        <FeaturesGrid />
        <HowItWorks />
      </main>
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
