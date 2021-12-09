import { useControls } from "leva";
import { useMemo, useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useFBO } from "@react-three/drei";
import * as THREE from "three";
import useStore from "../../../hooks/store";
import patchedVert from "../../../shaders/patched-shaders/patched-vert";
import patchedFrag from "../../../shaders/patched-shaders/patched-frag";

import vert from "../../../shaders/oceanShaders/vert.glsl";
import frag from "../../../shaders/oceanShaders/frag.glsl";

import imgA from "../../../static/waveA.png";
import imgB from "../../../static/waveB.png";

import { Mesh, ShaderMaterial, Vector2 } from "three";

interface OceanProps {
    radius: number;
    depthTexture: THREE.DepthTexture;
}

const Ocean = (props: OceanProps) => {
    const oceanRef = useRef<Mesh>();
    const shaderMatRef = useRef<ShaderMaterial>();

    // Waves Texture Loader
    const waveA = useMemo(() => new THREE.TextureLoader().load(imgA), []);
    const waveB = useMemo(() => new THREE.TextureLoader().load(imgB), []);
    waveA.wrapS = THREE.RepeatWrapping;
    waveA.wrapT = THREE.RepeatWrapping;

    waveB.wrapS = THREE.RepeatWrapping;
    waveB.wrapS = THREE.RepeatWrapping;

    const {
        oceanVisible,
        y,
        depthFactor,
        smoothness,
        specLightDirection,
        uWaveStrength,
        uFoamCutOff,
    } = useControls({
        oceanVisible: {
            value: true,
        },
        y: {
            value: 0,
            min: -50,
            max: 50,
            step: 0.001,
        },
        depthFactor: {
            value: 9.2,
            min: 0.0,
            max: 150.0,
            step: 0.001,
        },
        smoothness: {
            value: 0.02,
            min: 0.0,
            max: 1.0,
            step: 0.001,
        },
        specLightDirection: {
            value: { x: 0, y: 0, z: 160 },
            step: 1.0,
        },
        uWaveStrength: {
            value: 0.2,
            min: 0.0,
            max: 1.0,
            step: 0.001,
        },
        uFoamCutOff: {
            value: 0.85,
            min: 0.0,
            max: 1.0,
            step: 0.001,
        },
    });

    const { gl, scene, camera } = useThree();
    const size = useThree(({ size }) => size);
    const dpr = useThree(({ viewport }) => viewport.dpr);

    // RenderTarget/FBO
    // Render Target
    let RenderTargetClass: any = null;

    // sets better render target if webgl2 compatible
    // else sets to regular webGLRenderTarget
    if (gl.getPixelRatio() === 1 && gl.capabilities.isWebGL2) {
        RenderTargetClass = THREE.WebGLMultisampleRenderTarget;
    } else {
        RenderTargetClass = THREE.WebGLRenderTarget;
    }

    const renderTarget = useMemo(
        () =>
            new RenderTargetClass(size.width, size.height, {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat,
                encoding: THREE.sRGBEncoding,
            }),
        [RenderTargetClass, size.height, size.width]
    );

    renderTarget.depthTexture = useMemo(
        () => new THREE.DepthTexture(size.width, size.height),
        [size.height, size.width]
    );

    renderTarget.texture.format = THREE.RGBAFormat;
    renderTarget.texture.minFilter = THREE.NearestFilter;
    renderTarget.texture.magFilter = THREE.NearestFilter;
    renderTarget.generateMipMaps = false;
    renderTarget.stencilBuffer = false;
    renderTarget.depthBuffer = true;
    renderTarget.depthTexture.format = THREE.DepthFormat;
    renderTarget.depthTexture.type = THREE.UnsignedShortType;

    const uniforms = useMemo(() => {
        return {
            uTime: { value: 0.0 },
            uWaveA: { value: waveA },
            uWaveB: { value: waveB },
            uResolution: {
                value: new Vector2(size.width * dpr, size.height * dpr),
            },
            cameraNear: { value: 0 },
            cameraFar: { value: 0 },
            tDepth: { value: null },
            tDiffuse: { value: null },
            uFactor: { value: 9.2 },
            uSmoothness: { value: 0.02 },
            specLightDirX: { value: 0.0 },
            specLightDirY: { value: 0.0 },
            specLightDirZ: { value: 160.0 },
            uWaveStrength: { value: 0.2 },
            uFoamCutOff: { value: 0.85 },
        };
    }, [dpr, size.height, size.width, waveA, waveB]);

    // Animations
    useFrame((_) => {
        let time = _.clock.getElapsedTime();
        uniforms.uTime.value = time;

        shaderMat.uniforms.uResolution.value.set(
            size.width * dpr,
            size.height * dpr
        );
    });

    // Material
    const material = useMemo(
        () =>
            new THREE.ShaderMaterial({
                lights: true,
                extensions: {
                    derivatives: true,
                },
                defines: {
                    STANDARD: "",
                    PHYSICAL: "",
                },
                uniforms: {
                    ...THREE.ShaderLib.physical.uniforms,
                    ...uniforms,
                },
                vertexShader: vert,
                fragmentShader: frag,
            }),
        [uniforms]
    );
    material.needsUpdate = true;

    // Custom Shader Material
    // Material
    const shaderMat = useMemo(
        () =>
            new THREE.ShaderMaterial({
                lights: true,
                extensions: {
                    derivatives: true,
                },
                defines: {
                    STANDARD: "",
                    PHYSICAL: "",
                },
                uniforms: {
                    ...THREE.ShaderLib.physical.uniforms,
                    ...uniforms,
                },
                vertexShader: vert,
                fragmentShader: frag,
            }),
        [uniforms]
    );
    material.needsUpdate = true;

    shaderMat.uniforms.uFactor.value = depthFactor;
    shaderMat.uniforms.uSmoothness.value = smoothness;
    shaderMat.uniforms.cameraNear.value = camera.near;
    shaderMat.uniforms.cameraFar.value = camera.far;
    shaderMat.uniforms.specLightDirX.value = specLightDirection.x;
    shaderMat.uniforms.specLightDirY.value = specLightDirection.y;
    shaderMat.uniforms.specLightDirZ.value = specLightDirection.z;
    shaderMat.uniforms.uWaveStrength.value = uWaveStrength;
    shaderMat.uniforms.uFoamCutOff.value = uFoamCutOff;

    useFrame(() => {
        gl.setRenderTarget(renderTarget);
        gl.render(scene, camera);

        shaderMat.uniforms.tDiffuse.value = renderTarget.texture;
        shaderMat.uniforms.tDepth.value = renderTarget.depthTexture;

        gl.setRenderTarget(null);
        gl.render(scene, camera);
    });

    return (
        <mesh
            ref={oceanRef}
            material={shaderMat}
            position={[0, y, 0]}
            visible={oceanVisible}
        >
            <icosahedronBufferGeometry args={[props.radius, 64]} />
        </mesh>
    );
};

