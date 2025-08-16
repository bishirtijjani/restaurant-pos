import React from "react";
import heroImage from "/hero-image2.png"; // Replace with your image path
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <div className="hero min-h-screen bg-base-200 border-b-2 border-base-300">
      <div className="hero-content flex flex-col lg:flex-row pb-0 mb-0">
        <div className="text-center lg:text-left lg:w-1/2">
          <h1 className="text-6xl font-bold ">Bishir's Templateee</h1>
          <p className="py-4">To Do Great S*#!t</p>
          <div className="flex flex-col gap-2 items-center lg:flex-row">
            <Link to="/login" className="btn btn-primary w-full lg:w-auto">
              DO IT
            </Link>
          </div>
        </div>
        <div className="lg:w-2/3">
          <img src={heroImage} alt="" className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );
};
export default HeroSection;
