import React, {
  createContext,
  SyntheticEvent,
  useContext,
  useState,
} from 'react'
import { useUIContext, useMapContext } from '.'
import { BoardHex, ArmyCard, GameUnit, PlacementUnit } from 'game/types'
import { useBgioClientInfo, useBgioG, useBgioMoves } from 'bgio-contexts'

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
  const { playerID } = useBgioClientInfo()
  const { boardHexes, gameUnits, myUnits, myCards, myStartZone } = useBgioG()
  const { moves } = useBgioMoves()
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
    //  No current unit, but there is a unit on the hex, select that unit
    if (sourceHex.occupyingUnitID && !selectedUnitID) {
      const unitOnHex = gameUnits[sourceHex.occupyingUnitID]
      if (unitOnHex) {
        onClickPlacementUnit(sourceHex.occupyingUnitID)
      }
    }
    //  No unit, select hex
    if (!selectedUnitID) {
      setSelectedMapHex(hexID)
      return
    }
    // if we have a unit and we clicked in start zone, then place that unit (and remove it from wherever it was!)
    if (selectedUnitID && isInStartZone) {
      placeUnitOnHex(hexID, activeUnit)
      // if(we placed a unit from placement "tray", then remove it from there)
      setPlacementUnits(
        placementUnits.filter((u) => {
          return !(u.unitID === activeUnit.unitID)
        })
      )
      // if(we placed a unit from another hex, then remove it from there)
      // finally, deselect the unit
      setSelectedUnitID('')
      return
    }
    // have unit, clicked hex outside start zone, error
    if (selectedUnitID && !isInStartZone) {
      // TODO, add an error message timeout system?? Soon!
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
