export default function raySphere() {
    const glsl = (x: TemplateStringsArray) => x;
    const raySphere = glsl`
        // courtesy of Sebastian Lague
        vec2 raySphere(vec3 centre, float radius, vec3 rayOrigin, vec3 rayDir) {
            vec3 offset = rayOrigin - centre;
            float a = 1.0; // set  to dot(rayDir, rayDir) instead of rayDir may not be normalized
            float b = 2.0 * dot(offset, rayDir);
            float c = dot(offset, offset) - radius * radius;

            float discriminant = b*b-4.0*a*c;
            // No intersection: discriminant < 0
            // 1 intersection: discriminant == 0
            // 2 intersection: discriminant > 0
            if(discriminant > 0.0) {
                float s = sqrt(discriminant);
                float dstToSphereNear = max(0.0, (-b - s) / (2.0 * a));
                float dstToSphereFar = (-b + s) / (2.0 * a);

                if (dstToSphereFar >= 0.0) {
                    return vec2(dstToSphereNear, dstToSphereFar-dstToSphereNear);
                }
            }

            return vec2( 3.402823466e+38, 0.0);
        }
    `;
    return raySphere;
}
