import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import LandingScreen from "@/components/LandingScreen";
import CameraScreen from "@/components/CameraScreen";
import ProcessingScreen from "@/components/ProcessingScreen";
import EditorScreen from "@/components/EditorScreen";
import type { AppState } from "@/lib/photostrip";

export default function App() {
  const [state, setState] = useState<AppState>("idle");
  const [photos, setPhotos] = useState<string[]>([]);

  const handleStart = useCallback(() => setState("camera-ready"), []);

  const handlePhotos = useCallback((captured: string[]) => {
    setPhotos(captured);
    setState("processing");
  }, []);

  const handleProcessingDone = useCallback(() => setState("editing"), []);

  const handleReset = useCallback(() => {
    setPhotos([]);
    setState("idle");
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Subtle grain layer */}
      <div className="grain-overlay" aria-hidden="true" />

      {/* Subtle background texture */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 0%, hsl(352 30% 95% / 0.6) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <AnimatePresence mode="wait">
        {state === "idle" && (
          <LandingScreen key="landing" onStart={handleStart} />
        )}
        {state === "camera-ready" && (
          <CameraScreen
            key="camera"
            onPhotosCapture={handlePhotos}
            onBack={() => setState("idle")}
          />
        )}
        {state === "processing" && (
          <ProcessingScreen key="processing" onDone={handleProcessingDone} />
        )}
        {state === "editing" && (
          <EditorScreen
            key="editing"
            photos={photos}
            onReset={handleReset}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
