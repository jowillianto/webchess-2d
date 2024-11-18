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
  faChessBoard,
  faChessKing,
  faChessKnight,
  faChessPawn,
  faChessQueen,
  faChessRook,
} from "@fortawesome/free-solid-svg-icons";

const initialChessBoard = Board.empty_board();

type PieceRendererP = {
  piece: Board["pieces"][number] | null;
  className?: string;
};

function iconSwitch(piece: King | Queen | Rook | Pawn | Knight) {
  if (piece instanceof Queen) return faChessQueen;
  else if (piece instanceof King) return faChessKing;
  else if (piece instanceof Pawn) return faChessPawn;
  else if (piece instanceof Bishop) return faChessBishop;
  else if (piece instanceof Knight) return faChessKnight;
  else return faChessRook;
}

function PieceRenderer({ piece, className }: PieceRendererP) {
  if (piece === null) {
    return <></>;
  }
  return (
    <FontAwesomeIcon
      icon={iconSwitch(piece.piece)}
      className={cn(
        piece.color === PieceColor.WHITE ? "text-gray-500" : "text-black",
        className
      )}
    />
  );
}

export default function Home() {
  const [board, setBoard] = React.useState(initialChessBoard);
  const [action, setAction] = React.useState<Position[]>([]);
  const [activeId, setActiveId] = React.useState<number | null>(null);
  const [activePieceId, setActivePieceId] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (activeId === null) {
      setAction([]);
      return;
    }
    const q = board.query_board({
      x: activeId % 8,
      y: Math.floor(activeId / 8),
    });
    if (q === null) setAction([]);
    else
      setAction(
        q.piece.get_possible_actions(
          q.position,
          q.color,
          board,
          q.isMovedBefore
        )
      );
  }, [activeId, board]);

  return (
    <main className="w-full h-screen flex flex-row">
      <div className="flex flex-row justify-center items-center w-3/5 h-full bg-gray-600">
        <div className="relative grid grid-cols-8 grid-rows-8 w-fit">
          {Array(64)
            .fill(null)
            .map((_, id) => {
              const x = id % 8;
              const y = Math.floor(id / 8);
              const p = { x, y };
              const piece = board.query_board(p);
              const normalBgColor =
                (id + Math.floor(id / 8)) % 2 == 0
                  ? "bg-green-600"
                  : "bg-green-200";
              const activeBgColor = "bg-sky-400";
              const kingIsChecked =
                piece?.piece instanceof King &&
                piece.piece.is_checked(piece.position, piece.color, board);
              const inActions = action.find((v) => is_same_position(v, p));
              const isActive = id === activeId;
              return (
                <div
                  key={id}
                  onClick={() => {
                    if (inActions) {
                      /*
                        Perform the action
                      */
                      setBoard((prevBoard) => {
                        if (activeId === null) return prevBoard;
                        const origPosition = {
                          x: activeId % 8,
                          y: Math.floor(activeId / 8),
                        };
                        const board = prevBoard.move_piece(origPosition, p);
                        if (board === null) return prevBoard;
                        return board;
                      });
                    } else {
                      setActiveId((prevActiveId) => {
                        if (
                          (prevActiveId === null || prevActiveId !== id) &&
                          piece !== null &&
                          piece.color === board.currentTurn
                        )
                          return id;
                        else return null;
                      });
                    }
                  }}
                  className={cn(
                    "w-20 h-20 p-2",
                    inActions || isActive ? activeBgColor : normalBgColor,
                    kingIsChecked ? "bg-red-700" : ""
                  )}
                >
                  <PieceRenderer piece={piece} className="!w-16 !h-16" />
                </div>
              );
            })}
        </div>
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
