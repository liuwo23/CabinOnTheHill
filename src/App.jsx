import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import { SnowSparkles } from "./components/SnowSparkles";
import { Particles } from "./components/Particles";

import { Experience } from "./components/Experience";

function App( { scale = Array.from({ length: 2000 }, () => 40 + Math.random() * 20) } ) {
  const mouse = useRef([0, 0])

  return (
    <Canvas shadows camera={{ position: [3, 3, 3], fov: 30 }}>
      <color attach="background" args={["#ececec"]} />
      <Particles count={10000} mouse={mouse} />
      {/* <SnowSparkles count={scale.length} size={scale} position={[0, 0.9, 0]} scale={[120,80,120]} speed={8} noise={[-0.0001,0,0]} opacity={0.4} /> */}
      <Experience />
    </Canvas>
  );
}

export default App;
