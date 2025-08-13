import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

const SimulatorMockup: React.FC = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full border border-gray-100 relative overflow-hidden">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Congratulazioni!</h2>
        <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg inline-block text-xl font-semibold">
          240.000 €
        </div>
      </div>

      {/* Controls Section */}
      <div className="space-y-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-4 text-foreground">Modifica</h3>
          
          {/* Sliders */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Importo</span>
                <span className="text-sm font-medium">240.000 €</span>
              </div>
              <Slider 
                defaultValue={[75]} 
                max={100} 
                step={1}
                className="w-full"
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Durata</span>
                <span className="text-sm font-medium">25 anni</span>
              </div>
              <Slider 
                defaultValue={[60]} 
                max={100} 
                step={1}
                className="w-full"
              />
            </div>
          </div>

          {/* Input Fields */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <Input placeholder="Età" className="text-sm" />
            <Input placeholder="Reddito" className="text-sm" />
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Calcola
            </Button>
          </div>
        </div>

        {/* Action Button */}
        <div className="absolute bottom-6 right-6">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-semibold">
            Continua →
          </Button>
        </div>
      </div>

      {/* Right side details */}
      <div className="absolute top-6 right-6 space-y-3">
        <div className="w-32 h-3 bg-gray-200 rounded"></div>
        <div className="w-24 h-3 bg-gray-200 rounded"></div>
        <div className="w-28 h-3 bg-gray-200 rounded"></div>
        <div className="w-20 h-3 bg-primary/20 rounded"></div>
        <div className="w-32 h-3 bg-gray-200 rounded"></div>
        <div className="w-26 h-3 bg-gray-200 rounded"></div>
        <div className="w-36 h-8 bg-primary/10 rounded"></div>
      </div>
      </div>
    </div>
  );
};

export default SimulatorMockup;