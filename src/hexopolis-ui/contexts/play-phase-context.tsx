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
  selectUnitsForCard,
  selectHexNeighbors,
} from '../../game/selectors'
import {
  generateBlankMoveRange,
  transformMoveRangeToArraysOfIds,
} from 'game/constants'
import { usePlacementContext, useUIContext } from '../contexts'
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
  selectIfGameArmyCardHasAbility,
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
  fallHexID: string
  isWalkingFlyer: boolean
  isGrappleGun: boolean
  confirmDisengageAttempt: () => void
  cancelDisengageAttempt: () => void
  confirmFallDamageMove: () => void
  cancelFallDamageMove: () => void
  onConfirmDropPlacement(): void
  onDenyDrop(): void

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
  toBeDroppedUnitIDs: string[]
  theDropPlaceableHexIDs: string[]
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
    myCards,
    myUnits,
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
    isTheDropStage,
    isGrenadeSAStage,
  } = useBgioCtx()
  const {
    moves: {
      moveAction,
      attackAction,
      attemptDisengage,
      placeWaterClone,
      dropInUnits,
    },
  } = useBgioMoves()
  // SELECTED UNIT
  const { selectedUnitID, setSelectedUnitID } = useUIContext()
  const { onPlaceUnitUpdateEditingBoardHexes, editingBoardHexes } =
    usePlacementContext()
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

  // FALL DAMAGE ATTEMPT
  const [fallHexID, setFallHexID] = useState<string>('')
  const confirmFallDamageMove = () => {
    moveAction(selectedUnit, boardHexes[fallHexID], selectedUnitMoveRange)
    setFallHexID('')
  }
  const cancelFallDamageMove = () => {
    setFallHexID('')
  }
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
  const onClickDangerousHex = (endHexID: string) => {
    // this is either a disengage and/or a falling damage hex
    const moveRangeSelection = selectedUnitMoveRange[endHexID]
    if (!moveRangeSelection) {
      return
    }
    const fallDamage = moveRangeSelection?.fallDamage ?? 0
    if (moveRangeSelection.isDisengage) {
      const disengagementUnitIDs =
        selectedUnitMoveRange[endHexID]?.disengagedUnitIDs
      const endFromHexID = selectedUnitMoveRange[endHexID]?.fromHexID
      const movePointsLeft = selectedUnitMoveRange[endHexID]?.movePointsLeft
      const defendersToDisengage = disengagementUnitIDs.map(
        (id) => gameUnits[id]
      )
      setDisengageAttempt({
        unit: selectedUnit,
        endHexID,
        endFromHexID,
        defendersToDisengage,
        movePointsLeft,
        fallDamage,
      })
    } else if (fallDamage > 0) {
      // we set the id, and then show confirm, if they say yes, we do the move and move-action will apply the fall damage
      setFallHexID(endHexID)
    }
  }

  // MOVE RANGE
  const [selectedUnitMoveRange, setSelectedUnitMoveRange] = useState<MoveRange>(
    generateBlankMoveRange()
  )

  const { safeMoves, engageMoves, dangerousMoves } =
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
  // THE DROP
  const myCardWithTheDrop = myCards.filter((c) =>
    selectIfGameArmyCardHasAbility('The Drop', c)
  )[0]
  const getDroppingUnits = () => {
    return myUnits.filter((u) => u.gameCardID === myCardWithTheDrop?.gameCardID)
  }
  const toBeDroppedUnitIDs = getDroppingUnits()
    .map((u) => u.unitID)
    .filter(
      (u) =>
        !Object.values(boardHexes).some(
          (h) =>
            h.occupyingUnitID === u ||
            editingBoardHexes[h.id]?.occupyingUnitID === u
        )
    )
  // default empty if player is idling, or placed all units
  const theDropPlaceableHexIDs: string[] =
    !(toBeDroppedUnitIDs.length > 0) || !isTheDropStage
      ? []
      : Object.values(boardHexes)
          .filter((hex) => {
            const isHexUnoccupied =
              !hex.occupyingUnitID && !editingBoardHexes[hex.id]
            const isAllHexNeighborsUnoccupied = !selectHexNeighbors(
              hex.id,
              boardHexes
            ).some(
              (h) =>
                h.occupyingUnitID || editingBoardHexes[h.id]?.occupyingUnitID
            )
            return isHexUnoccupied && isAllHexNeighborsUnoccupied
          })
          .map((hex) => hex.id)
  function onConfirmDropPlacement() {
    dropInUnits({
      isAccepting: true,
      deploymentProposition: editingBoardHexes,
      gameCardID: myCardWithTheDrop?.gameCardID,
      toBeDroppedUnitIDs,
    })
  }
  function onDenyDrop() {
    dropInUnits({
      isAccept: false,
    })
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
    // THE DROP STAGE
    if (isTheDropStage) {
      // we clicked a drop-able hex, and we have a unitID to drop
      const unitIDToDrop = toBeDroppedUnitIDs[0]
      if (theDropPlaceableHexIDs.includes(sourceHexID) && unitIDToDrop) {
        onPlaceUnitUpdateEditingBoardHexes({
          clickedHexId: sourceHexID,
          selectedUnitID: unitIDToDrop,
        })
      }
    }
    // MOVE STAGE
    if (isMovementStage) {
      const isInSafeMoveRangeOfSelectedUnit = safeMoves.includes(sourceHex.id)
      const isInEngageMoveRangeOfSelectedUnit = engageMoves.includes(
        sourceHex.id
      )
      const isAbleToMakeMove =
        isInSafeMoveRangeOfSelectedUnit || isInEngageMoveRangeOfSelectedUnit
      const isInDangerousRange = dangerousMoves.includes(sourceHex.id)
      // move selected unit if possible...
      if (selectedUnitID && isAbleToMakeMove) {
        moveAction(
          selectedUnit,
          boardHexes[sourceHex.id],
          selectedUnitMoveRange
        )
      } else if (selectedUnitID && isInDangerousRange) {
        // if clicked in disengage hex, then make them confirm...
        onClickDangerousHex(sourceHexID)
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
        fallHexID,
        isWalkingFlyer,
        isGrappleGun,
        confirmDisengageAttempt,
        cancelDisengageAttempt,
        confirmFallDamageMove,
        cancelFallDamageMove,
        onConfirmDropPlacement,
        onDenyDrop,
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
        theDropPlaceableHexIDs,
        toBeDroppedUnitIDs,
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
