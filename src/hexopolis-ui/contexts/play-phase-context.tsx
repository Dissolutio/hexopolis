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
  selectIsInRangeOfAttack,
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
import { selectIfGameArmyCardHasFlying } from 'game/selector/card-selectors'

export type TargetsInRange = {
  [gameUnitID: string]: string[] // hexIDs
}

const PlayContext = createContext<PlayContextValue | undefined>(undefined)

type PlayContextValue = {
  // state
  selectedUnitMoveRange: MoveRange
  selectedUnitAttackRange: string[] // hexIDs
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
  revealedGameCardKilledUnits: GameUnit[]
  unitsWithTargets: number
  freeAttacksAvailable: number
  clonerHexIDs: string[]
  clonePlaceableHexIDs: string[]
  // handlers
  onClickTurnHex: (event: React.SyntheticEvent, sourceHex: BoardHex) => void
  toggleIsWalkingFlyer: () => void
}

export const PlayContextProvider = ({ children }: PropsWithChildren) => {
  const { playerID } = useBgioClientInfo()
  const {
    boardHexes,
    gameArmyCards,
    gameUnits,
    killedUnits,
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
    isMyTurn,
  } = useBgioCtx()
  const {
    moves: { moveAction, attackAction, attemptDisengage, placeWaterClone },
  } = useBgioMoves()
  const { selectedUnitID, setSelectedUnitID } = useUIContext()
  const selectedUnit = gameUnits?.[selectedUnitID]
  const selectedUnitGameCard = gameArmyCards.find(
    (card) => card.gameCardID === selectedUnit?.gameCardID
  )

  // disengage confirm and disengage related
  const [disengageAttempt, setDisengageAttempt] = useState<
    undefined | DisengageAttempt
  >(undefined)
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
  const [selectedUnitAttackRange, setSelectedUnitAttackRange] = useState<
    string[]
  >([])
  const { safeMoves, engageMoves, disengageMoves } =
    transformMoveRangeToArraysOfIds(selectedUnitMoveRange)
  // effect: update moverange when selected unit changes (only necessary in movement stage)
  useEffect(() => {
    if (isMovementStage) {
      if (selectedUnitID && selectedUnit) {
        setSelectedUnitMoveRange(() =>
          computeUnitMoveRange(
            selectedUnit,
            isFlying,
            boardHexes,
            gameUnits,
            gameArmyCards
          )
        )
      } else {
        setSelectedUnitMoveRange(generateBlankMoveRange())
      }
    }
  }, [
    isMovementStage,
    gameArmyCards,
    isFlying,
    boardHexes,
    gameUnits,
    selectedUnit,
    selectedUnitID,
  ])
  // effect: update attack-range when selected unit changes (only necessary in attacking stage)
  useEffect(() => {
    if (isAttackingStage) {
      if (selectedUnitID && selectedUnit) {
        const idsInRange = Object.values(boardHexes)
          .filter((hex) => {
            // if hex is not occupied by enemy unit, return false
            if (
              !hex.occupyingUnitID ||
              !gameUnits[hex.occupyingUnitID] ||
              gameUnits[hex.occupyingUnitID].playerID === playerID
            ) {
              return false
            }
            const { isInRange } = selectIsInRangeOfAttack({
              attackingUnit: selectedUnit,
              defenderHex: hex,
              gameArmyCards: gameArmyCards,
              boardHexes: boardHexes,
              gameUnits: gameUnits,
            })
            return isInRange
          })
          .map((hex) => hex.id)
        setSelectedUnitAttackRange(idsInRange)
      }
    }
  }, [
    boardHexes,
    gameArmyCards,
    gameUnits,
    isAttackingStage,
    playerID,
    selectedUnit,
    selectedUnitID,
  ])

  // water clone
  const clonerHexes = Object.values(waterCloneRoll?.placements ?? {}).map(
    (p) => p.clonerHexID
  )
  const waterClonesPlacedClonerIDs = waterClonesPlaced.map((p) => p.clonerID)
  const isAllClonesPlaced =
    waterClonesPlacedClonerIDs.length ===
    Object.values(waterCloneRoll?.placements ?? {}).length
  const clonePlaceableHexIDs = isAllClonesPlaced
    ? []
    : Object.values(waterCloneRoll?.placements ?? {})
        .filter(
          (placement) =>
            !waterClonesPlacedClonerIDs.includes(placement.clonerID)
        )
        .reduce((result: string[], placement) => {
          return [...result, ...placement.tails]
        }, [])
  const onClickClonePlaceableHex = (hex: BoardHex) => {
    // Since we know that marro warriors have 4 figures, the most that could be dead and cloned on one turn is 2 (2 dead, 2 successful clones)
    const validPlacements = Object.values(
      waterCloneRoll?.placements ?? {}
    ).filter(
      (placement) => !waterClonesPlacedClonerIDs.includes(placement.clonerID)
    )
    const firstIndex = validPlacements.findIndex((p) =>
      p.tails.includes(hex.id)
    )
    const secondIndex =
      firstIndex > -1
        ? validPlacements
            .slice(firstIndex)
            .findIndex((p) => p.tails.includes(hex.id))
        : 0
    // the number of placements should always be >= number of killed units, so accessing the first element is safe
    const clonedID = revealedGameCardKilledUnits.map((u) => u.unitID)[0]
    // 1. two matching, use the most exclusive one (the one that has the least tails), place the clone
    if (firstIndex >= 0 && secondIndex > 0) {
      const isSecondIndexMoreExclusive =
        validPlacements[secondIndex].tails.length <
        validPlacements[firstIndex].tails.length
      placeWaterClone({
        clonedID,
        hexID: hex.id,
        clonerID:
          validPlacements[isSecondIndexMoreExclusive ? secondIndex : firstIndex]
            .clonerID,
      })
    }
    // 2. only one matching, great, place the clone
    if (firstIndex >= 0) {
      placeWaterClone({
        clonedID,
        hexID: hex.id,
        clonerID: validPlacements[firstIndex].clonerID,
      })
    }
  }

  // COMPUTED
  const currentTurnGameCardID =
    players?.[playerID]?.orderMarkers?.[currentOrderMarker] ?? ''
  const revealedGameCard = selectRevealedGameCard(
    orderMarkers,
    gameArmyCards,
    currentOrderMarker,
    currentPlayer
  )
  const revealedGameCardUnits = Object.values(gameUnits).filter(
    (u: GameUnit) => u?.gameCardID === revealedGameCard?.gameCardID
  )
  const revealedGameCardKilledUnits: GameUnit[] = Object.values(
    killedUnits
  ).filter((killedUnit) => {
    return (
      killedUnit.playerID === playerID &&
      killedUnit.gameCardID === revealedGameCard?.gameCardID
    )
  })
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
    const result: TargetsInRange = unitsToConsider.reduce(
      (resultTargetsInRange, unit) => {
        const attackerHex = selectHexForUnit(unit.unitID, boardHexes)
        if (!attackerHex) {
          // the unit
          return resultTargetsInRange
        }
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
      },
      {}
    )
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
  const unitsThatAttackedButDidNotMove = Object.keys(unitsAttacked).filter(
    (id) => !uniqUnitsMoved.includes(id)
  )
  const countFreeAttacksUsed = unitsThatAttackedButDidNotMove.length
  const freeAttacksAvailable =
    initialFreeAttacksAvailable - countFreeAttacksUsed

  function onClickTurnHex(event: SyntheticEvent, sourceHex: BoardHex) {
    // Do not propagate to map-background onClick (if ever one is added)
    event.stopPropagation()
    const sourceHexID = sourceHex.id
    const occupyingUnitID = sourceHex.occupyingUnitID
    const isEndHexOccupied = Boolean(occupyingUnitID)
    const unitOnHex: GameUnit = { ...gameUnits[occupyingUnitID] }
    const endHexUnitPlayerID = unitOnHex.playerID
    const isUnitOnHexReadyToSelect =
      unitOnHex?.gameCardID === currentTurnGameCardID
    const isUnitOnHexSelected = unitOnHex?.unitID === selectedUnitID
    const isEndHexEnemyOccupied =
      isEndHexOccupied && endHexUnitPlayerID !== playerID

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
          // setSelectedUnitMoveRange(generateBlankMoveRange())
        } else if (isUnitOnHexReadyToSelect) {
          setSelectedUnitID(unitOnHex.unitID)
          // setSelectedUnitMoveRange(generateBlankMoveRange())
        }
      }
    }
    // ATTACK STAGE
    if (isAttackingStage) {
      // select unit
      if (isUnitOnHexReadyToSelect) {
        setSelectedUnitID(unitOnHex.unitID)
      }
      // deselect unit
      if (isUnitOnHexSelected) {
        setSelectedUnitID('')
      }
      // attack with selected unit
      if (selectedUnit && isEndHexEnemyOccupied) {
        const { isInRange } = selectIsInRangeOfAttack({
          attackingUnit: selectedUnit,
          defenderHex: sourceHex,
          gameArmyCards: gameArmyCards,
          boardHexes: boardHexes,
          gameUnits: gameUnits,
        })
        if (isInRange) {
          attackAction(selectedUnit, boardHexes[sourceHex.id])
        }
      }
    }
    // WATER CLONE STAGE
    if (isWaterCloneStage) {
      // place unit
      if (clonePlaceableHexIDs.includes(sourceHexID)) {
        // put the unit here, update placement
        onClickClonePlaceableHex(sourceHex)
      }
    }
  }

  return (
    <PlayContext.Provider
      value={{
        selectedUnitMoveRange,
        selectedUnitAttackRange,
        // disengage confirm
        showDisengageConfirm,
        disengageAttempt,
        isWalkingFlyer,
        confirmDisengageAttempt,
        cancelDisengageAttempt,
        toggleDisengageConfirm: onClickDisengageHex,
        // COMPUTED
        currentTurnGameCardID,
        selectedUnit,
        revealedGameCard,
        revealedGameCardUnits,
        revealedGameCardUnitIDs,
        revealedGameCardTargetsInRange,
        revealedGameCardKilledUnits,
        unitsWithTargets,
        freeAttacksAvailable,
        clonerHexIDs: clonerHexes,
        clonePlaceableHexIDs: clonePlaceableHexIDs,
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
