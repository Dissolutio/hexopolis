import { useBgioG } from 'bgio-contexts'
import { MapShapes } from 'game/types'
import { useMapContext } from 'hexopolis-ui/contexts'
import { Notifications } from 'hexopolis-ui/controls/Notifications'
import React, { useEffect, useRef } from 'react'
import { Layout } from './Layout'
import { MapHexes } from './MapHexes'
import { MapHexStyles } from './MapHexStyles'
import { TurnCounter } from './TurnCounter'
import { ZoomControls } from './ZoomControls'

type Props = {
  mapWrapperRef: React.RefObject<HTMLDivElement>
}

export const MapDisplay = ({ mapWrapperRef }: Props) => {
  const {
    hexMap: { hexSize, flat, mapShape, mapId, mapSize },
  } = useBgioG()
  const { viewBox } = useMapContext()
  const spacing = 1.15

  //! MAP SETUP/LAYOUT CONFIG
  const isHexagonShapedMap = mapShape === MapShapes.hexagon
  const isRectangleShapedMap = mapShape === MapShapes.rectangle
  const hexagonalMapState = {
    width: 100,
    height: 100,
    origin: { x: 0, y: 0 },
    flat,
    spacing: 0.99,
  }
  const rectangularMapState = {
    width: 100,
    height: 100,
    origin: { x: -750, y: -500 },
    flat,
    spacing: 0.99,
  }
  // this works ok if the longer number is the length, and around 25 length/width, otherwise, it's off screen easily
  const orientedRectangularMapState = {
    width: 100,
    height: 100,
    origin: { x: -750, y: -500 },
    flat,
    spacing: 0.99,
  }
  const initialMapState = isHexagonShapedMap
    ? hexagonalMapState
    : isRectangleShapedMap
    ? rectangularMapState
    : orientedRectangularMapState
  const [mapState, setMapState] = React.useState(() => initialMapState)
  const recalculateMapState = () => setMapState(initialMapState)
  useEffect(() => {
    recalculateMapState()
    // when the map changes, we recalculate, no other times
  }, [mapId])

  //! ZOOM FEATURE
  const zoomSeed = 10
  const zoomInterval = mapSize * zoomSeed
  const handleClickZoomIn = () => {
    // increases width and height by zoom interval, attempts scroll correction afterwards
    const el = mapWrapperRef.current
    const currentScrollTop = el?.scrollTop ?? mapState.height + zoomInterval / 2
    const currentScrollLeft =
      el?.scrollLeft ?? mapState.width + zoomInterval / 2
    setMapState((mapState) => ({
      ...mapState,
      width: mapState.width + zoomInterval,
      height: mapState.height + zoomInterval,
    }))
    el &&
      el.scrollTo({
        left: currentScrollLeft + zoomInterval,
        top: currentScrollTop + zoomInterval,
      })
  }
  const handleClickZoomOut = () => {
    // decreases width and height by zoom interval, attempts scroll correction afterwards
    const el = mapWrapperRef.current
    const currentScrollTop = el?.scrollTop ?? mapState.height - zoomInterval / 2
    const currentScrollLeft =
      el?.scrollLeft ?? mapState.width - zoomInterval / 2
    setMapState((s) => ({
      ...s,
      width: s.width - zoomInterval,
      height: s.height - zoomInterval,
    }))
    el &&
      el.scrollTo({
        left: currentScrollLeft - zoomInterval,
        top: currentScrollTop - zoomInterval,
      })
  }
  return (
    <MapHexStyles hexSize={hexSize}>
      <ZoomControls
        handleClickZoomIn={handleClickZoomIn}
        handleClickZoomOut={handleClickZoomOut}
      />
      <Notifications />
      <TurnCounter />
      <svg
        width={`${mapState.width}%`}
        height={`${mapState.height}%`}
        viewBox={viewBox}
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <Layout
          size={{ x: hexSize, y: hexSize }}
          flat={flat}
          spacing={spacing}
          className="hexgrid-layout"
        >
          <MapHexes hexSize={hexSize} />
        </Layout>
      </svg>
    </MapHexStyles>
  )
}
