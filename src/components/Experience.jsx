import { useRef } from 'react';
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { CabinOnTheHill } from "./Cabin_on_the_hill"
import { useFrame } from "@react-three/fiber";
import { AxesHelper } from 'three';
export const Experience = () => {

  const camera = useRef();

  // useFrame(() => {
  //   // 在每一帧更新时输出相机的位置
  //   console.log(camera.current.position);
  // });

  return (                                
    <>
      <PerspectiveCamera ref={camera} makeDefault position={[-58,14,11]} />
      <OrbitControls />
      <group>
        <CabinOnTheHill></CabinOnTheHill>
        {/* <mesh>
          <boxGeometry args={[90,50,90]} />
          <meshNormalMaterial />
        </mesh>                                                */}
      </group>
    </>
  );
};
