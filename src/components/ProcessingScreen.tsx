import { useEffect } from "react";
import { motion } from "framer-motion";

interface Props {
  onDone: () => void;
}

export default function ProcessingScreen({ onDone }: Props) {
  useEffect(() => {
    const timer = setTimeout(onDone, 1600);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Animated film strip */}
      <motion.div className="relative mb-8">
        <motion.div
          className="w-24 bg-[#F7F3EF] rounded-xl strip-shadow overflow-hidden"
          style={{ padding: "8px 7px", gap: "6px", display: "flex", flexDirection: "column" }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="rounded-sm"
              style={{ height: "52px" }}
              animate={{
                background: [
                  "linear-gradient(135deg, hsl(352 25% 88%), hsl(352 20% 85%))",
                  "linear-gradient(135deg, hsl(246 22% 88%), hsl(246 18% 85%))",
                  "linear-gradient(135deg, hsl(352 25% 88%), hsl(352 20% 85%))",
                ],
              }}
              transition={{ repeat: Infinity, duration: 1.4, delay: i * 0.2, ease: "easeInOut" }}
            />
          ))}
        </motion.div>
        <motion.div
          className="absolute -top-1 -right-3 text-xl"
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 1.4 }}
        >
          ✨
        </motion.div>
      </motion.div>

      <motion.p
        className="font-display text-2xl text-foreground mb-2"
        style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 400 }}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ repeat: Infinity, duration: 1.4 }}
      >
        Developing your strip
      </motion.p>
      <p className="font-sans text-xs text-muted-foreground tracking-widest uppercase">
        just a moment…
      </p>
    </motion.div>
  );
}
