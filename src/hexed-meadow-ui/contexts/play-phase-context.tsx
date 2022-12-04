import React, {
  createContext,
  PropsWithChildren,
  SyntheticEvent,
  useContext,
} from 'react'
import { HexUtils } from 'react-hexgrid'

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

const PlayContext = createContext<PlayContextValue | undefined>(undefined)

type PlayContextValue = {
  // computed
  currentTurnGameCardID: string
  selectedUnit: GameUnit
  revealedGameCard: GameArmyCard | undefined
  revealedGameCardUnits: GameUnit[]
  selectedGameCardUnits: GameUnit[]
  // handlers
  onClickTurnHex: (event: React.SyntheticEvent, sourceHex: BoardHex) => void
}

export const PlayContextProvider = ({ children }: PropsWithChildren) => {
  const { playerID } = useBgioClientInfo()
  const {
    boardHexes,
    armyCards,
    gameUnits,
    orderMarkers,
    currentOrderMarker,
    players,
  } = useBgioG()
  const { ctx } = useBgioCtx()
  const { moves } = useBgioMoves()
  const { selectedUnitID, setSelectedUnitID, selectedGameCardID } =
    useUIContext()
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
      const moveRange = selectedUnit?.moveRange ?? generateBlankMoveRange()
      const { safe, engage, disengage } = moveRange
      const allMoves = [safe, disengage, engage].flat()
      const isInMoveRange = allMoves.includes(sourceHex.id)
      // select unit
      if (isUnitReadyToSelect) {
        setSelectedUnitID(unitOnHex.unitID)
      }
      // deselect unit
      if (isUnitSelected) {
        setSelectedUnitID('')
      }
      // move selected unit
      if (selectedUnitID && isInMoveRange && !isEndHexOccupied) {
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
