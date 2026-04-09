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

export const STICKERS = ["💖", "✨", "🎀", "🌸", "🫶", "⭐", "🐻"];

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
  bubbles: TextBubble[]
): Promise<void> {
  // Preload images
  const imgs = await Promise.all(
    photos.map(
      (src) =>
        new Promise<HTMLImageElement>((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.src = src;
        })
    )
  );

  const EXP = 3; // export scale factor relative to preview
  const W = STRIP.WIDTH * EXP;
  const H = STRIP.HEIGHT * EXP;
  const PAD = STRIP.PADDING * EXP;
  const GAP = STRIP.GAP * EXP;
  const PW = STRIP.PHOTO_WIDTH * EXP;
  const PH = STRIP.PHOTO_HEIGHT * EXP;

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
    roundRect(ctx, x, y, PW, PH, 6 * EXP);
    ctx.clip();
    ctx.drawImage(img, x, y, PW, PH);
    ctx.restore();
  });

  // Stickers — scale from preview coords
  const scaleX = W / STRIP.WIDTH;
  const scaleY = H / STRIP.HEIGHT;
  stickers.forEach((s) => {
    ctx.save();
    ctx.font = `${28 * s.scale * EXP}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(s.emoji, s.x * scaleX, s.y * scaleY);
    ctx.restore();
  });

  // Text bubbles
  bubbles.forEach((b) => {
    if (!b.text.trim()) return;
    const bx = b.x * scaleX;
    const by = b.y * scaleY;
    const fontSize = 13 * EXP;
    ctx.font = `${fontSize}px 'Inter', sans-serif`;
    const metrics = ctx.measureText(b.text);
    const tw = metrics.width;
    const th = fontSize;
    const bpad = 8 * EXP;
    const bw = tw + bpad * 2;
    const bh = th + bpad * 2;
    const tailH = 6 * EXP;
    const br = 6 * EXP;

    // Shadow
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.15)";
    ctx.shadowBlur = 6 * EXP;
    ctx.shadowOffsetY = 2 * EXP;

    // Bubble body
    ctx.fillStyle = "#ffffff";
    roundRect(ctx, bx - bw / 2, by - bh - tailH, bw, bh, br);
    ctx.fill();

    // Tail
    ctx.beginPath();
    ctx.moveTo(bx - 5 * EXP, by - tailH);
    ctx.lineTo(bx, by);
    ctx.lineTo(bx + 5 * EXP, by - tailH);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Text
    ctx.fillStyle = "#2F2F2F";
    ctx.font = `${fontSize}px 'Inter', sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(b.text, bx, by - tailH - bh / 2);
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
