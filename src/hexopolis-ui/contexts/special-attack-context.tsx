import React, { useEffect, useMemo, useState } from 'react'

import {
  selectHexForUnit,
  selectTailHexForUnit,
  selectHexNeighborsWithDirections,
  selectHexesInLineFromHex,
  selectEngagementsForHex,
  selectIsInRangeOfAttack,
  selectGameCardByID,
} from '../../game/selectors'
import { selectIfGameArmyCardHasAbility } from 'game/selector/card-selectors'
import { uniq } from 'lodash'
import { usePlayContext } from './play-phase-context'
import { useBgioClientInfo, useBgioCtx, useBgioG } from 'bgio-contexts'
import {
  GameUnit,
  PossibleChomp,
  PossibleExplosionAttack,
  PossibleFireLineAttack,
} from 'game/types'

type SpecialAttackContextProviderProps = {
  children: React.ReactNode
}

const SpecialAttackContext = React.createContext<
  | {
      selectSpecialAttack: (id: string) => void
      selectedSpecialAttackHexID: string
      singleUnitOfRevealedGameCard: GameUnit | undefined
      chosenFireLineAttack: PossibleFireLineAttack | undefined
      fireLineTargetableHexIDs: string[]
      fireLineAffectedHexIDs: string[]
      fireLineSelectedHexIDs: string[]
      explosionTargetableHexIDs: string[]
      explosionAffectedHexIDs: string[]
      explosionAffectedUnitIDs: string[]
      explosionSelectedUnitIDs: string[]
      chosenExplosionAttack: PossibleExplosionAttack | undefined
      chompableHexIDs: string[]
      chompSelectedHexIDs: string[]
      chosenChomp: undefined | PossibleChomp
      mindShackleTargetableHexIDs: string[]
      mindShackleSelectedHexIDs: string[]
      chosenMindShackle:
        | { targetUnitID: string; targetName?: string }
        | undefined
    }
  | undefined
>(undefined)

