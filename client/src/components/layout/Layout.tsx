import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#FFFCF8] to-[#FFF9F0] text-[#334155] relative overflow-hidden font-sans select-none">
      
      {/* Drifting Clouds & Sparkles Background Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Soft clouds */}
        <div className="absolute top-[10%] left-[-200px] text-6xl opacity-[0.07] cloud-drift" style={{ animationDuration: "75s" }}>☁️</div>
        <div className="absolute top-[40%] left-[-300px] text-8xl opacity-[0.04] cloud-drift" style={{ animationDuration: "120s", animationDelay: "15s" }}>☁️</div>
        <div className="absolute top-[75%] left-[-150px] text-7xl opacity-[0.05] cloud-drift" style={{ animationDuration: "90s", animationDelay: "45s" }}>☁️</div>
        
        {/* Twinkling golden sparkles */}
        <div className="absolute top-[15%] left-[25%] text-amber-400 opacity-60 text-lg twinkle-sparkle" style={{ animationDelay: "0.2s" }}>✨</div>
        <div className="absolute top-[65%] left-[15%] text-amber-400 opacity-40 text-sm twinkle-sparkle" style={{ animationDelay: "1.4s" }}>✨</div>
        <div className="absolute top-[30%] right-[25%] text-amber-400 opacity-50 text-xl twinkle-sparkle" style={{ animationDelay: "0.8s" }}>✨</div>
        <div className="absolute top-[80%] right-[35%] text-amber-400 opacity-70 text-md twinkle-sparkle" style={{ animationDelay: "2.1s" }}>✨</div>
      </div>

      <Sidebar />
      
      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-h-screen z-10 relative ml-28">
        <Header />
        <main className="flex-1 p-6 overflow-auto relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
