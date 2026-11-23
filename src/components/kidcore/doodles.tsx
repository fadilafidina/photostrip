import { useId, type ReactNode } from "react";

/*
 * Retro kidcore doodle stickers.
 *
 * Every doodle is drawn in a 48×48 box. <Doodle> wraps it in an SVG whose own
 * filter adds the hand-printed wobble, the white die-cut border and a soft
 * offset shadow, so the sticker looks the same in the DOM and when drawn onto
 * the export canvas (see doodleImageSrc).
 */

export const INK = "#2E2420";
export const KC = {
  red: "#E0533D",
  orange: "#EE8B2F",
  yellow: "#F4C04A",
  green: "#5DAA68",
  blue: "#3F7DC4",
  purple: "#8A6BB8",
  pink: "#F39BB8",
  paper: "#F7ECD4",
  white: "#FFFAF0",
};

const SW = 3; // ink stroke width in doodle units

/** Little face used on several doodles. */
function Face({ cx, cy, s = 1, blush = false }: { cx: number; cy: number; s?: number; blush?: boolean }) {
  return (
    <g>
      <ellipse cx={cx - 5 * s} cy={cy - 1 * s} rx={1.8 * s} ry={2.6 * s} fill={INK} />
      <ellipse cx={cx + 5 * s} cy={cy - 1 * s} rx={1.8 * s} ry={2.6 * s} fill={INK} />
      {blush && (
        <>
          <ellipse cx={cx - 8.5 * s} cy={cy + 3 * s} rx={2.4 * s} ry={1.4 * s} fill={KC.pink} opacity={0.9} />
          <ellipse cx={cx + 8.5 * s} cy={cy + 3 * s} rx={2.4 * s} ry={1.4 * s} fill={KC.pink} opacity={0.9} />
        </>
      )}
      <path
        d={`M${cx - 4 * s} ${cy + 3 * s}q${4 * s} ${4.5 * s} ${8 * s} 0`}
        fill="none"
        stroke={INK}
        strokeWidth={2.2 * s}
        strokeLinecap="round"
      />
    </g>
  );
}

