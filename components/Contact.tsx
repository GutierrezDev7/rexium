import { useLanguage } from "@/context/LanguageContext";

export default function Contact() {
  const { t } = useLanguage();

  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-black text-white relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900/20 via-black to-black pointer-events-none" />
      
      <h2 className="text-5xl md:text-7xl lg:text-9xl font-bold tracking-tighter text-center mb-12 md:mb-24 z-10 leading-none">
        {t.contact.title} <br /> <span className="text-gray-500">{t.contact.titleSpan}</span>
      </h2>
      
      <a 
        href="https://wa.me/5562982772393"
        className="group relative px-12 py-6 bg-transparent border border-white/20 overflow-hidden transition-all duration-500 hover:border-white/60 z-10"
        data-cursor-text="WHATSAPP"
      >
        <span className="relative z-10 text-xs md:text-sm tracking-[0.2em] uppercase group-hover:text-black transition-colors duration-500 font-bold">
          {t.contact.cta}
        </span>
        <div className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left ease-[0.19,1,0.22,1]"></div>
      </a>
      
      <footer className="absolute bottom-12 w-full flex justify-between px-12 text-[10px] md:text-xs text-gray-700 uppercase tracking-[0.2em] font-mono z-10">
        <span>REXIUM &copy; 2026</span>
        <span>{t.contact.footer}</span>
      </footer>
    </section>
  );
}
