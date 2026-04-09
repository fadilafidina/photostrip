import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { STICKERS, BACKGROUND_COLORS, type Sticker, type TextBubble, exportStrip, STRIP } from "@/lib/photostrip";
import PhotostripPreview from "./PhotostripPreview";

interface Props {
  photos: string[];
  onReset: () => void;
}

export default function EditorScreen({ photos, onReset }: Props) {
  const [bgColor, setBgColor] = useState(BACKGROUND_COLORS[0].value);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [bubbles, setBubbles] = useState<TextBubble[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [sparkle, setSparkle] = useState(false);
  const [bubbleInput, setBubbleInput] = useState("");
  const bubbleInputRef = useRef<HTMLInputElement>(null);

  // trigger reveal once on mount
  if (!revealed) {
    setTimeout(() => setRevealed(true), 50);
  }

  function addSticker(emoji: string) {
    const id = `sticker-${Date.now()}-${Math.random()}`;
    const x = STRIP.WIDTH * (0.25 + Math.random() * 0.5);
    const y = STRIP.HEIGHT * (0.15 + Math.random() * 0.7);
    setStickers((prev) => [...prev, { id, emoji, x, y, scale: 1 + Math.random() * 0.35 }]);
  }

  function addBubble() {
    const text = bubbleInput.trim();
    if (!text) return;
    const id = `bubble-${Date.now()}-${Math.random()}`;
    const x = STRIP.WIDTH * (0.3 + Math.random() * 0.4);
    const y = STRIP.HEIGHT * (0.2 + Math.random() * 0.6);
    setBubbles((prev) => [...prev, { id, text, x, y }]);
    setBubbleInput("");
    bubbleInputRef.current?.focus();
  }

  function removeSticker(id: string) {
    setStickers((prev) => prev.filter((s) => s.id !== id));
  }

  function removeBubble(id: string) {
    setBubbles((prev) => prev.filter((b) => b.id !== id));
  }

  async function handleExport() {
    setExporting(true);
    setSparkle(true);
    setTimeout(() => setSparkle(false), 600);
    try {
      await exportStrip(photos, bgColor, stickers, bubbles);
    } finally {
      setTimeout(() => setExporting(false), 1000);
    }
  }

  return (
    <motion.div
      className="flex flex-col min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col lg:flex-row items-start justify-center gap-8 px-4 py-8 min-h-screen max-w-3xl mx-auto w-full">
        {/* Strip preview */}
        <div className="flex-shrink-0 w-full lg:w-auto flex justify-center pt-2">
          <motion.div
            className={revealed ? "strip-reveal" : "opacity-0"}
            style={{ willChange: "transform, opacity" }}
          >
            <PhotostripPreview
              photos={photos}
              backgroundColor={bgColor}
              stickers={stickers}
              bubbles={bubbles}
              onStickerMove={(id, x, y) =>
                setStickers((prev) => prev.map((s) => (s.id === id ? { ...s, x, y } : s)))
              }
              onStickerRemove={removeSticker}
              onBubbleMove={(id, x, y) =>
                setBubbles((prev) => prev.map((b) => (b.id === id ? { ...b, x, y } : b)))
              }
              onBubbleRemove={removeBubble}
            />
          </motion.div>
        </div>

        {/* Controls panel */}
        <motion.div
          className="flex flex-col gap-5 w-full lg:max-w-[220px]"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {/* Background */}
          <div>
            <p className="font-sans text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">
              Background
            </p>
            <div className="flex flex-wrap gap-2">
              {BACKGROUND_COLORS.map((c) => (
                <button
                  key={c.value}
                  title={c.name}
                  onClick={() => setBgColor(c.value)}
                  className="w-7 h-7 rounded-full transition-all"
                  style={{
                    backgroundColor: c.value,
                    border: bgColor === c.value
                      ? "2.5px solid hsl(352 35% 62%)"
                      : "2px solid hsl(20 15% 83%)",
                    transform: bgColor === c.value ? "scale(1.2)" : "scale(1)",
                    boxShadow: bgColor === c.value ? "0 0 0 3px hsl(352 40% 90%)" : "none",
                  }}
                />
              ))}
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Stickers */}
          <div>
            <p className="font-sans text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">
              Stickers
            </p>
            <div className="flex flex-wrap gap-2">
              {STICKERS.map((emoji) => (
                <motion.button
                  key={emoji}
                  onClick={() => addSticker(emoji)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-card border border-border text-xl"
                  whileHover={{ scale: 1.18 }}
                  whileTap={{ scale: 0.88 }}
                  style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
            {stickers.length > 0 && (
              <button
                onClick={() => setStickers([])}
                className="mt-2 text-xs text-muted-foreground/50 underline underline-offset-4 font-sans"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="h-px bg-border" />

          {/* Speech bubbles */}
          <div>
            <p className="font-sans text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">
              Speech bubble
            </p>
            <div className="flex gap-1.5">
              <input
                ref={bubbleInputRef}
                type="text"
                placeholder="Type something…"
                value={bubbleInput}
                onChange={(e) => setBubbleInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addBubble(); }}
                maxLength={40}
                className="flex-1 min-w-0 text-xs px-3 py-2 rounded-lg border border-border bg-card font-sans outline-none focus:border-primary/50 transition-colors"
                style={{ color: "#2F2F2F" }}
              />
              <motion.button
                onClick={addBubble}
                disabled={!bubbleInput.trim()}
                className="px-3 py-2 rounded-lg text-xs font-sans font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, hsl(352 35% 72%), hsl(352 30% 66%))",
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Add
              </motion.button>
            </div>

            {/* Placed bubbles list */}
            {bubbles.length > 0 && (
              <div className="mt-2 flex flex-col gap-1">
                {bubbles.map((b) => (
                  <div key={b.id} className="flex items-center gap-1.5 text-xs font-sans">
                    <span className="flex-1 truncate text-muted-foreground bg-muted rounded px-2 py-1">
                      💬 {b.text}
                    </span>
                    <button
                      onClick={() => removeBubble(b.id)}
                      className="text-muted-foreground/50 hover:text-foreground transition-colors text-base leading-none"
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="h-px bg-border" />

          {/* Export */}
          <div className="flex flex-col gap-3">
            <motion.button
              onClick={handleExport}
              disabled={exporting}
              className="relative px-8 py-3.5 rounded-full font-sans text-sm font-medium tracking-wide text-white disabled:opacity-70"
              style={{
                background: "linear-gradient(135deg, hsl(352 35% 72%), hsl(352 30% 66%))",
                boxShadow: "0 4px 14px rgba(210, 130, 125, 0.35)",
              }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              {exporting ? "Saving…" : "Save strip"}
              <AnimatePresence>
                {sparkle && (
                  <motion.span
                    className="absolute -top-1 -right-1 text-base pointer-events-none"
                    initial={{ scale: 0, rotate: 0 }}
                    animate={{ scale: 1.5, rotate: 180 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    ✨
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <button
              onClick={onReset}
              className="text-xs text-muted-foreground/50 underline underline-offset-4 font-sans text-center"
            >
              Start over
            </button>
          </div>

          <p className="text-[10px] text-muted-foreground/40 font-sans text-center italic leading-relaxed">
            Drag to reposition · Double-click to remove
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
