export function orthogonal() {
    const glsl = (x : TemplateStringsArray) => x;
    const orthogonal = glsl`
        vec3 orthogonal(vec3 v) {
            return normalize(abs(v.x) > abs(v.z) ? vec3(-v.y, v.x, 0.0)
            : vec3(0.0, -v.z, v.y));
      }       
    `;
    return orthogonal;
}