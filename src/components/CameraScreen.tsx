import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onPhotosCapture: (photos: string[]) => void;
  onBack: () => void;
}

const COZY_EMOJIS = ["🩷", "🦢", "🫧", "🪞", "☁️", "🌸", "🎀", "✨", "🕯️", "🧸", "🤍", "💌"];

type BorderEmoji = {
  emoji: string;
  left: number;
  top: number;
  rotate: number;
};

function randomRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateBorderEmojis(): BorderEmoji[] {
  const shuffled = shuffle(COZY_EMOJIS);
  const placements: Omit<BorderEmoji, "emoji">[] = [];
  const edges = [
    { edge: "top", count: 4, start: 3, end: 97 },
    { edge: "right", count: 3, start: 8, end: 92 },
    { edge: "bottom", count: 3, start: 4, end: 96 },
    { edge: "left", count: 3, start: 10, end: 90 },
  ] as const;

  edges.forEach(({ edge, count, start, end }) => {
    const span = end - start;

    for (let i = 0; i < count; i++) {
      const anchor = start + ((i + 1) * span) / (count + 1);
      const alongEdge = anchor + randomRange(-3.5, 3.5);
      const outsideOffset = randomRange(1.2, 3.2);

      if (edge === "top") {
        placements.push({
          left: alongEdge,
          top: -outsideOffset,
          rotate: randomRange(-18, 18),
        });
      } else if (edge === "right") {
        placements.push({
          left: 100 + outsideOffset,
          top: alongEdge,
          rotate: randomRange(-22, 22),
        });
      } else if (edge === "bottom") {
        placements.push({
          left: alongEdge,
          top: 100 + outsideOffset,
          rotate: randomRange(-18, 18),
        });
      } else {
        placements.push({
          left: -outsideOffset,
          top: alongEdge,
          rotate: randomRange(-22, 22),
        });
      }
    }
  });

  return placements.map((placement, index) => ({
    emoji: shuffled[index % shuffled.length],
    ...placement,
  }));
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

  // Stable edge distribution with light jitter so the layout feels balanced but not rigid.
  const borderEmojis = useMemo(() => generateBorderEmojis(), []);

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
                      foto {currentShot + 1} of 3
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

          {/* Reserve preview space so each captured thumbnail doesn't recenter the whole screen. */}
          <div className="flex items-center justify-center min-h-19 mb-5">
            <motion.div
              className="flex gap-2"
              initial={false}
              animate={{ opacity: photos.length > 0 ? 1 : 0.55 }}
            >
              {[0, 1, 2].map((i) => {
                const photo = photos[i];

                return photo ? (
                  <motion.div
                    key={i}
                    className="w-14 h-14 rounded-lg overflow-hidden ring-1 ring-border"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <img src={photo} alt="" className="w-full h-full object-cover" style={{ transform: "scaleX(-1)" }} />
                  </motion.div>
                ) : (
                  <div key={i} className="w-14 h-14 rounded-lg bg-muted ring-1 ring-border" />
                );
              })}
            </motion.div>
          </div>

          {/* Reserve status space so phase changes don't nudge the camera view. */}
          <div className="flex items-center justify-center min-h-14">
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
                  start the shoot
                </motion.button>
              ) : phase === "countdown" ? (
                <motion.div
                  key="shooting"
                  className="text-sm font-sans text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  get ready! 📷
                </motion.div>
              ) : phase === "preview" ? (
                <motion.div
                  key="done"
                  className="text-sm font-sans text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  developing your fotos...
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {phase === "ready" && (
            <button
              onClick={onBack}
              className="mt-4 text-xs text-muted-foreground/60 underline underline-offset-4 font-sans"
            >
              back
            </button>
          )}
        </>
      )}
    </motion.div>
  );
}
