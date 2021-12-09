export default function worldColor() {
    const glsl = (x: TemplateStringsArray) => x;
    const worldColor = glsl`
        float steepness = surfaceColor(vFragPos);

        vec2 uv = vUv;
        uv.y = elevation;
        
        vec2 uv2 = vUv;
        float posLength = length(normalize(vPosition));

        float oceanLerp = smoothstep(MIN, 0.0, elevation);
        
        // Colors
        vec3 uvColor =  vec3(uv.y);
        float oceanDepth = smoothstep(MIN, 0.0, uv.y);

        vec3 mixedColors;
        float t = elevation;
        vec3 mixedOcean = vec3(1.0);

        if (t <= 0.0) {
            mixedColors = vec3(.45, .45, .2);
        }
        if (t > 0.0){


            mixedColors = mix(vec3(0.0, 0.0, 1.0), vec3(1.0, 1.0, 1.0), t*2.0);

            // if(t > 0.0 && t <= .002) {
            //     mixedColors += vec3(uShoreClrR, uShoreClrG, uShoreClrB);
            // }
            
            // // Shore Line
            // if(t > .002 && t < .01) {
            //     mixedColors += vec3(uShoreClrR, uShoreClrG, uShoreClrB);
            // }
            
            // last color you see
            if(t > .00 && t <= .3) {
                mixedColors *= vec3(0.0, 1.0, 0.0);
            }

            //mixedColors += uvColor;
        }  
        
        vec4 diffuseColor = vec4(mixedColors, opacity);

    `;
    return worldColor;
}
