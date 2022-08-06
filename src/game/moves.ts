import { Move } from "boardgame.io";
import { ScoretopiaState } from "./game";

export const increaseScore: Move<ScoretopiaState> = (G, ctx) => {
  const { currentPlayer } = ctx;
  const currentScore = G.score[currentPlayer];
  G.score[`${currentPlayer}`] = currentScore + 1;
};
