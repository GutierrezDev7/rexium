"use client";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import CustomCursor from "@/components/CustomCursor";
import { useLanguage } from "@/context/LanguageContext";

const KronosDeepDive = dynamic(() => import("@/components/deep-dives/KronosDeepDive"), { ssr: false });
const OrionDeepDive = dynamic(() => import("@/components/deep-dives/OrionDeepDive"), { ssr: false });
const AetherDeepDive = dynamic(() => import("@/components/deep-dives/AetherDeepDive"), { ssr: false });

export default function ProjectDetail() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { t } = useLanguage();

  // Find project data based on ID (simplified mapping)
  const getProjectComponent = () => {
    if (id === 'kronos') return <KronosDeepDive />;
    if (id === 'orion') return <OrionDeepDive />;
    if (id === 'aether') return <AetherDeepDive />;
    return <div className="text-white flex items-center justify-center h-full">Project not found</div>;
  };

  const getProjectTitle = () => {
    if (id === 'kronos') return "KRONOS";
    if (id === 'orion') return "ORION";
    if (id === 'aether') return "AETHER";
    return "";
  };

  const backText = id === 'aether' ? t.deepDives.aether.scroll.split(" ")[0] : "BACK"; // Fallback logic or new key

  return (
    <main className="w-full min-h-screen bg-black relative overflow-hidden">
        <CustomCursor />
        
        {/* Navigation - Absolute to overlay everything */}
        <nav className="absolute top-0 left-0 w-full p-8 flex justify-between items-center z-[50] pointer-events-none text-white">
            <button 
                onClick={() => router.back()}
                className="pointer-events-auto text-xs font-mono tracking-widest hover:opacity-50 transition-opacity flex items-center gap-2 group mix-blend-difference"
                data-cursor-text="BACK"
            >
                <span className="group-hover:-translate-x-1 transition-transform">←</span> BACK
            </button>
            <div className="font-bold tracking-tighter text-xl mix-blend-difference">{getProjectTitle()}</div>
            <div className="w-20"></div> {/* Spacer for center alignment */}
        </nav>

        {/* Main Content Area - Full Screen */}
        <div className="w-full h-screen relative z-10 bg-black">
            {getProjectComponent()}
        </div>
    </main>
  );
}
