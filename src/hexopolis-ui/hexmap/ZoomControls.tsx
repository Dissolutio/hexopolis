import React from 'react'
import styled from 'styled-components'
import { HiOutlineZoomIn, HiOutlineZoomOut } from 'react-icons/hi'

type Props = {
  handleClickZoomIn: () => void
  handleClickZoomOut: () => void
}
export const ZoomControls = ({
  handleClickZoomIn,
  handleClickZoomOut,
}: Props) => {
  return (
    <StyledZoomControls>
      <button onClick={handleClickZoomOut}>
        <HiOutlineZoomOut fill="transparent" stroke="var(--player-color)" />
      </button>
      <button onClick={handleClickZoomIn}>
        <HiOutlineZoomIn fill="transparent" stroke="var(--player-color)" />
      </button>
    </StyledZoomControls>
  )
}
const StyledZoomControls = styled.span`
  position: absolute;
  top: 0%;
  left: 0%;
  padding-top: 36px;
  padding-left: 36px;
  @media screen and (max-width: 1100px) {
    padding-top: 14px;
    padding-left: 14px;
  }
  z-index: 2;
  button {
    background-color: var(--gunmetal-transparent);
  }
  svg {
    width: 30px;
    height: 30px;
    @media screen and (max-width: 1100px) {
      width: 18px;
      height: 18px;
    }
  }
`
