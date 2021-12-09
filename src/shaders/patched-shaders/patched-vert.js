import { snoise } from "../shaderChunks/snoise";
import { displace } from "../shaderChunks/displace";
import { mountains } from "../shaderChunks/mountains";
import { waves } from "../shaderChunks/waves";
import { orthogonal } from "../shaderChunks/orthogonal";
import { fixNormals } from "../shaderChunks/fixNormals";

import * as THREE from "three";

import shaderPatch from "../../helpers/shaderPatch";

const patchVert = shaderPatch(THREE.ShaderChunk.meshphysical_vert, {
    header: `
        uniform float uTime;
        uniform float uSpeed;

        varying float displacedPosition;
        varying float mountainPosition;
        varying float elevation;
        varying float scaledElevation;
        varying vec2 vUv;
        varying float MIN;
        varying float MAX;
        varying vec3 vPosition;
        varying vec4 vLocalPos;
        varying vec3 vFragPos;
        varying mat4 vModelMatrix;

        // Contentent Uniforms
        uniform float uFrequency;
        uniform float uBaseFrequency;
        uniform float uElevation;
        uniform float uLayers;
        uniform float uPersistance;
        uniform float uMinValue;
        uniform float uContinentCentreX;
        uniform float uContinentCentreY;
        uniform float uContinentCentreZ;

        //Mountain Uniforms
        uniform float uMountainFrequency;
        uniform float uMountainBaseFrequency;
        uniform float uMountainElevation;
        uniform float uMountainLayers;
        uniform float uMountainPersistance;
        uniform float uMountainMinValue;
        uniform float uMountainCentreX;
        uniform float uMountainCentreY;
        uniform float uMountainCentreZ;

        uniform float uOceanDepthMultiplier;
        uniform float uOceanFloorDepth;
        uniform float uOceanFloorSmoothing;
        
        float smoothmax( float a, float b, float k )
        {
            k = min(0.0, -k);
            float minCalc = min(1.0, (b - a + k) / (2.0 * k));
            float h = max(0.0, minCalc );
            return a * h + b * (1.0 - h) - k * h * (1.0 - h);
        }

        ${snoise()[0]} 
        ${displace()[0]}
        ${mountains()[0]}
        ${waves()[0]}
        ${orthogonal()[0]}
          
    `,
    main: `
        ${fixNormals()[0]}
    `,
    "#include <defaultnormal_vertex>": `   
        vec3 transformedNormal = displacedNormal;

        transformedNormal = normalMatrix * transformedNormal;
    `,
    "#include <displacementmap_vertex>": `
        #include <displacementmap_vertex>

        // Another Way that include 3rd noise (OCEAN)
        float continentShape = -1.4 + displacedPosition * .15;
        float mountainShape = displacedPosition;

        // displacedPosition var comes from fixNormals() 
        elevation = 0.0;
        elevation = displacedPosition;
        float mask = displacedPosition;
        elevation += (mountainPosition + wavesPosition) * mask;

        // doesn't mess with vertices when values are negative
        scaledElevation = max(0.0, elevation);

        // using uv channel for elevation so
        // we can use actual elevation for ocean depth
        vUv.y = scaledElevation;

        // Calclulate minMax elevation
        MIN = 99999999.0;
        MAX = -99999999.0;

        if(elevation > MAX) {
            MAX = elevation;
        }
        if(elevation < MIN) {
            MIN = elevation;
        }
        
        transformed.xyz = position * (1.0 + elevation);
        
        // Varying
        vFragPos = vec3(modelMatrix * vec4(position, 1.0));
        vPosition = position;
        vLocalPos = vec4(transformed, 1.0);
        vModelMatrix = modelMatrix;
    `,
});

export default patchVert;
