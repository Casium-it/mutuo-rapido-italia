import React, { useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { LoginButton } from "@/components/LoginButton";
import { Users, Award, MapPin, Heart, Menu, X } from "lucide-react";
const ChiSiamo = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return <div className="min-h-screen flex flex-col bg-[#f7f5f2]">
      {/* Header fisso */}
      <header className="fixed top-0 left-0 right-0 bg-[#f7f5f2]/95 backdrop-blur-sm z-50 py-6 px-4 md:px-6 flex items-center justify-between shadow-sm">
        {/* Logo */}
        <div className="cursor-pointer flex items-center" onClick={() => navigate("/")}>
          <Logo />
        </div>
        
        {/* Desktop only navigation - centered */}
        {!isMobile && <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-4">
            <Button variant="ghost" className="text-gray-700 hover:bg-transparent hover:text-[#00853E]" onClick={() => navigate('/simulazioni')}>
              Simulazione
            </Button>
            <Button variant="ghost" className="text-gray-700 hover:bg-transparent hover:text-[#00853E]" onClick={() => navigate('/blog')}>
              Blog
            </Button>
            <Button variant="ghost" className="text-[#00853E] hover:bg-transparent hover:text-[#00853E]">
              Chi Siamo
            </Button>
            <Button variant="ghost" className="text-gray-700 hover:bg-transparent hover:text-[#00853E]" onClick={() => window.open('https://wa.me/393518681491', '_blank')}>
              Contatti
            </Button>
          </div>}
        
        {/* Right side buttons */}
        <div className="flex items-center gap-2">
          {isMobile ? (
            <Button 
              variant="ghost" 
              size="icon"
              className="text-gray-700 hover:bg-transparent"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          ) : (
            <Button className="bg-[#245C4F] hover:bg-[#1e4f44] text-white rounded-[12px] px-6 shadow-[0_3px_0_0_#1a3f37] hover:translate-y-[1px] hover:shadow-[0_2px_0_0_#1a3f37] transition-all" onClick={() => navigate('/simulazioni')}>
              Simula Ora
            </Button>
          )}
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobile && mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setMobileMenuOpen(false)}>
          <div className="fixed top-0 right-0 h-full w-80 bg-[#f7f5f2] shadow-lg transform transition-transform duration-300">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-[#BEB8AE]">
                <Logo />
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              
              {/* Navigation Items */}
              <div className="flex flex-col p-6 space-y-4">
                <Button 
                  variant="ghost" 
                  className="text-gray-700 hover:bg-[#245C4F]/10 hover:text-[#245C4F] justify-start text-lg py-6"
                  onClick={() => {
                    navigate('/simulazioni');
                    setMobileMenuOpen(false);
                  }}
                >
                  Simulazione
                </Button>
                <Button 
                  variant="ghost" 
                  className="text-gray-700 hover:bg-[#245C4F]/10 hover:text-[#245C4F] justify-start text-lg py-6"
                  onClick={() => {
                    navigate('/blog');
                    setMobileMenuOpen(false);
                  }}
                >
                  Blog
                </Button>
                <Button 
                  variant="ghost" 
                  className="text-[#245C4F] hover:bg-[#245C4F]/10 hover:text-[#245C4F] justify-start text-lg py-6 font-medium"
                  onClick={() => {
                    setMobileMenuOpen(false);
                  }}
                >
                  Chi Siamo
                </Button>
                <Button 
                  variant="ghost" 
                  className="text-gray-700 hover:bg-[#245C4F]/10 hover:text-[#245C4F] justify-start text-lg py-6"
                  onClick={() => {
                    window.open('https://wa.me/393518681491', '_blank');
                    setMobileMenuOpen(false);
                  }}
                >
                  Contatti
                </Button>
              </div>
              
              {/* CTA Button */}
              <div className="mt-auto p-6">
                <Button 
                  className="w-full bg-[#245C4F] hover:bg-[#1e4f44] text-white rounded-[12px] py-4 text-lg shadow-[0_3px_0_0_#1a3f37] hover:translate-y-[1px] hover:shadow-[0_2px_0_0_#1a3f37] transition-all"
                  onClick={() => {
                    navigate('/simulazioni');
                    setMobileMenuOpen(false);
                  }}
                >
                  Simula Ora
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spacer per compensare l'header fisso */}
      <div className="h-24"></div>

      {/* Main content */}
      <main className="flex-1 px-4 md:px-8 py-8 max-w-4xl mx-auto w-full">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#245C4F]">
            Chi Siamo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            GoMutuo è il partner di fiducia per chi cerca il mutuo perfetto. La nostra missione è semplificare il processo di ottenimento del mutuo, rendendolo trasparente e accessibile a tutti.
          </p>
        </div>

        {/* Mission Section */}
        <section className="bg-white rounded-lg p-8 shadow-md mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4 text-[#245C4F]">La nostra missione</h2>
              <p className="text-gray-600 mb-4">
                Crediamo che ogni persona meriti di realizzare il sogno della casa propria. Per questo lavoriamo ogni giorno per democratizzare l'accesso ai mutui, offrendo consulenza personalizzata e soluzioni innovative.
              </p>
              <p className="text-gray-600">Con oltre 100 banche nelle reti dei nostri partner e una rete di consulenti partner esperti su tutto il territorio nazionale, siamo in grado di trovare la soluzione migliore per ogni situazione, anche quelle più complesse.</p>
            </div>
            <div className="bg-gradient-to-br from-[#245C4F] to-[#1e4f44] rounded-lg h-64 flex items-center justify-center">
              <Heart className="w-16 h-16 text-white" />
            </div>
          </div>
        </section>

        {/* Values Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg p-6 shadow-md text-center">
            <div className="bg-[#245C4F] rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-[#245C4F]">Esperienza</h3>
            <p className="text-gray-600">Oltre 10 anni di esperienza nel settore dei mutui con i nostri partner, con migliaia di famiglie aiutate a realizzare i loro sogni abitativi.</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md text-center">
            <div className="bg-[#245C4F] rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-[#245C4F]">Trasparenza</h3>
            <p className="text-gray-600">
              Nessuna sorpresa, nessun costo nascosto. La trasparenza è il fondamento del nostro rapporto con i clienti.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md text-center">
            <div className="bg-[#245C4F] rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-[#245C4F]">Copertura Nazionale</h3>
            <p className="text-gray-600">
              Una rete capillare di consulenti partner su tutto il territorio italiano, sempre pronti ad assisterti.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md text-center">
            <div className="bg-[#ddf574] rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Heart className="w-8 h-8 text-[#245C4F]" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-[#245C4F]">Personalizzazione</h3>
            <p className="text-gray-600">
              Ogni cliente è unico. Per questo offriamo soluzioni su misura per ogni esigenza e situazione finanziaria.
            </p>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-[#245C4F] rounded-lg p-8 text-white mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">I nostri numeri</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">100+</div>
              <div className="text-sm opacity-90">Banche dei Partner</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">50+</div>
              <div className="text-sm opacity-90">Consulenti Partner</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">5000+</div>
              <div className="text-sm opacity-90">Mutui Erogati dalle reti Partner</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">4.9/5</div>
              <div className="text-sm opacity-90">Soddisfazione Clienti</div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-lg p-8 shadow-md">
          <h3 className="text-2xl font-bold mb-4 text-[#245C4F]">Inizia il tuo percorso verso la casa dei tuoi sogni</h3>
          <p className="text-gray-600 mb-6">Affidati alla nostra esperienza per trovare il mutuo perfetto per te</p>
          <Button className="bg-[#245C4F] hover:bg-[#1e4f44] text-white px-8 py-4 text-lg rounded-[12px] shadow-[0_3px_0_0_#1a3f37] hover:translate-y-[1px] hover:shadow-[0_2px_0_0_#1a3f37] transition-all" onClick={() => navigate('/simulazioni')}>
            Simula il tuo mutuo
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-[#BEB8AE]">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-center items-center mb-4">
            <div className="flex gap-4 items-center">
              <button onClick={() => navigate("/privacy")} className="text-sm text-gray-600 hover:text-[#245C4F]">
                Privacy
              </button>
              <a href="#" className="text-sm text-gray-600 hover:text-[#245C4F]">Termini</a>
              <a href="#" className="text-sm text-gray-600 hover:text-[#245C4F]">Contatti</a>
              <LoginButton />
            </div>
          </div>
          <p className="text-sm text-gray-600 text-center">© 2025 GoMutuo - Tutti i diritti riservati</p>
        </div>
      </footer>
    </div>;
};
export default ChiSiamo;