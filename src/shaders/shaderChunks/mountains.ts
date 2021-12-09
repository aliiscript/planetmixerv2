export function mountains() {
    const glsl = (x: TemplateStringsArray) => x;
    const mountains = glsl`
        // the function which defines the displacement
        float mountains(vec3 point) {
            float noiseValue = 0.0;
            float amplitude = 1.0;
            float terrainRoughness = uMountainBaseFrequency;
            vec3 centre = vec3(uMountainCentreX, uMountainCentreY, uMountainCentreZ);
            float weight = 1.0;
            
            for(float i = 0.0; i < 5.0; i++) {
                float v = (1.0- abs(snoise(vec3(point * terrainRoughness + centre))));
                v *= v;
                v *= weight;
                weight = v;

                noiseValue += (v + 1.0) * .5 * amplitude;
                terrainRoughness *= uMountainFrequency;
                amplitude *= uMountainPersistance;
                
            }

            //noiseValue = max(0.0, noiseValue-uMountainMinValue);
            noiseValue = (noiseValue-uMountainMinValue);
            //noiseValue = noiseValue-uMountainMinValue;
            
            float mountains = noiseValue * uMountainElevation;

            return mountains;
        }
        
    `;
    return mountains;
}
