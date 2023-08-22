import { RandomAPI } from 'boardgame.io/dist/types/src/plugins/random/random'

type HeroscapeDieRoll = {
  skulls: number
  shields: number
  blanks: number
}

export const rollHeroscapeDice = (
  count: number,
  random: RandomAPI
): HeroscapeDieRoll => {
  const dice = []
  for (let i = 0; i < count; i++) {
    dice.push(random.Die(6))
  }
  return dice.reduce(
    (result, die) => {
      if (die === 1 || die === 2 || die === 3) {
        return { ...result, skulls: result.skulls + 1 }
      } else if (die === 4 || die === 5) {
        return { ...result, shields: result.skulls + 1 }
      } else if (die === 6) {
        return { ...result, blanks: result.skulls + 1 }
      } else {
        return result
      }
    },
    { skulls: 0, shields: 0, blanks: 0 }
  )
}
