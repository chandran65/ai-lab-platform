import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Image as ImageIcon, Focus, Activity, Hand, AudioLines, ScatterChart, MessageSquare } from "lucide-react";

const PROJECT_TYPES = [
  { id: "image_classifier", label: "Image Classifier", icon: ImageIcon, color: "bg-blue-100/50" },
  { id: "object_detection", label: "Object Detection", icon: Focus, color: "bg-blue-100/50" },
  { id: "pose_classifier", label: "Pose Classifier", icon: Activity, color: "bg-orange-50/50" },
  { id: "hand_pose_classifier", label: "Hand Pose Classifier", icon: Hand, color: "bg-orange-50/50" },
  { id: "audio_classifier", label: "Audio Classifier", icon: AudioLines, color: "bg-green-50/50" },
  { id: "numbers", label: "Numbers(C/R)", icon: ScatterChart, color: "bg-yellow-50/50" },
  { id: "text_classifier", label: "Text Classifier", icon: MessageSquare, color: "bg-pink-50/50" }
];

export default function CreateProject() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = () => {
    if (!name || !selectedType) return;
    // Route to the ML Environment with the selected type injected into the URL
    navigate(`/ml-environment?type=${selectedType}&name=${encodeURIComponent(name)}`);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 font-sans">
      <div className="bg-white rounded-md shadow-lg overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-[#6b258e] text-white px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Create New Project</h1>
          <button 
            onClick={() => navigate('/projects')}
            className="flex items-center gap-2 hover:bg-white/10 px-3 py-1.5 rounded transition-colors font-bold text-sm"
          >
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
        </div>

        <div className="p-8">
          {/* Project Details */}
          <h2 className="text-[#6b258e] font-bold text-lg mb-4">Enter Project Details:</h2>
          <div className="space-y-6 mb-10">
            <input
              type="text"
              placeholder="Enter Project Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border-b border-gray-300 pb-2 text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#6b258e] text-lg transition-colors"
            />
            <input
              type="text"
              placeholder="Enter Project Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border-b border-gray-300 pb-2 text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#6b258e] text-lg transition-colors"
            />
          </div>

          {/* Project Types */}
          <h2 className="text-[#6b258e] font-bold text-lg mb-6">Select Project Type:</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-8">
            {PROJECT_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedType === type.id;
              
              return (
                <div 
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`
                    border-2 border-dashed rounded-lg p-4 cursor-pointer transition-all flex flex-col items-center justify-center gap-4 text-center h-48
                    ${isSelected ? 'border-[#6b258e] bg-[#6b258e]/5 shadow-md scale-105' : 'border-gray-300 hover:border-[#6b258e]/50 hover:bg-gray-50'}
                  `}
                >
                  <div className={`w-full h-full rounded flex items-center justify-center ${type.color} bg-opacity-50`}>
                    <Icon className={`w-12 h-12 ${isSelected ? 'text-[#6b258e]' : 'text-gray-600'}`} strokeWidth={1.5} />
                  </div>
                  <span className={`text-sm font-bold ${isSelected ? 'text-[#6b258e]' : 'text-gray-700'}`}>
                    {type.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Create Button */}
          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              onClick={handleCreate}
              disabled={!name || !selectedType}
              className="bg-[#6b258e] text-white px-8 py-3 rounded text-lg font-bold disabled:opacity-50 hover:bg-[#5e2d8b] transition-colors"
            >
              Create Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