function Planet() {
    const clamp = (a: number, min = 0, max = 1) =>
        Math.min(max, Math.max(min, a));
    const invlerp = (x: number, y: number, a: number) =>
        clamp((a - x) / (y - x));

    // Dreis FBO
    const size = useThree(({ size }) => size);
    const dpr = useThree(({ viewport }) => viewport.dpr);
    const depthFBO = useFBO(size.width * dpr, size.width * dpr);

    // Zustand state
    const r = useStore((state) => state.radius);
    const cCenterX = useStore((state) => state.continentCenterX);
    const cCenterY = useStore((state) => state.continentCenterY);
    const cCenterZ = useStore((state) => state.continentCenterZ);
    const dFactor = useStore((state) => state.depthFactor);

    useEffect(() => {
        if (depthFBO) {
            depthFBO.depthBuffer = true;
            depthFBO.depthTexture = new THREE.DepthTexture(
                size.width,
                size.width
            );

            depthFBO.depthTexture.format = THREE.DepthFormat;
            depthFBO.depthTexture.type = THREE.UnsignedShortType;
        }
    }, [depthFBO, r, size.width]);

    // GUI
    const {
        radius,
        detail,
        speed,
        roughness,
        depthMultiplier,
        alphaMultiplier,
        folder,
        frequency,
        baseFrequency,
        persistance,
        elevation,
        noiseLayers,
        continentCentre,
        folder2,
        minValue,
        mountainFrequency,
        mountainBaseFrequency,
        mountainElevation,
        mountainNoiseLayers,
        mountainMinValue,
        mountainCentre,
        folder3,
        oceanClr,
        shoreClr,
        folder4,
        oceanDepthMultiplier,
        oceanFloorDepth,
        oceanFloorSmoothing,
    } = useControls({
        radius: {
            value: r,
            min: 20,
            max: 32,
        },
        detail: {
            value: 32,
            min: 8,
            max: 256,
        },
        speed: {
            value: 0.42,
            min: 0,
            max: 4,
            step: 0.001,
        },
        roughness: {
            value: 1.0,
            min: 0,
            max: 1,
            step: 0.001,
        },
        depthMultiplier: {
            value: 1.0,
            min: 1,
            max: 2000,
            step: 0.001,
        },
        alphaMultiplier: {
            value: 1.0,
            min: 1,
            max: 2000,
            step: 0.001,
        },
        folder: {
            value: "Continent Values",
        },
        frequency: {
            value: 2.35,
            min: 0,
            max: 10,
            step: 0.001,
        },
        baseFrequency: {
            value: 0.04,
            min: 0,
            // .3
            max: 5,
            step: 0.001,
        },
        persistance: {
            value: 0.5,
            min: 0,
            max: 4,
            step: 0.001,
        },
        elevation: {
            value: 0.08,
            min: 0,
            max: 1.0,
            step: 0.001,
        },
        noiseLayers: {
            value: 5,
            min: 1,
            max: 8,
            steps: 1,
        },
        minValue: {
            value: 1.0,
            min: 0.85,
            max: 5.0,
        },
        continentCentre: {
            value: { x: 0, y: 0, z: 0 },
        },
        folder2: {
            value: "Mountain Values",
        },
        mountainFrequency: {
            value: 0.0,
            min: 0,
            max: 10,
            step: 0.001,
        },
        mountainBaseFrequency: {
            value: 0.05,
            min: 0,
            max: 0.25,
            step: 0.001,
        },
        mountainElevation: {
            value: 4.0,
            min: 0,
            max: 4,
            step: 0.001,
        },
        mountainNoiseLayers: {
            value: 1,
            min: 1,
            max: 8,
            steps: 1,
        },
        mountainMinValue: {
            value: 0.55,
            min: 0.5,
            max: 5.0,
        },
        mountainCentre: {
            value: {
                x: 0,
                y: 0,
                z: 0,
            },
            min: 0,
            max: 50,
            steps: 0.001,
        },
        folder3: {
            value: "Albedos",
        },
        // b and g are flipped for whatever reason
        oceanClr: { a: 1.0, g: 28.0, b: 214.0, r: 0.0 },
        shoreClr: { a: 1.0, g: 206.0, b: 125.0, r: 197.0 },
        folder4: {
            value: "Ocean Settings",
        },
        oceanDepthMultiplier: {
            value: 1.55,
            min: 0.5,
            max: 10.0,
            step: 0.01,
        },
        oceanFloorDepth: {
            value: 1.55,
            min: 0.5,
            max: 5.0,
            step: 0.0001,
        },
        oceanFloorSmoothing: {
            value: 0.5,
            min: 0.0,
            max: 50.0,
            step: 0.01,
        },
    });

    // Uniforms
    const uniforms = useMemo(() => {
        return {
            // diffuse: {value: '#ff0000'},
            uTime: { value: 0.0 },
            uResolution: { value: new THREE.Vector2(0, 0) },
            uFactor: { value: 30 },
            uDepthMultiplier: { value: 1.0 },
            uAlphaMultiplier: { value: 1.0 },
            uSpeed: { value: 0.3 },
            roughness: { value: 1.0 },
            // Contentents Uniforms
            uFrequency: { value: 0.25 },
            uBaseFrequency: { value: 0.45 },
            uElevation: { value: 0.62 },
            uLayers: { value: 5.0 },
            uPersistance: { value: 0.5 },
            uMinValue: { value: 1.0 },
            uContinentCentreX: { value: cCenterX },
            uContinentCentreY: { value: cCenterY },
            uContinentCentreZ: { value: cCenterZ },

            // Mountains Uniforms
            uMountainFrequency: { value: 0.0 },
            uMountainBaseFrequency: { value: 0.1 },
            uMountainElevation: { value: 0.0 },
            uMountainLayers: { value: 5.0 },
            uMountainPersistance: { value: 0.0 },
            uMountainMinValue: { value: 0.0 },
            uMountainCentreX: { value: 0 },
            uMountainCentreY: { value: 0 },
            uMountainCentreZ: { value: 0 },

            // Albedos
            uOceanClrR: { value: 0 },
            uOceanClrG: { value: 28 },
            uOceanClrB: { value: 214 },

            uShoreClrR: { value: 197 },
            uShoreClrG: { value: 206 },
            uShoreClrB: { value: 125 },

            // Ocean uniforms
            uOceanDepthMultiplier: { value: 1.5 },
            uOceanFloorDepth: { value: 1.5 },
            uOceanFloorSmoothing: { value: 0.5 },
        };
    }, [cCenterX, cCenterY, cCenterZ]);

    // Material
    const material = useMemo(
        () =>
            new THREE.ShaderMaterial({
                lights: true,
                extensions: {
                    derivatives: true,
                },
                defines: {
                    STANDARD: "",
                    PHYSICAL: "",
                },
                uniforms: {
                    ...THREE.ShaderLib.physical.uniforms,
                    ...uniforms,
                },
                vertexShader: patchedVert,
                fragmentShader: patchedFrag,
            }),
        [uniforms]
    );
    material.needsUpdate = true;

    useFrame((_) => {
        let time = _.clock.getElapsedTime();
        uniforms.uTime.value = time;
    });

    // DYNAMIC GUI VALUES
    material.uniforms.uDepthMultiplier.value = depthMultiplier;
    material.uniforms.uAlphaMultiplier.value = alphaMultiplier;
    material.uniforms.uSpeed.value = speed;
    material.uniforms.roughness.value = roughness;
    material.uniforms.uElevation.value = elevation;
    material.uniforms.uFrequency.value = frequency;
    material.uniforms.uBaseFrequency.value = baseFrequency;
    material.uniforms.uPersistance.value = persistance;
    material.uniforms.uLayers.value = noiseLayers;
    material.uniforms.uMinValue.value = minValue;
    material.uniforms.uContinentCentreX.value = cCenterX;
    material.uniforms.uContinentCentreY.value = cCenterY;
    material.uniforms.uContinentCentreZ.value = cCenterZ;

    material.uniforms.uMountainElevation.value = mountainElevation;
    material.uniforms.uMountainFrequency.value = mountainFrequency;
    material.uniforms.uMountainBaseFrequency.value = mountainBaseFrequency;
    material.uniforms.uMountainLayers.value = mountainNoiseLayers;
    material.uniforms.uMountainMinValue.value = mountainMinValue;
    material.uniforms.uMountainCentreX.value = mountainCentre.x;
    material.uniforms.uMountainCentreY.value = mountainCentre.y;
    material.uniforms.uMountainCentreZ.value = mountainCentre.z;

    // Albedos
    material.uniforms.uOceanClrR.value = invlerp(0.0, 255.0, oceanClr.r);
    material.uniforms.uOceanClrG.value = invlerp(0.0, 255.0, oceanClr.g);
    material.uniforms.uOceanClrB.value = invlerp(0.0, 255.0, oceanClr.b);
    // Shore
    material.uniforms.uShoreClrR.value = invlerp(0.0, 255.0, shoreClr.r);
    material.uniforms.uShoreClrG.value = invlerp(0.0, 255.0, shoreClr.g);
    material.uniforms.uShoreClrB.value = invlerp(0.0, 255.0, shoreClr.b);

    // Ocean Settings
    material.uniforms.uOceanDepthMultiplier.value = oceanDepthMultiplier;
    material.uniforms.uOceanFloorDepth.value = oceanFloorDepth;
    material.uniforms.uOceanFloorSmoothing.value = oceanFloorSmoothing;

    const planetRef = useRef<Mesh>();

    return (
        <group>
            <mesh
                ref={planetRef}
                castShadow={true}
                receiveShadow={true}
                position={[0, 0, 0]}
                material={material}
            >
                <icosahedronBufferGeometry args={[r, detail]} />
            </mesh>
            <Ocean radius={r} depthTexture={depthFBO?.depthTexture} />
        </group>
    );
}

export default Planet;
