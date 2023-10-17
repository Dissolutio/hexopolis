import { Vector3, BufferGeometry, Line, Color } from 'three'
import { ReactThreeFiber, extend } from '@react-three/fiber'
import { hexTerrainColor } from './MapDisplay3D'

// this extension for line_ is because, if we just use <line></line> then we get an error:
// Property 'geometry' does not exist on type 'SVGProps<SVGLineElement>'
// So, following advice found in issue: https://github.com/pmndrs/react-three-fiber/discussions/1387
extend({ Line_: Line })
declare global {
  namespace JSX {
    interface IntrinsicElements {
      line_: ReactThreeFiber.Object3DNode<Line, typeof Line>
    }
  }
}

const genPointsForHeightRing = (height: number) => {
  // our World renders where the map is flat along the X,Z axes, and the negative-Y is out of the screen
  return [
    new Vector3(1.0, height, 0),
    new Vector3(0.5, height, Math.sqrt(3) / 2),
    new Vector3(-0.5, height, Math.sqrt(3) / 2),
    new Vector3(-1.0, height, 0),
    new Vector3(-0.5, height, -Math.sqrt(3) / 2),
    new Vector3(0.5, height, -Math.sqrt(3) / 2),
    new Vector3(1.0, height, 0),
  ]
}
export const HeightRing = ({
  height,
  position,
  terrain,
}: {
  height: number
  position: Vector3
  terrain: string
}) => {
  const points = genPointsForHeightRing(height)
  const lineGeometry = new BufferGeometry().setFromPoints(points)
  return (
    <line_
      geometry={lineGeometry}
      position={position}
      rotation={[0, Math.PI / 6, 0]}
    >
      <lineBasicMaterial
        attach="material"
        color={new Color(hexTerrainColor[terrain])}
        linewidth={1}
        linecap={'round'}
        linejoin={'round'}
      />
    </line_>
  )
}
