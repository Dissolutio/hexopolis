import React from 'react'
import styled from 'styled-components'

import { useBgioClientInfo, useBgioG, useBgioMoves } from 'bgio-contexts'
import { useUIContext, usePlacementContext } from '../contexts'
import { PlacementCardUnitIcon } from '../unit-icons'
import { PlacementUnit } from 'game/types'
import {
  StyledControlsHeaderH2,
  StyledControlsP,
} from 'hexed-meadow-ui/layout/Typography'
import { selectedTileStyle } from 'hexed-meadow-ui/layout/styles'

export const PlacementControls = () => {
  const { playerID } = useBgioClientInfo()
  const { placementReady, myStartZone } = useBgioG()
  const { moves } = useBgioMoves()
  const { deployUnits } = moves
  const { placementUnits, editingBoardHexes } = usePlacementContext()

  const { confirmPlacementReady } = moves
  const isReady = placementReady[playerID] === true
  const makeReady = () => {
    deployUnits(editingBoardHexes)
    confirmPlacementReady({ playerID })
  }
  const filledHexesCount = Object.keys(editingBoardHexes).length
  const startZoneHexesCount = myStartZone.length
  const isNoMoreEmptyStartZoneHexes = filledHexesCount === startZoneHexesCount
  const isAllPlacementUnitsPlaced = placementUnits?.length === 0
  const isShowingConfirm =
    (isAllPlacementUnitsPlaced || isNoMoreEmptyStartZoneHexes) && !isReady
  // once player has placed and confirmed, show waiting
  if (isReady) {
    return (
      <StyledPlacementControlsWrapper>
        <StyledControlsHeaderH2>
          Waiting for opponents to finish placing armies...
        </StyledControlsHeaderH2>
      </StyledPlacementControlsWrapper>
    )
  } else {
    // return UI
    return (
      <StyledPlacementControlsWrapper>
        <StyledControlsHeaderH2>Phase: Placement</StyledControlsHeaderH2>
        {!isShowingConfirm && (
          <StyledControlsP>
            Select your units and place them within your start zone. Once all
            players are ready, the game will begin!
          </StyledControlsP>
        )}
        {isShowingConfirm && (
          <ConfirmReady
            makeReady={makeReady}
            isNoMoreEmptyStartZoneHexes={isNoMoreEmptyStartZoneHexes}
            isAllPlacementUnitsPlaced={isAllPlacementUnitsPlaced}
          />
        )}
        <PlacementUnitTiles />
      </StyledPlacementControlsWrapper>
    )
  }
}
const StyledPlacementControlsWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  color: var(--player-color);
`

// CONFIRM READY
const ConfirmReady = ({
  makeReady,
  isNoMoreEmptyStartZoneHexes,
  isAllPlacementUnitsPlaced,
}: {
  makeReady: () => void
  isNoMoreEmptyStartZoneHexes: boolean
  isAllPlacementUnitsPlaced: boolean
}) => {
  const { onResetPlacementState } = usePlacementContext()
  return (
    <>
      {isNoMoreEmptyStartZoneHexes && (
        <StyledControlsP>Your start zone is full.</StyledControlsP>
      )}
      {isAllPlacementUnitsPlaced && (
        <StyledControlsP>All of your units are placed.</StyledControlsP>
      )}
      <StyledControlsP>Please confirm, this placement is OK?</StyledControlsP>
      {!isAllPlacementUnitsPlaced && (
        <StyledControlsP style={{ color: 'var(--error-red)' }}>
          Some of your units will not be placed! (See those units below)
        </StyledControlsP>
      )}
      <StyledButtonWrapper>
        <button
          onClick={makeReady}
          style={{
            display: 'inline-block',
            marginTop: '20px',
            fontSize: '0.8rem',
            color: 'var(--success-green)',
            border: '1px solid var(--success-green)',
          }}
        >
          Confirm Placement
        </button>
        <button
          onClick={onResetPlacementState}
          style={{
            display: 'inline-block',
            marginTop: '20px',
            fontSize: '0.8rem',
            color: 'var(--error-red)',
            border: '1px solid var(--error-red)',
          }}
        >
          No, reset my placement
        </button>
      </StyledButtonWrapper>
    </>
  )
}
const StyledButtonWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  max-width: 300px;
  margin: 0 auto;
`

// PLACEMENT UNIT TILES
const PlacementUnitTiles = () => {
  const { inflatedPlacementUnits } = usePlacementContext()
  const isLength = inflatedPlacementUnits.length > 0
  // render null if list is empty
  if (!isLength) {
    return null
  }
  return (
    <div
      style={{
        border: '1px solid var(--sub-white)',
        margin: '10px 0 0 0',
        padding: '5px',
      }}
    >
      <StyledControlsH3>Unplaced Units</StyledControlsH3>
      <StyledUl>
        {inflatedPlacementUnits &&
          inflatedPlacementUnits.map((unit) => (
            <PlacementUnitTile key={unit.unitID} unit={unit} />
          ))}
      </StyledUl>
    </div>
  )
}
const StyledUl = styled.ul`
  display: flex;
  flex-flow: row wrap;
  flex-grow: 1;
  list-style-type: none;
  margin: 0;
  padding: 0;
  li {
    padding: 0.3rem;
  }
`

const PlacementUnitTile = ({ unit }: { unit: PlacementUnit }) => {
  const { selectedUnitID } = useUIContext()
  const { onClickPlacementUnit } = usePlacementContext()
  const onClick = () => {
    onClickPlacementUnit?.(unit.unitID)
  }
  const selectedStyle = (unitID: string) => {
    if (selectedUnitID === unitID) {
      return selectedTileStyle
    } else {
      return {}
    }
  }
  return (
    <StyledPlacementTileLi
      key={unit.unitID}
      style={selectedStyle(unit.unitID)}
      onClick={onClick}
    >
      <PlacementCardUnitIcon
        armyCardID={unit.armyCardID}
        playerID={unit.playerID}
      />
      <span>{unit.name}</span>
    </StyledPlacementTileLi>
  )
}
const StyledPlacementTileLi = styled.li`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  padding: 5px;
  border: 1px solid var(--player-color);
  border-radius: 5px;
  max-width: 100px;
  @media screen and (max-width: 1100px) {
    max-width: 50px;
    svg {
      font-size: 25px !important;
    }
    span {
      font-size: 0.6rem;
      text-align: center;
    }
  }
`
const StyledControlsH3 = styled.h3`
  text-align: center;
  font-size: 1.1rem;
  margin: 0 0 3px 0;
  @media screen and (max-width: 1100px) {
    font-size: 0.9rem;
  }
`
