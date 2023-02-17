import { GameArmyCard } from '../types'

// this is not entirely finished, but will be used soon at the end of the game if the decision comes to points
export const selectPointsOnBoard = ({
  myCards,
}: {
  myCards: GameArmyCard[]
}) => {
  return myCards.reduce((acc: number, curr) => {
    return acc + curr.points
  }, 0)
}
