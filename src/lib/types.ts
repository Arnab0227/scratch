export interface Block {
  times: number
  id: string
  type: string
  steps?: number
  moveX?: number
  moveY?: number
  degrees?: number
  rotationDirection?: "clockwise" | "counterclockwise"
  x?: number
  y?: number
  text?: string
  seconds?: number
  blocks?: Block[]
  executed?: boolean
}

export interface Sprite {
  id: string
  name: string
  x: number
  y: number
  direction: number
  blocks: Block[]
  costume: string
  isAnimating: boolean
  sayText: string
  sayDuration: number
  thinkText: string
  thinkDuration: number
  currentBlockIndex?: number
  executionComplete?: boolean
}
