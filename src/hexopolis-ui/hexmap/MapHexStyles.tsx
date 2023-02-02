import { Ref } from 'react'
import styled from 'styled-components'

type MapHexStylesProps = {
  hexSize: number
}

export const MapHexStyles = styled.div<MapHexStylesProps>`
  @keyframes dash {
    to {
      stroke-dashoffset: 100;
    }
  }
  height: 100%;
  /* position: relative; */
  overflow: scroll;
  // Style Map Scrollbars
  scrollbar-width: thin;
  scrollbar-color: var(--player-color) var(--black);
  &::-webkit-scrollbar {
    height: 0.2rem;
    width: 0.2rem;
    background: var(--black);
  }
  &::-webkit-scrollbar-track {
    border-radius: 10px;
    box-shadow: inset 0 0 1px var(--player-color);
    background: var(--black);
  }
  &::-webkit-scrollbar-thumb {
    background: var(--player-color);
    border-radius: 10px;
  }
  &::-webkit-scrollbar-corner {
    background: var(--black);
  }
  // Style Hex Text
  .maphex_altitude-text {
    fill: var(--sub-white);
    font-size: ${(props) => `${props.hexSize / 75}rem`};
  }
  // All Hex Styles
  // highlight all hexes, and set fill-opacity to its initial value (it has given problems with flickering to 1, before)
  .hexagon-group polygon {
    stroke: var(--white);
    stroke-width: 0.1;
    fill-opacity: 0.4;
    transition: fill-opacity 0.2s ease-in-out, stroke-width 0.2s ease-in-out,
      stroke 0.2s ease-in-out;
  }
  // polygons, highlight on hover
  .hexagon-group {
    fill: var(--black);
    polygon {
      @media (hover: hover) {
        &:hover {
          fill: var(--neon-orange);
        }
      }
    }
  }
  .maphex__terrain--water polygon {
    fill: var(--water);
    fill-opacity: 0.4;
  }
  .maphex__terrain--grass polygon {
    fill: var(--grass);
    fill-opacity: 0.4;
  }
  .maphex__terrain--sand polygon {
    fill: var(--sand);
    fill-opacity: 0.4;
  }
  .maphex__terrain--rock polygon {
    fill: var(--rock);
    fill-opacity: 0.4;
  }

  // PHASE: PLACEMENT
  // highlight all player startzones,
  .maphex__startzone--player0 > g polygon {
    stroke: var(--bee-yellow);
    stroke-width: 0.3;
    // style stroke width a little thicker on mobile so you can see it
    @media screen and (max-width: 1100px) {
      stroke-width: 0.4;
    }
  }
  .maphex__startzone--player1 > g polygon {
    stroke: var(--butterfly-purple);
    stroke-width: 0.3;
    // style stroke width a little thicker on mobile so you can see it
    @media screen and (max-width: 1100px) {
      stroke-width: 0.4;
    }
  }
  // highlight placeable hexes for selected unit, if hex is NOT occupied by friendly unit
  .maphex__start-zone--placement > g polygon {
    stroke: var(--player-color);
    stroke-width: 0.6;
    fill: var(--player-color);
    fill-opacity: 0.4;
    // style stroke width a little thicker on mobile so you can see it
    @media screen and (max-width: 1100px) {
      stroke-width: 0.8;
    }
  }

  // highlight placeable hexes for selected unit, if hex is occupied
  .maphex__start-zone--placement--occupied > g polygon {
    stroke: var(--player-color);
    stroke-width: 0.6;
    fill: var(--player-color);
    fill-opacity: 0.4;
    // style stroke width a little thicker on mobile so you can see it
    @media screen and (max-width: 1100px) {
      stroke-width: 0.8;
    }
  }
  // highlight selected unit
  .maphex__start-zone--placement--selected-unit > g polygon {
    stroke: var(--success-green);
    /* stroke: var(--neon-green); */
    stroke-width: 0.6;
    fill: var(--success-green);
    /* fill: var(--neon-green); */
    fill-opacity: 0.6;
    // style stroke width a little thicker on mobile so you can see it
    @media screen and (max-width: 1100px) {
      stroke-width: 0.8;
    }
  }

  // Selected Map Hex
  .maphex__selected--active > g polygon {
    stroke: var(--white);
    stroke-width: 0.6;
  }

  // PHASE: ROP-all stages
  // highlight selectable units for selected card
  .maphex__selected-card-unit--selectable > g polygon {
    stroke: var(--sub-white);
    stroke-width: 0.6;
  }
  // highlight selected unit
  .maphex__selected-card-unit--active > g polygon {
    stroke: var(--player-color);
    stroke-width: 0.6;
    filter: drop-shadow(1px 1px 1px var(--sub-white))
      drop-shadow(-1px -1px 1px var(--sub-white))
      drop-shadow(1px -1px 1px var(--sub-white))
      drop-shadow(-1px 1px 1px var(--sub-white));
  }
  // PHASE: ROP-opponent's turn
  // highlight active enemy unit
  .maphex__opponents-active-unit > g polygon {
    stroke: var(--neon-red);
    stroke-width: 0.6;
  }

  //PHASE: ROP-move
  // paint safe moverange
  .maphex__move-safe > g polygon {
    fill: var(--neon-green);
    fill-opacity: 1;
    /* stroke: var(--neon-green);
    stroke-width: 2;
    stroke-dasharray: 10;
    animation: dash 10s linear infinite; */
  }
  // paint engage moverange
  .maphex__move-engage > g polygon {
    fill: var(--neon-orange);
    fill-opacity: 1;
  }
  // paint disengage moverange
  .maphex__move-disengage > g polygon {
    fill: var(--neon-red);
    fill-opacity: 1;
  }
  // paint partially moves units
  .maphex__move-partially-moved-unit > g polygon {
    stroke: var(--caution-yellow);
    stroke-opacity: 0.3;
    stroke-width: 5;
  }
  // paint totally moves units
  .maphex__move-totally-moved-unit > g polygon {
    stroke: var(--error-red);
    stroke-opacity: 0.3;
    stroke-width: 5;
  }

  //PHASE: ROP-attack
  // paint targetable enemy unit
  .maphex__targetable-enemy > g polygon {
    fill: var(--neon-red);
    fill-opacity: 1;
    filter: drop-shadow(5px 5px 4px var(--neon-red))
      drop-shadow(-5px -5px 4px var(--neon-red))
      drop-shadow(5px -5px 4px var(--neon-red))
      drop-shadow(-5px 5px 4px var(--neon-red));
  }
`
