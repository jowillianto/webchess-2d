export type Position = {
  x: number;
  y: number;
};

export function is_same_position(l: Position, r: Position) {
  return l.x === r.x && l.y === r.y;
}

export enum PieceColor {
  BLACK,
  WHITE,
}

export interface ChessPiece {
  get_possible_actions(
    position: Position,
    color: PieceColor,
    board: Board,
    isMovedBefore: boolean
  ): Position[];
}

export class Rook implements ChessPiece {
  get_possible_actions(
    position: Position,
    color: PieceColor,
    board: Board
  ): Position[] {
    const actions: Position[] = [];
    for (let i = position.x + 1; i < 8; i++) {
      const targetPosition = { x: i, y: position.y };
      const q = board.query_board(targetPosition);
      if (q === null || q.color !== color) actions.push(targetPosition);
      if (q !== null) break;
    }
    for (let i = position.x - 1; i >= 0; i--) {
      const targetPosition = { x: i, y: position.y };
      const q = board.query_board(targetPosition);
      if (q === null || q.color !== color) actions.push(targetPosition);
      if (q !== null) break;
    }
    for (let i = position.y + 1; i < 8; i++) {
      const targetPosition = { x: position.x, y: i };
      const q = board.query_board(targetPosition);
      if (q === null || q.color !== color) actions.push(targetPosition);
      if (q !== null) break;
    }
    for (let i = position.y - 1; i >= 0; i--) {
      const targetPosition = { x: position.x, y: i };
      const q = board.query_board(targetPosition);
      if (q === null || q.color !== color) actions.push(targetPosition);
      if (q !== null) break;
    }
    return actions;
  }
}
export class King implements ChessPiece {
  get_possible_actions(
    position: Position,
    color: PieceColor,
    board: Board,
    isMovedBefore: boolean,
    useCheck: boolean = true
  ): Position[] {
    const actions = [
      {
        x: position.x + 1,
        y: position.y,
      },
      {
        x: position.x - 1,
        y: position.y,
      },
      {
        x: position.x + 1,
        y: position.y + 1,
      },
      {
        x: position.x - 1,
        y: position.y - 1,
      },
      {
        x: position.x,
        y: position.y + 1,
      },
      {
        x: position.x,
        y: position.y - 1,
      },
      {
        x: position.x + 1,
        y: position.y + 1,
      },
      {
        x: position.x - 1,
        y: position.y - 1,
      },
    ].filter((p) => {
      if (p.x === -1 || p.x === 8 || p.y === -1 || p.y === 8) return false;
      else if (useCheck && this.is_checked(p, color, board)) return false;
      else if (board.query_board(p) !== null) return false;
      return true;
    });
    // Castling
    if (!isMovedBefore && useCheck) {
      const rooks = board.pieces.filter(
        ({ piece, isMovedBefore: pieceIsMovedBefore, color: pieceColor }) =>
          piece instanceof Rook && !pieceIsMovedBefore && color === pieceColor
      );
      rooks.forEach(({ position: rookPosition }) => {
        if (rookPosition.x === 7) {
          const p1 = board.query_board({ x: 6, y: position.y });
          const p1Check = this.is_checked(
            { x: 6, y: position.y },
            color,
            board
          );
          const p2 = board.query_board({ x: 5, y: position.y });
          const p2Check = this.is_checked(
            { x: 5, y: position.y },
            color,
            board
          );
          if (p1 === null && p2 === null && !p1Check && !p2Check) {
            actions.push({ x: 6, y: position.y });
          }
        } else if (rookPosition.x === 0) {
          const p1 = board.query_board({ x: 1, y: position.y });
          const p1Check = this.is_checked(
            { x: 1, y: position.y },
            color,
            board
          );
          const p2 = board.query_board({ x: 2, y: position.y });
          const p2Check = this.is_checked(
            { x: 2, y: position.y },
            color,
            board
          );
          const p3 = board.query_board({ x: 3, y: position.y });
          const p3Check = this.is_checked(
            { x: 3, y: position.y },
            color,
            board
          );
          if (
            p1 === null &&
            p2 === null &&
            p3 === null &&
            !p1Check &&
            !p2Check &&
            !p3Check
          ) {
            actions.push({ x: 2, y: position.y });
          }
        }
      });
    }
    return actions;
  }
  is_checked(position: Position, color: PieceColor, board: Board): boolean {
    const actions = board.pieces
      .filter(({ color: c }) => c !== color)
      .reduce((actions, { piece, color, position, isMovedBefore }) => {
        if (piece instanceof King) {
          return actions.concat(
            piece.get_possible_actions(
              position,
              color,
              board,
              isMovedBefore,
              false
            )
          );
        } else {
          return actions.concat(
            piece.get_possible_actions(position, color, board, isMovedBefore)
          );
        }
      }, [] as Position[]);
    return actions.find((pos) => is_same_position(pos, position)) !== undefined;
  }
}
export class Queen implements ChessPiece {
  get_possible_actions(
    position: Position,
    color: PieceColor,
    board: Board,
  ): Position[] {
    return [
      ...new Rook().get_possible_actions(position, color, board),
      ...new Bishop().get_possible_actions(position, color, board),
    ];
  }
}
export class Knight implements ChessPiece {
  get_possible_actions(
    position: Position,
    color: PieceColor,
    board: Board
  ): Position[] {
    return [
      {
        x: position.x + 1,
        y: position.y + 2,
      },
      {
        x: position.x - 1,
        y: position.y + 2,
      },
      {
        x: position.x + 1,
        y: position.y - 2,
      },
      {
        x: position.x - 1,
        y: position.y - 2,
      },
      {
        x: position.x + 2,
        y: position.y + 1,
      },
      {
        x: position.x + 2,
        y: position.y - 1,
      },
      {
        x: position.x - 2,
        y: position.y + 1,
      },
      {
        x: position.x - 2,
        y: position.y - 1,
      },
    ]
      .filter(({ x, y }) => x >= 0 && x < 8 && y >= 0 && y < 8)
      .filter((p) => {
        const piece = board.query_board(p);
        return piece === null || piece.color !== color;
      });
  }
}
export class Pawn implements ChessPiece {
  get_possible_actions(
    position: Position,
    color: PieceColor,
    board: Board,
    isMovedBefore: boolean
  ): Position[] {
    const initPossiblePawnActions: Position[] = [];
    for (let i = 1; i < (isMovedBefore ? 2 : 3); i += 1) {
      const targetPosition = {
        x: position.x,
        y: position.y + (color === PieceColor.WHITE ? i : -i),
      };
      const piece = board.query_board(targetPosition);
      if (piece === null) initPossiblePawnActions.push(targetPosition);
      else break;
    }
    const enPassant = (
      color === PieceColor.WHITE
        ? [
            {
              x: position.x + 1,
              y: position.y + 1,
            },
            {
              x: position.x - 1,
              y: position.y + 1,
            },
          ]
        : [
            {
              x: position.x - 1,
              y: position.y - 1,
            },
            {
              x: position.x + 1,
              y: position.y - 1,
            },
          ]
    )
      .filter(({ x, y }) => x >= 0 && y < 8)
      .filter((p) => {
        const boardPiece = board.query_board(p);
        return boardPiece !== null && boardPiece.color !== color;
      });
    return [...initPossiblePawnActions, ...enPassant];
  }
}
export class Bishop implements ChessPiece {
  get_possible_actions(
    position: Position,
    color: PieceColor,
    board: Board
  ): Position[] {
    const actions: Position[] = [];
    for (let i = 1; i < 8 - position.x; i += 1) {
      const y = position.y + i;
      if (y < 8) {
        const target = { x: position.x + i, y };
        const query = board.query_board(target);
        if (query === null || query.color !== color) actions.push(target);
        if (query !== null) break;
      }
    }
    for (let i = 1; i < 8 - position.x; i += 1) {
      const y = position.y - i;
      if (y >= 0) {
        const target = { x: position.x + i, y };
        const query = board.query_board(target);
        if (query === null || query.color !== color) actions.push(target);
        if (query !== null) break;
      }
    }
    for (let i = 1; i < position.x + 1; i += 1) {
      const y = position.y + i;
      if (y < 8) {
        const target = { x: position.x - i, y };
        const query = board.query_board(target);
        if (query === null || query.color !== color) actions.push(target);
        if (query !== null) break;
      }
    }
    for (let i = 1; i < position.x + 1; i += 1) {
      const y = position.y - i;
      if (y >= 0) {
        const target = { x: position.x - i, y };
        const query = board.query_board(target);
        if (query === null || query.color !== color) actions.push(target);
        if (query !== null) break;
      }
    }
    return actions;
  }
}

