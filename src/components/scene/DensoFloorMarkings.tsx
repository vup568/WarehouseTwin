import React, { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { DENSO_LAYOUT_V1 } from '../../data/denso-layout-v1'
import { FLOOR_MARKING_Y } from '../../data/aws-environment-layout'
import { createDensoFloorMarkings, MARKING_COLORS } from '../../data/denso-floor-markings'
import type { FloorMarking } from '../../data/denso-floor-markings'
import { useStore } from '../../state/store'

const markings = createDensoFloorMarkings(DENSO_LAYOUT_V1)
const arrowShape = new THREE.Shape()
arrowShape.moveTo(-0.28, -0.32)
arrowShape.lineTo(0.28, -0.32)
arrowShape.lineTo(0, 0.38)
arrowShape.closePath()

const PaintedPath: React.FC<{ marking: FloorMarking }> = ({ marking }) => {
  const color = MARKING_COLORS[marking.kind]
  const labelTexture = useMemo(() => {
    if (!marking.label) return null
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 80
    const context = canvas.getContext('2d')!
    context.font = 'bold 34px sans-serif'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillStyle = color
    context.fillText(marking.label, 256, 40, 500)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
  }, [marking.label, color])
  useEffect(() => () => { labelTexture?.dispose() }, [labelTexture])

  return (
    <group name={`FloorMarking:${marking.id}`}>
      {marking.points.slice(1).map(([x2, z2], index) => {
        const [x1, z1] = marking.points[index]
        const length = Math.hypot(x2 - x1, z2 - z1)
        if (length < 0.001) return null
        const angle = Math.atan2(z2 - z1, x2 - x1)
        return (
          <group key={index} position={[(x1 + x2) / 2, FLOOR_MARKING_Y, (z1 + z2) / 2]} rotation={[0, -angle, 0]}>
            <mesh renderOrder={2} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[length, marking.widthM]} />
              <meshBasicMaterial color={color} depthWrite={false} polygonOffset polygonOffsetFactor={-1} />
            </mesh>
            {marking.arrows && <mesh renderOrder={2} position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, -Math.PI / 2]}>
              <shapeGeometry args={[arrowShape]} /><meshBasicMaterial color={color} depthWrite={false} />
            </mesh>}
          </group>
        )
      })}
      {labelTexture && <mesh position={[marking.points[0][0], FLOOR_MARKING_Y + 0.004, marking.points[0][1] + 0.9]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[marking.label.length > 10 ? 5 : 3, 0.65]} />
        <meshBasicMaterial map={labelTexture} transparent depthWrite={false} />
      </mesh>}
    </group>
  )
}

export const DensoFloorMarkings: React.FC = () => {
  const layers = useStore(state => state.layers)
  return <group name="DensoFloorMarkings">{markings.filter(marking => marking.kind === 'AGV' ? layers.agv : marking.kind === 'AMR' ? layers.amr : layers.zones)
    .map(marking => <PaintedPath key={marking.id} marking={marking} />)}</group>
}
