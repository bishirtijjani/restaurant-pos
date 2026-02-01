import { useState } from "react";
import "./index.css";
import Header from "./components/Header";
import Hero from "./components/Hero";
import TrustBar from "./components/TrustBar";
import Philosophy from "./components/Philosophy";
import Pricing from "./components/Pricing";
import FAQ from "./components/FAQ";
import FinalCTA from "./components/FinalCTA";
import Footer from "./components/Footer";
import OperationalFlow from "./components/OperationalFlow";
import Credibility from "./components/Credibility";
import FoundingPartners from "./components/FoundingPartners";
import BookingModal from "./components/BookingModal";

function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");

  const openContactModal = (plan = "") => {
    setSelectedPlan(plan);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white selection:bg-orange-100">
      <Header />
      <main>
        <Hero />
        <TrustBar />
        <OperationalFlow />
        <Philosophy />
        <Credibility />
        <FoundingPartners />
        <Pricing />
        <FAQ />
        <FinalCTA onContactClick={() => openContactModal()} />
      </main>
      <Footer onContactClick={() => openContactModal()} />

      <BookingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        selectedPlan={selectedPlan}
      />
    </div>
  );
}

export default App;
