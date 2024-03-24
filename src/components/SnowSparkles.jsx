import * as React from 'react'
import * as THREE from 'three'
import { useThree, useFrame, extend } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import { version } from '../helpers/constants'

const SparklesImplMaterial = shaderMaterial(
    { time: 0, pixelRatio: 1 },
    ` uniform float pixelRatio;
    uniform float time;
    attribute float size;  
    attribute float speed;  
    attribute float opacity;
    attribute vec3 noise;
    attribute vec3 color;
    varying vec3 vColor;
    varying float vOpacity;
    void main() {
      vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    //   modelPosition.y -= abs(sin(time * speed * -0.01 + modelPosition.x * noise.x * 100.0) * 25.0);
    //   modelPosition.y -= 10.0*fract(0.2*time);
        

    //   modelPosition.z += cos(time * speed + modelPosition.x * noise.y * 100.0) * 0.2;
    //   modelPosition.x += cos(time * speed + modelPosition.x * noise.z * 100.0) * 0.2;

    // vec3 velocity = vec3(0.0, -0.1, 0.0);  // 定义点的下落速度
    // // modelPosition.xyz += -1.0 * velocity * abs(sin(time * speed * -0.01));  // 更新点的位置，模拟下雪的效果
    
    // modelPosition.y += sin(time * speed * -0.01);  // 更新点的位置，模拟下雪的效果

    // if (modelPosition.y < 0.0) {  // 如果点超出屏幕范围，重置它的位置
    //     modelPosition.y = 10.0;
    //     modelPosition.x = fract(gl_Position.x * 0.5) - 5.0;  // 通过gl_Position的值计算点的x坐标
    //     modelPosition.z = fract(gl_Position.z * 0.3) - 5.0;  // 通过gl_Position的值计算点的z坐标
    // }

      vec4 viewPosition = viewMatrix * modelPosition;
      vec4 projectionPostion = projectionMatrix * viewPosition;
      gl_Position = projectionPostion;
      gl_PointSize = size * 25. * pixelRatio;
      gl_PointSize *= (1.0 / - viewPosition.z);
      vColor = color;
      vOpacity = opacity;
    }`,
    ` varying vec3 vColor;
    varying float vOpacity;
    void main() {
      float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
      float strength = 0.05 / distanceToCenter - 0.1;
      gl_FragColor = vec4(vColor, strength * vOpacity);
      #include <tonemapping_fragment>
      #include <${version >= 154 ? 'colorspace_fragment' : 'encodings_fragment'}>
    }`
)

const isFloat32Array = def => def && def.constructor === Float32Array

const expandColor = (v) => [v.r, v.g, v.b]
const isVector = (v) =>
    v instanceof THREE.Vector2 || v instanceof THREE.Vector3 || v instanceof THREE.Vector4

const normalizeVector = (v) => {
    if (Array.isArray(v)) return v
    else if (isVector(v)) return v.toArray()
    return [v, v, v]
}

function usePropAsIsOrAsAttribute(count, prop, setDefault) {
    return React.useMemo(() => {
        if (prop !== undefined) {
            if (isFloat32Array(prop)) {
                return prop
            } else {
                if (prop instanceof THREE.Color) {
                    const a = Array.from({ length: count * 3 }, () => expandColor(prop)).flat()
                    return Float32Array.from(a)
                } else if (isVector(prop) || Array.isArray(prop)) {
                    const a = Array.from({ length: count * 3 }, () => normalizeVector(prop)).flat()
                    return Float32Array.from(a)
                }
                return Float32Array.from({ length: count }, () => prop)
            }
        }
        return Float32Array.from({ length: count }, setDefault)
    }, [prop])
}

export const SnowSparkles = React.forwardRef(({ noise = 1, count = 100, speed = 1, opacity = 1, scale = 1, size, color, children, ...props }, forwardRef) => {
    React.useMemo(() => extend({ SparklesImplMaterial }), [])
    const ref = React.useRef(null)
    const dpr = useThree((state) => state.viewport.dpr)

    const _scale = normalizeVector(scale)
    const positions = React.useMemo(
        () => Float32Array.from(Array.from({ length: count }, () => _scale.map(THREE.MathUtils.randFloatSpread)).flat()),
        [count, ..._scale]
    )

    const sizes = usePropAsIsOrAsAttribute(count, size, Math.random)
    const opacities = usePropAsIsOrAsAttribute(count, opacity)
    const speeds = usePropAsIsOrAsAttribute(count, speed)
    const noises = usePropAsIsOrAsAttribute(count * 3, noise)
    const colors = usePropAsIsOrAsAttribute(
        color === undefined ? count * 3 : count,
        !isFloat32Array(color) ? new THREE.Color(color) : color,
        () => 1
    )

    useFrame((state) => {
        if (ref.current && ref.current.material) (ref.current.material).time = state.clock.elapsedTime
    })

    React.useImperativeHandle(forwardRef, () => ref.current, [])

    return (
        <points key={`particle-${count}-${JSON.stringify(scale)}`} {...props} ref={ref}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
                <bufferAttribute attach="attributes-opacity" args={[opacities, 1]} />
                <bufferAttribute attach="attributes-speed" args={[speeds, 1]} />
                <bufferAttribute attach="attributes-color" args={[colors, 3]} />
                <bufferAttribute attach="attributes-noise" args={[noises, 3]} />
            </bufferGeometry>
            {children ? children : <sparklesImplMaterial transparent pixelRatio={dpr} depthWrite={false} />}
        </points>
    )
})
