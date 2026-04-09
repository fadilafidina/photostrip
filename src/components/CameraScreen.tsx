import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onPhotosCapture: (photos: string[]) => void;
  onBack: () => void;
}

const COZY_EMOJIS = ["🩷", "🦢", "🫧", "🪞", "☁️", "🌸", "🎀", "✨", "🕯️", "🧸", "🤍", "💌"];

// Fixed border positions as [left%, top%] — arranged around the perimeter
const BORDER_SLOTS: [number, number, number][] = [
  // top edge
  [8,   -5,  -12],
  [28,  -4,    8],
  [50,  -5,    3],
  [71,  -4,  -10],
  [90,  -5,   14],
  // right edge
  [97,  20,  -15],
  [97,  55,    8],
  [97,  80,  -10],
  // bottom edge
  [78, 102,   10],
  [52, 103,   -8],
  [28, 102,   12],
  // left edge
  [ 1,  65,   -8],
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function CameraScreen({ onPhotosCapture, onBack }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [phase, setPhase] = useState<"ready" | "countdown" | "capturing" | "preview">("ready");
  const [countdown, setCountdown] = useState(3);
  const [currentShot, setCurrentShot] = useState(0);
  const [photos, setPhotos] = useState<string[]>([]);
  const [flash, setFlash] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const photosRef = useRef<string[]>([]);

  // Stable randomised emoji assignments for each border slot
  const borderEmojis = useMemo(() => {
    const shuffled = shuffle(COZY_EMOJIS);
    return BORDER_SLOTS.map((slot, i) => ({
      emoji: shuffled[i % shuffled.length],
      left: slot[0],
      top: slot[1],
      rotate: slot[2],
    }));
  }, []);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError("Camera access is needed for the photobooth. Please allow camera permission and refresh.");
      }
    }
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return "";
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();
    return canvas.toDataURL("image/jpeg", 0.95);
  }, []);

  const runSequence = useCallback(async () => {
    const captured: string[] = [];
    setPhase("countdown");

    for (let shot = 0; shot < 3; shot++) {
      setCurrentShot(shot);
      // Countdown 3 → 1
      for (let c = 3; c >= 1; c--) {
        setCountdown(c);
        await sleep(900);
      }

      // Capture
      setPhase("capturing");
      setFlash(true);
      const photo = capturePhoto();
      captured.push(photo);
      photosRef.current = [...captured];
      setPhotos([...captured]);

      await sleep(150);
      setFlash(false);
      await sleep(350);

      if (shot < 2) {
        setPhase("countdown");
      }
    }

    setPhase("preview");
    await sleep(600);
    onPhotosCapture(photosRef.current);
  }, [capturePhoto, onPhotosCapture]);

  function sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
  }

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen px-4"
      initial={{ opacity: 0, scale: 1.04 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97, filter: "blur(4px)" }}
      transition={{ duration: 0.5 }}
    >
      {error ? (
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-4">📷</div>
          <p className="font-sans text-muted-foreground text-sm leading-relaxed mb-6">{error}</p>
          <button
            onClick={onBack}
            className="text-sm text-muted-foreground underline underline-offset-4"
          >
            Go back
          </button>
        </div>
      ) : (
        <>
          {/* Camera wrapper — outer div has no overflow so emojis bleed outside */}
          <div className="relative mb-5" style={{ width: "min(85vw, 480px)" }}>
            {/* Camera viewfinder — 4:3 landscape */}
            <div
              className="relative rounded-2xl overflow-hidden camera-frame"
              style={{ width: "100%", aspectRatio: "4/3" }}
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: "scaleX(-1)" }}
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Flash */}
              <AnimatePresence>
                {flash && (
                  <motion.div
                    className="absolute inset-0 bg-white z-30"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  />
                )}
              </AnimatePresence>

              {/* Countdown overlay */}
              <AnimatePresence mode="wait">
                {phase === "countdown" && (
                  <motion.div
                    key={countdown}
                    className="absolute inset-0 flex items-center justify-center z-20"
                    initial={{ opacity: 0, scale: 0.75 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  >
                    <div
                      className="bg-white/25 backdrop-blur-sm rounded-full flex items-center justify-center"
                      style={{ width: 80, height: 80 }}
                    >
                      <span
                        style={{
                          fontFamily: "'Inter', system-ui, sans-serif",
                          fontSize: 42,
                          fontWeight: 600,
                          color: "#fff",
                          lineHeight: 1,
                          textShadow: "0 2px 12px rgba(0,0,0,0.28)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "100%",
                          textAlign: "center",
                        }}
                      >
                        {countdown}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Shot progress dots */}
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-20">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: photos.length > i ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.3)",
                    }}
                    animate={{ scale: photos.length === i && phase === "countdown" ? [1, 1.3, 1] : 1 }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                  />
                ))}
              </div>

              {/* Shot label */}
              {phase === "countdown" && (
                <div className="absolute top-3 left-0 right-0 flex justify-center z-20">
                  <div className="bg-black/20 backdrop-blur-sm rounded-full px-3 py-1">
                    <span className="text-white text-xs font-sans">
                      Photo {currentShot + 1} of 3
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Emoji border stickers — absolutely positioned over camera frame, overflow visible */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ overflow: "visible", zIndex: 10 }}
            >
              {borderEmojis.map(({ emoji, left, top, rotate }, i) => (
                <motion.span
                  key={i}
                  className="absolute select-none"
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                    fontSize: "22px",
                    lineHeight: 1,
                    transform: `translate(-50%, -50%) rotate(${rotate}deg)`,
                    filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.13))",
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.04 * i, type: "spring", stiffness: 340, damping: 18 }}
                >
                  {emoji}
                </motion.span>
              ))}
            </div>
          </div>

          {/* Thumbnail strip preview */}
          {photos.length > 0 && (
            <motion.div
              className="flex gap-2 mb-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {photos.map((p, i) => (
                <div key={i} className="w-14 h-14 rounded-lg overflow-hidden ring-1 ring-border">
                  <img src={p} alt="" className="w-full h-full object-cover" style={{ transform: "scaleX(-1)" }} />
                </div>
              ))}
              {[...Array(3 - photos.length)].map((_, i) => (
                <div key={i} className="w-14 h-14 rounded-lg bg-muted ring-1 ring-border" />
              ))}
            </motion.div>
          )}

          {/* Start / status */}
          <AnimatePresence mode="wait">
            {phase === "ready" ? (
              <motion.button
                key="start"
                onClick={runSequence}
                className="px-10 py-3.5 rounded-full font-sans text-sm font-medium tracking-wide text-white"
                style={{
                  background: "linear-gradient(135deg, hsl(352 35% 72%), hsl(352 30% 66%))",
                  boxShadow: "0 4px 14px rgba(210, 130, 125, 0.35)",
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                Start the shoot
              </motion.button>
            ) : phase === "countdown" ? (
              <motion.div
                key="shooting"
                className="text-sm font-sans text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Get ready! 📷
              </motion.div>
            ) : phase === "preview" ? (
              <motion.div
                key="done"
                className="text-sm font-sans text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                Developing your strip…
              </motion.div>
            ) : null}
          </AnimatePresence>

          {phase === "ready" && (
            <button
              onClick={onBack}
              className="mt-4 text-xs text-muted-foreground/60 underline underline-offset-4 font-sans"
            >
              Back
            </button>
          )}
        </>
      )}
    </motion.div>
  );
}
