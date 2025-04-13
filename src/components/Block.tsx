import { useDrop } from "react-dnd"
import {
  ArrowRight,
  RotateCw,
  RotateCcw,
  MapPin,
  Repeat,
  MessageSquare,
  MessageCircle,
  Trash2,
  GripVertical,
} from "lucide-react"
import type { Block } from "../lib/types"
import { useDrag } from "react-dnd"
import { useRef } from "react"

interface BlockProps {
  block: Block
  onUpdate: (block: Block) => void
  onDelete: (id: string) => void
  onAddToRepeat?: (repeatId: string, block: Block) => void
  onUpdateRepeatBlock?: (repeatId: string, block: Block) => void
  onDeleteFromRepeat?: (repeatId: string, blockId: string) => void
  isNested?: boolean
  repeatId?: string
  index?: number
  moveBlock?: (dragIndex: number, hoverIndex: number) => void
}

export default function BlockComponent({
  block,
  onUpdate,
  onDelete,
  onAddToRepeat,
  onUpdateRepeatBlock,
  onDeleteFromRepeat,
  isNested = false,
  repeatId,
  index,
  moveBlock,
}: BlockProps) {
  const ref = useRef<HTMLDivElement>(null)

  const handleUpdate = (updates: Partial<Block>) => {
    const updatedBlock = { ...block, ...updates }
    if (isNested && repeatId && onUpdateRepeatBlock) {
      onUpdateRepeatBlock(repeatId, updatedBlock)
    } else {
      onUpdate(updatedBlock)
    }
  }

  const handleDelete = () => {
    if (isNested && repeatId && onDeleteFromRepeat) {
      onDeleteFromRepeat(repeatId, block.id)
    } else {
      onDelete(block.id)
    }
  }

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: "BLOCK",
      drop: (item: Block) => {
        if (block.type === "repeat" && onAddToRepeat) {
          onAddToRepeat(block.id, item)
        }
        return undefined
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver({ shallow: true }),
      }),
    }),
    [block],
  )

  const [{ isDragging }, drag] = useDrag({
    type: "REORDER_BLOCK",
    item: () => ({ id: block.id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const [, dropReorder] = useDrop({
    accept: "REORDER_BLOCK",
    hover: (item: { id: string; index: number }) => {
      if (!moveBlock || !ref.current) return
      const dragIndex = item.index!
      const hoverIndex = index!

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }

      moveBlock(dragIndex, hoverIndex)
      item.index = hoverIndex
    },
  })

  drop(ref)
  dropReorder(ref)

  let blockContent
  let blockColor

  switch (block.type) {
    case "move":
      blockColor = "bg-blue-500"
      blockContent = (
        <div className="flex items-center flex-wrap">
          <ArrowRight className="h-4 w-4 mr-2" />
          <span>Move X:</span>
          <input
            type="number"
            value={block.moveX}
            onChange={(e) => handleUpdate({ moveX: Number(e.target.value) })}
            className="w-16 mx-2 h-6 text-black px-2 rounded"
            aria-label="text"
          />
          <span>Y:</span>
          <input
            type="number"
            value={block.moveY}
            onChange={(e) => handleUpdate({ moveY: Number(e.target.value) })}
            className="w-16 mx-2 h-6 text-black px-2 rounded"
            aria-label="text"
          />
        </div>
      )
      break

    case "turn":
      blockColor = "bg-blue-500"
      blockContent = (
        <div className="flex items-center">
          {block.rotationDirection === "clockwise" ? (
            <RotateCw className="h-4 w-4 mr-2" />
          ) : (
            <RotateCcw className="h-4 w-4 mr-2" />
          )}
          <span>Turn</span>
          <select
            value={block.rotationDirection}
            onChange={(e) => handleUpdate({ rotationDirection: e.target.value as "clockwise" | "counterclockwise" })}
            className="mx-2 h-6 text-black px-2 rounded"
            aria-label="text"
          >
            <option value="clockwise">Clockwise</option>
            <option value="counterclockwise">Counter-clockwise</option>
          </select>
          <input
            type="number"
            value={block.degrees}
            onChange={(e) => handleUpdate({ degrees: Number(e.target.value) })}
            className="w-16 mx-2 h-6 text-black px-2 rounded"
            aria-label="text"
          />
          <span>degrees</span>
        </div>
      )
      break

    case "goto":
      blockColor = "bg-blue-500"
      blockContent = (
        <div className="flex items-center">
          <MapPin className="h-4 w-4 mr-2" />
          <span>Go to x:</span>
          <input
            type="number"
            value={block.x}
            onChange={(e) => handleUpdate({ x: Number(e.target.value) })}
            className="w-16 mx-2 h-6 text-black px-2 rounded"
            aria-label="text"
          />
          <span>y:</span>
          <input
            type="number"
            value={block.y}
            onChange={(e) => handleUpdate({ y: Number(e.target.value) })}
            className="w-16 mx-2 h-6 text-black px-2 rounded"
            aria-label="text"
          />
        </div>
      )
      break

    case "say":
      blockColor = "bg-purple-500"
      blockContent = (
        <div className="flex items-center">
          <MessageSquare className="h-4 w-4 mr-2" />
          <span>Say</span>
          <input
            type="text"
            value={block.text}
            onChange={(e) => handleUpdate({ text: e.target.value })}
            className="w-24 mx-2 h-6 text-black px-2 rounded"
            aria-label="text"
          />
          <span>for</span>
          <input
            type="number"
            value={block.seconds}
            onChange={(e) => handleUpdate({ seconds: Number(e.target.value) })}
            className="w-16 mx-2 h-6 text-black px-2 rounded"
            aria-label="text"
          />
          <span>seconds</span>
        </div>
      )
      break

    case "think":
      blockColor = "bg-purple-500"
      blockContent = (
        <div className="flex items-center">
          <MessageCircle className="h-4 w-4 mr-2" />
          <span>Think</span>
          <input
            type="text"
            value={block.text}
            onChange={(e) => handleUpdate({ text: e.target.value })}
            className="w-24 mx-2 h-6 text-black px-2 rounded"
            aria-label="text"
          />
          <span>for</span>
          <input
            type="number"
            value={block.seconds}
            onChange={(e) => handleUpdate({ seconds: Number(e.target.value) })}
            className="w-16 mx-2 h-6 text-black px-2 rounded"
            aria-label="text"
          />
          <span>seconds</span>
        </div>
      )
      break

    case "repeat":
      blockColor = "bg-orange-500"
      blockContent = (
        <div className="w-full">
          <div className="flex items-center">
            <Repeat className="h-4 w-4 mr-2" />
            <span>Repeat animation</span>
          </div>
          <div className={`mt-2 p-2 rounded-md ${isOver ? "bg-orange-400" : "bg-orange-400/50"}`}>
            {block.blocks && block.blocks.length > 0 ? (
              <div className="space-y-2">
                {block.blocks.map((nestedBlock, nestedIndex) => (
                  <BlockComponent
                    key={nestedBlock.id}
                    block={nestedBlock}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    onAddToRepeat={onAddToRepeat}
                    onUpdateRepeatBlock={onUpdateRepeatBlock}
                    onDeleteFromRepeat={onDeleteFromRepeat}
                    isNested={true}
                    repeatId={block.id}
                    index={nestedIndex}
                  />
                ))}
              </div>
            ) : (
              <div className="text-white/70 text-center text-sm py-1">Drag blocks here</div>
            )}
          </div>
        </div>
      )
      break

    default:
      blockColor = "bg-gray-500"
      blockContent = <div>Unknown block type: {block.type}</div>
  }

  const executedClass = block.executed ? "opacity-70" : "opacity-100"

  return (
    <div
      ref={ref}
      className={`${blockColor} text-white p-3 rounded-lg flex items-center justify-between shadow-md ${executedClass} ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      {moveBlock && (
        <div ref={drag} className="cursor-move mr-2 p-1 hover:bg-white/20 rounded">
          <GripVertical className="h-4 w-4" />
        </div>
      )}
      <div className="flex-1">{blockContent}</div>
      <button onClick={handleDelete} className="h-6 w-6 text-white hover:bg-red-600 hover:text-white ml-2 rounded" aria-label="text">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}
