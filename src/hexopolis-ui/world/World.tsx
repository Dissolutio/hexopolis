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

export const World = () => {
  const { isDraftPhase } = useBgioCtx()
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
        {/* <ambientLight intensity={1} /> */}
        {/* <directionalLight position={[150, 150, 150]} intensity={1} /> */}
        <Stats />
        <Stage adjustCamera={false} intensity={5}>
          {/* <axesHelper scale={[10, 30, 30]} /> */}
          <MapDisplay3D />
          {/* <SgtDrakeModel /> */}
          {/* <AgentCarrModel />
          <SyvarrisModel />
          <Deathwalker9000Model /> */}
        </Stage>
        {/* <Grid infiniteGrid /> */}
        <PerspectiveCamera makeDefault position={[0, 30, 50]} fov={30} />
        <OrbitControls
          enableDamping
          dampingFactor={0.1}
          //  onChange?: (e?: OrbitControlsChangeEvent) => void; // use this to save camera position!
        />
      </Canvas>
      <Notifications />
      <RoundCounter />
      {isDraftPhase && <DraftCounter />}
    </div>
  )
}
