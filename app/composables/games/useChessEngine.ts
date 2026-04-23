import { computed, ref, watch } from 'vue'

export type ChessColor = 'white' | 'black'
export type ChessPieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn'

export interface ChessPiece {
  type: ChessPieceType
  color: ChessColor
}

export interface ChessPosition {
  row: number
  col: number
}

export interface ChessMove {
  from: ChessPosition
  to: ChessPosition
  piece: ChessPiece
  captured?: ChessPiece
  promotion?: ChessPieceType
  isCheck?: boolean
  isCheckmate?: boolean
}

type ChessCell = ChessPiece | null
type ChessBoard = ChessCell[][]

const PIECE_VALUES: Record<ChessPieceType, number> = {
  pawn: 1,
  knight: 3,
  bishop: 3,
  rook: 5,
  queen: 9,
  king: 100,
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

const cloneBoard = (board: ChessBoard): ChessBoard => board.map(row => row.map(cell => {
  if (!cell) return null
  return { ...cell }
}))

const isInside = (row: number, col: number) => row >= 0 && row < 8 && col >= 0 && col < 8

const oppositeColor = (color: ChessColor): ChessColor => color === 'white' ? 'black' : 'white'

const posEq = (left: ChessPosition, right: ChessPosition) => left.row === right.row && left.col === right.col

const toAlgebraic = (position: ChessPosition) => `${FILES[position.col]}${8 - position.row}`

const findKingPosition = (board: ChessBoard, color: ChessColor): ChessPosition | null => {
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const piece = board[row][col]
      if (piece?.type === 'king' && piece.color === color) {
        return { row, col }
      }
    }
  }

  return null
}

const createInitialBoard = (): ChessBoard => {
  const board: ChessBoard = Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => null))
  const backRank: ChessPieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook']

  for (let col = 0; col < 8; col += 1) {
    board[0][col] = { type: backRank[col], color: 'black' }
    board[1][col] = { type: 'pawn', color: 'black' }
    board[6][col] = { type: 'pawn', color: 'white' }
    board[7][col] = { type: backRank[col], color: 'white' }
  }

  return board
}

const rayMoves = (board: ChessBoard, from: ChessPosition, color: ChessColor, deltas: Array<[number, number]>) => {
  const moves: ChessPosition[] = []

  deltas.forEach(([dr, dc]) => {
    let row = from.row + dr
    let col = from.col + dc

    while (isInside(row, col)) {
      const target = board[row][col]
      if (!target) {
        moves.push({ row, col })
        row += dr
        col += dc
        continue
      }

      if (target.color !== color) {
        moves.push({ row, col })
      }
      break
    }
  })

  return moves
}

const pseudoMovesForPiece = (board: ChessBoard, from: ChessPosition): ChessPosition[] => {
  const piece = board[from.row][from.col]
  if (!piece) return []

  if (piece.type === 'pawn') {
    const direction = piece.color === 'white' ? -1 : 1
    const startRow = piece.color === 'white' ? 6 : 1
    const output: ChessPosition[] = []

    const oneForward = { row: from.row + direction, col: from.col }
    if (isInside(oneForward.row, oneForward.col) && !board[oneForward.row][oneForward.col]) {
      output.push(oneForward)
      const twoForward = { row: from.row + (2 * direction), col: from.col }
      if (from.row === startRow && !board[twoForward.row][twoForward.col]) {
        output.push(twoForward)
      }
    }

    ;[-1, 1].forEach((dc) => {
      const row = from.row + direction
      const col = from.col + dc
      if (!isInside(row, col)) return
      const target = board[row][col]
      if (target && target.color !== piece.color) {
        output.push({ row, col })
      }
    })

    return output
  }

  if (piece.type === 'knight') {
    return [
      [-2, -1], [-2, 1],
      [-1, -2], [-1, 2],
      [1, -2], [1, 2],
      [2, -1], [2, 1],
    ]
      .map(([dr, dc]) => ({ row: from.row + dr, col: from.col + dc }))
      .filter(target => isInside(target.row, target.col))
      .filter((target) => {
        const occupant = board[target.row][target.col]
        return !occupant || occupant.color !== piece.color
      })
  }

  if (piece.type === 'bishop') {
    return rayMoves(board, from, piece.color, [[1, 1], [1, -1], [-1, 1], [-1, -1]])
  }

  if (piece.type === 'rook') {
    return rayMoves(board, from, piece.color, [[1, 0], [-1, 0], [0, 1], [0, -1]])
  }

  if (piece.type === 'queen') {
    return rayMoves(board, from, piece.color, [
      [1, 1], [1, -1], [-1, 1], [-1, -1],
      [1, 0], [-1, 0], [0, 1], [0, -1],
    ])
  }

  return [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1],
  ]
    .map(([dr, dc]) => ({ row: from.row + dr, col: from.col + dc }))
    .filter(target => isInside(target.row, target.col))
    .filter((target) => {
      const occupant = board[target.row][target.col]
      return !occupant || occupant.color !== piece.color
    })
}

