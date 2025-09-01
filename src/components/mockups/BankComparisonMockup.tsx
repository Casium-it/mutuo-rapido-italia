import React from "react";

const BankComparisonMockup: React.FC = () => {
  return (
    <div className="w-full h-full flex items-center justify-center flex-shrink-0">
      <picture>
        <source srcSet="/lovable-uploads/efb4b871-5e27-45bb-a040-67fd1c57bea4.webp" type="image/webp" />
        <img 
          src="/lovable-uploads/efb4b871-5e27-45bb-a040-67fd1c57bea4.png" 
          alt="Consulente personale mockup"
          className="w-full h-full object-contain"
        />
      </picture>
    </div>
  );
};

export default BankComparisonMockup;