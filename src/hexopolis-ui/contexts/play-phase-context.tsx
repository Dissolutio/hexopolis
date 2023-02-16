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
import {
  selectGameArmyCardAttacksAllowed,
  selectIfGameArmyCardHasFlying,
} from 'game/selector/card-selectors'

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
  isGrappleGun: boolean
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
  attacksLeft: number
  unitsWithTargets: number
  countOfUnmovedFiguresThatCanAttack: number
  clonerHexIDs: string[]
  clonePlaceableHexIDs: string[]
  // handlers
  onClickTurnHex: (event: React.SyntheticEvent, sourceHex: BoardHex) => void
  toggleIsWalkingFlyer: () => void
  toggleIsGrappleGun: () => void
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
    isGrenadeSAStage,
  } = useBgioCtx()
  const {
    moves: { moveAction, attackAction, attemptDisengage, placeWaterClone },
  } = useBgioMoves()
  // SELECTED UNIT
  const { selectedUnitID, setSelectedUnitID } = useUIContext()
  const selectedUnit = gameUnits?.[selectedUnitID]
  const selectedUnitGameCard = gameArmyCards.find(
    (card) => card.gameCardID === selectedUnit?.gameCardID
  )
  // CURRENT TURN COMPUTED
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
  const unitsAliveCount = revealedGameCardUnits.length
  const revealedGameCardKilledUnits: GameUnit[] = Object.values(
    killedUnits
  ).filter((killedUnit) => {
    return (
      killedUnit.playerID === playerID &&
      killedUnit.gameCardID === revealedGameCard?.gameCardID
    )
  })

  const {
    numberOfAttackingFigures,
    totalNumberOfAttacksAllowed,
    attacksAllowedPerFigure,
  } = selectGameArmyCardAttacksAllowed(revealedGameCard)
  const attacksUsed = Object.values(unitsAttacked).flat().length // TODO: attacksUsed will get weird because something like explosion attack might hit 8 people but only count as 1 attack
  const attacksLeft =
    Math.min(
      totalNumberOfAttacksAllowed,
      unitsAliveCount * attacksAllowedPerFigure
    ) - attacksUsed
  const revealedGameCardUnitIDs = (revealedGameCardUnits ?? []).map(
    (u) => u.unitID
  )

  const countOfUnitsThatMoved = uniqUnitsMoved.length
  const unitIDsThatHaveAttacked = Object.keys(unitsAttacked)
  const unitIDsThatHaveExpendedAllAttacks = unitIDsThatHaveAttacked.filter(
    (id) => {
      const attacksUsed = unitsAttacked[id].length
      return attacksUsed >= attacksAllowedPerFigure
    }
  )
  const initialCountOfUnmovedFiguresThatCanAttack =
    numberOfAttackingFigures - countOfUnitsThatMoved
  const countFreeAttacksUsed = unitIDsThatHaveExpendedAllAttacks.filter(
    (id) => !uniqUnitsMoved.includes(id)
  ).length
  const countOfUnmovedFiguresThatCanAttack =
    initialCountOfUnmovedFiguresThatCanAttack - countFreeAttacksUsed
  const canUnMovedFiguresAttack = countOfUnmovedFiguresThatCanAttack > 0
  const unitsThatCanAttack = revealedGameCardUnits
    .filter((u) => !unitIDsThatHaveExpendedAllAttacks.includes(u.unitID))
    .filter((u) =>
      canUnMovedFiguresAttack ? true : uniqUnitsMoved.includes(u.unitID)
    )

  // TARGETS IN RANGE
  const revealedGameCardTargetsInRange = React.useMemo((): TargetsInRange => {
    if (!revealedGameCard) {
      return {}
    }
    const targetsInRange: TargetsInRange = unitsThatCanAttack.reduce(
      (resultTargetsInRange, attackingUnit) => {
        const attackerPlayerID = attackingUnit.playerID
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
              const { isInRange } = selectIsInRangeOfAttack({
                attackingUnit: attackingUnit,
                defenderHex: iteratedHex,
                gameArmyCards: gameArmyCards,
                boardHexes: boardHexes,
                gameUnits: gameUnits,
              })
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
          [attackingUnit.unitID]: numberUnitsInRangeForThisUnit,
        }
      },
      {}
    )
    return targetsInRange
  }, [
    boardHexes,
    gameArmyCards,
    gameUnits,
    revealedGameCard,
    unitsThatCanAttack,
  ])
  const unitsWithTargets = Object.entries(
    revealedGameCardTargetsInRange
  ).filter((e) => e[1].length > 0).length
  // ATTACK RANGE: wip merging into targets in range
  const selectedUnitAttackRange =
    revealedGameCardTargetsInRange?.[selectedUnitID] ?? []

  // DISENGAGE CONFIRM AND DISENGAGE RELATED
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
    const movePointsLeft = selectedUnitMoveRange[endHexID]?.movePointsLeft
    const defendersToDisengage = disengagementUnitIDs.map((id) => gameUnits[id])
    setDisengageAttempt({
      unit: selectedUnit,
      endHexID,
      endFromHexID,
      defendersToDisengage,
      movePointsLeft,
    })
  }

  // TOGGLE WALKING/GRAPPLE-GUN FOR SPECIAL-MOVE UNITS
  const [isGrappleGun, setIsGrappleGun] = useState<boolean>(false)
  const toggleIsGrappleGun = () => {
    setIsGrappleGun((s) => !s)
  }
  // TOGGLE FLYING/WALKING FOR FLYING UNITS
  const [isWalkingFlyer, setIsWalkingFlyer] = useState<boolean>(false)
  const { hasFlying } = selectIfGameArmyCardHasFlying(selectedUnitGameCard)
  const isFlying = isWalkingFlyer ? false : hasFlying
  const toggleIsWalkingFlyer = () => {
    setIsWalkingFlyer((s) => !s)
  }

  // MOVE RANGE
  const [selectedUnitMoveRange, setSelectedUnitMoveRange] = useState<MoveRange>(
    generateBlankMoveRange()
  )

  const { safeMoves, engageMoves, disengageMoves } =
    transformMoveRangeToArraysOfIds(selectedUnitMoveRange)
  // effect: update moverange when selected unit changes (only necessary in movement stage)
  useEffect(() => {
    if (isMovementStage) {
      if (selectedUnitID && selectedUnit) {
        setSelectedUnitMoveRange(() =>
          // TODO GRAPPLE GUN
          computeUnitMoveRange(
            selectedUnit,
            isFlying,
            isGrappleGun,
            uniqUnitsMoved.length > 0,
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
    isGrappleGun,
    uniqUnitsMoved.length,
  ])

  // WATER CLONE
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
    // ATTACK STAGE / Grenade SA is stowing-away on the selection/deselection logic
    if (isAttackingStage || isGrenadeSAStage) {
      // select unit
      if (isUnitOnHexReadyToSelect) {
        setSelectedUnitID(unitOnHex.unitID)
      }
      // deselect unit
      if (isUnitOnHexSelected) {
        setSelectedUnitID('')
      }
      // attack with selected unit
      // the selecting of a special attack is split off in MapHexes, weird but lets GrenadeSA reuse some stuff
      if (isAttackingStage) {
        if (selectedUnit && isEndHexEnemyOccupied) {
          const { isInRange } = selectIsInRangeOfAttack({
            attackingUnit: selectedUnit,
            defenderHex: sourceHex,
            gameArmyCards: gameArmyCards,
            boardHexes: boardHexes,
            gameUnits: gameUnits,
          })
          if (isInRange) {
            const isStillAttacksLeftAfterThisOne = attacksLeft - 1 > 0
            attackAction({
              attackingUnit: selectedUnit,
              defenderHex: boardHexes[sourceHex.id],
              isStillAttacksLeft: isStillAttacksLeftAfterThisOne,
            })
          }
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
        isGrappleGun,
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
        attacksLeft,
        countOfUnmovedFiguresThatCanAttack,
        clonerHexIDs: clonerHexes,
        clonePlaceableHexIDs: clonePlaceableHexIDs,
        // HANDLERS
        onClickTurnHex,
        toggleIsWalkingFlyer,
        toggleIsGrappleGun,
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
