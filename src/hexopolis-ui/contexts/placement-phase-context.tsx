import React, {
  createContext,
  SyntheticEvent,
  useContext,
  useState,
} from 'react'
import { useUIContext, useMapContext } from '.'
import {
  BoardHex,
  ArmyCard,
  GameUnit,
  PlacementUnit,
  BoardHexesUnitDeployment,
} from 'game/types'
import { useBgioClientInfo, useBgioG } from 'bgio-contexts'
import { selectValidTailHexes } from 'game/selectors'

const PlacementContext = createContext<PlacementContextValue | undefined>(
  undefined
)

type PlacementContextValue = {
  placementUnits: string[]
  activeTailPlacementUnitID: string
  tailPlaceables: string[]
  inflatedPlacementUnits: PlacementUnit[]
  onClickPlacementUnit: (unitID: string) => void
  onClickPlacementHex: (
    event: React.SyntheticEvent,
    sourceHex: BoardHex
  ) => void
  editingBoardHexes: BoardHexesUnitDeployment
  startZoneForMy2HexUnits: string[]
  onResetPlacementState: () => void
}

const PlacementContextProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const { playerID } = useBgioClientInfo()
  const {
    boardHexes,
    startZones,
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
  // if we pre-placed units, this will setup their editing-state from G.boardHexes, but if they click reset, then we will set editing-state to be empty
  // the flow is that in setup, we assign units to boardHexes if that is toggled on, then here, we copy board hexes to make our editing-state
  const initialEditingBoardHexes = () =>
    Object.values(boardHexes)
      .filter(
        (i) => !!i.occupyingUnitID && myUnitIds.includes(i.occupyingUnitID)
      )
      .reduce((result, bh) => {
        return {
          ...result,
          [bh.id]: {
            occupyingUnitID: bh.occupyingUnitID,
            isUnitTail: bh.isUnitTail,
          },
        }
      }, {})
  const startZoneForMy2HexUnits = (startZones?.[playerID] ?? []).filter(
    (sz) => {
      return selectValidTailHexes(sz, boardHexes).length > 0
    }
  )
  const initialEditingBoardHexesIfTotallyReset = {}
  const myUnitIdsAlreadyOnMap = () =>
    Object.values(boardHexes)
      .map((bH: BoardHex) => bH.occupyingUnitID)
      .filter((id) => {
        return id && gameUnits[id].playerID === playerID
      })
  const initialPlacementUnitsIfTotallyReset = myUnits.map((unit) => {
    return unit.unitID
  })
  const initialPlacementUnits = () =>
    myUnits
      .filter(
        (unit: GameUnit) => !myUnitIdsAlreadyOnMap().includes(unit.unitID)
      )
      .map((unit) => {
        return unit.unitID
      })
  const [editingBoardHexes, setEditingBoardHexes] =
    useState<BoardHexesUnitDeployment>(initialEditingBoardHexes())
  const [placementUnits, setPlacementUnits] = useState((): string[] =>
    initialPlacementUnits()
  )
  const [activeTailPlacementUnitID, setActiveTailPlacementUnitID] =
    useState<string>('')
  const [tailPlaceables, setTailPlaceables] = useState<string[]>([])
  const exitTailPlacementMode = () => {
    setActiveTailPlacementUnitID('')
    setTailPlaceables([])
  }
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
    setEditingBoardHexes(initialEditingBoardHexesIfTotallyReset)
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
    // Do not propagate to map-background onClick (if ever one is added)
    event.stopPropagation()
    const clickedHexId = sourceHex.id
    const isInStartZone = myStartZone.includes(clickedHexId)
    const displacedUnitID =
      editingBoardHexes?.[clickedHexId]?.occupyingUnitID ?? ''
    const isTailHex = editingBoardHexes?.[clickedHexId]?.isUnitTail ?? false
    const displacedUnitsOtherHex =
      Object.entries(editingBoardHexes).find(
        (entry) =>
          entry[1].occupyingUnitID === displacedUnitID &&
          (isTailHex ? !entry[1].isUnitTail : entry[1].isUnitTail)
      )?.[0] ?? ''
    // 1. no unit selected (or tail to place)
    if (!selectedUnitID && !activeTailPlacementUnitID) {
      // 1A. select the unit
      if (displacedUnitID && !isConfirmedReady) {
        onClickPlacementUnit(displacedUnitID)
      }
      // 1B. select the hex
      else {
        // disabled until we know why we are selecting hexes
        // selectMapHex(clickedHexId)
      }
      return
    }
    const is2HexUnit = gameUnits[selectedUnitID]?.is2Hex
    const selectedUnitOldHex = editingBoardHexes
      ? Object.entries(editingBoardHexes).find(
          (entry) =>
            entry[1].occupyingUnitID === selectedUnitID && !entry[1].isUnitTail
        )?.[0]
      : ''
    let selectedUnitOldTail = is2HexUnit
      ? editingBoardHexes
        ? Object.entries(editingBoardHexes).find(
            (entry) =>
              entry[1].occupyingUnitID === selectedUnitID && entry[1].isUnitTail
          )?.[0]
        : ''
      : ''
    const isSelectedUnitHexThatWasClicked = displacedUnitID === selectedUnitID
    // const displacedUnit
    // 2. unit selected and we clicked in start zone (we clicked the selected unit or a hex)
    if (selectedUnitID && isInStartZone) {
      // 2A. deselect unit if we clicked it again
      if (isSelectedUnitHexThatWasClicked) {
        setSelectedUnitID('')
        return
      }
      // 2B. place our selected unit on clicked hex: 2-spacer or 1-spacer
      else {
        if (is2HexUnit) {
          const validTailHexes = selectValidTailHexes(clickedHexId, boardHexes)
          // place unit if there's room for the tail next to the head
          if (validTailHexes.length > 0) {
            // switch ui to tail-placement mode, set active tail and tail placeables
            setActiveTailPlacementUnitID(selectedUnitID)
            setTailPlaceables(validTailHexes.map((bh) => bh.id))
            // update board hexes
            setEditingBoardHexes((oldState) => {
              const newState = {
                ...oldState,
                // place selected unit('s head) on clicked hex
                [clickedHexId]: {
                  occupyingUnitID: selectedUnitID,
                  isUnitTail: false,
                },
              }
              // remove unit from old hex, head and tail
              delete newState[selectedUnitOldHex ?? '']
              delete newState[selectedUnitOldTail ?? '']
              delete newState[displacedUnitsOtherHex ?? '']
              return newState
            })
            // // update placement units (may not have changed)
            setPlacementUnits([
              // ...displaced pieces go to front of placement tray, so user can see it appear...
              ...(displacedUnitID ? [displacedUnitID] : []),
              // ... filter out the unit we're placing on hex, unless it came from a hex, then skip
              ...placementUnits.filter((u) => {
                return !(u === selectedUnitID)
              }),
            ])
            // deselect unit after placing it
            setSelectedUnitID('')
            return
          } else {
            // ignore clicks on hexes that don't have room for the tail
            return
          }
        }
        // 1-spacer
        else {
          // update board hexes
          setEditingBoardHexes((oldState) => {
            const newState = {
              ...oldState,
              // place selected unit('s head) on clicked hex
              [clickedHexId]: {
                occupyingUnitID: selectedUnitID,
                isUnitTail: false,
              },
            }
            // remove unit from old hex, head and tail
            delete newState[selectedUnitOldHex ?? '']
            delete newState[selectedUnitOldTail ?? '']
            delete newState[displacedUnitsOtherHex ?? '']
            return newState
          })
          updatePlacementUnits(displacedUnitID, selectedUnitID)
          // deselect unit after placing it
          setSelectedUnitID('')
          return
        }
      }
    }
    // 3. tail-selected, and we clicked a tail-placeable hex (otherwise, having a tail-selected means clicking any other hex does nothing)
    if (activeTailPlacementUnitID && tailPlaceables.includes(clickedHexId)) {
      // add tail to boardHexes
      setEditingBoardHexes((s) => ({
        ...s,
        [clickedHexId]: {
          occupyingUnitID: activeTailPlacementUnitID,
          isUnitTail: true,
        },
      }))
      updatePlacementUnits(displacedUnitID, activeTailPlacementUnitID)
      exitTailPlacementMode()
    }
  }
  const updatePlacementUnits = (
    displacedUnitID: string,
    placedUnitID: string
  ) => {
    setPlacementUnits([
      // ...displaced pieces go to front of placement tray, so user can see it appear...
      ...(displacedUnitID ? [displacedUnitID] : []),
      // ... filter out the unit we're placing on hex, unless it came from a hex, then skip
      ...placementUnits.filter((u) => {
        return !(u === placedUnitID)
      }),
    ])
  }
  return (
    <PlacementContext.Provider
      value={{
        placementUnits,
        activeTailPlacementUnitID,
        tailPlaceables,
        inflatedPlacementUnits,
        onClickPlacementUnit,
        onClickPlacementHex,
        editingBoardHexes,
        startZoneForMy2HexUnits,
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
