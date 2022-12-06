import React, {
  createContext,
  PropsWithChildren,
  SyntheticEvent,
  useContext,
} from 'react'
import { Hex, HexUtils } from 'react-hexgrid'

import { BoardHex, GameArmyCard, GameUnit } from 'game/types'
import { selectHexForUnit, selectRevealedGameCard } from 'game/selectors'
import { generateBlankMoveRange } from 'game/constants'
import { useUIContext } from '../contexts'
import {
  useBgioClientInfo,
  useBgioCtx,
  useBgioG,
  useBgioMoves,
} from 'bgio-contexts'
import { uniq } from 'lodash'

export type TargetsInRange = {
  [gameUnitID: string]: string[] // hexIDs
}

const PlayContext = createContext<PlayContextValue | undefined>(undefined)

type PlayContextValue = {
  // computed
  currentTurnGameCardID: string
  selectedUnit: GameUnit
  revealedGameCard: GameArmyCard | undefined
  revealedGameCardUnits: GameUnit[]
  revealedGameCardUnitIDs: string[]
  revealedGameCardTargetsInRange: TargetsInRange
  countOfRevealedGameCardUnitsWithTargetsInRange: number
  selectedGameCardUnits: GameUnit[]
  freeAttacksAvailable: number
  isFreeAttackAvailable: boolean
  // handlers
  onClickTurnHex: (event: React.SyntheticEvent, sourceHex: BoardHex) => void
}

