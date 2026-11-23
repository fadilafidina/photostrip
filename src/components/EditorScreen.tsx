import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { STICKERS, BACKGROUND_COLORS, type Sticker, type TextBubble, exportStrip, STRIP } from "@/lib/photostrip";
import PhotostripPreview from "./PhotostripPreview";
import { useIsKidcore } from "@/lib/theme";
import { INK, KIDCORE_BACKGROUND_COLORS, KIDCORE_STICKERS, StickerGlyph } from "./kidcore/doodles";

interface Props {
  photos: string[];
  onReset: () => void;
}

export default function EditorScreen({ photos, onReset }: Props) {
  const kid = useIsKidcore();
  const bgColors = kid ? KIDCORE_BACKGROUND_COLORS : BACKGROUND_COLORS;
  const stickerTray = kid ? KIDCORE_STICKERS : STICKERS;
  const [bgColor, setBgColor] = useState(bgColors[0].value);
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
      await exportStrip(photos, bgColor, stickers, bubbles, kid ? "kidcore" : "classic");
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
            <p className={kid ? "font-display text-base text-foreground mb-2" : "font-sans text-xs font-medium tracking-widest text-muted-foreground mb-3"}>
              background
            </p>
            <div className="flex flex-wrap gap-2">
              {bgColors.map((c) => (
                <button
                  key={c.value}
                  title={c.name}
                  onClick={() => setBgColor(c.value)}
                  className="w-7 h-7 rounded-full transition-all"
                  style={{
                    backgroundColor: c.value,
                    border: kid
                      ? `2.5px solid ${INK}`
                      : bgColor === c.value
                        ? "2.5px solid hsl(352 35% 62%)"
                        : "2px solid hsl(20 15% 83%)",
                    transform: bgColor === c.value ? "scale(1.2)" : "scale(1)",
                    boxShadow: bgColor === c.value
                      ? kid ? `2px 3px 0 ${INK}` : "0 0 0 3px hsl(352 40% 90%)"
                      : "none",
                  }}
                />
              ))}
            </div>
          </div>

          <div className={kid ? "h-0 border-t-2 border-dashed border-foreground/25" : "h-px bg-border"} />

          {/* Stickers */}
          <div>
            <p className={kid ? "font-display text-base text-foreground mb-2" : "font-sans text-xs font-medium tracking-widest text-muted-foreground mb-3"}>
              stickers
            </p>
            <div className="flex flex-wrap gap-2">
              {stickerTray.map((emoji) => (
                <motion.button
                  key={emoji}
                  onClick={() => addSticker(emoji)}
                  className={`flex items-center justify-center rounded-xl bg-card border text-xl ${kid ? "w-11 h-11 border-2" : "w-9 h-9 border-border"}`}
                  whileHover={{ scale: kid ? 1.08 : 1.18 }}
                  whileTap={{ scale: 0.88 }}
                  style={{ boxShadow: kid ? `2px 3px 0 ${INK}` : "0 2px 6px rgba(0,0,0,0.05)" }}
                >
                  <StickerGlyph id={emoji} size={kid ? 26 : 20} />
                </motion.button>
              ))}
            </div>
            {stickers.length > 0 && (
              <button
                onClick={() => setStickers([])}
                className="mt-2 text-xs text-muted-foreground/50 underline underline-offset-4 font-sans"
              >
                clear all
              </button>
            )}
          </div>

          <div className={kid ? "h-0 border-t-2 border-dashed border-foreground/25" : "h-px bg-border"} />

          {/* Speech bubbles */}
          <div>
            <p className={kid ? "font-display text-base text-foreground mb-2" : "font-sans text-xs font-medium tracking-widest text-muted-foreground mb-3"}>
              speech bubble
            </p>
            <div className="flex gap-1.5">
              <input
                ref={bubbleInputRef}
                type="text"
                placeholder="type something…"
                value={bubbleInput}
                onChange={(e) => setBubbleInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addBubble(); }}
                maxLength={40}
                className={`flex-1 min-w-0 text-xs px-3 py-2 rounded-lg border bg-card font-sans outline-none transition-colors ${kid ? "border-2 font-semibold focus:border-[#3F7DC4]" : "border-border focus:border-primary/50"}`}
                style={{ color: kid ? INK : "#2F2F2F" }}
              />
              <motion.button
                onClick={addBubble}
                disabled={!bubbleInput.trim()}
                className={kid
                  ? "kc-btn px-3 py-1.5 rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  : "px-3 py-2 rounded-lg text-xs font-sans font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed"}
                style={kid ? undefined : {
                  background: "linear-gradient(135deg, hsl(352 35% 72%), hsl(352 30% 66%))",
                }}
                whileHover={{ scale: kid ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                add
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

          <div className={kid ? "h-0 border-t-2 border-dashed border-foreground/25" : "h-px bg-border"} />

          {/* Export */}
          <div className="flex flex-col gap-3">
            <motion.button
              onClick={handleExport}
              disabled={exporting}
              className={kid
                ? "kc-btn relative px-8 py-3.5 rounded-full text-lg disabled:opacity-70"
                : "relative px-8 py-3.5 rounded-full font-sans text-sm font-medium tracking-wide text-white disabled:opacity-70"}
              style={kid ? undefined : {
                background: "linear-gradient(135deg, hsl(352 35% 72%), hsl(352 30% 66%))",
                boxShadow: "0 4px 14px rgba(210, 130, 125, 0.35)",
              }}
              whileHover={{ scale: kid ? 1 : 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              {exporting ? "saving…" : kid ? "save strip!" : "save strip"}
              <AnimatePresence>
                {sparkle && (
                  <motion.span
                    className="absolute -top-1 -right-1 text-base pointer-events-none"
                    initial={{ scale: 0, rotate: 0 }}
                    animate={{ scale: 1.5, rotate: 180 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {kid ? <StickerGlyph id="kc:sparkle" size={18} /> : "✨"}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <button
              onClick={onReset}
              className="text-xs text-muted-foreground/50 underline underline-offset-4 font-sans text-center"
            >
              start over
            </button>
          </div>

          <p className="text-[10px] text-muted-foreground/40 font-sans text-center italic leading-relaxed">
            drag to reposition · double-click to remove
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
