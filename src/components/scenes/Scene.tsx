import React, { useRef, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useHelper, FlyControls } from "@react-three/drei";
import Planet from "../models/planet/index"

interface SceneProps {}

function Scene(props: SceneProps) {
    // Refs
    const directionalLightRef = useRef();

    // Hooks

    // Helpers

    return (
        <>
            <directionalLight ref={directionalLightRef} position={[0, 0, 16]} />
            <Planet />
            <OrbitControls />
            <FlyControls />
        </>
    );
}

export default Scene;