export const PlayContextProvider = ({ children }: PropsWithChildren) => {
  const { playerID } = useBgioClientInfo()
  const {
    boardHexes,
    armyCards,
    gameUnits,
    unitsAttacked,
    orderMarkers,
    currentOrderMarker,
    players,
    uniqUnitsMoved,
  } = useBgioG()
  const { ctx } = useBgioCtx()
  const { moves } = useBgioMoves()
  const { selectedUnitID, setSelectedUnitID } = useUIContext()
  const { currentPlayer, isMyTurn, isAttackingStage } = ctx
  const { moveAction, attackAction } = moves

  const currentTurnGameCardID =
    players?.[playerID]?.orderMarkers?.[currentOrderMarker] ?? ''
  // COMPUTED
  const selectedUnit = gameUnits?.[selectedUnitID]
  const revealedGameCard = selectRevealedGameCard(
    orderMarkers,
    armyCards,
    currentOrderMarker,
    currentPlayer
  )
  const revealedGameCardUnits = Object.values(gameUnits).filter(
    (u: GameUnit) => u?.gameCardID === revealedGameCard?.gameCardID
  )
  const getRevealedGameCardTargetsInRange = (): TargetsInRange => {
    // first, we need to account for which units moved (if all moves were used, only those units can attack)
    const attacksAllowed = revealedGameCard?.figures ?? 0
    const countOfUnitsThatMoved = uniqUnitsMoved.length
    const isAttackAvailableToUnmovedUnits =
      countOfUnitsThatMoved < attacksAllowed
    const unitsToConsider = isAttackAvailableToUnmovedUnits
      ? revealedGameCardUnits
      : revealedGameCardUnits.filter((u) => uniqUnitsMoved.includes(u.unitID))
    // for each unit, go through all hexes and count how many are in range
    const result = unitsToConsider.reduce((resultTargetsInRange, unit) => {
      const attackerHex = selectHexForUnit(unit.unitID, boardHexes)
      const attackerPlayerID = unit.playerID
      const numberUnitsInRangeForThisUnit = Object.values(boardHexes).reduce(
        (resultHexIDs: string[], iteratedHex) => {
          const endHexUnitID = iteratedHex?.occupyingUnitID ?? ''
          const isEndHexOccupied = Boolean(endHexUnitID)
          const endHexUnitPlayerID = gameUnits[endHexUnitID]?.playerID
          const isEndHexEnemyOccupied =
            isEndHexOccupied &&
            endHexUnitPlayerID &&
            endHexUnitPlayerID !== attackerPlayerID // TODO: make this work for team games
          // If hex is enemy occupied...
          if (isEndHexEnemyOccupied) {
            // TODO isInRange: a place where we may consider engagements requiring adjacent attacks / terrain blocking range-1 attacks etc.
            const isInRange =
              HexUtils.distance(attackerHex as Hex, iteratedHex as Hex) <=
              (revealedGameCard?.range ?? 0)
            // ... and is in range
            if (isInRange) {
              return [...resultHexIDs, iteratedHex.id]
            }
          }
          return resultHexIDs
        },
        []
      )
      return {
        ...resultTargetsInRange,
        [unit.unitID]: numberUnitsInRangeForThisUnit,
      }
    }, {})
    return result
  }
  const revealedGameCardTargetsInRange: TargetsInRange =
    getRevealedGameCardTargetsInRange()
  const revealedGameCardUnitIDs = (revealedGameCardUnits ?? []).map(
    (u) => u.unitID
  )
  const countOfRevealedGameCardUnitsWithTargetsInRange = Object.entries(
    revealedGameCardTargetsInRange
  ).filter((e) => e[1].length > 0).length
  const attacksAllowed = revealedGameCard?.figures ?? 0
  const countOfUnitsThatMoved = uniqUnitsMoved.length
  const initialFreeAttacksAvailable = attacksAllowed - countOfUnitsThatMoved
  const unitsThatAttackedButDidNotMove = unitsAttacked.filter(
    (id) => !uniqUnitsMoved.includes(id)
  )
  const countFreeAttacksUsed = unitsThatAttackedButDidNotMove.length
  const freeAttacksAvailable =
    initialFreeAttacksAvailable - countFreeAttacksUsed
  const isFreeAttackAvailable = freeAttacksAvailable > 0
  const selectedGameCardUnits = Object.values(gameUnits).filter(
    (unit: GameUnit) => unit.gameCardID === currentTurnGameCardID
  )
  // HANDLERS
  function onClickTurnHex(event: SyntheticEvent, sourceHex: BoardHex) {
    event.stopPropagation()
    const boardHex = boardHexes[sourceHex.id]
    const occupyingUnitID = boardHex.occupyingUnitID
    const isEndHexOccupied = Boolean(occupyingUnitID)
    const unitOnHex: GameUnit = { ...gameUnits[occupyingUnitID] }
    const endHexUnitPlayerID = unitOnHex.playerID
    const isUnitReadyToSelect = unitOnHex?.gameCardID === currentTurnGameCardID
    const isUnitSelected = unitOnHex?.unitID === selectedUnitID

    // MOVE STAGE
    if (isMyTurn && !isAttackingStage) {
      const selectedUnitMoveRange =
        selectedUnit?.moveRange ?? generateBlankMoveRange()
      const { safe, engage, disengage } = selectedUnitMoveRange
      const allMoves = [safe, disengage, engage].flat()
      const isInMoveRangeOfSelectedUnit = allMoves.includes(sourceHex.id)
      // select unit
      if (isUnitReadyToSelect) {
        setSelectedUnitID(unitOnHex.unitID)
      }
      // deselect unit
      if (isUnitSelected) {
        setSelectedUnitID('')
      }
      // move selected unit
      if (selectedUnitID && isInMoveRangeOfSelectedUnit && !isEndHexOccupied) {
        moveAction(selectedUnit, boardHexes[sourceHex.id])
      }
    }
    // ATTACK STAGE
    if (isMyTurn && isAttackingStage) {
      const isEndHexEnemyOccupied =
        isEndHexOccupied && endHexUnitPlayerID !== playerID

      // select unit
      if (isUnitReadyToSelect) {
        setSelectedUnitID(unitOnHex.unitID)
      }
      // deselect unit
      if (isUnitSelected) {
        setSelectedUnitID('')
      }
      // attack with selected unit
      if (selectedUnitID && isEndHexEnemyOccupied) {
        const startHex = selectHexForUnit(selectedUnitID, boardHexes)
        const gameCard: any = Object.values(armyCards).find(
          (armyCard: GameArmyCard) =>
            armyCard?.gameCardID === currentTurnGameCardID
        )
        const isInRange =
          HexUtils.distance(startHex as BoardHex, boardHex) <=
            gameCard?.range ?? false
        if (isInRange) {
          // TODO: shall we mark this attack as unique, so react does not run it twice?
          attackAction(selectedUnit, boardHexes[sourceHex.id])
        }
      }
    }
  }

  return (
    <PlayContext.Provider
      value={{
        // COMPUTED
        currentTurnGameCardID,
        selectedGameCardUnits,
        selectedUnit,
        revealedGameCard,
        revealedGameCardUnits,
        revealedGameCardUnitIDs,
        revealedGameCardTargetsInRange,
        countOfRevealedGameCardUnitsWithTargetsInRange,
        freeAttacksAvailable,
        isFreeAttackAvailable,
        // HANDLERS
        onClickTurnHex,
      }}
    >
      {children}
    </PlayContext.Provider>
  )
}

export const usePlayContext = () => {
  const context = useContext(PlayContext)
  if (context === undefined) {
    throw new Error('usePlayContext must be used within a PlayContextProvider')
  }
  return context
}
