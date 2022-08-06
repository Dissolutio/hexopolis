import { useBgioCtx, useBgioMoves, useBgioEvents } from "bgio-contexts";

export const Controls = () => {
  const { ctx } = useBgioCtx();
  const { isMyTurn } = ctx;
  const { moves, undo, redo } = useBgioMoves();
  const { events } = useBgioEvents();
  const { endTurn } = events;
  const { increaseScore } = moves;
  const handleClickIncreaseScore = (e: React.MouseEvent) => {
    increaseScore();
  };
  const handleClickEndTurn = (e: React.MouseEvent) => {
    endTurn?.();
  };

  return (
    <div>
      {isMyTurn ? <div>IT'S YOUR TURN</div> : <div>NOT YOUR TURN</div>}
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <button disabled={!isMyTurn} onClick={undo}>
          UNDO
        </button>
        <button disabled={!isMyTurn} onClick={redo}>
          REDO
        </button>
        <button disabled={!isMyTurn} onClick={handleClickIncreaseScore}>
          Move: Increase Score
        </button>
        <button disabled={!isMyTurn} onClick={handleClickEndTurn}>
          Event: End Turn
        </button>
      </div>
    </div>
  );
};
