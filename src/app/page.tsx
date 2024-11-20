"use client";
import React from "react";
import {
  Bishop,
  Board,
  is_same_position,
  King,
  Knight,
  Pawn,
  Piece,
  PieceColor,
  Position,
  Queen,
  Rook,
} from "../../libs/chess";
import { cn } from "@nextui-org/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChessBishop,
  faChessKing,
  faChessKnight,
  faChessPawn,
  faChessQueen,
  faChessRook,
} from "@fortawesome/free-solid-svg-icons";

const initialChessBoard = Board.empty_board();

type ChessPieceT = Board["pieces"][number];

function iconSwitch(piece: King | Queen | Rook | Pawn | Knight) {
  if (piece instanceof Queen) return faChessQueen;
  else if (piece instanceof King) return faChessKing;
  else if (piece instanceof Pawn) return faChessPawn;
  else if (piece instanceof Bishop) return faChessBishop;
  else if (piece instanceof Knight) return faChessKnight;
  else return faChessRook;
}

type ChessPieceP = {
  piece: ChessPieceT;
  chessColor: [string, string];
  disableAnimations: boolean;
};

function ChessPiece({
  piece,
  chessColor: [blackColor, whiteColor],
  disableAnimations,
}: ChessPieceP) {
  const style = React.useMemo<React.CSSProperties>(() => {
    if (piece.color === PieceColor.WHITE) {
      return { color: whiteColor };
    } else {
      return { color: blackColor };
    }
  }, [blackColor, whiteColor, piece.color]);
  return (
    <FontAwesomeIcon
      style={style}
      icon={iconSwitch(piece.piece)}
      className={cn(
        "!w-16 !h-16 transition-transform",
        disableAnimations ? "" : "hover:scale-95"
      )}
    />
  );
}

type ChessTileP = {
  x: number;
  y: number;
  piece: ChessPieceT | null;
  boardColor: [string, string];
  chessColor: [string, string];
  highlightColor: string;
  isHighlighted: boolean;
  isMovement: boolean;
  movementColor: string;
  isChecked: boolean;
  checkedColor: string;
  onPress?: () => void;
  disableAnimations: boolean;
};

function ChessTile({
  x,
  y,
  boardColor: [blackColor, whiteColor],
  chessColor,
  piece,
  highlightColor,
  isHighlighted,
  movementColor,
  isMovement,
  isChecked,
  checkedColor,
  disableAnimations,
  onPress,
}: ChessTileP) {
  const originalTileColor = React.useMemo(() => {
    const determiner = (x + y) % 2;
    if (determiner == 0) {
      return whiteColor;
    } else {
      return blackColor;
    }
  }, [x, y, whiteColor, blackColor]);
  const tileColor = React.useMemo(() => {
    if (isHighlighted) {
      return highlightColor;
    } else if (isMovement) {
      return movementColor;
    } else {
      return originalTileColor;
    }
  }, [
    originalTileColor,
    movementColor,
    highlightColor,
    isHighlighted,
    isMovement,
  ]);
  return (
    <div
      className="w-20 h-20 p-2"
      style={{
        backgroundColor: tileColor,
      }}
      onClick={onPress}
    >
      {piece && (
        <ChessPiece
          chessColor={chessColor}
          piece={piece}
          disableAnimations={disableAnimations}
        />
      )}
    </div>
  );
}

type ChessBoardP = {
  board: Board;
  setBoard: React.Dispatch<React.SetStateAction<Board>>;
  movementColor?: string;
  highlightColor?: string;
  chessColor?: [string, string];
  boardColor?: [string, string];
  checkColor?: string;
  onCheckMate?: (winnerPiece: PieceColor) => void;
  onCheck?: (winnerPiece: PieceColor) => void;
  onMove?: (piece: Board["pieces"][number], turn: PieceColor) => void;
  className?: string;
  disableAnimations?: boolean;
};

const defaultChessColor = ["#000000", "#FFFFFF"] as [string, string];
const defaultBoardColor = ["#7f1d1d", "#dc2626"] as [string, string];

