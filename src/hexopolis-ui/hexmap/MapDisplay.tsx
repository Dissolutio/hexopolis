import { useBgioG } from 'bgio-contexts'
import { MapShapes } from 'game/types'
import { useMapContext } from 'hexopolis-ui/contexts'
import { Notifications } from 'hexopolis-ui/controls/Notifications'
import React, { useEffect } from 'react'
import { HexgridLayout } from './HexgridLayout'
import { MapHexes } from './MapHexes'
import { MapHexStyles } from './MapHexStyles'
import { TurnCounter } from './TurnCounter'
import { ZoomControls } from './ZoomControls'

type Props = {
  mapWrapperRef: React.RefObject<HTMLDivElement>
}

export const MapDisplay = ({ mapWrapperRef }: Props) => {
  const {
    hexMap: { hexSize, flat, mapId, mapSize },
  } = useBgioG()
  const { viewBox } = useMapContext()
  //! MAP SETUP/LAYOUT CONFIG
  const initialMapState = {
    width: 100,
    height: 100,
  }
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
    // Early return if already all the way zoomed out
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
      <HexgridLayout size={{ x: hexSize, y: hexSize }} flat={flat} spacing={1}>
        <svg
          width={`${mapState.width}%`}
          height={`${mapState.height}%`}
          viewBox={viewBox}
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g className="hexgrid-layout">
            <MapHexes hexSize={hexSize} />
          </g>
        </svg>
      </HexgridLayout>
    </MapHexStyles>
  )
}
