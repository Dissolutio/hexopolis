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
  // Hex text: fill, font-size
  .maphex_altitude-text {
    fill: var(--sub-white);
    font-size: ${(props) => `${props.hexSize / 75}rem`};
  }

  // All hexagons white fill on hover
  .hexagon-group polygon {
    @media (hover: hover) {
      &:hover {
        fill: var(--sub-white);
      }
    }
  }
  // All hexagons stroke, stroke-width, fill-opacity (fill-opacity has given problems with flickering to 1, before)
  .hexagon-group polygon {
    stroke: var(--white);
    stroke-width: 0.1;
    fill-opacity: 0.4;
    transition: fill-opacity 0.2s ease-in-out, stroke-width 0.2s ease-in-out,
      stroke 0.2s ease-in-out;
  }
  // All hexagons terrain: fill, fill-opacity
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
  // Startzone hexagons: stroke,  stroke-width
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
  // empty placeable hexagons: stroke, stroke-width, fill, fill-opacity
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
  // occupied placeable hexagons: stroke, stroke-width, fill, fill-opacity
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
  // selected unit: stroke, stroke-width, fill, fill-opacity
  .maphex__start-zone--placement--selected-unit > g polygon {
    stroke: var(--success-green);
    stroke-width: 0.6;
    fill: var(--success-green);
    fill-opacity: 0.6;
    // style stroke width a little thicker on mobile so you can see it
    @media screen and (max-width: 1100px) {
      stroke-width: 0.8;
    }
  }

  // PHASE: PLACEMENT AND OM:
  /* selected hex: stroke, stroke-width */
  .maphex__selected--active > g polygon {
    stroke: var(--white);
    stroke-width: 0.6;
  }

  // PHASE: ROP-most stages
  // highlight selectable units for selected card: stroke, stroke-width
  .maphex__selected-card-unit--selectable > g polygon {
    stroke: var(--sub-white);
    stroke-width: 0.6;
  }
  // highlight selected unit: stroke, stroke-width, drop-shadow
  .maphex__selected-card-unit--active > g polygon {
    stroke: var(--player-color);
    stroke-width: 0.6;
    filter: drop-shadow(2.5px 2.5px 2px var(--sub-white))
      drop-shadow(-2.5px -2.5px 2px var(--sub-white));
  }
  // PHASE: ROP-idle
  // highlight active enemy unit
  .maphex__opponents-active-unit > g polygon {
    stroke: var(--neon-red);
    stroke-width: 0.6;
  }

  //PHASE: ROP-move
  // move ranges: fill, fill-opacity
  .maphex__move-safe > g polygon {
    fill: var(--neon-green);
    fill-opacity: 1;
    /* stroke: var(--neon-green);
    stroke-width: 2;
    stroke-dasharray: 10;
    animation: dash 10s linear infinite; */
  }
  .maphex__move-engage > g polygon {
    fill: var(--neon-orange);
    fill-opacity: 1;
  }
  .maphex__move-disengage > g polygon {
    fill: var(--neon-red);
    fill-opacity: 1;
  }

  // partially moves units: stroke, stroke-opacity, stroke-width
  .maphex__move-partially-moved-unit > g polygon {
    stroke: var(--caution-yellow);
    stroke-opacity: 0.3;
    stroke-width: 5;
  }
  // totally moves units: stroke, stroke-opacity, stroke-width
  .maphex__move-totally-moved-unit > g polygon {
    stroke: var(--error-red);
    stroke-opacity: 0.3;
    stroke-width: 5;
  }

  //PHASE: ROP-attack
  // targetable enemy unit:fill, fill-opacity, drop-shadow
  .hexagon-attack-selectable > g polygon {
    fill: var(--neon-red);
    fill-opacity: 1;
    filter: drop-shadow(2.5px 2.5px 2px var(--neon-red))
      drop-shadow(-2.5px -2.5px 2px var(--neon-red));
  }
  //PHASE: ROP-water-clone
  // paint places where water clone can be placed
  .maphex__cloner-hexes > g polygon {
    stroke: var(--player-color);
    stroke-width: 0.3;
    // style stroke width a little thicker on mobile so you can see it
    @media screen and (max-width: 1100px) {
      stroke-width: 0.4;
    }
  }

  //PHASE: ROP WaterClone && FireLineSA: fill, fill-opacity, drop-shadow
  /* hexagon-selectable is going to become more of a utility class for stages */
  .hexagon-selectable > g polygon {
    fill: var(--neon-green);
    fill-opacity: 1;
    filter: drop-shadow(2.5px 2.5px 2px var(--neon-green))
      drop-shadow(-2.5px -2.5px 2px var(--neon-green));
  }
  //PHASE: ROP FireLineSA: fill, fill-opacity, drop-shadow
  .hexagon-malaffected > g polygon {
    fill: var(--neon-yellow);
    fill-opacity: 0.6;
    filter: drop-shadow(2.5px 2.5px 2px var(--neon-orange))
      drop-shadow(-2.5px -2.5px 2px var(--neon-orange));
  }
  .hexagon-selected-special-attack > g polygon {
    fill: var(--neon-red);
    fill-opacity: 0.6;
    filter: drop-shadow(2.5px 2.5px 2px var(--neon-red))
      drop-shadow(-2.5px -2.5px 2px var(--neon-red));
  }
`
