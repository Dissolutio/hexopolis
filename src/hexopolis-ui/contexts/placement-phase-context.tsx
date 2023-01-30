import React, {
  createContext,
  SyntheticEvent,
  useContext,
  useState,
} from 'react'
import { useUIContext, useMapContext } from '.'
import { BoardHex, ArmyCard, GameUnit, PlacementUnit } from 'game/types'
import { useBgioClientInfo, useBgioG } from 'bgio-contexts'
import { selectHexNeighbors, selectValidTailHexes } from 'game/selectors'

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
  editingBoardHexes: DeploymentProposition
  onResetPlacementState: () => void
}

export type DeploymentProposition = {
  [boardHexId: string]: {
    unitID: string
    isUnitTail: boolean
  }
}

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
  const initialEditingBoardHexes = () =>
    Object.values(boardHexes)
      .filter(
        (i) => !!i.occupyingUnitID && myUnitIds.includes(i.occupyingUnitID)
      )
      .reduce((result, bh) => {
        return {
          ...result,
          [bh.id]: { unitID: bh.occupyingUnitID, isUnitTail: bh.isUnitTail },
        }
      }, {})
  const intialEditingBoardHexesIfTotallyReset = {}
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
    useState<DeploymentProposition>(initialEditingBoardHexes())
  const [placementUnits, setPlacementUnits] = useState((): string[] =>
    initialPlacementUnits()
  )
  console.log(
    '🚀 ~ file: placement-phase-context.tsx:87 ~ editingBoardHexes',
    editingBoardHexes
  )
  const [activeTailPlacementUnitID, setActiveTailPlacementUnitID] =
    useState<string>('')
  const [tailPlaceables, setTailPlaceables] = useState<string[]>([])

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
    const displacedUnitID = editingBoardHexes?.[clickedHexId]?.unitID ?? ''
    const isTailHex = editingBoardHexes?.[clickedHexId]?.isUnitTail ?? false
    const displacedUnitsOtherHex =
      Object.entries(editingBoardHexes).find(
        (entry) =>
          entry[1].unitID === displacedUnitID &&
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
        selectMapHex(clickedHexId)
      }
      return
    }
    const is2HexUnit = gameUnits[selectedUnitID]?.is2Hex
    const selectedUnitOldHex = editingBoardHexes
      ? Object.entries(editingBoardHexes).find(
          (entry) => entry[1].unitID === selectedUnitID && !entry[1].isUnitTail
        )?.[0]
      : ''
    let selectedUnitOldTail = is2HexUnit
      ? editingBoardHexes
        ? Object.entries(editingBoardHexes).find(
            (entry) => entry[1].unitID === selectedUnitID && entry[1].isUnitTail
          )?.[0]
        : ''
      : ''
    const isSelectedUnitHexThatWasClicked = displacedUnitID === selectedUnitID
    // const displacedUnit
    // 2. unit selected and we clicked in start zone
    if (selectedUnitID && isInStartZone) {
      // 2A. deselect unit if we clicked it again
      if (isSelectedUnitHexThatWasClicked) {
        setSelectedUnitID('')
        return
      }
      // 2B. place our selected unit on clicked hex: 1-spacer or 2-spacer head (tail is placed later)
      else {
        if (is2HexUnit) {
          const validTailHexes = selectValidTailHexes(clickedHexId, boardHexes)
          if (validTailHexes.length > 0) {
            setActiveTailPlacementUnitID(selectedUnitID)
            setTailPlaceables(validTailHexes.map((bh) => bh.id))
            // update board hexes
            setEditingBoardHexes((oldState) => {
              const newState = {
                ...oldState,
                // place selected unit('s head) on clicked hex
                [clickedHexId]: {
                  unitID: selectedUnitID,
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
          }
        } else {
          // update board hexes
          setEditingBoardHexes((oldState) => {
            const newState = {
              ...oldState,
              // place selected unit('s head) on clicked hex
              [clickedHexId]: {
                unitID: selectedUnitID,
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
        }
        setSelectedUnitID('')
        selectMapHex(clickedHexId)
        // // 2C. if 2-spacer, switch ui to tail-placement mode
        // if (is2HexUnit) {
        //   setActiveTailPlacementUnitID(selectedUnitID)
        //   setTailPlaceables(
        //     selectValidTailHexes(clickedHexId, boardHexes).map((bh) => bh.id)
        //   )
        // }
        return
      }
    }
    // 3. tail selected, and we clicked a tail-placeable hex
    if (activeTailPlacementUnitID && tailPlaceables.includes(clickedHexId)) {
      setEditingBoardHexes((s) => ({
        ...s,
        [clickedHexId]: {
          unitID: activeTailPlacementUnitID,
          isUnitTail: true,
        },
      }))
      // put the displaced unit in placement tray: copied from 2B^^
      setPlacementUnits([
        // ...displaced pieces go to front of placement tray, so user can see it appear...
        ...(displacedUnitID ? [displacedUnitID] : []),
        // ... filter out the unit we're placing on hex, unless it came from a hex, then skip
        ...placementUnits.filter((u) => {
          return !(u === selectedUnitID)
        }),
      ])
      setActiveTailPlacementUnitID('')
      setTailPlaceables([])
    }
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
