import { useDrop } from "react-dnd"
import type { Block } from "../lib/types"
import BlockComponent from "./Block"
import { useCallback } from "react"
import { useRef, useEffect } from "react"

interface CodeAreaProps {
  blocks: Block[]
  updateBlocks: (blocks: Block[]) => void
}

export default function CodeArea({ blocks, updateBlocks }: CodeAreaProps) {
  const dropRef = useRef<HTMLDivElement>(null)
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "BLOCK",
    drop: (item: Block) => {
      updateBlocks([...blocks, item])
      return undefined
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }))

  const handleUpdateBlock = (updatedBlock: Block) => {
    updateBlocks(blocks.map((block) => (block.id === updatedBlock.id ? updatedBlock : block)))
  }

  const handleDeleteBlock = (id: string) => {
    updateBlocks(blocks.filter((block) => block.id !== id))
  }

  const handleAddToRepeat = (repeatId: string, newBlock: Block) => {
    updateBlocks(
      blocks.map((block) => {
        if (block.id === repeatId && block.type === "repeat") {
          return {
            ...block,
            blocks: [...(block.blocks || []), newBlock],
          }
        }
        return block
      }),
    )
  }

  const handleUpdateRepeatBlock = (repeatId: string, updatedBlock: Block) => {
    updateBlocks(
      blocks.map((block) => {
        if (block.id === repeatId && block.type === "repeat") {
          return {
            ...block,
            blocks: (block.blocks || []).map((b) => (b.id === updatedBlock.id ? updatedBlock : b)),
          }
        }
        return block
      }),
    )
  }

  const handleDeleteFromRepeat = (repeatId: string, blockId: string) => {
    updateBlocks(
      blocks.map((block) => {
        if (block.id === repeatId && block.type === "repeat") {
          return {
            ...block,
            blocks: (block.blocks || []).filter((b) => b.id !== blockId),
          }
        }
        return block
      }),
    )
  }

  const moveBlock = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const dragBlock = blocks[dragIndex]
      const newBlocks = [...blocks]
      newBlocks.splice(dragIndex, 1)
      newBlocks.splice(hoverIndex, 0, dragBlock)
      updateBlocks(newBlocks)
    },
    [blocks, updateBlocks],
  )

  useEffect(() => {
    if (dropRef.current) {
      drop(dropRef)
    }
  }, [drop])
  return (
    <div
      ref={dropRef}
      className={`min-h-[300px] p-4 rounded-lg border-2 ${isOver ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
    >
      {blocks.length === 0 ? (
        <div className="text-gray-400 text-center">Drag blocks here</div>
      ) : (
        <div className="space-y-2">
          {blocks.map((block, index) => (
            <BlockComponent
              key={block.id}
              block={block}
              onUpdate={handleUpdateBlock}
              onDelete={handleDeleteBlock}
              onAddToRepeat={handleAddToRepeat}
              onUpdateRepeatBlock={handleUpdateRepeatBlock}
              onDeleteFromRepeat={handleDeleteFromRepeat}
              index={index}
              moveBlock={moveBlock}
            />
          ))}
        </div>
      )}
    </div>
  )
}
