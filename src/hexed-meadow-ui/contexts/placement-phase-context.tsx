import React, {
  createContext,
  SyntheticEvent,
  useContext,
  useState,
} from 'react'
import { usePlayerID, useMoves, useG, useUIContext, useMapContext } from '.'
import { BoardHex, ArmyCard, GameUnit, PlacementUnit } from 'game/HM-types'

const PlacementContext = createContext<PlacementContextValue | undefined>(
  undefined
)

type PlacementContextValue = {
  placementUnits: PlacementUnit[]
  onClickPlacementUnit: (unitID: string) => void
  onClickBoardHex_placement: (
    event: React.SyntheticEvent,
    sourceHex: BoardHex
  ) => void
}
const PlacementContextProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const { playerID } = usePlayerID()
  const { boardHexes, gameUnits, myUnits, myCards, myStartZone } = useG()
  const { moves } = useMoves()
  const { setSelectedMapHex } = useMapContext()
  const { selectedUnitID, setSelectedUnitID } = useUIContext()
  const { placeUnitOnHex } = moves
  // STATE
  const [placementUnits, setPlacementUnits] = useState((): PlacementUnit[] => {
    const myUnitIdsAlreadyOnMap = Object.values(boardHexes)
      .map((bH: BoardHex) => bH.occupyingUnitID)
      .filter((id) => {
        return id && gameUnits[id].playerID === playerID
      })
    const units = myUnits
      .filter((unit: GameUnit) => !myUnitIdsAlreadyOnMap.includes(unit.unitID))
      .map((unit) => {
        const armyCard = myCards.find(
          (card: ArmyCard) => card.armyCardID === unit.armyCardID
        )
        return {
          ...unit,
          name: armyCard?.name ?? '',
        }
      })
    return units
  })
  const activeUnit: GameUnit = gameUnits[selectedUnitID]
  const removeUnitFromAvailable = (unit: GameUnit) => {
    const newState = placementUnits.filter((u) => {
      return !(u.unitID === unit.unitID)
    })
    setPlacementUnits(newState)
  }
  // HANDLERS
  function onClickPlacementUnit(unitID: string) {
    // either deselect unit, or select unit and deselect active hex
    if (unitID === selectedUnitID) {
      setSelectedUnitID('')
    } else {
      setSelectedUnitID(unitID)
      setSelectedMapHex('')
    }
  }
  function onClickBoardHex_placement(
    event: SyntheticEvent,
    sourceHex: BoardHex
  ) {
    // Do not propagate to background onClick
    event.stopPropagation()
    const hexID = sourceHex.id
    const isInStartZone = myStartZone.includes(hexID)
    //  No unit, select hex
    if (!selectedUnitID) {
      setSelectedMapHex(hexID)
      return
    }
    // have unit, clicked in start zone, place unit
    if (selectedUnitID && isInStartZone) {
      placeUnitOnHex(hexID, activeUnit)
      removeUnitFromAvailable(activeUnit)
      setSelectedUnitID('')
      return
    }
    // have unit, clicked hex outside start zone, error
    if (selectedUnitID && !isInStartZone) {
      console.error(
        'Invalid hex selected. You must place units inside your start zone.'
      )
      return
    }
  }

  return (
    <PlacementContext.Provider
      value={{
        placementUnits,
        onClickPlacementUnit,
        onClickBoardHex_placement,
      }}
    >
      {children}
    </PlacementContext.Provider>
  )
}

const usePlacementContext = () => {
  const context = useContext(PlacementContext)
  if (context === undefined) {
    throw new Error(
      'usePlacementContext must be used within a PlacementContextProvider'
    )
  }
  return context
}

export { PlacementContextProvider, usePlacementContext }
