export function waves() {
    const glsl = (x: TemplateStringsArray) => x;
    const waves = glsl`

        float waves(vec3 point) {
            if(point.x == 0.0 && point.y == 0.0 && point.z == 0.0) {
                float amplitude = 1.0;
                float numWaves = .5;
                float centre;

                float weight = 1.0;

                float noiseValue = sin(point.x * numWaves + uTime * amplitude) * 2.0;

                for (float i = 0.0; i < 5.0; i++) {
                    noiseValue -= abs(snoise(vec3(point.xyz * 3.0 * i * uTime * .2)) * .15 / i);
                }

                return noiseValue;

            } else {
                return 0.0;
            }

        }
    `;
    return waves;
}