const SHAPES: Record<string, () => ReactNode> = {
  star: () => (
    <>
      <path
        d="M24 3l6.3 13.2 14.3 1.8-10.5 9.9 2.8 14.2L24 35 11.1 42.1l2.8-14.2L3.4 18l14.3-1.8z"
        fill={KC.yellow}
        stroke={INK}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      <Face cx={24} cy={24} s={0.85} blush />
    </>
  ),
  heart: () => (
    <>
      <path
        d="M24 42S5 30.5 5 17.5C5 11.4 9.7 7 15.2 7c3.8 0 6.9 2.1 8.8 5.2C25.9 9.1 29 7 32.8 7 38.3 7 43 11.4 43 17.5 43 30.5 24 42 24 42z"
        fill={KC.red}
        stroke={INK}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      <path d="M11 16c0-2.4 1.7-4.2 4-4.2" fill="none" stroke={KC.white} strokeWidth={2.5} strokeLinecap="round" />
      <Face cx={24} cy={22} s={0.85} />
    </>
  ),
  smiley: () => (
    <>
      <circle cx={24} cy={24} r={20} fill={KC.yellow} stroke={INK} strokeWidth={SW} />
      <ellipse cx={17.5} cy={19.5} rx={2.4} ry={3.8} fill={INK} />
      <ellipse cx={30.5} cy={19.5} rx={2.4} ry={3.8} fill={INK} />
      <path d="M13.5 27.5c4.5 8 16.5 8 21 0" fill="none" stroke={INK} strokeWidth={SW} strokeLinecap="round" />
    </>
  ),
  flower: () => (
    <>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse
          key={a}
          cx={24}
          cy={12}
          rx={7.5}
          ry={9.5}
          fill={KC.blue}
          stroke={INK}
          strokeWidth={SW}
          transform={`rotate(${a} 24 24)`}
        />
      ))}
      <circle cx={24} cy={24} r={8} fill={KC.yellow} stroke={INK} strokeWidth={SW} />
      <circle cx={21.5} cy={23} r={1.1} fill={INK} />
      <circle cx={26.5} cy={23} r={1.1} fill={INK} />
      <path d="M22 26q2 2 4 0" fill="none" stroke={INK} strokeWidth={1.4} strokeLinecap="round" />
    </>
  ),
  rainbow: () => {
    const bands = [KC.red, KC.orange, KC.yellow, KC.green, KC.blue];
    return (
      <>
        {bands.map((c, i) => {
          const r = 20 - i * 3.2;
          return <path key={c} d={`M${24 - r} 36a${r} ${r} 0 0 1 ${r * 2} 0`} fill="none" stroke={c} strokeWidth={3.6} />;
        })}
        <path d="M2.2 36a21.8 21.8 0 0 1 43.6 0" fill="none" stroke={INK} strokeWidth={2.4} />
        <path d="M9.4 36a14.6 14.6 0 0 1 29.2 0" fill="none" stroke={INK} strokeWidth={2.4} />
        <ellipse cx={7} cy={36} rx={6.5} ry={4.5} fill={KC.white} stroke={INK} strokeWidth={2.4} />
        <ellipse cx={41} cy={36} rx={6.5} ry={4.5} fill={KC.white} stroke={INK} strokeWidth={2.4} />
      </>
    );
  },
  sparkle: () => (
    <path
      d="M24 4c1.8 10.4 8.6 17.2 19 19-10.4 1.8-17.2 8.6-19 19-1.8-10.4-8.6-17.2-19-19C15.4 21.2 22.2 14.4 24 4z"
      fill={KC.purple}
      stroke={INK}
      strokeWidth={SW}
      strokeLinejoin="round"
    />
  ),
  sun: () => (
    <>
      {Array.from({ length: 8 }, (_, i) => i * 45).map((a) => (
        <path
          key={a}
          d="M24 1.5l3.6 7.5h-7.2z"
          fill={KC.orange}
          stroke={INK}
          strokeWidth={2.2}
          strokeLinejoin="round"
          transform={`rotate(${a} 24 24)`}
        />
      ))}
      <circle cx={24} cy={24} r={13} fill={KC.yellow} stroke={INK} strokeWidth={SW} />
      <Face cx={24} cy={24} s={0.75} blush />
    </>
  ),
  cloud: () => (
    <>
      <path
        d="M12 36c-5.5 0-9-3.6-9-8 0-4.2 3.2-7.6 7.4-7.9C11.6 13.8 17 9.5 23 9.5c5.2 0 9.6 3 11.3 7.6 5.6-.3 10.2 4 10.2 9.6 0 5.2-4 9.3-9.3 9.3z"
        fill={KC.white}
        stroke={INK}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      <Face cx={24} cy={25} s={0.8} blush />
    </>
  ),
  mushroom: () => (
    <>
      <path d="M17 26h14l1.5 14c.2 2-1.4 3.5-3.4 3.5H18.9c-2 0-3.6-1.5-3.4-3.5z" fill={KC.white} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M4 26C4 14.5 13 6 24 6s20 8.5 20 20z" fill={KC.red} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <circle cx={14} cy={17} r={3.2} fill={KC.white} />
      <circle cx={26} cy={12} r={2.6} fill={KC.white} />
      <circle cx={34} cy={19} r={3.4} fill={KC.white} />
      <circle cx={21} cy={33} r={1} fill={INK} />
      <circle cx={27} cy={33} r={1} fill={INK} />
      <path d="M22.3 36.3q1.7 1.6 3.4 0" fill="none" stroke={INK} strokeWidth={1.5} strokeLinecap="round" />
    </>
  ),
  bolt: () => (
    <path
      d="M28 3L9 27h12l-4 18 22-26H26z"
      fill={KC.yellow}
      stroke={INK}
      strokeWidth={SW}
      strokeLinejoin="round"
    />
  ),
  cherries: () => (
    <>
      <path d="M15 31C17 20 22 12 31 6M33 31c-1-9-1-17-2-25" fill="none" stroke={KC.green} strokeWidth={3} strokeLinecap="round" />
      <path d="M31 6c4-2 9-1 11 2-4 2-8 2-11-2z" fill={KC.green} stroke={INK} strokeWidth={2.2} strokeLinejoin="round" />
      <circle cx={14} cy={35} r={9} fill={KC.red} stroke={INK} strokeWidth={SW} />
      <circle cx={34} cy={35} r={9} fill={KC.red} stroke={INK} strokeWidth={SW} />
      <path d="M9.5 32.5q1.5-3 4-3.2M29.5 32.5q1.5-3 4-3.2" fill="none" stroke={KC.white} strokeWidth={2} strokeLinecap="round" />
    </>
  ),
  ghost: () => (
    <>
      <path
        d="M9 44V21C9 12 15.7 5 24 5s15 7 15 16v23l-5-4-5 4-5-4-5 4-5-4z"
        fill={KC.white}
        stroke={INK}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      <Face cx={24} cy={21} s={0.85} blush />
    </>
  ),
};

