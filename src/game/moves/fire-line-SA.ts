import type { Move } from 'boardgame.io'
import { selectUnitDefenseDiceForAttack } from '../selector/card-selectors'
import {
  selectEngagementsForHex,
  selectGameCardByID,
  selectHexForUnit,
} from '../selectors'
import { PossibleAttack } from '../../hexopolis-ui/contexts/special-attack-context'
import { GameState } from '../types'
import { rollHeroscapeDice } from './attack-action'

export const rollForFireLineSpecialAttack: Move<GameState> = (
  { G, random },
  {
    chosenFireLineAttack,
    affectedUnitIDs,
    attackingUnitID,
  }: {
    chosenFireLineAttack: PossibleAttack
    affectedUnitIDs: string[]
    attackingUnitID: string
  }
) => {
  // 0. get ready
  const newGameUnits = { ...G.gameUnits }
  const attackerHex = selectHexForUnit(attackingUnitID, G.boardHexes)
  // DISALLOW - missing needed ingredients
  if (!attackerHex) {
    console.error(
      `Fire Line Special Attack aborted before attack was rolled: missing needed ingredients to calculate attack`
    )
    return
  }
  // 1. roll the attack
  const { skulls } = rollHeroscapeDice(4, random)
  // for each defender figure out defense, wounds
  affectedUnitIDs.forEach((unitID) => {
    const defenderGameUnit = newGameUnits[unitID]
    const defenderGameCard = selectGameCardByID(
      G.gameArmyCards,
      defenderGameUnit.gameCardID
    )
    // DISALLOW - no card should not happen
    if (!defenderGameCard) {
      console.error(
        `Attack action denied: missing needed ingredients to calculate attack`
      )
      return
    }
    // we take the hex that is closest to the attacker to be the defender hex
    const firstIndexOfDefenderInLine = chosenFireLineAttack.line.findIndex(
      (hex) => hex.occupyingUnitID === defenderGameUnit.unitID
    )
    const defenderHex = chosenFireLineAttack.line[firstIndexOfDefenderInLine]
    const isRanged = selectEngagementsForHex({
      hexID: defenderHex.id,
      boardHexes: G.boardHexes,
      gameUnits: newGameUnits,
      armyCards: G.gameArmyCards,
    }).includes(attackingUnitID)
    const defenseRolled = selectUnitDefenseDiceForAttack({
      attackerHex,
      defenderHex,
      defenderArmyCard: defenderGameCard,
      defenderUnit: defenderGameUnit,
      boardHexes: G.boardHexes,
      gameArmyCards: G.gameArmyCards,
      gameUnits: G.gameUnits,
    })
  })
}
