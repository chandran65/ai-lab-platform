import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { gamesAPI } from "../../services/api";

export const KaggleArena: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data) {
        // Handle Back button click inside iframe navbar
        if (event.data.type === "BACK_TO_HUB") {
          navigate("/dashboard");
          return;
        }

        // Save progress details
        if (
          event.data.type === "GAME_PROGRESS" &&
          event.data.gameId === "kaggle_arena"
        ) {
          try {
            await gamesAPI.saveProgress("kaggle_arena", event.data.progressData);
            console.log("Kaggle Arena progress saved:", event.data.progressData);
          } catch (error) {
            console.error("Failed to save Kaggle Arena progress:", error);
          }
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [navigate]);

  return (
    <div className="w-full max-w-[96%] mx-auto py-2 font-sans animate-in fade-in transition-all duration-500 space-y-3">
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-black text-[#a16207] hover:text-[#F4B942] transition-colors uppercase tracking-wider font-display"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          Back to Plaza
        </Link>
      </div>

      <div className="w-full bg-white rounded-[24px] border-2 border-[#FFD76A]/45 shadow-2xl overflow-hidden relative" style={{ height: "calc(100vh - 120px)", minHeight: "780px" }}>
        <iframe
          src="/games/kaggle/index.html"
          className="w-full h-full border-none"
          title="Kaggle Competition Arena V2"
        />
      </div>
    </div>
  );
};
