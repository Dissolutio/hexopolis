import { Canvas, useThree } from '@react-three/fiber'
import {
  Center,
  OrbitControls,
  Text3D,
  Stage,
  Stars,
  Billboard,
  Text,
  Stats,
} from '@react-three/drei'

import { HexMap3D } from './HexMap3D'
import { SgtDrakeModel } from './components/SgtDrakeModel'
import { AgentCarrModel } from './components/AgentCarrModel'
import { Color } from 'three'

export const StyledFullScreenWorld = () => {
  return (
    <div
      id="canvas-container"
      style={{
        width: '100vw',
        height: '100vh',
      }}
    >
      <World />
    </div>
  )
}

const World = () => {
  return (
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
      <ambientLight intensity={1} />
      <directionalLight position={[150, 150, 150]} intensity={1} />
      <Stats />
      <Stage>
        <HexMap3D />
        <SgtDrakeModel />
        <AgentCarrModel />
        <axesHelper position={[0, 1, 0]} scale={[50, 10, 30]} />
      </Stage>
      {/* <Grid infiniteGrid /> */}
      <OrbitControls />
    </Canvas>
  )
}

const Text3DCanvas = () => {
  return (
    <Canvas orthographic camera={{ position: [0, 0, 100], zoom: 100 }}>
      <Text3DExample />
    </Canvas>
  )
}
const Text3DExample = () => {
  const margin = 0.5
  const { width, height } = useThree((state) => state.viewport)
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} />
      <Center
        bottom
        right
        position={[-width / 2 + margin, height / 2 - margin, 0]}
      >
        <Text3D letterSpacing={-0.06} size={0.5} font="/Inter_Bold.json">
          top left
          <meshStandardMaterial color="white" />
        </Text3D>
      </Center>
      <Center top left position={[width / 2 - margin, -height / 2 + margin, 0]}>
        <Text3D letterSpacing={-0.06} size={0.5} font="/Inter_Bold.json">
          bottom right
          <meshStandardMaterial color="white" />
        </Text3D>
      </Center>
      <Center rotation={[-0.5, -0.25, 0]}>
        <Text3D
          curveSegments={32}
          bevelEnabled
          bevelSize={0.04}
          bevelThickness={0.1}
          height={0.5}
          lineHeight={0.5}
          letterSpacing={-0.06}
          size={1.5}
          font="/Inter_Bold.json"
        >
          {`hello\nworld`}
          <meshNormalMaterial />
        </Text3D>
      </Center>
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 2}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  )
}
