import { useState, useCallback, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import LandingScreen from "@/components/LandingScreen";
import CameraScreen from "@/components/CameraScreen";
import ProcessingScreen from "@/components/ProcessingScreen";
import EditorScreen from "@/components/EditorScreen";
import KidcoreLandingScreen from "@/components/kidcore/KidcoreLandingScreen";
import { KidcoreDefs } from "@/components/kidcore/doodles";
import type { AppState } from "@/lib/photostrip";
import { ThemeContext, type Theme } from "@/lib/theme";

export default function App({ theme = "classic" }: { theme?: Theme }) {
  const kid = theme === "kidcore";
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

  // Theme tokens are scoped to .theme-kidcore on <html> so body/portals pick them up too.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("theme-kidcore", kid);
    document.title = kid ? "fotostrip ☺ kidcore" : "fotostrip";
    return () => root.classList.remove("theme-kidcore");
  }, [kid]);

  return (
    <ThemeContext.Provider value={theme}>
    <div className={`min-h-screen relative overflow-hidden ${kid ? "kc-paper" : "bg-background"}`}>
      {kid && <KidcoreDefs />}
      {/* Subtle grain layer */}
      <div className="grain-overlay" aria-hidden="true" />

      {/* Subtle background texture */}
      {!kid && <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 0%, hsl(352 30% 95% / 0.6) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />}

      <AnimatePresence mode="wait">
        {state === "idle" && (
          kid
            ? <KidcoreLandingScreen key="landing" onStart={handleStart} />
            : <LandingScreen key="landing" onStart={handleStart} />
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
    </ThemeContext.Provider>
  );
}
