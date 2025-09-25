import React from "react";

const StepsSection = ({ steps }) => {
  return (
    <div className="w-full py-12">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-between gap-12 md:gap-6 relative">
        {steps.map((step, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-center relative flex-1"
          >
            {/* Circle with edge-to-edge half connectors */}
            <div className="relative flex items-center justify-center w-full">
              {/* Icon Circle (80px on desktop → r = 2.5rem) */}
              <div className="z-10 w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-full border-1 border-[#A6653A]">
                {step.icon?.startsWith?.("/") ? (
                  <img
                    src={step.icon}
                    alt=""
                    aria-hidden="true"
                    className="w-8 h-8 object-contain"
                  />
                ) : (
                  <span className="text-2xl sm:text-3xl leading-none select-none">
                    {step.icon || "•"}
                  </span>
                )}
              </div>
            </div>

            {/* Title */}
            <h3 className="mt-4 text-lg sm:text-xl font-semibold text-[#4A2A23]">
              {step.title}
            </h3>

            {/* Description */}
            {step.description && (
              <p className="max-w-xs mt-2 text-[#6A5852]">{step.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepsSection;