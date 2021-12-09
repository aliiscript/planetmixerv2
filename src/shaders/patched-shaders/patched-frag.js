import * as THREE from "three";
import worldColor from "../shaderChunks/world-color";

import shaderPatch from "../../helpers/shaderPatch";

const patchVert = shaderPatch(THREE.ShaderChunk.meshphysical_frag, {
    header: `
        uniform float uTime; 
        uniform float uElevation; 
        uniform float uMinValue;
        uniform float uOceanClrR;
        uniform float uOceanClrG;
        uniform float uOceanClrB;
        uniform float uShoreClrR;
        uniform float uShoreClrG;
        uniform float uShoreClrB;

        varying float displacedPosition;
        varying float mountainPosition;
        varying float elevation;
        varying float scaledElevation;
        varying vec2 vUv;
        varying float MIN;
        varying float MAX;
        varying vec3 vPosition;
        varying vec3 vFragPos;
        varying vec4 vLocalPos;
        varying vec3 newNormal;
        varying mat4 vModelMatrix;

        // courtesy of Sebastian Lague
        float surfaceColor(vec3 vPos) {
            vec3 sphereNormal = normalize(vPos);
            vec4 worldNormal = vec4(vNormal, 1.0) * vModelMatrix;
            float steepness = 1.0 - dot(sphereNormal, vNormal);
            steepness = clamp(steepness, 0.0, .65);

            return steepness;
        }

    `,
    main: `
        
    `,
    "vec4 diffuseColor = vec4( diffuse, opacity );": `${worldColor()[0]}`,
});

export default patchVert;
