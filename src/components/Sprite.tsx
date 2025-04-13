import type React from "react";

import { useState, useEffect, useRef } from "react";
import type { Sprite as SpriteType } from "../lib/types";

interface SpriteProps {
  sprite: SpriteType;
  isSelected: boolean;
  updatePosition: (x: number, y: number) => void;
}

export default function Sprite({
  sprite,
  isSelected,
  updatePosition,
}: SpriteProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const spriteRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (spriteRef.current) {
      const rect = spriteRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && spriteRef.current) {
      const parentRect =
        spriteRef.current.parentElement?.getBoundingClientRect();
      if (parentRect) {
        const x = e.clientX - parentRect.left - dragOffset.x;
        const y = e.clientY - parentRect.top - dragOffset.y;
        updatePosition(x, y);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const spriteStyle = {
    transform: `translate(${sprite.x}px, ${sprite.y}px) rotate(${
      sprite.direction - 90
    }deg)`,
    cursor: isDragging ? "grabbing" : "grab",
  };

  return (
    <div
      ref={spriteRef}
      data-sprite-id={sprite.id}
      className={`absolute text-4xl transition-transform ${
        isSelected ? "outline outline-2 outline-blue-500 rounded-full" : ""
      }`}
      style={spriteStyle}
      onMouseDown={handleMouseDown}
    >
      <div className="relative">
        <div>{sprite.costume}</div>

        {sprite.sayText && (
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white p-2 rounded-lg border border-gray-300 min-w-[100px] text-sm text-center before:content-[''] before:absolute before:bottom-[-8px] before:left-1/2 before:-translate-x-1/2 before:border-l-[8px] before:border-l-transparent before:border-r-[8px] before:border-r-transparent before:border-t-[8px] before:border-t-white">
            {sprite.sayText}
          </div>
        )}

        {sprite.thinkText && (
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white p-2 rounded-full border border-gray-300 min-w-[100px] text-sm text-center before:content-[''] before:absolute before:bottom-[-12px] before:left-1/2 before:-translate-x-1/2 before:w-3 before:h-3 before:rounded-full before:bg-white before:border before:border-gray-300 after:content-[''] after:absolute after:bottom-[-20px] after:left-1/2 after:-translate-x-1/2 after:w-2 after:h-2 after:rounded-full after:bg-white after:border after:border-gray-300">
            {sprite.thinkText}
          </div>
        )}
      </div>
    </div>
  );
}
