import React, {
  createContext,
  PropsWithChildren,
  SyntheticEvent,
  useContext,
  useEffect,
} from 'react'
import { HexUtils } from 'react-hexgrid'

import { BoardHex, GameArmyCard, GameUnit } from 'game/HM-types'
import { selectHexForUnit, selectRevealedGameCard } from 'game/HM-G-selectors'
import { generateBlankMoveRange } from 'game/HM-constants'
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
  selectedGameCard: GameArmyCard | undefined
  selectedGameCardUnits: GameUnit[]
  // handlers
  onSelectCard__turn: (gameCardID: string) => void
  onClickBoardHex__turn: (
    event: React.SyntheticEvent,
    sourceHex: BoardHex
  ) => void
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
  const {
    selectedUnitID,
    setSelectedUnitID,
    selectedGameCardID,
    setSelectedGameCardID,
  } = useUIContext()

  const { currentPlayer, isMyTurn, isAttackingStage } = ctx
  const { moveAction, attackAction } = moves

  const currentTurnGameCardID =
    players?.[playerID]?.orderMarkers?.[currentOrderMarker] ?? ''
  // EFFECTS
  useEffect(() => {
    // auto select card on turn begin
    if (isMyTurn) {
      // auto select card AND deselect units on attack begin
      if (isAttackingStage) {
        setSelectedGameCardID(currentTurnGameCardID)
        setSelectedUnitID('')
      }
      setSelectedGameCardID(currentTurnGameCardID)
    }
    //  auto deselect card/units on end turn
    if (!isMyTurn) {
      setSelectedGameCardID('')
      setSelectedUnitID('')
    }
  }, [
    isMyTurn,
    isAttackingStage,
    currentTurnGameCardID,
    setSelectedGameCardID,
    setSelectedUnitID,
  ])
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
  const selectedGameCard = Object.values(armyCards).find(
    (armyCard: GameArmyCard) => armyCard?.gameCardID === selectedGameCardID
  )
  const selectedGameCardUnits = Object.values(gameUnits).filter(
    (unit: GameUnit) => unit.gameCardID === selectedGameCardID
  )
  // HANDLERS
  function onSelectCard__turn(gameCardID: string) {
    // deselect if already selected
    if (gameCardID === selectedGameCardID) {
      setSelectedGameCardID('')
      return
    }
    setSelectedGameCardID(gameCardID)
    return
  }
  function onClickBoardHex__turn(event: SyntheticEvent, sourceHex: BoardHex) {
    event.stopPropagation()
    const boardHex = boardHexes[sourceHex.id]
    const occupyingUnitID = boardHex.occupyingUnitID
    const isEndHexOccupied = Boolean(occupyingUnitID)
    const unitOnHex: GameUnit = { ...gameUnits[occupyingUnitID] }
    const endHexUnitPlayerID = unitOnHex.playerID
    const isUnitReadyToSelect =
      unitOnHex?.gameCardID === selectedGameCardID &&
      selectedGameCardID === currentTurnGameCardID
    const isUnitSelected = unitOnHex?.unitID === selectedUnitID

    // MOVE STAGE
    if (isMyTurn && !isAttackingStage) {
      const moveRange = selectedUnit?.moveRange ?? generateBlankMoveRange()
      const { safe, engage, disengage } = moveRange
      const allMoves = [safe, disengage, engage].flat()
      const isInMoveRange = allMoves.includes(sourceHex.id)
      // move selected unit
      if (selectedUnitID && isInMoveRange && !isEndHexOccupied) {
        moveAction(selectedUnit, boardHexes[sourceHex.id])
      }
      // select unit
      if (isUnitReadyToSelect) {
        setSelectedUnitID(unitOnHex.unitID)
      }
      // deselect unit
      if (isUnitSelected) {
        setSelectedUnitID('')
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
            armyCard?.gameCardID === selectedGameCardID
        )
        const isInRange =
          HexUtils.distance(startHex as BoardHex, boardHex) <=
            gameCard?.range ?? false
        if (isInRange) {
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
        selectedGameCard,
        selectedGameCardUnits,
        selectedUnit,
        revealedGameCard,
        revealedGameCardUnits,
        // HANDLERS
        onClickBoardHex__turn,
        onSelectCard__turn,
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