/** The editor's kidcore sticker tray, in display order. */
export const KIDCORE_STICKERS = Object.keys(SHAPES).map((k) => `kc:${k}`);

export const KIDCORE_BACKGROUND_COLORS = [
  { name: "Old Paper", value: "#FBF1DC" },
  { name: "Mustard", value: "#F4C04A" },
  { name: "Bubblegum", value: "#F39BB8" },
  { name: "Sky", value: "#8EC3EA" },
  { name: "Mint", value: "#A8D5A2" },
  { name: "Grape", value: "#B9A3DC" },
  { name: "Tomato", value: "#E0533D" },
];

export function isDoodle(id: string): boolean {
  return id.startsWith("kc:") && id.slice(3) in SHAPES;
}

/* The sticker filter: wobble the art, grow a white border around it, drop a soft shadow. */
function StickerFilter({ id, cut }: { id: string; cut: boolean }) {
  return (
    <filter id={id} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="4" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.2" xChannelSelector="R" yChannelSelector="G" result="art" />
      {cut ? (
        <>
          <feMorphology in="art" operator="dilate" radius="2.6" result="fat" />
          <feFlood floodColor={KC.white} result="white" />
          <feComposite in="white" in2="fat" operator="in" result="border" />
          <feOffset in="fat" dx="1.6" dy="2.2" result="offset" />
          <feFlood floodColor={INK} floodOpacity="0.42" />
          <feComposite in2="offset" operator="in" result="shadow" />
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="border" />
            <feMergeNode in="art" />
          </feMerge>
        </>
      ) : (
        <feMerge>
          <feMergeNode in="art" />
        </feMerge>
      )}
    </filter>
  );
}

interface DoodleProps {
  /** "star" or "kc:star" */
  name: string;
  /** rendered pixel size of the whole sticker, border included */
  size?: number;
  /** white die-cut border + shadow (default true) */
  cut?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function Doodle({ name, size = 48, cut = true, className, style }: DoodleProps) {
  const key = name.startsWith("kc:") ? name.slice(3) : name;
  const shape = SHAPES[key];
  const filterId = `kcf${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  if (!shape) return null;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="-6 -6 60 60"
      className={className}
      style={{ overflow: "visible", ...style }}
      aria-hidden="true"
    >
      <defs>
        <StickerFilter id={filterId} cut={cut} />
      </defs>
      <g filter={`url(#${filterId})`}>{shape()}</g>
    </svg>
  );
}

/** Renders a sticker id: a doodle for "kc:*" ids, otherwise the emoji itself. */
export function StickerGlyph({ id, size }: { id: string; size: number }) {
  if (isDoodle(id)) return <Doodle name={id} size={size * 1.25} />;
  return <>{id}</>;
}

/** Data URL for drawing a doodle onto a canvas at `px` pixels.
 *  react-dom/server is loaded on demand so it only ships when someone exports. */
export async function doodleImageSrc(id: string, px: number): Promise<string> {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const markup = renderToStaticMarkup(<Doodle name={id} size={px} />);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
}

/** Global SVG filter used for hand-printed wobble on non-sticker elements (title, strip). */
export function KidcoreDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
      <filter id="kc-wobble">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" />
        <feDisplacementMap in="SourceGraphic" scale="2.6" />
      </filter>
    </svg>
  );
}
