import { useBgioG } from 'bgio-contexts'
import { Notifications } from 'hexed-meadow-ui/controls/Notifications'
import React, { useRef } from 'react'
import { ActiveHexReadout } from './ActiveHexReadout'
import { Layout } from './Layout'
import { MapHexes } from './MapHexes'
import { MapHexStyles } from './MapHexStyles'
import { TurnCounter } from './TurnCounter'
import { ZoomControls } from './ZoomControls'

export const MapDisplay = () => {
  const { hexMap } = useBgioG()
  const { mapSize, hexSize, flat } = hexMap
  const mapRef = useRef<HTMLDivElement>(null)
  const zoomInterval = 100
  const [mapState, setMapState] = React.useState(() => ({
    width: 100,
    height: 100,
  }))
  const spacing = 1.15
  const handleClickZoomIn = () => {
    const el = mapRef.current
    setMapState((mapState) => ({
      ...mapState,
      width: mapState.width + zoomInterval,
      height: mapState.height + zoomInterval,
    }))
    if (el) {
      setTimeout(() => {
        const el: any = mapRef.current
        el && el.scrollBy(2 * zoomInterval, 2 * zoomInterval)
      }, 1)
    }
  }
  const handleClickZoomOut = () => {
    const el: any = mapRef.current
    setMapState((s) => ({
      ...s,
      width: s.width - zoomInterval,
      height: s.height - zoomInterval,
    }))
    el && el.scrollBy(-2 * zoomInterval, -2 * zoomInterval)
  }
  const calcViewBox = (mapSize: number) => {
    const halfViewBox = mapSize * -50
    const fullViewBox = mapSize * 100
    return `${halfViewBox} ${halfViewBox} ${fullViewBox} ${fullViewBox}`
  }
  return (
    <MapHexStyles hexSize={hexSize} ref={mapRef}>
      <ZoomControls
        handleClickZoomIn={handleClickZoomIn}
        handleClickZoomOut={handleClickZoomOut}
      />
      <Notifications />
      <TurnCounter />
      <ActiveHexReadout />
      <svg
        width={`${mapState.width}%`}
        height={`${mapState.height}%`}
        viewBox={calcViewBox(mapSize)}
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
