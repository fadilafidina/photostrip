import { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import type { Sticker, TextBubble } from "@/lib/photostrip";
import { STRIP } from "@/lib/photostrip";

interface Props {
  photos: string[];
  backgroundColor: string;
  stickers: Sticker[];
  bubbles: TextBubble[];
  onStickerMove: (id: string, x: number, y: number) => void;
  onStickerRemove: (id: string) => void;
  onBubbleMove: (id: string, x: number, y: number) => void;
  onBubbleRemove: (id: string) => void;
}

type DragTarget = { kind: "sticker" | "bubble"; id: string };

export default function PhotostripPreview({
  photos,
  backgroundColor,
  stickers,
  bubbles,
  onStickerMove,
  onStickerRemove,
  onBubbleMove,
  onBubbleRemove,
}: Props) {
  const stripRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<DragTarget | null>(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const W = STRIP.WIDTH;
  const H = STRIP.HEIGHT;

  function getMoveHandler(target: DragTarget) {
    return (clientX: number, clientY: number) => {
      if (!stripRef.current) return;
      const rect = stripRef.current.getBoundingClientRect();
      const x = clientX - rect.left - offsetRef.current.x;
      const y = clientY - rect.top - offsetRef.current.y;
      if (target.kind === "sticker") onStickerMove(target.id, x, y);
      else onBubbleMove(target.id, x, y);
    };
  }

  function startDrag(
    target: DragTarget,
    clientX: number,
    clientY: number,
    itemX: number,
    itemY: number
  ) {
    draggingRef.current = target;
    setDraggingId(target.id);
    const rect = stripRef.current!.getBoundingClientRect();
    offsetRef.current = {
      x: clientX - (rect.left + itemX),
      y: clientY - (rect.top + itemY),
    };
    const move = getMoveHandler(target);

    function onMouseMove(e: MouseEvent) { move(e.clientX, e.clientY); }
    function onTouchMove(e: TouchEvent) { move(e.touches[0].clientX, e.touches[0].clientY); }
    function end() {
      draggingRef.current = null;
      setDraggingId(null);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", end);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", end);
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", end);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", end);
  }

  return (
    <div
      id="photostrip-area"
      ref={stripRef}
      className="relative select-none"
      style={{
        width: W,
        height: H,
        backgroundColor,
        borderRadius: 14,
        padding: STRIP.PADDING,
        display: "flex",
        flexDirection: "column",
        gap: STRIP.GAP,
        overflow: "hidden",
        boxShadow: "0 12px 32px rgba(0,0,0,0.11), 0 4px 10px rgba(0,0,0,0.07)",
        boxSizing: "border-box",
      }}
    >
      {/* Photos — landscape 4:3 */}
      {photos.map((photo, i) => (
        <div
          key={i}
          style={{
            width: STRIP.PHOTO_WIDTH,
            height: STRIP.PHOTO_HEIGHT,
            borderRadius: 6,
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <img
            src={photo}
            alt={`Photo ${i + 1}`}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>
      ))}

      {/* Stickers */}
      {stickers.map((sticker) => (
        <motion.div
          key={sticker.id}
          className="absolute cursor-grab active:cursor-grabbing"
          style={{
            left: sticker.x,
            top: sticker.y,
            fontSize: `${28 * sticker.scale}px`,
            transform: "translate(-50%, -50%)",
            zIndex: draggingId === sticker.id ? 50 : 10,
            userSelect: "none",
            touchAction: "none",
            lineHeight: 1,
          }}
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 18 }}
          onMouseDown={(e) => {
            e.preventDefault();
            startDrag({ kind: "sticker", id: sticker.id }, e.clientX, e.clientY, sticker.x, sticker.y);
          }}
          onTouchStart={(e) => {
            const t = e.touches[0];
            startDrag({ kind: "sticker", id: sticker.id }, t.clientX, t.clientY, sticker.x, sticker.y);
          }}
          onDoubleClick={() => onStickerRemove(sticker.id)}
          title="Drag to move · Double-click to remove"
        >
          {sticker.emoji}
        </motion.div>
      ))}

      {/* Speech bubbles */}
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className="absolute cursor-grab active:cursor-grabbing"
          style={{
            left: bubble.x,
            top: bubble.y,
            transform: "translate(-50%, -100%)",
            zIndex: draggingId === bubble.id ? 50 : 15,
            userSelect: "none",
            touchAction: "none",
          }}
          initial={{ scale: 0, y: 8 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 20 }}
          onMouseDown={(e) => {
            e.preventDefault();
            startDrag({ kind: "bubble", id: bubble.id }, e.clientX, e.clientY, bubble.x, bubble.y - 20);
          }}
          onTouchStart={(e) => {
            const t = e.touches[0];
            startDrag({ kind: "bubble", id: bubble.id }, t.clientX, t.clientY, bubble.x, bubble.y - 20);
          }}
          onDoubleClick={() => onBubbleRemove(bubble.id)}
          title="Drag to move · Double-click to remove"
        >
          {/* Bubble body */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: 8,
              padding: "5px 9px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              fontSize: 11,
              fontFamily: "'Inter', sans-serif",
              color: "#2F2F2F",
              fontWeight: 400,
              whiteSpace: "nowrap",
              maxWidth: 140,
              overflow: "hidden",
              textOverflow: "ellipsis",
              lineHeight: 1.4,
              position: "relative",
            }}
          >
            {bubble.text || "…"}
            {/* Tail */}
            <div
              style={{
                position: "absolute",
                bottom: -6,
                left: "50%",
                transform: "translateX(-50%)",
                width: 0,
                height: 0,
                borderLeft: "5px solid transparent",
                borderRight: "5px solid transparent",
                borderTop: "6px solid #ffffff",
                filter: "drop-shadow(0 2px 1px rgba(0,0,0,0.10))",
              }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
