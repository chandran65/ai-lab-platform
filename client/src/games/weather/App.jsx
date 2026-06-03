import { useState } from "react";

import HomePage from "./pages/HomePage";
import WeatherGuardian from "./pages/WeatherGuardian";
import AnimalRescue from "./pages/AnimalRescue";
import GardenBuilder from "./pages/GardenBuilder";

import { WeatherProvider } from "./context/WeatherContext";

export default function App() {
  const [mode, setMode] =
    useState(null);

  return (
  <WeatherProvider>
    {!mode && (
      <HomePage
        onSelectMode={setMode}
      />
    )}

    {mode === "weather" && (
      <WeatherGuardian
        onBack={() => setMode(null)}
      />
    )}

    {mode === "garden" && (
      <GardenBuilder
        onBack={() => setMode(null)}
      />
    )}

    {mode === "animals" && (
      <AnimalRescue
        onBack={() => setMode(null)}
      />
    )}
  </WeatherProvider>
);
}