import React from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const DashboardMockup: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 min-h-[400px]">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground mb-2">Ciao Marco!</h2>
      </div>

      {/* Progress Section */}
      <div className="mb-6">
        <h3 className="font-semibold text-foreground mb-3">Stato del tuo dossier</h3>
        
        <div className="bg-green-50 rounded-lg p-4 mb-4">
          <Badge className="bg-green-600 text-white mb-2">Completato</Badge>
          <div className="space-y-2">
            <div className="w-32 h-3 bg-gray-200 rounded"></div>
            <Progress value={100} className="w-full" />
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <Badge variant="outline" className="border-blue-600 text-blue-600 mb-2">In corso</Badge>
          <div className="space-y-2">
            <div className="w-40 h-3 bg-gray-200 rounded"></div>
            <Progress value={60} className="w-full" />
          </div>
        </div>
      </div>

      {/* Appointments Section */}
      <div className="mb-6">
        <h3 className="font-semibold text-foreground mb-3">I tuoi appuntamenti</h3>
        
        <div className="space-y-3">
          {/* Appointment 1 */}
          <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <div className="flex-1">
              <div className="w-24 h-3 bg-gray-200 rounded mb-1"></div>
              <div className="w-32 h-3 bg-gray-200 rounded"></div>
            </div>
            <div className="text-right">
              <Badge className="bg-green-600 text-white">✓</Badge>
              <div className="w-16 h-2 bg-gray-200 rounded mt-1"></div>
            </div>
          </div>

          {/* Appointment 2 */}
          <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <div className="flex-1">
              <div className="w-28 h-3 bg-gray-200 rounded mb-1"></div>
              <div className="w-36 h-3 bg-gray-200 rounded"></div>
            </div>
            <div className="text-right">
              <Badge className="bg-green-600 text-white">✓</Badge>
              <div className="w-16 h-2 bg-gray-200 rounded mt-1"></div>
            </div>
          </div>

          {/* Future Appointment */}
          <div className="flex items-center gap-3 p-3 border border-dashed border-gray-300 rounded-lg opacity-60">
            <div className="w-10 h-10 bg-gray-300 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">?</span>
            </div>
            <div className="flex-1">
              <div className="w-20 h-3 bg-gray-200 rounded mb-1"></div>
              <div className="w-24 h-3 bg-gray-200 rounded"></div>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="text-gray-400">Prossimo appuntamento</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Section */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">I tuoi documenti</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center p-3 border border-border rounded-lg">
            <div className="w-8 h-8 bg-green-100 rounded mb-2 flex items-center justify-center">
              <span className="text-green-600 text-xs">✓</span>
            </div>
            <div className="w-16 h-2 bg-gray-200 rounded"></div>
          </div>
          <div className="flex flex-col items-center p-3 border border-border rounded-lg">
            <div className="w-8 h-8 bg-green-100 rounded mb-2 flex items-center justify-center">
              <span className="text-green-600 text-xs">✓</span>
            </div>
            <div className="w-16 h-2 bg-gray-200 rounded"></div>
          </div>
          <div className="flex flex-col items-center p-3 border border-dashed border-gray-300 rounded-lg opacity-60">
            <div className="w-8 h-8 bg-gray-100 rounded mb-2 flex items-center justify-center">
              <span className="text-gray-400 text-xs">○</span>
            </div>
            <div className="w-16 h-2 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardMockup;