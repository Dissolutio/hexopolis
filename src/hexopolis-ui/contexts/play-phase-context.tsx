import React, {
  createContext,
  PropsWithChildren,
  SyntheticEvent,
  useContext,
  useEffect,
  useState,
} from 'react'

import {
  BoardHex,
  DisengageAttempt,
  GameArmyCard,
  GameUnit,
  HexCoordinates,
  MoveRange,
} from 'game/types'
import {
  selectHexForUnit,
  selectRevealedGameCard,
  selectIfGameArmyCardHasFlying,
} from '../../game/selectors'
import {
  generateBlankMoveRange,
  transformMoveRangeToArraysOfIds,
} from 'game/constants'
import { useUIContext } from '../contexts'
import {
  useBgioClientInfo,
  useBgioCtx,
  useBgioG,
  useBgioMoves,
} from 'bgio-contexts'
import { hexUtilsDistance } from 'game/hex-utils'
import { computeUnitMoveRange } from 'game/computeUnitMoveRange'

export type TargetsInRange = {
  [gameUnitID: string]: string[] // hexIDs
}

const PlayContext = createContext<PlayContextValue | undefined>(undefined)

type PlayContextValue = {
  // state
  selectedUnitMoveRange: MoveRange
  showDisengageConfirm: boolean
  disengageAttempt: DisengageAttempt | undefined
  isWalkingFlyer: boolean
  confirmDisengageAttempt: () => void
  cancelDisengageAttempt: () => void
  toggleDisengageConfirm: (endHexID: string) => void
  // computed
  currentTurnGameCardID: string
  selectedUnit: GameUnit
  revealedGameCard: GameArmyCard | undefined
  revealedGameCardUnits: GameUnit[]
  revealedGameCardUnitIDs: string[]
  revealedGameCardTargetsInRange: TargetsInRange
  unitsWithTargets: number
  selectedGameCardUnits: GameUnit[]
  freeAttacksAvailable: number
  isFreeAttackAvailable: boolean
  // handlers
  onClickTurnHex: (event: React.SyntheticEvent, sourceHex: BoardHex) => void
  toggleIsWalkingFlyer: () => void
}