function ChessBoard({
  board,
  setBoard,
  movementColor = "#7dd3fc",
  highlightColor = "#38bdf8",
  chessColor = defaultChessColor,
  boardColor = defaultBoardColor,
  checkColor = "#7f1d1d",
  className = "",
  onMove,
  onCheckMate,
  disableAnimations = false,
}: ChessBoardP) {
  const [activePiece, setActivePiece] = React.useState<null | ChessPieceT>(
    null
  );
  const [activeMovement, setActiveMovement] = React.useState<Position[]>([]);
  const isCurrentKingChecked = React.useMemo(() => {
    const { piece, position, color } = board.pieces.find(
      ({ piece, color }) => piece instanceof King && color === board.currentTurn
    ) as Piece<King>;
    return piece.is_checked(position, color, board);
  }, [board]);
  const isCheckmate = React.useMemo(() => {
    const { piece, position, color, isMovedBefore } = board.pieces.find(
      ({ piece, color }) => piece instanceof King && color === board.currentTurn
    ) as Piece<King>;
    return (
      piece.get_possible_actions(position, color, board, isMovedBefore)
        .length === 0
    );
  }, [board]);
  const onPiecePress = React.useCallback(
    (p: ChessPieceT | null) => {
      setActivePiece((prevActivePiece) => {
        if (
          p !== null &&
          p.piece !== prevActivePiece?.piece &&
          p.color === board.currentTurn
        ) {
          setActiveMovement(
            p.piece.get_possible_actions(
              p.position,
              p.color,
              board,
              p.isMovedBefore
            )
          );
          return p;
        } else {
          setActiveMovement([]);
          return null;
        }
      });
    },
    [board]
  );
  const onMovementPress = React.useCallback(
    (p: Position) => {
      // call signal
      if (onMove && activePiece !== null)
        onMove(activePiece, board.currentTurn);

      // p is not an active movement
      if (
        activeMovement.find((movement_p) => is_same_position(movement_p, p)) ===
        undefined
      )
        return;
      setBoard((prevBoard) => {
        if (activePiece === null) return prevBoard;
        const board = prevBoard.move_piece(activePiece.position, p);
        if (board === null) return prevBoard;
        return board;
      });
      setActiveMovement([]);
      setActivePiece(null);
    },
    [board, activePiece, activeMovement, setBoard, onMove]
  );
  React.useEffect(() => {
    if (isCheckmate && onCheckMate) {
      onCheckMate(
        board.currentTurn === PieceColor.BLACK
          ? PieceColor.WHITE
          : PieceColor.BLACK
      );
    }
  }, [isCheckmate, onCheckMate, board.currentTurn]);
  const tiles = React.useMemo(() => {
    return Array(64)
      .fill(null)
      .map((_, id) => {
        const x = id % 8;
        const y = 7 - Math.floor(id / 8);
        const isMovement =
          activeMovement.find((p) => is_same_position(p, { x, y })) !==
          undefined;
        const piece = board.query_board({ x, y });
        const isHighlighted =
          piece !== null &&
          activePiece !== null &&
          activePiece.piece === piece.piece;
        return (
          <ChessTile
            key={id}
            x={x}
            y={y}
            piece={piece}
            boardColor={boardColor}
            chessColor={chessColor}
            highlightColor={highlightColor}
            movementColor={movementColor}
            isMovement={isMovement}
            isHighlighted={isHighlighted}
            isChecked={
              isCurrentKingChecked &&
              piece !== null &&
              piece.color === board.currentTurn
            }
            checkedColor={checkColor}
            onPress={
              isMovement
                ? () => onMovementPress({ x, y })
                : () => onPiecePress(piece)
            }
            disableAnimations={disableAnimations}
          />
        );
      });
  }, [
    activeMovement,
    activePiece,
    board,
    boardColor,
    checkColor,
    chessColor,
    disableAnimations,
    highlightColor,
    isCurrentKingChecked,
    movementColor,
    onMovementPress,
    onPiecePress,
  ]);
  return (
    <div className={cn("grid grid-cols-8 grid-rows-8", className)}>{tiles}</div>
  );
}

export default function Home() {
  const [board, setBoard] = React.useState(initialChessBoard);
  return (
    <main className="w-full h-screen flex flex-row">
      <div className="flex flex-row justify-center items-center w-3/5 h-full">
        <ChessBoard
          board={board}
          setBoard={setBoard}
          boardColor={["#71717a", "#52525b"]}
        />
      </div>
      <aside className="flex-1 bg-gray-200 flex flex-col p-20">
        <p className="text-center text-xl font-semibold">
          {board.currentTurn === PieceColor.WHITE ? "White Turn" : "Black Turn"}
        </p>
        <div>
          <p>White Captures</p>
          <p>
            {board.captured
              .filter(({ color }) => color === PieceColor.BLACK)
              .map(({ piece }, id) => (
                <FontAwesomeIcon icon={iconSwitch(piece)} key={id} />
              ))}
          </p>
        </div>
        <div>
          <p>Black Captures</p>
          <p>
            {" "}
            {board.captured
              .filter(({ color }) => color === PieceColor.WHITE)
              .map(({ piece }, id) => (
                <FontAwesomeIcon key={id} icon={iconSwitch(piece)} />
              ))}
          </p>
        </div>
      </aside>
    </main>
  );
}
