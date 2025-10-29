// frontend/src/features/home/index.jsx
import React from "react";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import Platforms from "./components/Platforms";
import Features from "./components/Features";
import Comparison from "./components/Comparison";
import Testimonials from "./components/Testimonials";
import Pricing from "./components/Pricing";
import Guarantee from "./components/Guarantee";
import FAQs from "./components/FAQs";
import Footer from "./components/Footer";

const LandingPage = () => {
  return (
    <>
      <Header />
      <HeroSection />
      <Platforms />
      <Features />
      <Comparison />
      <Testimonials />
      <Pricing />
      <Guarantee />
      <FAQs />
      <Footer />
    </>
  );
};

export default LandingPage;