export type Piece<T> = {
  piece: T;
  position: Position;
  color: PieceColor;
  isMovedBefore: boolean;
};

export type PieceT =
  | Piece<King>
  | Piece<Queen>
  | Piece<Bishop>
  | Piece<Rook>
  | Piece<Pawn>
  | Piece<Knight>;

export class Board {
  pieces: PieceT[];
  lookupHash: Record<string, PieceT>;
  captured: PieceT[];
  currentTurn: PieceColor;
  constructor(
    pieces: PieceT[],
    turn: PieceColor = PieceColor.WHITE,
    captured: PieceT[] = []
  ) {
    this.pieces = pieces;
    this.currentTurn = turn;
    this.captured = captured;
    this.lookupHash = this.__computeHash();
  }
  __hashPosition(pos: Position) {
    return `${pos.x}${pos.y}`;
  }
  __computeHash() {
    return this.pieces.reduce((prev, cur) => {
      prev[this.__hashPosition(cur.position)] = cur;
      return prev;
    }, {} as Record<string, PieceT>);
  }
  query_board(position: Position | string): null | PieceT {
    if (typeof position === "object") position = this.__hashPosition(position);
    const piece = this.lookupHash[position];
    if (piece) return piece;
    else return null;
  }
  get_black_pieces() {
    return this.pieces.filter((piece) => piece.color === PieceColor.BLACK);
  }
  get_white_pieces() {
    return this.pieces.filter((piece) => piece.color === PieceColor.WHITE);
  }
  is_checkmate(): PieceColor | null {
    const { position, piece, isMovedBefore, color } = this.pieces.find(
      ({ piece, color }) => color !== this.currentTurn && piece instanceof King
    ) as unknown as Piece<King>;
    if (
      piece.get_possible_actions(position, color, this, isMovedBefore)
        .length === 0 &&
      piece.is_checked(position, color, this)
    )
      return color;
    return null;
  }
  move_piece(from: Position, to: Position): Board | null {
    const fromHash = this.__hashPosition(from);
    const toHash = this.__hashPosition(to);
    const fromPiece = this.query_board(fromHash);
    const toPiece = this.query_board(toHash);
    if (fromPiece === null) return null;
    const movedPiece = { ...fromPiece, position: to, isMovedBefore: true };
    /*
      Detect Castling
    */
    if (fromPiece.piece instanceof King && Math.abs(to.x - from.x) != 1) {
      /* Castling */
      const rookPos =
        to.x > from.x
          ? { x: 7, y: fromPiece.position.y }
          : {
              x: 0,
              y: fromPiece.position.y,
            };
      const rookHash = this.__hashPosition(rookPos);
      const rookPiece = this.query_board(rookHash) as Piece<Rook>;
      const movedRook = {
        ...rookPiece,
        position:
          to.x > from.x
            ? { x: from.x + 1, y: from.y }
            : { x: from.x - 1, y: from.y },
        isMovedBefore: true,
      };
      return new Board(
        Object.entries(this.lookupHash).reduce((prev, [h, p]) => {
          if (h === fromHash) {
            prev.push(movedPiece);
            return prev;
          } else if (h === rookHash) {
            prev.push(movedRook);
            return prev;
          } else if (h === toHash) {
            return prev;
          } else {
            prev.push(p);
            return prev;
          }
        }, [] as PieceT[]),
        this.currentTurn === PieceColor.WHITE
          ? PieceColor.BLACK
          : PieceColor.WHITE,
        toPiece === null ? this.captured : [...this.captured, toPiece]
      );
    }
    return new Board(
      Object.entries(this.lookupHash).reduce((prev, [h, p]) => {
        if (h === fromHash) {
          prev.push(movedPiece);
          return prev;
        } else if (h === toHash) {
          return prev;
        } else {
          prev.push(p);
          return prev;
        }
      }, [] as PieceT[]),
      this.currentTurn === PieceColor.WHITE
        ? PieceColor.BLACK
        : PieceColor.WHITE,
      toPiece === null ? this.captured : [...this.captured, toPiece]
    );
  }
  clone() {
    return new Board(this.pieces, this.currentTurn);
  }

