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
  placementUnits: string[]
  inflatedPlacementUnits: PlacementUnit[]
  onClickPlacementUnit: (unitID: string) => void
  onClickBoardHex_placement: (
    event: React.SyntheticEvent,
    sourceHex: BoardHex
  ) => void
  editingBoardHexes: DeploymentProposition
  updatePlacementEditingBoardHexes: (updated: DeploymentProposition) => void
}
type DeploymentProposition = { [boardHexId: string]: string } | undefined
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
  const [editingBoardHexes, setEditingBoardHexes] =
    useState<DeploymentProposition>(undefined)
  const updatePlacementEditingBoardHexes = (updated: DeploymentProposition) => {
    setEditingBoardHexes(updated)
  }
  const [placementUnits, setPlacementUnits] = useState((): string[] => {
    const myUnitIdsAlreadyOnMap = Object.values(boardHexes)
      .map((bH: BoardHex) => bH.occupyingUnitID)
      .filter((id) => {
        return id && gameUnits[id].playerID === playerID
      })
    const units = myUnits
      .filter((unit: GameUnit) => !myUnitIdsAlreadyOnMap.includes(unit.unitID))
      .map((unit) => {
        return unit.unitID
      })
    return units
  })
  const inflatedPlacementUnits: PlacementUnit[] = placementUnits.reduce(
    (result, unitId) => {
      const gameUnit = myUnits.find((unit) => unit.unitID === unitId)
      const armyCard = myCards.find(
        (card: ArmyCard) => card.armyCardID === gameUnit?.armyCardID
      )
      if (!gameUnit || !armyCard) {
        return result
      }
      return [
        ...result,
        {
          ...gameUnit,
          name: armyCard?.name ?? '',
        },
      ]
    },
    [] as PlacementUnit[]
  )

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
    const clickedHexId = sourceHex.id
    const isInStartZone = myStartZone.includes(clickedHexId)
    const unitIdOnHex = editingBoardHexes?.[clickedHexId]

    //  1.a No current unit, but there is a unit on the hex, select that unit
    //  1.b No current unit, so since we're not placing on the hex, select the hex
    if (!selectedUnitID) {
      if (unitIdOnHex) {
        onClickPlacementUnit(unitIdOnHex)
      }
      setSelectedMapHex(clickedHexId)
      return
    }

    // 2. if we have a unit and we clicked in start zone, then place that unit
    // - What unit is on hex already?
    if (selectedUnitID && isInStartZone) {
      placeUnitOnHex(clickedHexId, activeUnit)
      // if (we placed a unit from placement "tray", then remove it from there)
      setPlacementUnits(
        // add in the one we're removing (if any), filter out the unit we're placing on hex
        [
          ...placementUnits.filter((u) => {
            return !(u === selectedUnitID)
          }),
        ]
      )
      // if (we placed a unit from another hex, then remove it from there)
      // finally, deselect the unit
      setSelectedUnitID('')
      return
    }
    // TODO: Error toasts?
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
        inflatedPlacementUnits,
        onClickPlacementUnit,
        onClickBoardHex_placement,
        editingBoardHexes,
        updatePlacementEditingBoardHexes,
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
