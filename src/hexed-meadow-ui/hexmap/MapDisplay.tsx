import { useBgioG } from 'bgio-contexts'
import { Notifications } from 'hexed-meadow-ui/controls/Notifications'
import React, { useRef } from 'react'
import styled from 'styled-components'
import {
  ReactHexgrid,
  MapHexStyles,
  MapHexes,
  TurnCounter,
  ZoomControls,
} from './'
import { ActiveHexReadout } from './ActiveHexReadout'

export const MapDisplay = () => {
  const { hexMap } = useBgioG()
  const mapSize = hexMap.mapSize
  const mapRef = useRef<HTMLDivElement>(null)
  const zoomInterval = 100
  const [mapState, setMapState] = React.useState(() => ({
    width: 100,
    height: 100,
    hexSize: mapSize <= 3 ? 15 : mapSize <= 5 ? 20 : mapSize <= 10 ? 25 : 25,
    spacing: 1.15,
  }))
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
  return (
    <MapStyle>
      <ZoomControls
        handleClickZoomIn={handleClickZoomIn}
        handleClickZoomOut={handleClickZoomOut}
      />
      <Notifications />
      <TurnCounter />
      <ActiveHexReadout />
      <MapHexStyles hexSize={mapState.hexSize} ref={mapRef}>
        <ReactHexgrid
          mapSize={mapSize}
          width={`${mapState.width}%`}
          height={`${mapState.height}%`}
          hexSize={mapState.hexSize}
          spacing={mapState.spacing}
        >
          <MapHexes hexSize={mapState.hexSize} />
        </ReactHexgrid>
      </MapHexStyles>
    </MapStyle>
  )
}

const MapStyle = styled.div`
  height: 100%;
`
