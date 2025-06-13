
import React from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Star, MapPin, CheckCircle, ArrowRight, Users, Award, Shield, Clock, TrendingUp, Calculator } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";

const Calcolatori = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const handleWhatsAppContact = () => {
    window.open('https://wa.me/393518681491', '_blank');
  };

  const features = [
    {
      icon: Clock,
      title: "3 Minuti",
      description: "Risultati in tempo reale"
    },
    {
      icon: Calculator,
      title: "98% Precisione",
      description: "Il più accurato d'Italia"
    },
    {
      icon: Shield,
      title: "100% Sicuro",
      description: "Dati protetti e gratuito"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#fff7f0] via-[#f8f5f1] to-[#f0f8f5]">
      {/* Header */}
      <header className="py-6 px-4 md:px-6 relative flex items-center z-10 bg-white/80 backdrop-blur-sm border-b border-[#BEB8AE]/20">
        <div className="cursor-pointer" onClick={() => navigate("/")}>
          <Logo />
        </div>
        
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-4">
          <Button variant="ghost" className="text-gray-700 hover:bg-transparent hover:text-[#245C4F]" onClick={() => navigate("/simulazioni")}>
            Simulazioni
          </Button>
          <Button variant="ghost" className="text-gray-700 hover:bg-transparent hover:text-[#245C4F]" onClick={handleWhatsAppContact}>
            Contattaci
          </Button>
        </div>
        
        <div className="ml-auto">
          <Button className="bg-[#245C4F] hover:bg-[#1e4f44] text-white rounded-full px-6" onClick={() => navigate("/simulazioni")}>
            Simulazione
          </Button>
        </div>
      </header>

      {/* Background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-[#245C4F]/10 to-[#E8F5E9]/30 rounded-full blur-3xl opacity-40 animate-float"></div>
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-gradient-to-r from-[#E8F5E9]/30 to-[#245C4F]/10 rounded-full blur-3xl opacity-40 animate-float-rotate"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-[#245C4F]/5 to-transparent rounded-full"></div>
      </div>

      {/* Main Hero Section */}
      <main className="flex-1 container mx-auto px-4 md:px-6 py-8 md:py-16 relative z-10">
        <div className="max-w-6xl mx-auto">
          
          {/* Hero Content */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16">
            
            {/* Left Column - Main Content */}
            <div className="space-y-8 animate-fade-in">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-[#245C4F]/10 text-[#245C4F] px-4 py-2 rounded-full text-sm font-medium animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <Award className="w-4 h-4" />
                <span>La prima vera simulazione precisa</span>
              </div>
              
              {/* Main Headline */}
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  <span className="block mb-2">Cerca, confronta</span>
                  <span className="block">e richiedi il </span>
                  <span className="relative inline-block">
                    <span className="gradient-text">mutuo</span>
                    <div className="absolute -bottom-2 left-0 right-0 h-3 bg-[#d3f54f] rounded-full opacity-80 -z-10"></div>
                  </span>
                </h1>
                
                {/* Key Benefits */}
                <div className="flex flex-wrap gap-6 text-lg font-semibold text-[#245C4F] animate-fade-in" style={{ animationDelay: '0.3s' }}>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Veloce</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Online</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>100% Gratuito</span>
                  </div>
                </div>
              </div>

              {/* Social Proof */}
              <div className="space-y-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                
                {/* Star Rating Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-[#BEB8AE]/30 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <span className="text-2xl font-bold text-gray-900">4.89</span>
                      </div>
                      <p className="text-gray-600 font-medium">
                        <span className="font-bold text-[#245C4F]">857</span> recensioni verificate
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#245C4F] to-[#1e4f44] rounded-full flex items-center justify-center">
                        <TrendingUp className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location Promise */}
                <div className="flex items-center gap-3 text-gray-700">
                  <MapPin className="w-5 h-5 text-[#245C4F]" />
                  <span className="font-medium">Ti troviamo il migliore mediatore creditizio vicino a te</span>
                </div>
              </div>

              {/* CTA Section */}
              <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    className="bg-[#245C4F] hover:bg-[#1e4f44] text-white px-8 py-6 text-lg font-semibold rounded-2xl shadow-[0_8px_0_0_#1a3f37] hover:translate-y-[2px] hover:shadow-[0_6px_0_0_#1a3f37] transition-all group animate-glow flex-1 sm:flex-none"
                    onClick={() => navigate("/simulazioni")}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-2xl"></div>
                    <span className="relative flex items-center justify-center gap-3">
                      Inizia la tua simulazione
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="text-[#245C4F] hover:bg-[#245C4F] hover:text-white border-2 border-[#245C4F] px-6 py-6 text-lg font-medium rounded-2xl transition-all backdrop-blur-sm bg-white/80"
                    onClick={handleWhatsAppContact}
                  >
                    <span className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Parla con un esperto
                    </span>
                  </Button>
                </div>

                {/* Trust Indicators */}
                <div className="flex flex-wrap justify-center sm:justify-start items-center gap-6 text-sm text-gray-500 pt-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Nessun impegno</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>100% sicuro</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Risultati in 3 minuti</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Feature Cards */}
            <div className="space-y-6 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              {features.map((feature, index) => (
                <div 
                  key={feature.title}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-[#BEB8AE]/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                  style={{ animationDelay: `${0.7 + index * 0.1}s` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#245C4F] to-[#1e4f44] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#245C4F] mb-1">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Additional Trust Element */}
              <div className="bg-gradient-to-r from-[#245C4F]/10 to-[#E8F5E9]/30 rounded-2xl p-6 border border-[#245C4F]/20">
                <div className="text-center">
                  <Shield className="w-12 h-12 text-[#245C4F] mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-[#245C4F] mb-2">Certificato e Sicuro</h3>
                  <p className="text-sm text-gray-600">I tuoi dati sono protetti con crittografia bancaria</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-[#BEB8AE]/30 relative z-10 bg-white/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <p className="text-sm text-gray-600">© 2025 GoMutuo.it - Tutti i diritti riservati</p>
          <div className="flex gap-4">
            <button 
              onClick={() => navigate("/privacy")}
              className="text-sm text-gray-600 hover:text-[#245C4F] transition-colors"
            >
              Privacy
            </button>
            <a href="#" className="text-sm text-gray-600 hover:text-[#245C4F] transition-colors">Termini</a>
            <a href="#" className="text-sm text-gray-600 hover:text-[#245C4F] transition-colors">Contatti</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Calcolatori;
