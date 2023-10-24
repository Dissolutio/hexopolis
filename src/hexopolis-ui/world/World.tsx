import { Canvas } from '@react-three/fiber'
import {
  OrbitControls,
  Stage,
  Stars,
  Stats,
  PerspectiveCamera,
} from '@react-three/drei'

import { MapDisplay3D } from './hexmap3d/MapDisplay3D'
import { Notifications } from 'hexopolis-ui/notifications/Notifications'
import { RoundCounter } from 'hexopolis-ui/hexmap/RoundCounter'
import { DraftCounter } from 'hexopolis-ui/hexmap/DraftCounter'
import { useBgioCtx } from 'bgio-contexts'
import { useUIContext } from 'hexopolis-ui/contexts'

export const World = () => {
  const { isDraftPhase } = useBgioCtx()
  const { setSelectedUnitID } = useUIContext()
  return (
    <div
      id="canvas-container"
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
    >
      <Canvas onPointerMissed={() => setSelectedUnitID('')}>
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />
        <ambientLight intensity={1} />
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
        <MapDisplay3D />
        {/* <Grid infiniteGrid /> */}
        <PerspectiveCamera makeDefault position={[30, 30, 50]} fov={30} />
        <OrbitControls
          enableDamping
          dampingFactor={0.1}
          rotateSpeed={0.5}
          zoomSpeed={0.2}
          //  onChange?: (e?: OrbitControlsChangeEvent) => void; // use this to save camera position!
        />
      </Canvas>
      <Notifications />
      <RoundCounter />
      {isDraftPhase && <DraftCounter />}
    </div>
  )
}