export function SpecialAttackContextProvider({
  children,
}: SpecialAttackContextProviderProps) {
  const { playerID } = useBgioClientInfo()
  const { boardHexes, gameUnits, gameArmyCards, unitsAttacked } = useBgioG()
  const {
    isMyTurn,
    isGrenadeSAStage,
    isExplosionSAStage,
    isChompStage,
    isMindShackleStage,
  } = useBgioCtx()
  const { revealedGameCard, revealedGameCardUnits, selectedUnit } =
    usePlayContext()
  const selectedUnitGameCard = gameArmyCards.find(
    (card) => card.gameCardID === selectedUnit?.gameCardID
  )

  const [selectedSpecialAttackHexID, setSelectedSpecialAttackHexID] =
    useState<string>('')
  useEffect(() => {
    if (!isMyTurn) {
      setSelectedSpecialAttackHexID('')
    }

    // return () => {
    // }
  }, [isMyTurn])
  const selectSpecialAttack = (id: string) => {
    setSelectedSpecialAttackHexID(id)
  }
  const firstUnitOfRevealedGameCard = revealedGameCardUnits?.[0]
  const headHexOfFirstRevealedUnit = selectHexForUnit(
    firstUnitOfRevealedGameCard?.unitID ?? '',
    boardHexes
  )
  // NEGOKSA MIND SHACKLE
  const possibleMindShackles = useMemo(() => {
    const hasMindShackle = selectIfGameArmyCardHasAbility(
      'Mind Shackle 20',
      revealedGameCard
    )
    if (!hasMindShackle || !isMindShackleStage) {
      return {}
    }

    if (
      !isMyTurn ||
      !revealedGameCard ||
      !firstUnitOfRevealedGameCard ||
      !headHexOfFirstRevealedUnit
    ) {
      return {}
    }
    const result = selectEngagementsForHex({
      // TODO: technically, you can chomp your own people
      // all: true
      hexID: headHexOfFirstRevealedUnit.id,
      boardHexes,
      gameUnits,
      armyCards: gameArmyCards,
    }).reduce(
      (
        acc: { [hexID: string]: { targetUnitID: string; targetName?: string } },
        id
      ) => {
        const targetCard = selectGameCardByID(
          gameArmyCards,
          gameUnits?.[id]?.gameCardID ?? ''
        )
        if (!targetCard) {
          return acc
        }
        const isUnique = targetCard.type.includes('unique')
        const targetName = targetCard.name
        // can only mind shackle unique cards
        if (!isUnique) {
          return acc
        }
        const hex = selectHexForUnit(id, boardHexes)
        if (!hex) {
          return acc
        }
        return { ...acc, [hex.id]: { targetUnitID: id, targetName } }
      },
      {}
    )
    return result
  }, [
    revealedGameCard,
    isMindShackleStage,
    isMyTurn,
    firstUnitOfRevealedGameCard,
    headHexOfFirstRevealedUnit,
    boardHexes,
    gameUnits,
    gameArmyCards,
  ])
  const mindShackleTargetableHexIDs = Object.keys(possibleMindShackles)
  const mindShackleSelectedHexIDs =
    possibleMindShackles?.[selectedSpecialAttackHexID] !== undefined
      ? [selectedSpecialAttackHexID]
      : []

  const chosenMindShackle = possibleMindShackles?.[selectedSpecialAttackHexID]
  // GRIMNAK CHOMP
  const possibleChomps: { [hexID: string]: { isSquad: boolean } } =
    useMemo(() => {
      const hasChomp = selectIfGameArmyCardHasAbility('Chomp', revealedGameCard)
      if (!hasChomp || !isChompStage) {
        return {}
      }
      const headHex = selectHexForUnit(
        firstUnitOfRevealedGameCard?.unitID ?? '',
        boardHexes
      )
      const tailHex = selectTailHexForUnit(
        firstUnitOfRevealedGameCard?.unitID ?? '',
        boardHexes
      )
      if (
        !isMyTurn ||
        !revealedGameCard ||
        !firstUnitOfRevealedGameCard ||
        !headHex ||
        !tailHex
      ) {
        return {}
      }
      const result = selectEngagementsForHex({
        // TODO: technically, you can chomp your own people
        // all: true
        hexID: headHex.id,
        boardHexes,
        gameUnits,
        armyCards: gameArmyCards,
      }).reduce(
        (
          acc: { [hexID: string]: { isSquad: boolean; targetUnitID: string } },
          id
        ) => {
          const cardForEngagedUnit = selectGameCardByID(
            gameArmyCards,
            gameUnits?.[id]?.gameCardID ?? ''
          )
          const isSmallOrMedium =
            cardForEngagedUnit?.heightClass === 'small' ||
            cardForEngagedUnit?.heightClass === 'medium'
          if (!isSmallOrMedium) {
            return acc
          }
          const isSquad = cardForEngagedUnit?.type?.includes?.('squad')
          // TODO: Reselecting the hex here causes the head to be selectable even if Grimnak is only engaged to the tail (if Grimnak is engaged to the head, no problem)
          const hex = selectHexForUnit(id, boardHexes)
          if (!hex) {
            return acc
          }
          return {
            ...acc,
            [hex.id]: { isSquad, targetUnitID: id },
          }
        },
        {}
      )
      return result
    }, [
      boardHexes,
      gameArmyCards,
      gameUnits,
      isChompStage,
      isMyTurn,
      revealedGameCard,
      firstUnitOfRevealedGameCard,
    ])

  const chompableHexIDs = Object.keys(possibleChomps)
  const chompSelectedHexIDs =
    possibleChomps?.[selectedSpecialAttackHexID] !== undefined
      ? [selectedSpecialAttackHexID]
      : []
  const chosenChomp =
    possibleChomps?.[selectedSpecialAttackHexID] !== undefined
      ? {
          chompingUnitID: firstUnitOfRevealedGameCard?.unitID ?? '',
          targetHexID: selectedSpecialAttackHexID,
          isSquad: possibleChomps?.[selectedSpecialAttackHexID]?.isSquad,
        }
      : undefined
  // MIMRING FIRE LINE
  const possibleFireLineAttacks: PossibleFireLineAttack[] = useMemo(() => {
    const hasFireLine = selectIfGameArmyCardHasAbility(
      'Fire Line Special Attack',
      revealedGameCard
    )
    const headHex = selectHexForUnit(
      firstUnitOfRevealedGameCard?.unitID ?? '',
      boardHexes
    )
    const tailHex = selectTailHexForUnit(
      firstUnitOfRevealedGameCard?.unitID ?? '',
      boardHexes
    )
    // 0. This attack is illustrated in the ROTV 2nd Edition Rules(p. 15), it can affect stacked hexes in 3D (if this game ever gets that far)
    // 0.1 The affected path of the attack is 8 hexes projected out in a straight line, starting from either the head or tail of the unit
    // 1. Get the 8 neighboring hexes, 6 of them will simply have one path going through them, note their direction from their source
    // 2. Note the 2 neighbors that are abutting both head and tail, these special neighbors have 2 paths going through them, one from the head, one from the tail
    // 2.1. These 2 special neighbors will each have 2 paths, so making them the clickable hex would add a level of confusion, but move just one hex along both of those paths and now you have 2 unique hexes for clicking on and their associated single path
    // 2.2. If the projection outwards for the 2 special hexes is blocked (i.e. Mimring is along the edge of the map, or in a hallway of sorts) revert to just the special hex, because now it would have only one or maybe even zero paths going through it
    // 3. These 6 simple hexes and 4 extrapolated hexes are now clickable, and each is apart of a unique path away from Mimring, and the player can choose which path to attack with
    // 4. Get the units on the hexes for each path, for readout to user
    if (
      !isMyTurn ||
      !hasFireLine ||
      !revealedGameCard ||
      !firstUnitOfRevealedGameCard ||
      !headHex ||
      !tailHex
    ) {
      return []
    }
    const engagedEnemyUnitIDs = selectEngagementsForHex({
      hexID: headHex.id,
      boardHexes,
      gameUnits,
      armyCards: gameArmyCards,
    })
    const unitsNeighborHexIDAndDirectionPairs = [
      // get all the neighbors of the head and tail hexes
      ...selectHexNeighborsWithDirections(headHex?.id ?? '', boardHexes),
      ...selectHexNeighborsWithDirections(tailHex?.id ?? '', boardHexes),
      // remove the head and tail hexes from the list
    ].filter((e) => e[0] !== headHex?.id && e[0] !== tailHex?.id)
    const specialIDs = uniq(
      unitsNeighborHexIDAndDirectionPairs.reduce((acc, pair) => {
        const isThisPairOneOfTheSpecialDuplicates =
          unitsNeighborHexIDAndDirectionPairs
            .map((p) => p[0])
            .filter((id) => id === pair[0]).length > 1
        if (isThisPairOneOfTheSpecialDuplicates) {
          acc.push(pair[0])
        }
        return acc
      }, [])
    )
    const result = unitsNeighborHexIDAndDirectionPairs.reduce(
      (acc, idDirectionPair) => {
        const lineOfBoardHexes = selectHexesInLineFromHex(
          idDirectionPair[0],
          idDirectionPair[1], // 0-5 NE-E-SE-SW-E-NW
          8, // the number of hexes in a line
          boardHexes
        )
        const affectedUnitIDs = uniq(
          lineOfBoardHexes.map((hex) => hex.occupyingUnitID).filter((h) => !!h)
        )
        if (
          engagedEnemyUnitIDs.length > 0 &&
          !engagedEnemyUnitIDs.some((id) => affectedUnitIDs.includes(id))
        ) {
          return acc
        }
        const theKeyFor6NormalHexes = lineOfBoardHexes[0]?.id
        const theKeyFor2SpecialHexes = lineOfBoardHexes[1]?.id
        const direction = idDirectionPair[1]
        // this is when we do the adjustment for the 2 special hexes, and instead use the second hex in the line as the key, if there is a second hex
        // if its a special ID AND there is a second hex in the line, then use the second hex as the key
        if (specialIDs.includes(idDirectionPair[0]) && theKeyFor2SpecialHexes) {
          acc[theKeyFor2SpecialHexes] = {
            clickableHexID: theKeyFor2SpecialHexes,
            direction,
            line: lineOfBoardHexes,
            affectedUnitIDs,
          }
        } else {
          acc[theKeyFor6NormalHexes] = {
            clickableHexID: theKeyFor6NormalHexes,
            direction,
            line: lineOfBoardHexes,
            affectedUnitIDs,
          }
        }
        return acc
      },
      {}
    )
    return result
  }, [
    revealedGameCard,
    firstUnitOfRevealedGameCard,
    boardHexes,
    isMyTurn,
    gameUnits,
    gameArmyCards,
  ])
  const chosenFireLineAttack = Object.values(possibleFireLineAttacks)?.find?.(
    (pa) => {
      return pa.clickableHexID === selectedSpecialAttackHexID
    }
  )
  const { fireLineTargetableHexIDs, fireLineSecondaryHexIDs } = useMemo(() => {
    const fireLineTargetHexIDs =
      Object.values(possibleFireLineAttacks)?.map?.(
        (pa) => pa.clickableHexID
      ) ?? []
    const fireLineSecondaryHexIDs =
      (
        Object.values(possibleFireLineAttacks)?.map?.((pa) =>
          pa?.line?.map?.((hex) => hex.id)
        ) ?? []
      )?.flat() ?? []
    return {
      fireLineTargetableHexIDs: fireLineTargetHexIDs,
      fireLineSecondaryHexIDs,
    }
  }, [possibleFireLineAttacks])

  const { fireLineSelectedHexIDs, fireLineAffectedHexIDs } = useMemo(() => {
    const fireLineSelectedHexIDs =
      chosenFireLineAttack?.line?.map?.((hex) => hex.id) ?? []

    const fireLineAffectedHexIDs = fireLineSecondaryHexIDs.filter(
      (id) => !fireLineTargetableHexIDs.includes(id)
    )
    return {
      fireLineSelectedHexIDs,
      fireLineTargetableHexIDs,
      fireLineAffectedHexIDs,
    }
  }, [
    fireLineSecondaryHexIDs,
    chosenFireLineAttack?.line,
    fireLineTargetableHexIDs,
  ])
  // DEATHWALKER-9000 EXPLOSION & AIRBORNE GRENADE
  const possibleExplosionAttacks: PossibleExplosionAttack[] = useMemo(() => {
    const cardToUse = isGrenadeSAStage ? selectedUnitGameCard : revealedGameCard
    const unitToUse = isGrenadeSAStage
      ? selectedUnit
      : firstUnitOfRevealedGameCard
    const unitAlreadyAttacked =
      Boolean(unitToUse) &&
      Object.keys(unitsAttacked).includes(unitToUse.unitID)
    const hasExplosion =
      selectIfGameArmyCardHasAbility('Explosion Special Attack', cardToUse) ||
      (!cardToUse?.hasThrownGrenade &&
        !unitAlreadyAttacked &&
        selectIfGameArmyCardHasAbility('Grenade Special Attack', cardToUse))
    // deathwalker 9000 & AirborneElite are 1-hex figures
    const headHex = selectHexForUnit(unitToUse?.unitID ?? '', boardHexes)
    // This attack is very similar to normal attack, select a unit in range
    if (!isMyTurn || !hasExplosion || !cardToUse || !unitToUse || !headHex) {
      return []
    }
    const engagedEnemyUnitIDs = selectEngagementsForHex({
      hexID: headHex.id,
      boardHexes,
      gameUnits,
      armyCards: gameArmyCards,
    })
    const hexIDsInRange: [string, string][] = Object.values(boardHexes)
      .filter((hex) => {
        // if hex is not occupied by enemy unit, return false
        if (
          // not occupied
          !hex.occupyingUnitID ||
          // no unit for id on hex (shouldn't happen))
          !gameUnits[hex.occupyingUnitID] ||
          // attacking unit is engaged and not by this unit, must attacked engaged units
          (engagedEnemyUnitIDs.length > 0 &&
            !engagedEnemyUnitIDs.some((id) => id === hex.occupyingUnitID)) ||
          // unit is a friendly unit (TODO: It's technically legal to attack your own figures)
          gameUnits[hex.occupyingUnitID].playerID === playerID
        ) {
          return false
        }
        const { isInRange } = selectIsInRangeOfAttack({
          attackingUnit: unitToUse,
          defenderHex: hex,
          gameArmyCards: gameArmyCards,
          boardHexes: boardHexes,
          gameUnits: gameUnits,
          overrideUnitRange: isGrenadeSAStage
            ? 5
            : isExplosionSAStage
            ? 7
            : undefined,
          isSpecialAttack: true,
        })
        return isInRange
      })
      .map((hex) => [hex.id, hex.occupyingUnitID])

    const result: PossibleExplosionAttack[] = hexIDsInRange.reduce(
      (acc: PossibleExplosionAttack[], [hexID, hexUnitID]) => {
        const affectedUnitIDs = uniq([
          // include the clickable unit
          hexUnitID,
          ...selectEngagementsForHex({
            hexID,
            boardHexes,
            gameUnits,
            armyCards: gameArmyCards,
            all: true,
          }),
        ])
        const affectedHexIDs: string[] = affectedUnitIDs
          .map((id) => {
            return selectHexForUnit(id, boardHexes)?.id ?? ''
          })
          .filter((id) => id !== '')
        return [
          ...acc,
          {
            clickableHexID: hexID,
            clickableHexUnitID: hexUnitID,
            affectedUnitIDs,
            affectedHexIDs,
          },
        ]
      },
      []
    )
    return result
  }, [
    isGrenadeSAStage,
    selectedUnitGameCard,
    revealedGameCard,
    selectedUnit,
    firstUnitOfRevealedGameCard,
    unitsAttacked,
    boardHexes,
    isMyTurn,
    gameUnits,
    gameArmyCards,
    playerID,
    isExplosionSAStage,
  ])
  const explosionTargetableHexIDs =
    possibleExplosionAttacks?.map?.((pa) => pa.clickableHexID) ?? []
  const chosenExplosionAttack = possibleExplosionAttacks?.find?.((pa) => {
    return pa.clickableHexID === selectedSpecialAttackHexID
  })
  // plural name, but it's an array of one unitID
  const explosionSelectedUnitIDs = chosenExplosionAttack
    ? [chosenExplosionAttack.clickableHexUnitID]
    : []
  const explosionAffectedHexIDs = chosenExplosionAttack?.affectedHexIDs ?? []
  const explosionAffectedUnitIDs = chosenExplosionAttack?.affectedUnitIDs ?? []
  return (
    <SpecialAttackContext.Provider
      value={{
        selectSpecialAttack,
        selectedSpecialAttackHexID,
        singleUnitOfRevealedGameCard: firstUnitOfRevealedGameCard,
        chosenFireLineAttack,
        fireLineSelectedHexIDs,
        fireLineTargetableHexIDs,
        fireLineAffectedHexIDs,
        explosionTargetableHexIDs,
        explosionAffectedHexIDs,
        explosionAffectedUnitIDs,
        explosionSelectedUnitIDs,
        chosenExplosionAttack,
        chompableHexIDs,
        chompSelectedHexIDs,
        chosenChomp,
        mindShackleTargetableHexIDs,
        mindShackleSelectedHexIDs,
        chosenMindShackle,
      }}
    >
      {children}
    </SpecialAttackContext.Provider>
  )
}
export function useSpecialAttackContext() {
  const context = React.useContext(SpecialAttackContext)
  if (context === undefined) {
    throw new Error(
      'useSpecialAttackContext must be used within a SpecialAttackContextProvider'
    )
  }
  return context
}