const applyMove = (board: ChessBoard, from: ChessPosition, to: ChessPosition): ChessBoard => {
  const next = cloneBoard(board)
  const movingPiece = next[from.row][from.col]
  if (!movingPiece) return next

  next[from.row][from.col] = null
  next[to.row][to.col] = { ...movingPiece }

  const promotionRow = movingPiece.color === 'white' ? 0 : 7
  if (movingPiece.type === 'pawn' && to.row === promotionRow) {
    next[to.row][to.col] = {
      type: 'queen',
      color: movingPiece.color,
    }
  }

  return next
}

const isInCheckOnBoard = (board: ChessBoard, color: ChessColor) => {
  const kingPosition = findKingPosition(board, color)
  if (!kingPosition) return false

  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const piece = board[row][col]
      if (!piece || piece.color === color) continue

      if (piece.type === 'pawn') {
        const direction = piece.color === 'white' ? -1 : 1
        const pawnAttacks = [
          { row: row + direction, col: col - 1 },
          { row: row + direction, col: col + 1 },
        ].filter(square => isInside(square.row, square.col))

        if (pawnAttacks.some(square => posEq(square, kingPosition))) {
          return true
        }
        continue
      }

      const moves = pseudoMovesForPiece(board, { row, col })
      if (moves.some(move => posEq(move, kingPosition))) {
        return true
      }
    }
  }

  return false
}

const legalMovesForColor = (board: ChessBoard, color: ChessColor): ChessMove[] => {
  const legalMoves: ChessMove[] = []

  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const piece = board[row][col]
      if (!piece || piece.color !== color) continue

      const from = { row, col }
      const pseudoMoves = pseudoMovesForPiece(board, from)

      pseudoMoves.forEach((to) => {
        const resulting = applyMove(board, from, to)
        if (isInCheckOnBoard(resulting, color)) return

        legalMoves.push({
          from,
          to,
          piece,
          captured: board[to.row][to.col] ?? undefined,
          promotion: piece.type === 'pawn' && (to.row === 0 || to.row === 7) ? 'queen' : undefined,
        })
      })
    }
  }

  return legalMoves
}

const evaluateBoard = (board: ChessBoard) => {
  let score = 0
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const piece = board[row][col]
      if (!piece) continue
      const value = PIECE_VALUES[piece.type]
      score += piece.color === 'white' ? value : -value
    }
  }
  return score
}

const minimax = (board: ChessBoard, turn: ChessColor, depth: number, alpha: number, beta: number): number => {
  const moves = legalMovesForColor(board, turn)
  if (!moves.length || depth === 0) {
    if (!moves.length) {
      if (isInCheckOnBoard(board, turn)) {
        return turn === 'white' ? -10000 - depth : 10000 + depth
      }
      return 0
    }
    return evaluateBoard(board)
  }

  if (turn === 'white') {
    let best = -Infinity
    for (const move of moves) {
      const value = minimax(applyMove(board, move.from, move.to), 'black', depth - 1, alpha, beta)
      best = Math.max(best, value)
      alpha = Math.max(alpha, best)
      if (beta <= alpha) break
    }
    return best
  }

  let best = Infinity
  for (const move of moves) {
    const value = minimax(applyMove(board, move.from, move.to), 'white', depth - 1, alpha, beta)
    best = Math.min(best, value)
    beta = Math.min(beta, best)
    if (beta <= alpha) break
  }
  return best
}

const chooseAiMove = (board: ChessBoard, color: ChessColor, depth: number) => {
  const moves = legalMovesForColor(board, color)
  if (!moves.length) return null

  const scoredMoves = moves.map((move) => {
    const score = minimax(applyMove(board, move.from, move.to), oppositeColor(color), depth - 1, -Infinity, Infinity)
    return { move, score }
  })

  const isWhite = color === 'white'
  const bestScore = isWhite
    ? Math.max(...scoredMoves.map(entry => entry.score))
    : Math.min(...scoredMoves.map(entry => entry.score))

  const bestMoves = scoredMoves.filter(entry => entry.score === bestScore).map(entry => entry.move)
  return bestMoves[Math.floor(Math.random() * bestMoves.length)]
}

