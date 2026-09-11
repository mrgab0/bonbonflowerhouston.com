"use client";

interface FooterProps {
  siteConfig?: any;
}

export function Footer({ siteConfig }: FooterProps) {
  return (
    <footer className="bg-[#2a0002] text-gray-200 py-14 border-t border-[#D4AF37]/40 relative overflow-hidden">
      {/* Detalle de fondo sutil */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#4a0e0e]/40 via-[#2a0002] to-[#1a0001] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-[#D4AF37]/30 pb-10 mb-10">
          <div className="flex items-center gap-4 text-center md:text-left">
            <img
              src="/logo.jpg"
              alt="Gabriela's Flowers Logo"
              className="w-14 h-14 rounded-full object-cover border border-[#D4AF37] shadow-lg hidden sm:block"
            />
            <div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold !text-white tracking-tight" style={{ color: '#FFFFFF' }}>
                {siteConfig?.footerTitle || "Gabriela's Flowers LLC"}
              </h3>
              <p className="text-xs !text-[#D4AF37] font-serif italic font-medium mt-1" style={{ color: '#D4AF37' }}>
                {siteConfig?.footerSlogan || "Boutique Digital de Alta Floristería • Pasadena, Texas"}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-xs font-bold tracking-widest !text-gray-200 uppercase" style={{ color: '#E5E7EB' }}>
            <span style={{ color: '#E5E7EB' }}>4201 Fairmont Pkwy</span>
            <span style={{ color: '#E5E7EB' }}>•</span>
            <span style={{ color: '#E5E7EB' }}>Pasadena, TX 77504</span>
            <span style={{ color: '#E5E7EB' }}>•</span>
            <span style={{ color: '#E5E7EB' }}>Boutique Digital</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <p className="!text-gray-300 font-medium text-xs tracking-wider" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
            {siteConfig?.footerCopyright || `© ${new Date().getFullYear()} Gabriela's Flowers LLC. Todos los derechos reservados.`}
          </p>

          {/* Logotipos de Métodos de Pago Aceptados */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-3">
            <span className="text-xs font-bold uppercase tracking-widest !text-gray-300 mr-1" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
              Métodos Aceptados:
            </span>
            
            <div className="flex items-center gap-2">
              {/* Zelle */}
              <div className="h-8 px-2.5 bg-white rounded-lg border border-gray-200 shadow-sm flex items-center justify-center shrink-0" title="Zelle">
                <img src="/images/pay_methods/zelle.png" alt="Zelle" className="h-5 w-auto object-contain block max-h-5" style={{ height: '20px', width: 'auto', objectFit: 'contain' }} />
              </div>

              {/* Square */}
              <div className="h-8 px-2.5 bg-white rounded-lg border border-gray-200 shadow-sm flex items-center justify-center shrink-0" title="Square">
                <img src="/images/pay_methods/square.png" alt="Square" className="h-5 w-auto object-contain block max-h-5" style={{ height: '20px', width: 'auto', objectFit: 'contain' }} />
              </div>

              {/* Visa / Master / Tarjetas */}
              <div className="h-8 px-2.5 bg-white rounded-lg border border-gray-200 shadow-sm flex items-center justify-center shrink-0" title="Visa / MasterCard / Tarjetas">
                <img src="/images/pay_methods/visa.png" alt="Visa / MasterCard" className="h-5 w-auto object-contain block max-h-5" style={{ height: '20px', width: 'auto', objectFit: 'contain' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
