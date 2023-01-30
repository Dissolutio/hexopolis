import React, {
  createContext,
  SyntheticEvent,
  useContext,
  useState,
} from 'react'
import { useUIContext, useMapContext } from '.'
import { BoardHex, ArmyCard, GameUnit, PlacementUnit } from 'game/types'
import { useBgioClientInfo, useBgioG } from 'bgio-contexts'

const PlacementContext = createContext<PlacementContextValue | undefined>(
  undefined
)

type PlacementContextValue = {
  placementUnits: string[]
  inflatedPlacementUnits: PlacementUnit[]
  onClickPlacementUnit: (unitID: string) => void
  onClickPlacementHex: (
    event: React.SyntheticEvent,
    sourceHex: BoardHex
  ) => void
  editingBoardHexes: DeploymentProposition
  onResetPlacementState: () => void
}

export type DeploymentProposition = { [boardHexId: string]: string }

const PlacementContextProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const { playerID } = useBgioClientInfo()
  const {
    boardHexes,
    gameUnits,
    myUnits,
    myCards,
    myStartZone,
    placementReady,
  } = useBgioG()
  const isConfirmedReady = placementReady[playerID] === true
  const { selectMapHex } = useMapContext()
  const { selectedUnitID, setSelectedUnitID } = useUIContext()
  // STATE
  const myUnitIds = myUnits.map((u) => u.unitID)
  // if we pre-placed units, this will setup their editing-state from G.boardHexes, but if they click reset, then we will set editing-state to be empty -- all for sake of pre-placed units
  const initialEditingBoardHexes = Object.values(boardHexes)
    .filter((i) => !!i.occupyingUnitID && myUnitIds.includes(i.occupyingUnitID))
    .reduce((result, bh) => {
      return {
        ...result,
        [bh.id]: bh.occupyingUnitID,
      }
    }, {})
  const intialEditingBoardHexesIfTotallyReset = {}
  // we honor this now for the sake of pre-placement
  const myUnitIdsAlreadyOnMap = Object.values(boardHexes)
    .map((bH: BoardHex) => bH.occupyingUnitID)
    .filter((id) => {
      return id && gameUnits[id].playerID === playerID
    })
  const initialPlacementUnitsIfTotallyReset = myUnits.map((unit) => {
    return unit.unitID
  })
  const initialPlacementUnits = myUnits
    .filter((unit: GameUnit) => !myUnitIdsAlreadyOnMap.includes(unit.unitID))
    .map((unit) => {
      return unit.unitID
    })
  const [editingBoardHexes, setEditingBoardHexes] =
    useState<DeploymentProposition>(initialEditingBoardHexes)
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
          singleName: armyCard?.singleName ?? '',
        },
      ]
    },
    [] as PlacementUnit[]
  )

  // HANDLERS
  function onResetPlacementState() {
    setPlacementUnits(initialPlacementUnitsIfTotallyReset)
    setEditingBoardHexes(intialEditingBoardHexesIfTotallyReset)
  }
  function onClickPlacementUnit(unitID: string) {
    // either deselect unit, or select unit and deselect active hex
    if (unitID === selectedUnitID) {
      setSelectedUnitID('')
    } else {
      setSelectedUnitID(unitID)
      selectMapHex('')
    }
  }

  function onClickPlacementHex(event: SyntheticEvent, sourceHex: BoardHex) {
    // Do not propagate to background onClick
    event.stopPropagation()
    const clickedHexId = sourceHex.id
    const isInStartZone = myStartZone.includes(clickedHexId)
    const unitIdAlreadyOnHex = editingBoardHexes?.[clickedHexId]
    //  -- 1A. No current unit, but there is a unit on the hex, select that unit -- 1B. No current unit, so since we're not placing on the hex, select the hex
    if (!selectedUnitID) {
      if (unitIdAlreadyOnHex && !isConfirmedReady) {
        onClickPlacementUnit(unitIdAlreadyOnHex)
      } else {
        selectMapHex(clickedHexId)
      }
      return
    }

    const oldHexIdOfSelectedUnit = editingBoardHexes
      ? Object.entries(editingBoardHexes).find(
          (entry) => entry[1] === selectedUnitID
        )?.[0]
      : ''
    const isSelectedUnitHexThatWasClicked =
      unitIdAlreadyOnHex === selectedUnitID
    // 2. unit selected and we clicked in start zone
    if (selectedUnitID && isInStartZone) {
      // 2A. deselect unit if we clicked it again
      if (isSelectedUnitHexThatWasClicked) {
        // ... 2A. then we either clicked our selected unit so deselect it...
        setSelectedUnitID('')
        return
      } else {
        // 2B. or place our selected unit on clicked hex
        // update board hexes
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
        // update placement units
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
        setSelectedUnitID('')
        selectMapHex(clickedHexId)
        return
      }
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
        onClickPlacementHex,
        editingBoardHexes,
        onResetPlacementState,
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
