export function displace() {
    const glsl = (x: TemplateStringsArray) => x;
    const displace = glsl`
        // the function which defines the displacement
        float displace(vec3 point) {
            float noiseValue = 0.0;
            float amplitude = 1.0;
            float terrainRoughness = uBaseFrequency;
            vec3 centre = vec3(uContinentCentreX, uContinentCentreY, uContinentCentreZ);

            for(float i = 0.0; i < uLayers; i++) {
                float v = snoise(vec3(point * terrainRoughness + centre));
                noiseValue += (v + 1.0) * .5 * amplitude;
                terrainRoughness *= uFrequency;
                amplitude *= uPersistance;
                
            }
            
            // flat ocean
            // noiseValue = Max(0.0, noiseValue-uMinValue);
            
            // ocean with depth
            noiseValue = (noiseValue-uMinValue);
            noiseValue = noiseValue;
            
            float distort = noiseValue * uElevation;
            //float distort = pow(noiseValue, uElevation);

            return distort;
        }
        
    `;
    return displace;
}
