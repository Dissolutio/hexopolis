import { useBgioG } from 'bgio-contexts'
import { useMapContext } from 'hexed-meadow-ui/contexts'
import React from 'react'
import styled from 'styled-components'

export const ActiveHexReadout = () => {
  const { boardHexes, gameUnits, armyCards } = useBgioG()
  const { selectedMapHex } = useMapContext()
  const activeHex = boardHexes?.[selectedMapHex]
  const unitOnHex = gameUnits?.[activeHex?.occupyingUnitID]
  const cardForUnit = armyCards.find(
    (c) => c.gameCardID === unitOnHex?.gameCardID
  )
  const unitOnHexName = cardForUnit?.name
  if (!activeHex) {
    return null
  }
  return (
    <StyledActiveHexReadout>
      <div>Hex ID: {activeHex.id}</div>
      <div>Hex Altitude: {activeHex.altitude}</div>
      {unitOnHexName && <div>Unit: {unitOnHexName}</div>}
    </StyledActiveHexReadout>
  )
}

const StyledActiveHexReadout = styled.span`
  position: absolute;
  bottom: 0%;
  left: 45%;
  padding-bottom: 36px;
  padding-right: 36px;
  @media screen and (max-width: 1100px) {
    left: 30%;
    padding-bottom: 14px;
    padding-right: 14px;
  }

  font-size: 0.8rem;
  color: var(--white);
  z-index: 2;
`
