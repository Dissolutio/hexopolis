import { Move } from 'boardgame.io'
import { ScoretopiaState } from './game'

export const increaseScore: Move<ScoretopiaState> = (G, ctx) => {
  const { currentPlayer } = ctx
  const currentScore = G.score[currentPlayer]
  G.score[`${currentPlayer}`] = currentScore + 1
}

export const increaseScoreByRandomAmount: Move<ScoretopiaState> = (G, ctx) => {
  const { currentPlayer } = ctx
  const currentScore = G.score[currentPlayer]
  const randomAmount = Math.floor(Math.random() * 10)
  const newScore = currentScore + randomAmount
  G.score[`${currentPlayer}`] = newScore
}
