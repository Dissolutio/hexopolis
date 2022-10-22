import { Game } from 'boardgame.io'
import { increaseScore } from './moves'

export type ScoretopiaState = {
  score: {
    [playerID: string]: number
  }
}

export const defaultSetupData = {
  score: { '0': 0, '1': 0 },
  lobbyDisplayName: '',
}

export const MYGAME_NUMPLAYERS = 2

export const scoretopiaGame: Game<ScoretopiaState> = {
  name: 'scoretopia',
  setup: (ctx, setupData) => {
    const myG = {
      ...defaultSetupData,
      ...setupData,
    }
    return myG
  },
  moves: {
    increaseScore,
  },
  minPlayers: 2,
  maxPlayers: 2,
}
