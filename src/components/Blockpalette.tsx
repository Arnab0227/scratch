import type React from "react"
import { useDrag } from "react-dnd"
import { ArrowRight, RotateCw, MapPin, Repeat, MessageSquare, MessageCircle } from "lucide-react"
import { nanoid } from "nanoid"
import type { Block } from "../lib/types"

const blockTypes = [
  {
    category: "Motion",
    blocks: [
      { type: "move", label: "Move", icon: <ArrowRight className="h-4 w-4" />, color: "bg-blue-500" },
      { type: "turn", label: "Turn", icon: <RotateCw className="h-4 w-4" />, color: "bg-blue-500" },
      { type: "goto", label: "Go to", icon: <MapPin className="h-4 w-4" />, color: "bg-blue-500" },
    ],
  },
  {
    category: "Looks",
    blocks: [
      { type: "say", label: "Say", icon: <MessageSquare className="h-4 w-4" />, color: "bg-purple-500" },
      { type: "think", label: "Think", icon: <MessageCircle className="h-4 w-4" />, color: "bg-purple-500" },
    ],
  },
  {
    category: "Control",
    blocks: [{ type: "repeat", label: "Repeat", icon: <Repeat className="h-4 w-4" />, color: "bg-orange-500" }],
  },
]

interface DraggableBlockProps {
  type: string
  label: string
  icon: React.ReactNode
  color: string
}

function DraggableBlock({ type, label, icon, color }: DraggableBlockProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "BLOCK",
    item: () => {
      const blockData: Partial<Block> = {
        id: nanoid(),
        type,
        executed: false,
      }

      switch (type) {
        case "move":
          blockData.moveX = 10
          blockData.moveY = 0
          break
        case "turn":
          blockData.degrees = 15
          blockData.rotationDirection = "clockwise"
          break
        case "goto":
          blockData.x = 0
          blockData.y = 0
          break
        case "say":
          blockData.text = "Hello!"
          blockData.seconds = 2
          break
        case "think":
          blockData.text = "Hmm..."
          blockData.seconds = 2
          break
        case "repeat":
          blockData.blocks = []
          break
      }

      return blockData as Block
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  return (
    <div
      ref={drag}
      className={`${color} text-white p-3 rounded-lg mb-2 cursor-move flex items-center shadow-sm ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      <div className="mr-2">{icon}</div>
      <span>{label}</span>
    </div>
  )
}

export default function BlockPalette() {
  return (
    <div className="space-y-4">
      {blockTypes.map((category) => (
        <div key={category.category}>
          <h3 className="font-medium text-gray-700 mb-2">{category.category}</h3>
          <div className="space-y-2">
            {category.blocks.map((block) => (
              <DraggableBlock
                key={block.type}
                type={block.type}
                label={block.label}
                icon={block.icon}
                color={block.color}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
