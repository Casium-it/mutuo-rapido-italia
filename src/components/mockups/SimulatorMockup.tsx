import React from "react";

const SimulatorMockup: React.FC = () => {
  return (
    <div className="w-full h-full flex items-center justify-center flex-shrink-0">
      <picture>
        <source srcSet="/lovable-uploads/541599e5-f622-495d-987c-43e6cfce8499.webp" type="image/webp" />
        <img 
          src="/lovable-uploads/541599e5-f622-495d-987c-43e6cfce8499.png" 
          alt="Simulazione mockup"
          className="w-full h-full object-contain"
        />
      </picture>
    </div>
  );
};

export default SimulatorMockup;