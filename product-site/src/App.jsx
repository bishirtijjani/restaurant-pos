import "./index.css";
import Header from "./components/Header";
import Hero from "./components/Hero";
import TrustBar from "./components/TrustBar";
import Philosophy from "./components/Philosophy";
import Testimonials from "./components/Testimonials";
import Pricing from "./components/Pricing";
import FAQ from "./components/FAQ";
import FinalCTA from "./components/FinalCTA";
import Footer from "./components/Footer";
import OperationalFlow from "./components/OperationalFlow";
import Credibility from "./components/Credibility";

function App() {
  return (
    <div className="min-h-screen bg-white selection:bg-orange-100">
      <Header />
      <main>
        <Hero />
        <TrustBar />
        <OperationalFlow />
        <Philosophy />
        <Testimonials />
        <Credibility />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}

export default App;
