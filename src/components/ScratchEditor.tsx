import { useState, useRef, useEffect } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { nanoid } from "nanoid"
import { Play, Pause, RotateCw } from "lucide-react"
import BlockPalette from "./Blockpalette.tsx"
import Sprite from "./Sprite"
import SpriteList from "./SpriteList"
import CodeArea from "./CodeArea"
import type { Block, Sprite as SpriteType } from "../lib/types"

export default function ScratchEditor() {
  const [sprites, setSprites] = useState<SpriteType[]>([
    {
      id: nanoid(),
      name: "Sprite 1",
      x: 0,
      y: 0,
      direction: 90,
      blocks: [],
      costume: "🐱",
      isAnimating: false,
      sayText: "",
      sayDuration: 0,
      thinkText: "",
      thinkDuration: 0,
      currentBlockIndex: 0,
      executionComplete: false,
    },
  ])
  const [selectedSpriteId, setSelectedSpriteId] = useState<string>(sprites[0].id)
  const [isExecuting, setIsExecuting] = useState(false)
  const animationFrameRef = useRef<number | null>(null)
  const executionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const lastCollisionCheckRef = useRef<number>(0)

  const selectedSprite = sprites.find((sprite) => sprite.id === selectedSpriteId)

  const addSprite = () => {
    const costumes = ["🐱", "🐶", "🐰", "🦊", "🐻"]
    const randomCostume = costumes[Math.floor(Math.random() * costumes.length)]

    const newSprite: SpriteType = {
      id: nanoid(),
      name: `Sprite ${sprites.length + 1}`,
      x: 0,
      y: 0,
      direction: 90,
      blocks: [],
      costume: randomCostume,
      isAnimating: false,
      sayText: "",
      sayDuration: 0,
      thinkText: "",
      thinkDuration: 0,
      currentBlockIndex: 0,
      executionComplete: false,
    }

    setSprites([...sprites, newSprite])
    setSelectedSpriteId(newSprite.id)
  }

  const updateSpriteBlocks = (blocks: Block[]) => {
    setSprites(
      sprites.map((sprite) => {
        if (sprite.id === selectedSpriteId) {
          return {
            ...sprite,
            blocks,
            currentBlockIndex: 0,
            executionComplete: false,
          }
        }
        return sprite
      }),
    )
  }

  const updateSpritePosition = (id: string, x: number, y: number) => {
    setSprites(
      sprites.map((sprite) => {
        if (sprite.id === id) {
          return { ...sprite, x, y }
        }
        return sprite
      }),
    )
  }

  const checkCollisions = () => {
    const now = Date.now()
    if (now - lastCollisionCheckRef.current < 500) return
    lastCollisionCheckRef.current = now

    const spriteElements = document.querySelectorAll("[data-sprite-id]")
    const spriteRects: { id: string; rect: DOMRect }[] = []

    spriteElements.forEach((element) => {
      const id = element.getAttribute("data-sprite-id")
      if (id) {
        spriteRects.push({
          id,
          rect: element.getBoundingClientRect(),
        })
      }
    })

    for (let i = 0; i < spriteRects.length; i++) {
      for (let j = i + 1; j < spriteRects.length; j++) {
        const rect1 = spriteRects[i].rect
        const rect2 = spriteRects[j].rect

        if (
          rect1.left < rect2.right &&
          rect1.right > rect2.left &&
          rect1.top < rect2.bottom &&
          rect1.bottom > rect2.top
        ) {
          const sprite1 = sprites.find((s) => s.id === spriteRects[i].id)
          const sprite2 = sprites.find((s) => s.id === spriteRects[j].id)

          if (sprite1 && sprite2) {
            const temp = sprite1.blocks
            setSprites(
              sprites.map((sprite) => {
                if (sprite.id === sprite1.id) {
                  return {
                    ...sprite,
                    blocks: sprite2.blocks,
                    currentBlockIndex: 0,
                    executionComplete: false,
                  }
                }
                if (sprite.id === sprite2.id) {
                  return {
                    ...sprite,
                    blocks: temp,
                    currentBlockIndex: 0,
                    executionComplete: false,
                  }
                }
                return sprite
              }),
            )

            const sprite1Name = sprite1.name
            const sprite2Name = sprite2.name

            setSprites((prev) =>
              prev.map((sprite) => {
                if (sprite.id === sprite1.id) {
                  return {
                    ...sprite,
                    sayText: `Swapped with ${sprite2Name}!`,
                    sayDuration: Date.now() + 2000,
                  }
                }
                if (sprite.id === sprite2.id) {
                  return {
                    ...sprite,
                    sayText: `Swapped with ${sprite1Name}!`,
                    sayDuration: Date.now() + 2000,
                  }
                }
                return sprite
              }),
            )
          }
        }
      }
    }
  }

  const executeBlock = (spriteId: string, block: Block, timestamp: number): SpriteType => {
    const sprite = sprites.find((s) => s.id === spriteId)
    if (!sprite) return sprite!

    let updatedSprite = { ...sprite }

    switch (block.type) {
      case "move":
        updatedSprite.x += block.moveX || 0
        updatedSprite.y += block.moveY || 0
        break
      case "turn":
        if (block.rotationDirection === "clockwise") {
          updatedSprite.direction += block.degrees || 0
        } else {
          updatedSprite.direction -= block.degrees || 0
        }
        break
      case "goto":
        updatedSprite.x = block.x || 0
        updatedSprite.y = block.y || 0
        break
      case "say":
        updatedSprite.sayText = block.text || ""
        updatedSprite.sayDuration = timestamp + (block.seconds || 0) * 1000
        break
      case "think":
        updatedSprite.thinkText = block.text || ""
        updatedSprite.thinkDuration = timestamp + (block.seconds || 0) * 1000
        break
        case "repeat":
          if (block.blocks && block.blocks.length > 0) {
            const times = block.times || 1;
            for (let i = 0; i < times; i++) {
              for (const innerBlock of block.blocks) {
                updatedSprite = executeBlock(spriteId, innerBlock, timestamp)
              }
            }
            return updatedSprite
          }
          break
        
    }

    return updatedSprite
  }

  const executeNextBlock = (timestamp: number) => {
    let allComplete = true

    const updatedSprites = sprites.map((sprite) => {
      if (sprite.executionComplete || sprite.blocks.length === 0) {
        return sprite
      }

      allComplete = false
      const currentIndex = sprite.currentBlockIndex || 0

      if (currentIndex >= sprite.blocks.length) {
        return { ...sprite, executionComplete: true }
      }

      const currentBlock = sprite.blocks[currentIndex]
      const updatedSprite = executeBlock(sprite.id, currentBlock, timestamp)

      const updatedBlocks = [...sprite.blocks]
      updatedBlocks[currentIndex] = { ...currentBlock, executed: true }

      return {
        ...updatedSprite,
        blocks: updatedBlocks,
        currentBlockIndex: currentIndex + 1,
      }
    })

    setSprites(updatedSprites)

    checkCollisions()

    if (allComplete) {
      stopExecution()
    }
  }

  const clearSpeechBubbles = (timestamp: number) => {
    setSprites((prev) =>
      prev.map((sprite) => {
        const updatedSprite = { ...sprite }

        // Clear speech/thought bubbles if their time has expired
        if (updatedSprite.sayDuration > 0 && timestamp > updatedSprite.sayDuration) {
          updatedSprite.sayText = ""
          updatedSprite.sayDuration = 0
        }

        if (updatedSprite.thinkDuration > 0 && timestamp > updatedSprite.thinkDuration) {
          updatedSprite.thinkText = ""
          updatedSprite.thinkDuration = 0
        }

        return updatedSprite
      }),
    )
  }

  const animate = (timestamp: number) => {
    clearSpeechBubbles(timestamp)

    const allComplete = sprites.every((sprite) => sprite.executionComplete || sprite.blocks.length === 0)

    if (allComplete) {
      stopExecution()
    } else {
      animationFrameRef.current = requestAnimationFrame(animate)
    }
  }

  const startExecution = () => {
    if (isExecuting) return

    setSprites((prev) =>
      prev.map((sprite) => ({
        ...sprite,
        currentBlockIndex: 0,
        executionComplete: false,
        blocks: sprite.blocks.map((block) => ({ ...block, executed: false })),
      })),
    )

    setIsExecuting(true)

    executionIntervalRef.current = setInterval(() => {
      executeNextBlock(Date.now())
    }, 1000) 

    animationFrameRef.current = requestAnimationFrame(animate)
  }

  const stopExecution = () => {
    setIsExecuting(false)

    if (executionIntervalRef.current) {
      clearInterval(executionIntervalRef.current)
      executionIntervalRef.current = null
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
  }

  const resetExecution = () => {
    stopExecution()

    setSprites((prev) =>
      prev.map((sprite) => ({
        ...sprite,
        currentBlockIndex: 0,
        executionComplete: false,
        blocks: sprite.blocks.map((block) => ({ ...block, executed: false })),
        sayText: "",
        sayDuration: 0,
        thinkText: "",
        thinkDuration: 0,
      })),
    )
  }

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (executionIntervalRef.current) {
        clearInterval(executionIntervalRef.current)
      }
    }
  }, [])

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container mx-auto p-4">
        <header className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-blue-700">Scratch-like Editor</h1>
          <div className="flex gap-2">
            <button
              onClick={isExecuting ? stopExecution : startExecution}
              className="flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md"
            >
              {isExecuting ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
              {isExecuting ? "Stop" : "Play"}
            </button>
            <button
              onClick={resetExecution}
              className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
            >
              <RotateCw className="mr-2 h-4 w-4" />
              Reset
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-4">Blocks</h2>
            <BlockPalette />
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-4">Code</h2>
            {selectedSprite && <CodeArea blocks={selectedSprite.blocks} updateBlocks={updateSpriteBlocks} />}
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Stage</h2>
              <button
                onClick={addSprite}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Add Sprite
              </button>
            </div>

            <div
              ref={stageRef}
              className="bg-blue-100 rounded-lg h-80 relative overflow-hidden border-2 border-blue-200"
            >
              {sprites.map((sprite) => (
                <Sprite
                  key={sprite.id}
                  sprite={sprite}
                  isSelected={sprite.id === selectedSpriteId}
                  updatePosition={(x, y) => updateSpritePosition(sprite.id, x, y)}
                />
              ))}
            </div>

            <div className="mt-4">
              <h3 className="text-md font-semibold mb-2">Sprites</h3>
              <SpriteList sprites={sprites} selectedSpriteId={selectedSpriteId} onSelectSprite={setSelectedSpriteId} />
            </div>

            
          </div>
        </div>
      </div>
    </DndProvider>
  )
}
