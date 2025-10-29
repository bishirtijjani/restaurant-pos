import React from "react";

const LoginHeroSection = () => {
  return (
    <div className="hero min-h-screen bg-base-200 border-b-2 border-base-300">
      <div className="hero-content flex-col pb-0 mb-0">
        <div className="flex items-center py-3 self-stretch">
          <img src="./icon.svg" className="w-32" alt="" />
          <span className="text-3xl  font-extrabold  relative -top-1 -left-14">
            Restaurant
          </span>
        </div>
        <div className="text-center lg:text-left lg:w-1/2 self-start">
          <p className="text-2xl font-bold ">The only </p>
          <h1 className="text-6xl font-bold ">
            Restaurant Management Software
          </h1>
          <p className="text-2xl font-bold ">You will ever need</p>
        </div>
      </div>
    </div>
  );
};
export default LoginHeroSection;
