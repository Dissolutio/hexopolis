import { Canvas } from '@react-three/fiber'
import {
  OrbitControls,
  Stage,
  Stars,
  Stats,
  PerspectiveCamera,
  CameraControls,
} from '@react-three/drei'

import { MapDisplay3D } from './hexmap3d/MapDisplay3D'
import { Notifications } from 'hexopolis-ui/notifications/Notifications'
import { RoundCounter } from 'hexopolis-ui/hexmap/RoundCounter'
import { DraftCounter } from 'hexopolis-ui/hexmap/DraftCounter'
import { useBgioCtx } from 'bgio-contexts'
import { useUIContext } from 'hexopolis-ui/contexts'
import { useRef } from 'react'
import { EffectProphet } from './hexmap3d/EffectProphet'

export const World = () => {
  const { isDraftPhase } = useBgioCtx()
  const { setSelectedUnitID } = useUIContext()
  const cameraControlsRef = useRef(undefined!)
  return (
    <div
      id="canvas-container"
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
    >
      <Canvas>
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />
        <EffectProphet cameraControlsRef={cameraControlsRef} />
        {/* <ambientLight intensity={1} /> */}
        {/* 4 in rectangle over top, shop-light style */}
        <directionalLight position={[50, 50, 50]} intensity={0.65} />
        <directionalLight position={[50, 50, -50]} intensity={0.65} />
        <directionalLight position={[-50, 50, 50]} intensity={0.65} />
        <directionalLight position={[-50, 50, -50]} intensity={0.65} />
        {/* 4 on sides, picture-day style */}
        <directionalLight position={[-50, 0, 0]} intensity={0.65} />
        <directionalLight position={[-50, 0, -50]} intensity={0.65} />
        <directionalLight position={[0, 0, 0]} intensity={0.65} />
        <directionalLight position={[0, 0, -50]} intensity={0.65} />
        <Stats />
        <MapDisplay3D cameraControlsRef={cameraControlsRef} />
        {/* <Grid infiniteGrid /> */}
        <PerspectiveCamera makeDefault position={[30, 30, 50]} fov={65} />
        {/* <axesHelper scale={[100, 100, 100]} /> */}
        <CameraControls
          maxPolarAngle={Math.PI / 2}
          ref={cameraControlsRef}
          // minDistance={0.1}
          makeDefault
          smoothTime={1}
          // dollySpeed={0.5}
          // enabled
          // verticalDragToForward={verticalDragToForward}
          // dollyToCursor={dollyToCursor}
          // infinityDolly={infinityDolly}
        />
      </Canvas>
      <Notifications />
      <RoundCounter />
      {isDraftPhase && <DraftCounter />}
    </div>
  )
}
