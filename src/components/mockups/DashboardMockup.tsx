import React from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, Check } from "lucide-react";

const DashboardMockup: React.FC = () => {
  return (
    <div className="w-full h-full flex items-center justify-center flex-shrink-0">
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-5 lg:p-6 w-full h-full border border-gray-100 overflow-y-auto">
        <div className="mb-4 md:mb-6">
          <h3 className="text-lg md:text-lg font-semibold text-gray-900 mb-2">Ciao Marco!</h3>
          <p className="text-gray-600 text-sm md:text-sm">Ecco lo stato del tuo dossier mutuo</p>
        </div>

        {/* Progress Section */}
        <div className="mb-4 md:mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Progresso Dossier</span>
            <span className="text-sm text-[#245C4F] font-semibold">75%</span>
          </div>
          <Progress value={75} className="mb-3" />
          <div className="flex gap-2">
            <Badge className="bg-[#245C4F]/10 text-[#245C4F] text-xs">Completato</Badge>
            <Badge variant="outline" className="text-xs">In corso</Badge>
          </div>
        </div>

        {/* Appointments */}
        <div className="mb-4 md:mb-6">
          <h4 className="text-base md:text-base font-semibold mb-2 md:mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 md:w-4 md:h-4" />
            Appuntamenti
          </h4>
          <div className="space-y-2 md:space-y-3">
            <div className="flex justify-between items-center p-2 md:p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm md:text-sm font-medium">Consulenza iniziale</p>
                <p className="text-xs text-gray-500">15 Gen, 14:30</p>
              </div>
              <Badge variant="outline" className="text-xs">Completato</Badge>
            </div>
            <div className="flex justify-between items-center p-2 md:p-3 bg-[#245C4F]/5 rounded-lg border border-[#245C4F]/20">
              <div>
                <p className="text-sm md:text-sm font-medium">Revisione documenti</p>
                <p className="text-xs text-gray-500">22 Gen, 10:00</p>
              </div>
              <Badge className="bg-[#245C4F]/10 text-[#245C4F] text-xs">Prossimo</Badge>
            </div>
          </div>
        </div>

        {/* Documents */}
        <div>
          <h4 className="text-base md:text-base font-semibold mb-2 md:mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 md:w-4 md:h-4" />
            Documenti
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm md:text-sm">Busta paga</span>
              <Check className="w-4 h-4 text-[#245C4F]" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm md:text-sm">Estratto conto</span>
              <Check className="w-4 h-4 text-[#245C4F]" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm md:text-sm">Documento identità</span>
              <div className="w-4 h-4 border border-gray-300 rounded"></div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm md:text-sm">Certificato residenza</span>
              <div className="w-4 h-4 border border-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardMockup;