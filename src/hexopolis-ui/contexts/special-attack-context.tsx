import React, { useMemo, useState } from 'react'

import {
  selectHexForUnit,
  selectTailHexForUnit,
  selectHexNeighborsWithDirections,
  selectHexesInLineFromHex,
  selectUnitForHex,
  selectGameCardByID,
} from '../../game/selectors'
import { selectIfGameArmyCardHasAbility } from 'game/selector/card-selectors'
import { uniq, uniqBy } from 'lodash'
import { usePlayContext } from './play-phase-context'
import { useBgioCtx, useBgioG } from 'bgio-contexts'
import { BoardHex, GameUnit } from 'game/types'

export type PossibleAttack = {
  affectedUnitIDs: string[]
  clickableHexID: string
  direction: number
  line: BoardHex[]
}
type SpecialAttackContextProviderProps = {
  children: React.ReactNode
}

const SpecialAttackContext = React.createContext<
  | {
      chosenSpecialAttack: string
      possibleFireLineAttacks: PossibleAttack[]
      selectSpecialAttack: (id: string) => void
      unitFireLining: GameUnit | undefined
      chosenFireLineAttack: PossibleAttack | undefined
      malaffectedHexIDs: string[]
      selectedFireLinePathHexIDs: string[]
      targetableHexIDs: string[]
      affectedSelectedUnitNames: string[]
    }
  | undefined
>(undefined)

export function SpecialAttackContextProvider({
  children,
}: SpecialAttackContextProviderProps) {
  const { revealedGameCard, revealedGameCardUnits } = usePlayContext()
  const { isMyTurn } = useBgioCtx()
  const { boardHexes, gameUnits, gameArmyCards } = useBgioG()
  const [chosenSpecialAttack, setChosenSpecialAttack] = useState<string>('')
  const selectSpecialAttack = (id: string) => {
    setChosenSpecialAttack(id)
  }
  const unitFireLining = revealedGameCardUnits?.[0]

  const possibleFireLineAttacks: PossibleAttack[] = useMemo(() => {
    const hasFireLine = selectIfGameArmyCardHasAbility(
      'Fire Line Special Attack',
      revealedGameCard
    )
    // 0. This attack is illustrated in the ROTV 2nd Edition Rules(p. 15), it can affect stacked hexes in 3D (if this game ever gets that far)
    // 0.1 The affected path of the attack is 8 hexes projected out in a straight line, starting from either the head or tail of the unit
    // 1. Get the 8 neighboring hexes, 6 of them will simply have one path going through them, note their direction from their source
    // 2. Note the 2 neighbors that are abutting both head and tail, these special neighbors have 2 paths going through them, one from the head, one from the tail
    // 2.1. These 2 special neighbors will each have 2 paths, so making them the clickable hex would add a level of confusion, but move just one hex along both of those paths and now you have 2 unique hexes for clicking on and their associated single path
    // 2.2. If the projection outwards for the 2 special hexes is blocked (i.e. Mimring is along the edge of the map, or in a hallway of sorts) revert to just the special hex, because now it would have only one or maybe even zero paths going through it
    // 3. These 6 simple hexes and 4 extrapolated hexes are now clickable, and each is apart of a unique path away from Mimring, and the player can choose which path to attack with
    // 4. Get the units on the hexes for each path, for readout to user
    if (!isMyTurn || !hasFireLine || !revealedGameCard) {
      return []
    }
    const headHex = selectHexForUnit(unitFireLining.unitID, boardHexes)
    const tailHex = selectTailHexForUnit(unitFireLining.unitID, boardHexes)
    const unitsNeighborHexIDAndDirectionPairs = [
      ...selectHexNeighborsWithDirections(headHex?.id ?? '', boardHexes),
      ...selectHexNeighborsWithDirections(tailHex?.id ?? '', boardHexes),
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
  }, [boardHexes, isMyTurn, revealedGameCard, unitFireLining])

  const chosenFireLineAttack = Object.values(possibleFireLineAttacks)?.find?.(
    (pa) => {
      return pa.clickableHexID === chosenSpecialAttack
    }
  )
  const selectedFireLinePathHexIDs =
    chosenFireLineAttack?.line?.map?.((hex) => hex.id) ?? []

  const targetableHexIDs =
    Object.values(possibleFireLineAttacks)?.map?.((pa) => pa.clickableHexID) ??
    []
  const allMalaffectedHexIDs =
    (
      Object.values(possibleFireLineAttacks)?.map?.((pa) =>
        pa?.line?.map?.((hex) => hex.id)
      ) ?? []
    )?.flat() ?? []
  const malaffectedHexIDs = allMalaffectedHexIDs.filter(
    (id) => !targetableHexIDs.includes(id)
  )
  const affectedUnits = uniqBy(
    selectedFireLinePathHexIDs
      .map((id) => {
        const hex = boardHexes[id]
        const unit = selectUnitForHex(hex.id, boardHexes, gameUnits)
        const card = selectGameCardByID(gameArmyCards, unit?.gameCardID ?? '')
        if (!card || !unit || !hex) {
          return undefined
        }
        return { ...unit, singleName: card?.singleName }
      })
      .filter((unit) => !!unit),
    'unitID'
  )

  const affectedSelectedUnitNames = affectedUnits.map((unit) => {
    return unit?.singleName ?? ''
  })
  const affectedUnitIDs = affectedUnits.map((unit) => {
    return unit?.unitID ?? ''
  })
  return (
    <SpecialAttackContext.Provider
      value={{
        chosenSpecialAttack,
        selectSpecialAttack,
        possibleFireLineAttacks,
        chosenFireLineAttack,
        malaffectedHexIDs,
        selectedFireLinePathHexIDs,
        targetableHexIDs,
        affectedSelectedUnitNames,
        unitFireLining,
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
