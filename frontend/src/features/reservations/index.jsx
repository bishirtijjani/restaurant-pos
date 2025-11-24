import React from "react";
import ReservationList from "./components/ReservationList";

const Reservations = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Reservations</h1>
      <ReservationList />
    </div>
  );
};

export default Reservations;