  static empty_board() {
    return new Board([
      ...Array(8)
        .fill(null)
        .map((_, id) => ({
          isMovedBefore: false,
          position: { x: id, y: 1 },
          piece: new Pawn(),
          color: PieceColor.WHITE,
        })),
      {
        isMovedBefore: false,
        position: { x: 0, y: 0 },
        piece: new Rook(),
        color: PieceColor.WHITE,
      },
      {
        isMovedBefore: false,
        position: { x: 1, y: 0 },
        piece: new Knight(),
        color: PieceColor.WHITE,
      },
      {
        isMovedBefore: false,
        position: { x: 2, y: 0 },
        piece: new Bishop(),
        color: PieceColor.WHITE,
      },
      {
        isMovedBefore: false,
        position: { x: 3, y: 0 },
        piece: new Queen(),
        color: PieceColor.WHITE,
      },
      {
        isMovedBefore: false,
        position: { x: 4, y: 0 },
        piece: new King(),
        color: PieceColor.WHITE,
      },
      {
        isMovedBefore: false,
        position: { x: 5, y: 0 },
        piece: new Bishop(),
        color: PieceColor.WHITE,
      },
      {
        isMovedBefore: false,
        position: { x: 6, y: 0 },
        piece: new Knight(),
        color: PieceColor.WHITE,
      },
      {
        isMovedBefore: false,
        position: { x: 7, y: 0 },
        piece: new Rook(),
        color: PieceColor.WHITE,
      },
      ...Array(8)
        .fill(null)
        .map((_, id) => ({
          isMovedBefore: false,
          position: { x: id, y: 6 },
          piece: new Pawn(),
          color: PieceColor.BLACK,
        })),
      {
        isMovedBefore: false,
        position: { x: 0, y: 7 },
        piece: new Rook(),
        color: PieceColor.BLACK,
      },
      {
        isMovedBefore: false,
        position: { x: 1, y: 7 },
        piece: new Knight(),
        color: PieceColor.BLACK,
      },
      {
        isMovedBefore: false,
        position: { x: 2, y: 7 },
        piece: new Bishop(),
        color: PieceColor.BLACK,
      },
      {
        isMovedBefore: false,
        position: { x: 3, y: 7 },
        piece: new Queen(),
        color: PieceColor.BLACK,
      },
      {
        isMovedBefore: false,
        position: { x: 4, y: 7 },
        piece: new King(),
        color: PieceColor.BLACK,
      },
      {
        isMovedBefore: false,
        position: { x: 5, y: 7 },
        piece: new Bishop(),
        color: PieceColor.BLACK,
      },
      {
        isMovedBefore: false,
        position: { x: 6, y: 7 },
        piece: new Knight(),
        color: PieceColor.BLACK,
      },
      {
        isMovedBefore: false,
        position: { x: 7, y: 7 },
        piece: new Rook(),
        color: PieceColor.BLACK,
      },
    ]);
  }
}
