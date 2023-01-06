import React from 'react'
import styled from 'styled-components'
import { HiOutlineZoomIn, HiOutlineZoomOut } from 'react-icons/hi'
import { useMapContext } from 'hexopolis-ui/contexts'

type Props = {
  handleClickZoomIn: () => void
  handleClickZoomOut: () => void
}
export const ZoomControls = ({
  handleClickZoomIn,
  handleClickZoomOut,
}: Props) => {
  const { zoomMap, panMap } = useMapContext()
  return (
    <StyledZoomControls>
      <svg
        viewBox={`0 0 50 50`}
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="25" cy="25" r="21" fill="white" opacity="0.75" />
        <path
          className="button"
          onClick={() => panMap(0, 25)}
          d="M25 5 l6 10 a20 35 0 0 0 -12 0z"
        />
        <path
          className="button"
          onClick={() => panMap(25, 0)}
          d="M5 25 l10 -6 a35 20 0 0 0 0 12z"
        />
        <path
          className="button"
          onClick={() => panMap(0, -25)}
          d="M25 45 l6 -10 a20, 35 0 0,1 -12,0z"
        />
        <path
          className="button"
          onClick={() => panMap(-25, 0)}
          d="M45 25 l-10 -6 a35 20 0 0 1 0 12z"
        />

        <circle className="compass" cx="25" cy="25" r="10" />
        <circle
          className="button"
          cx="25"
          cy="20.5"
          r="4"
          onClick={() => zoomMap(0.8)}
        />
        <circle
          className="button"
          cx="25"
          cy="29.5"
          r="4"
          onClick={() => zoomMap(1.25)}
        />

        <rect x="23" y="20" width="4" height="1" fill="var(--white)" />
        <rect x="23" y="29" width="4" height="1" fill="var(--white)" />
        <rect x="24.5" y="27.5" width="1" height="4" fill="var(--white)" />
      </svg>
    </StyledZoomControls>
  )
}
const StyledZoomControls = styled.span`
  position: absolute;
  top: 0%;
  left: 0%;
  width: 100px;
  height: 100px;
  padding-top: 36px;
  padding-left: 36px;
  z-index: 2;
  @media screen and (max-width: 1100px) {
    width: 75px;
    height: 75px;
    padding-top: 14px;
    padding-left: 14px;
  }
  .compass {
    fill: #fff;
    stroke: #000;
    stroke-width: 1;
  }
  .button {
    fill: #225ea8;
    stroke: #0c2c84;
    stroke-width: 0.5;
    stroke-miterlimit: 6;
    stroke-linecap: round;
  }
  .button:hover {
    stroke-width: 1;
  }
`