export const PlayContextProvider = ({ children }: PropsWithChildren) => {
  const { playerID } = useBgioClientInfo()
  const {
    boardHexes,
    gameArmyCards: armyCards,
    gameUnits,
    unitsAttacked,
    orderMarkers,
    currentOrderMarker,
    players,
    uniqUnitsMoved,
    waterCloneRoll,
    waterClonesPlaced,
  } = useBgioG()
  const {
    currentPlayer,
    isMovementStage,
    isAttackingStage,
    isWaterCloneStage,
  } = useBgioCtx()
  const { moves } = useBgioMoves()
  const { selectedUnitID, setSelectedUnitID } = useUIContext()
  const selectedUnit = gameUnits?.[selectedUnitID]
  const selectedUnitGameCard = armyCards.find(
    (card) => card.gameCardID === selectedUnit?.gameCardID
  )
  const { moveAction, attackAction, attemptDisengage } = moves
  // disengage confirm
  const [disengageAttempt, setDisengageAttempt] = useState<
    undefined | DisengageAttempt
  >(undefined)

  // toggle flying/walking for flying units
  const [isWalkingFlyer, setIsWalkingFlyer] = useState<boolean>(false)
  const { hasFlying } = selectIfGameArmyCardHasFlying(selectedUnitGameCard)
  const isFlying = isWalkingFlyer ? false : hasFlying
  const toggleIsWalkingFlyer = () => {
    setIsWalkingFlyer((s) => !s)
  }

  // move range of selected unit, when it's your move
  const [selectedUnitMoveRange, setSelectedUnitMoveRange] = useState<MoveRange>(
    generateBlankMoveRange()
  )
  const { safeMoves, engageMoves, disengageMoves } =
    transformMoveRangeToArraysOfIds(selectedUnitMoveRange)
  // effect: update moverange when selected unit changes
  useEffect(() => {
    if (selectedUnitID && selectedUnit)
      setSelectedUnitMoveRange(() =>
        computeUnitMoveRange(
          selectedUnit,
          isFlying,
          boardHexes,
          gameUnits,
          armyCards
        )
      )
  }, [armyCards, isFlying, boardHexes, gameUnits, selectedUnit, selectedUnitID])

  const showDisengageConfirm = disengageAttempt !== undefined
  const confirmDisengageAttempt = () => {
    attemptDisengage(disengageAttempt)
    setDisengageAttempt(undefined)
  }
  const cancelDisengageAttempt = () => {
    setDisengageAttempt(undefined)
  }
  const onClickDisengageHex = (endHexID: string) => {
    const disengagementUnitIDs =
      selectedUnitMoveRange[endHexID]?.disengagedUnitIDs
    const endFromHexID = selectedUnitMoveRange[endHexID]?.fromHexID
    const defendersToDisengage = disengagementUnitIDs.map((id) => gameUnits[id])
    setDisengageAttempt({
      unit: selectedUnit,
      endHexID,
      endFromHexID,
      defendersToDisengage,
    })
  }

  // COMPUTED
  const currentTurnGameCardID =
    players?.[playerID]?.orderMarkers?.[currentOrderMarker] ?? ''
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
      // if (!attackerHex) {
      //   // the unit
      //   return resultTargetsInRange
      // }
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
              hexUtilsDistance(
                attackerHex as HexCoordinates,
                iteratedHex as HexCoordinates
              ) <= (revealedGameCard?.range ?? 0)
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
  const unitsWithTargets = Object.entries(
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
  const clonerHexes = Object.values(waterCloneRoll?.placements ?? {}).map(
    (p) => p.unitHexID
  )
  const { clonePlaceables, cloneRePlaceables } = Object.values(
    waterCloneRoll?.placements ?? {}
  ).reduce(
    (
      result: { clonePlaceables: string[]; cloneRePlaceables: string[] },
      placement
    ) => {
      // if the unit has been placed, then the hex is not placeable, it's re-placeable
      const cloneForThisHexWasPlacedAlready = waterClonesPlaced
        ?.map((placed) => placed.clonerID)
        .includes(placement.clonerID)
      if (!cloneForThisHexWasPlacedAlready) {
        return {
          ...result,
          clonePlaceables: [...result.clonePlaceables, ...placement.tails],
        }
      } else {
        return {
          ...result,
          cloneRePlaceables: [...result.cloneRePlaceables, ...placement.tails],
        }
      }
    },
    { clonePlaceables: [], cloneRePlaceables: [] }
  )
  // HANDLERS
  function onClickTurnHex(event: SyntheticEvent, sourceHex: BoardHex) {
    // Do not propagate to map-background onClick (if ever one is added)
    event.stopPropagation()
    const sourceHexID = sourceHex.id
    const boardHex = boardHexes[sourceHex.id]
    const occupyingUnitID = boardHex.occupyingUnitID
    const isEndHexOccupied = Boolean(occupyingUnitID)
    const unitOnHex: GameUnit = { ...gameUnits[occupyingUnitID] }
    const endHexUnitPlayerID = unitOnHex.playerID
    const isUnitOnHexReadyToSelect =
      unitOnHex?.gameCardID === currentTurnGameCardID
    const isUnitOnHexSelected = unitOnHex?.unitID === selectedUnitID

    // MOVE STAGE
    if (isMovementStage) {
      const isInSafeMoveRangeOfSelectedUnit = safeMoves.includes(sourceHex.id)
      const isInEngageMoveRangeOfSelectedUnit = engageMoves.includes(
        sourceHex.id
      )
      const isAbleToMakeMove =
        isInSafeMoveRangeOfSelectedUnit || isInEngageMoveRangeOfSelectedUnit
      const isInDisengageRange = disengageMoves.includes(sourceHex.id)
      // move selected unit if possible...
      if (selectedUnitID && isAbleToMakeMove) {
        moveAction(
          selectedUnit,
          boardHexes[sourceHex.id],
          selectedUnitMoveRange
        )
      } else if (selectedUnitID && isInDisengageRange) {
        // if clicked in disengage hex, then make them confirm...
        onClickDisengageHex(sourceHexID)
      } else {
        // ...otherwise, select or deselect
        // select unit
        // deselect unit
        if (isUnitOnHexSelected) {
          setSelectedUnitID('')
          setSelectedUnitMoveRange(generateBlankMoveRange())
        } else if (isUnitOnHexReadyToSelect) {
          setSelectedUnitID(unitOnHex.unitID)
          setSelectedUnitMoveRange(generateBlankMoveRange())
        }
      }
    }
    // ATTACK STAGE
    if (isAttackingStage) {
      const isEndHexEnemyOccupied =
        isEndHexOccupied && endHexUnitPlayerID !== playerID

      // select unit
      if (isUnitOnHexReadyToSelect) {
        setSelectedUnitID(unitOnHex.unitID)
      }
      // deselect unit
      if (isUnitOnHexSelected) {
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
          hexUtilsDistance(startHex as BoardHex, boardHex) <= gameCard?.range ??
          false
        if (isInRange) {
          attackAction(selectedUnit, boardHexes[sourceHex.id])
        }
      }
    }
    // WATER CLONE STAGE
    if (isWaterCloneStage) {
      const isHexInClonePlaceables = clonePlaceables.includes(sourceHexID)
      const isHexInCloneRePlaceables = cloneRePlaceables.includes(sourceHexID)
      // place unit
      if (isHexInClonePlaceables) {
        setSelectedUnitID(unitOnHex.unitID)
      }
      // re-place unit
      if (isHexInCloneRePlaceables) {
        setSelectedUnitID('')
      }
    }
  }

  return (
    <PlayContext.Provider
      value={{
        selectedUnitMoveRange,
        // disengage confirm
        showDisengageConfirm,
        disengageAttempt,
        isWalkingFlyer,
        confirmDisengageAttempt,
        cancelDisengageAttempt,
        toggleDisengageConfirm: onClickDisengageHex,
        // COMPUTED
        currentTurnGameCardID,
        selectedGameCardUnits,
        selectedUnit,
        revealedGameCard,
        revealedGameCardUnits,
        revealedGameCardUnitIDs,
        revealedGameCardTargetsInRange,
        unitsWithTargets,
        freeAttacksAvailable,
        isFreeAttackAvailable,
        // HANDLERS
        onClickTurnHex,
        toggleIsWalkingFlyer,
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