export const useChessEngine = (playMode: 'ai' | 'pvp') => {
  const board = ref<ChessBoard>(createInitialBoard())
  const currentTurn = ref<ChessColor>('white')
  const selectedSquare = ref<ChessPosition | null>(null)
  const legalTargets = ref<ChessPosition[]>([])
  const moveHistory = ref<ChessMove[]>([])
  const winner = ref<ChessColor | 'draw' | null>(null)
  const statusMessage = ref('Aux blancs de jouer')
  const isAiThinking = ref(false)

  const isInCheck = computed(() => isInCheckOnBoard(board.value, currentTurn.value))

  const currentLegalMoves = computed(() => legalMovesForColor(board.value, currentTurn.value))

  const updateStatus = () => {
    if (winner.value === 'draw') {
      statusMessage.value = 'Pat ! Match nul.'
      return
    }

    if (winner.value) {
      statusMessage.value = winner.value === 'white' ? 'Échec et mat : les blancs gagnent.' : 'Échec et mat : les noirs gagnent.'
      return
    }

    const checkSuffix = isInCheck.value ? ' (échec)' : ''
    statusMessage.value = currentTurn.value === 'white'
      ? `Aux blancs de jouer${checkSuffix}`
      : `Aux noirs de jouer${checkSuffix}`
  }

  const finalizeTurn = () => {
    const nextTurn = oppositeColor(currentTurn.value)
    const nextMoves = legalMovesForColor(board.value, nextTurn)
    const opponentInCheck = isInCheckOnBoard(board.value, nextTurn)

    if (!nextMoves.length) {
      if (opponentInCheck) {
        winner.value = currentTurn.value
      }
      else {
        winner.value = 'draw'
      }
      updateStatus()
      selectedSquare.value = null
      legalTargets.value = []
      return
    }

    currentTurn.value = nextTurn
    selectedSquare.value = null
    legalTargets.value = []
    updateStatus()
  }

  const pushMove = (move: ChessMove) => {
    const opponentColor = oppositeColor(move.piece.color)
    const boardAfterMove = applyMove(board.value, move.from, move.to)
    const opponentMoves = legalMovesForColor(boardAfterMove, opponentColor)
    const opponentInCheck = isInCheckOnBoard(boardAfterMove, opponentColor)

    moveHistory.value.push({
      ...move,
      isCheck: opponentInCheck,
      isCheckmate: opponentInCheck && opponentMoves.length === 0,
    })
  }

  const makeMove = (from: ChessPosition, to: ChessPosition) => {
    const piece = board.value[from.row][from.col]
    if (!piece || piece.color !== currentTurn.value || winner.value) return false

    const legalMove = currentLegalMoves.value.find(move => posEq(move.from, from) && posEq(move.to, to))
    if (!legalMove) return false

    pushMove(legalMove)
    board.value = applyMove(board.value, from, to)
    finalizeTurn()
    return true
  }

  const selectSquare = (position: ChessPosition) => {
    if (winner.value || isAiThinking.value) return

    const piece = board.value[position.row][position.col]

    if (!selectedSquare.value) {
      if (!piece || piece.color !== currentTurn.value) return
      selectedSquare.value = position
      legalTargets.value = currentLegalMoves.value
        .filter(move => posEq(move.from, position))
        .map(move => move.to)
      return
    }

    if (posEq(selectedSquare.value, position)) {
      selectedSquare.value = null
      legalTargets.value = []
      return
    }

    const moved = makeMove(selectedSquare.value, position)
    if (moved) return

    if (piece && piece.color === currentTurn.value) {
      selectedSquare.value = position
      legalTargets.value = currentLegalMoves.value
        .filter(move => posEq(move.from, position))
        .map(move => move.to)
      return
    }

    selectedSquare.value = null
    legalTargets.value = []
  }

  const reset = () => {
    board.value = createInitialBoard()
    currentTurn.value = 'white'
    selectedSquare.value = null
    legalTargets.value = []
    moveHistory.value = []
    winner.value = null
    isAiThinking.value = false
    updateStatus()
  }

  const aiColor: ChessColor = 'black'

  watch(currentTurn, async (turn) => {
    if (playMode !== 'ai' || winner.value || turn !== aiColor) return
    isAiThinking.value = true

    await new Promise(resolve => setTimeout(resolve, 280))
    const aiMove = chooseAiMove(board.value, aiColor, 2)

    if (aiMove) {
      makeMove(aiMove.from, aiMove.to)
    }

    isAiThinking.value = false
  })

  const formatHistoryMove = (move: ChessMove) => {
    const pieceLabel = {
      king: 'R',
      queen: 'D',
      rook: 'T',
      bishop: 'F',
      knight: 'C',
      pawn: 'P',
    }[move.piece.type]

    const from = toAlgebraic(move.from)
    const to = toAlgebraic(move.to)
    const capture = move.captured ? 'x' : '→'
    const suffix = move.isCheckmate ? '#' : move.isCheck ? '+' : ''
    const promo = move.promotion ? '=D' : ''

    return `${pieceLabel} ${from}${capture}${to}${promo}${suffix}`
  }

  updateStatus()

  return {
    board,
    currentTurn,
    selectedSquare,
    legalTargets,
    moveHistory,
    winner,
    statusMessage,
    isAiThinking,
    isInCheck,
    selectSquare,
    reset,
    formatHistoryMove,
  }
}
