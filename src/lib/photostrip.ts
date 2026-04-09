export interface Sticker {
  id: string;
  emoji: string;
  x: number;
  y: number;
  scale: number;
}

export interface TextBubble {
  id: string;
  text: string;
  x: number;
  y: number;
}

export type AppState =
  | "idle"
  | "camera-ready"
  | "countdown"
  | "capturing"
  | "processing"
  | "reveal"
  | "editing"
  | "final";

export const STICKERS = ["🩷", "🦢", "🫧", "🪞", "☁️", "🌸", "🎀", "✨", "🕯️", "🧸", "🤍", "💌"];

export const BACKGROUND_COLORS = [
  { name: "Ivory Cream", value: "#F7F3EF" },
  { name: "Warm White", value: "#FFFDFC" },
  { name: "Dusty Rose", value: "#E8C4BF" },
  { name: "Lavender", value: "#D8D4F0" },
  { name: "Powder Blue", value: "#C8DCF0" },
  { name: "Sage", value: "#D8E4D4" },
  { name: "Butter", value: "#F8EFC8" },
];

// Preview dimensions — single source of truth used by both preview and export
export const STRIP = {
  WIDTH: 220,
  PADDING: 14,
  GAP: 14,
  get PHOTO_WIDTH() { return this.WIDTH - this.PADDING * 2; },
  get PHOTO_HEIGHT() { return Math.round(this.PHOTO_WIDTH * (3 / 4)); },
  get HEIGHT() { return this.PADDING * 2 + this.PHOTO_HEIGHT * 3 + this.GAP * 2; },
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = src;
  });
}

/**
 * Crop an image to exact pixel dimensions using object-fit:cover center-crop.
 */
function cropToCover(src: string, targetW: number, targetH: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d")!;
      const srcAspect = img.width / img.height;
      const dstAspect = targetW / targetH;
      let sx = 0, sy = 0, sw = img.width, sh = img.height;
      if (srcAspect > dstAspect) {
        sw = img.height * dstAspect;
        sx = (img.width - sw) / 2;
      } else {
        sh = img.width / dstAspect;
        sy = (img.height - sh) / 2;
      }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);
      resolve(canvas.toDataURL("image/jpeg", 0.97));
    };
    img.src = src;
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function addGrain(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 18;
    data[i]     = Math.min(255, Math.max(0, data[i]     + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imageData, 0, 0);
}

export async function exportStrip(
  photos: string[],
  backgroundColor: string,
  stickers: Sticker[],
  bubbles: TextBubble[],
): Promise<void> {
  const SCALE = 3;
  const W = STRIP.WIDTH * SCALE;
  const H = STRIP.HEIGHT * SCALE;
  const PAD = STRIP.PADDING * SCALE;
  const GAP = STRIP.GAP * SCALE;
  const PW = STRIP.PHOTO_WIDTH * SCALE;
  const PH = STRIP.PHOTO_HEIGHT * SCALE;

  // Pre-crop every photo to exact 4:3 dimensions — no reliance on object-fit
  const croppedSrcs = await Promise.all(photos.map((src) => cropToCover(src, PW, PH)));
  const imgs = await Promise.all(croppedSrcs.map(loadImage));

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, W, H);

  // Photos
  imgs.forEach((img, i) => {
    const x = PAD;
    const y = PAD + i * (PH + GAP);
    ctx.save();
    roundRect(ctx, x, y, PW, PH, 6 * SCALE);
    ctx.clip();
    ctx.drawImage(img, x, y, PW, PH);
    ctx.restore();
  });

  // Scale from preview coords to export coords
  const sx = W / STRIP.WIDTH;
  const sy = H / STRIP.HEIGHT;

  // Stickers — rendered as text (best emoji quality in canvas)
  stickers.forEach((s) => {
    ctx.save();
    ctx.font = `${28 * s.scale * SCALE}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(s.emoji, s.x * sx, s.y * sy);
    ctx.restore();
  });

  // Speech bubbles — precisely matching the CSS layout in PhotostripPreview
  // In CSS: transform translate(-50%, -100%) means anchor is at bottom-center of bubble
  // The tail is below the bubble body (absolute bottom: -6px)
  bubbles.forEach((b) => {
    if (!b.text.trim()) return;

    const bx = b.x * sx;
    const by = b.y * sy;

    // Match CSS: font-size 11px, padding 5px top/bottom, 9px left/right, line-height 1.4
    const fontSize = 11 * SCALE;
    const lineH = fontSize * 1.4;
    const padX = 9 * SCALE;
    const padY = 5 * SCALE;
    const maxTW = 140 * SCALE;
    const tailH = 6 * SCALE;
    const br = 8 * SCALE;

    ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
    ctx.textAlign = "left";

    // Measure text, respecting maxWidth
    const rawW = ctx.measureText(b.text).width;
    const tw = Math.min(rawW, maxTW);
    const bw = tw + padX * 2;
    const bh = lineH + padY * 2;

    // CSS: translate(-50%, -100%) — bubble bottom aligns with anchor y
    // tail sits below bubble body (bottom: -6px of the bubble div)
    const bLeft = bx - bw / 2;
    const bTop = by - bh - tailH;

    // Shadow + white bubble body
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.15)";
    ctx.shadowBlur = 8 * SCALE;
    ctx.shadowOffsetY = 2 * SCALE;
    ctx.fillStyle = "#ffffff";
    roundRect(ctx, bLeft, bTop, bw, bh, br);
    ctx.fill();

    // Tail
    ctx.beginPath();
    ctx.moveTo(bx - 5 * SCALE, by - tailH);
    ctx.lineTo(bx, by);
    ctx.lineTo(bx + 5 * SCALE, by - tailH);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Text centred inside bubble
    ctx.fillStyle = "#2F2F2F";
    ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(b.text, bx, bTop + bh / 2, maxTW);
  });

  // Grain
  addGrain(ctx, W, H);

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `photostrip-${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}
