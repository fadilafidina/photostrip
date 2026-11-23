import { motion } from "framer-motion";
import { Doodle, INK, KC } from "./doodles";

interface Props {
  onStart: () => void;
}

const TITLE_COLORS = [KC.red, KC.orange, KC.yellow, KC.green, KC.blue, KC.purple, KC.pink, KC.red, KC.orange];
const TITLE_TILT = [-6, 4, -3, 5, -4, 3, -5, 4, -2];

const FRAMES = [
  { bg: KC.blue, doodle: "smiley" },
  { bg: KC.yellow, doodle: "heart" },
  { bg: KC.green, doodle: "star" },
];

/* Stickers slapped around the page edges. Positions are % of the viewport. */
const SCATTER = [
  { name: "rainbow", size: 78, rotate: -12, cls: "top-[5%] left-[4%] sm:left-[14%]" },
  { name: "star", size: 56, rotate: 14, cls: "top-[8%] right-[5%] sm:right-[16%]" },
  { name: "flower", size: 56, rotate: -8, cls: "bottom-[15%] left-[3%] sm:left-[15%]" },
  { name: "heart", size: 52, rotate: 10, cls: "bottom-[9%] right-[4%] sm:right-[15%]" },
  { name: "sparkle", size: 34, rotate: 0, cls: "top-[44%] left-[2%] sm:left-[22%] hidden min-[420px]:block" },
  { name: "mushroom", size: 46, rotate: 8, cls: "top-[38%] right-[3%] sm:right-[21%] hidden min-[420px]:block" },
];

export default function KidcoreLandingScreen({ onStart }: Props) {
  return (
    <motion.div
      className="relative flex flex-col items-center justify-center min-h-screen px-4 py-10 text-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {SCATTER.map((s, i) => (
        <motion.div
          key={s.name}
          className={`absolute select-none pointer-events-none ${s.cls}`}
          style={{ rotate: `${s.rotate}deg` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 + i * 0.05, duration: 0.3 }}
        >
          <Doodle name={s.name} size={s.size} />
        </motion.div>
      ))}

      {/* Title: one crayon per letter, printed slightly off-register */}
      <motion.h1
        className="relative font-display leading-none flex kc-wobble"
        aria-label="fotostrip"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {"fotostrip".split("").map((ch, i) => (
          <span
            key={i}
            aria-hidden="true"
            className="inline-block text-[3.4rem] min-[400px]:text-6xl md:text-7xl"
            style={{
              color: TITLE_COLORS[i],
              WebkitTextStroke: `6px ${INK}`,
              paintOrder: "stroke fill",
              textShadow: `4px 4px 0 ${INK}, -2px 1px 0 rgba(63,125,196,0.35)`,
              transform: `rotate(${TITLE_TILT[i]}deg) translateY(${i % 2 ? 2 : -2}px)`,
            }}
          >
            {ch}
          </span>
        ))}
      </motion.h1>

      {/* Handwritten tagline with a crayon squiggle */}
      <motion.div
        className="relative font-hand text-2xl font-bold mt-3 mb-9"
        style={{ color: INK, rotate: "-2deg" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        say cheeeese! ☺
        <svg
          className="absolute left-1/2 -translate-x-1/2 -bottom-2.5 kc-wobble"
          width="150"
          height="10"
          viewBox="0 0 150 10"
          aria-hidden="true"
        >
          <path
            d="M2 6c8-5 14 4 22 0s14-5 22 0 14 4 22 0 14-5 22 0 14 4 22 0 14-5 22 0 10 3 14 1"
            fill="none"
            stroke={KC.red}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>

      {/* Mini strip preview */}
      <motion.div
        className="relative mb-9"
        style={{ rotate: "3deg" }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.45, ease: "easeOut" }}
      >
        <div
          className="w-[7.5rem] bg-white rounded-2xl strip-shadow flex flex-col kc-wobble"
          style={{ padding: "10px 9px", gap: "8px" }}
        >
          {FRAMES.map((f, i) => (
            <div
              key={i}
              className="rounded-lg flex items-center justify-center"
              style={{
                height: "66px",
                background: f.bg,
                border: `2.5px solid ${INK}`,
                backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.3) 1.5px, transparent 2px)",
                backgroundSize: "8px 8px",
              }}
            >
              <Doodle name={f.doodle} size={44} cut={false} style={{ rotate: `${(i - 1) * 10}deg` }} />
            </div>
          ))}
          <div className="font-hand text-sm font-bold leading-none pt-0.5" style={{ color: INK }}>
            best day ever!!
          </div>
        </div>
      </motion.div>

      <motion.p
        className="font-sans font-semibold text-base leading-snug max-w-xs mb-7"
        style={{ color: INK }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.4 }}
      >
        a fun lil fotobooth for you &amp; your friends &lt;3
      </motion.p>

      <motion.button
        onClick={onStart}
        className="kc-btn px-10 py-3.5 rounded-full text-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        whileTap={{ x: 3, y: 4 }}
      >
        open the booth!
      </motion.button>

      <motion.p
        className="font-hand text-base mt-6"
        style={{ color: "rgba(46,36,32,0.65)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        ⋆˙⟡ made with ♡ by dila •{" "}
        <a
          href="https://github.com/fadilafidina/photostrip"
          className="underline decoration-wavy underline-offset-4"
          style={{ textDecorationColor: KC.pink }}
        >
          gh
        </a>{" "}
        ⟡˙⋆
      </motion.p>
    </motion.div>
  );
}
