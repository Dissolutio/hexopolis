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
type DeploymentProposition = { [boardHexId: string]: string }
const PlacementContextProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const { playerID } = useBgioClientInfo()
  const { boardHexes, gameUnits, myUnits, myCards, myStartZone } = useBgioG()
  const { setSelectedMapHex } = useMapContext()
  const { selectedUnitID, setSelectedUnitID } = useUIContext()
  // STATE
  const [editingBoardHexes, setEditingBoardHexes] =
    useState<DeploymentProposition>({})
  const updatePlacementEditingBoardHexes = (updated: DeploymentProposition) => {
    setEditingBoardHexes(updated)
  }
  const myUnitIdsAlreadyOnMap = Object.values(boardHexes)
    .map((bH: BoardHex) => bH.occupyingUnitID)
    .filter((id) => {
      return id && gameUnits[id].playerID === playerID
    })
  const initialPlacementUnits = myUnits
    .filter((unit: GameUnit) => !myUnitIdsAlreadyOnMap.includes(unit.unitID))
    .map((unit) => {
      return unit.unitID
    })
  const [placementUnits, setPlacementUnits] = useState(
    (): string[] => initialPlacementUnits
  )
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

  // HANDLERS
  function onResetPlacementState() {
    setPlacementUnits(initialPlacementUnits)
    setEditingBoardHexes({})
  }
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
    const unitIdAlreadyOnHex = editingBoardHexes?.[clickedHexId]

    //  -- 1A. No current unit, but there is a unit on the hex, select that unit -- 1B. No current unit, so since we're not placing on the hex, select the hex
    if (!selectedUnitID) {
      if (unitIdAlreadyOnHex) {
        onClickPlacementUnit(unitIdAlreadyOnHex)
      }
      setSelectedMapHex(clickedHexId)
      return
    }

    const oldHexIdOfSelectedUnit = editingBoardHexes
      ? Object.entries(editingBoardHexes).find(
          (entry) => entry[1] === selectedUnitID
        )?.[0]
      : ''

    // 2. if we have a unit and we clicked in start zone, then place that unit
    if (selectedUnitID && isInStartZone) {
      setEditingBoardHexes((oldState) => {
        const newState = {
          ...oldState,
          // place selected unit on clicked hex
          [clickedHexId]: selectedUnitID,
        }
        // remove unit from old hex, if applicable
        delete newState[oldHexIdOfSelectedUnit ?? '']
        return newState
      })
      // update placement tray...
      setPlacementUnits([
        // ...displaced pieces go to front of placement tray, so user can see it appear...
        ...(unitIdAlreadyOnHex ? [unitIdAlreadyOnHex] : []),
        // ... filter out the unit we're placing on hex, unless it came from a hex, then skip
        // TODO: is this kind of efficiency silly? (below, early out for the filter)
        ...(oldHexIdOfSelectedUnit
          ? placementUnits
          : placementUnits.filter((u) => {
              return !(u === selectedUnitID)
            })),
      ])
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
