"use client"
import type { Sprite } from "../lib/types"

interface SpriteListProps {
  sprites: Sprite[]
  selectedSpriteId: string
  onSelectSprite: (id: string) => void
}

export default function SpriteList({ sprites, selectedSpriteId, onSelectSprite }: SpriteListProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {sprites.map((sprite) => (
        <button
          key={sprite.id}
          onClick={() => onSelectSprite(sprite.id)}
          className={`flex items-center gap-2 px-3 py-1 text-sm rounded-md ${
            sprite.id === selectedSpriteId ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <span className="text-lg">{sprite.costume}</span>
          <span>{sprite.name}</span>
        </button>
      ))}
    </div>
  )
}
