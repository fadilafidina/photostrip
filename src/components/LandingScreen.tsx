import { motion } from "framer-motion";

interface Props {
  onStart: () => void;
}

export default function LandingScreen({ onStart }: Props) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen px-6 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.5 }}
    >
      {/* Decorative top dots */}
      <motion.div
        className="flex gap-2 mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {["#E8C4BF", "#D8D4F0", "#C8DCF0"].map((color, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: color }}
          />
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="text-xs font-sans font-light tracking-[0.3em] text-muted-foreground uppercase mb-3">
        ⋆𐙚₊˚⊹♡
        </div>
        <h1
          className="font-display text-6xl md:text-7xl text-foreground leading-none mb-2"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 400 }}
        >
          fotostrip
        </h1>
        <div
          className="font-display text-xl text-muted-foreground italic mb-10"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: "italic" }}
        >
          vintage edition
        </div>
      </motion.div>

      {/* Decorative strip preview */}
      <motion.div
        className="relative mb-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.7, ease: [0.34, 1.3, 0.64, 1] }}
      >
        <div
          className="w-28 bg-[#F7F3EF] rounded-xl strip-shadow overflow-hidden"
          style={{ padding: "10px 8px", gap: "7px", display: "flex", flexDirection: "column" }}
        >
          {[1, 2, 3].map((_, i) => (
            <div
              key={i}
              className="rounded-md overflow-hidden"
              style={{
                height: "64px",
                background: `linear-gradient(135deg, hsl(${20 + i * 30} 20% 91%), hsl(${20 + i * 30} 15% 88%))`,
              }}
            />
          ))}
        </div>
        {/* floating stickers */}
        <div className="absolute -top-2 -right-4 text-2xl select-none">✨</div>
        <div className="absolute -bottom-2 -left-4 text-xl select-none">💖</div>
      </motion.div>

      {/* Description */}
      <motion.p
        className="font-sans text-sm text-muted-foreground max-w-xs leading-relaxed mb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.65, duration: 0.5 }}
      >
        {`a fun lil fotobooth for you and your friends <3`}
      </motion.p>

      {/* CTA button */}
      <motion.button
        onClick={onStart}
        className="px-10 py-3.5 rounded-full font-sans text-sm font-medium tracking-wide text-white transition-all"
        style={{
          background: "linear-gradient(135deg, hsl(352 35% 72%), hsl(352 30% 66%))",
          boxShadow: "0 4px 14px rgba(210, 130, 125, 0.35)",
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.4 }}
        whileHover={{ scale: 1.04, boxShadow: "0 6px 18px rgba(210, 130, 125, 0.45)" }}
        whileTap={{ scale: 0.97 }}
      >
        open the booth
      </motion.button>

      <motion.p
        className="text-xs text-muted-foreground/60 mt-5 font-sans"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.5 }}
      >
      ⋆˙⟡ made with ♡ by dila • <a href="https://github.com/fadilafidina/photostrip">github</a> ⟡˙⋆
      </motion.p>
    </motion.div>
  );
}
