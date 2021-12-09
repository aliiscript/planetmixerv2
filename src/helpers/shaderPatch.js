export default function shaderPatch(
    shader,
    { defines = "", header = "", main = "", ...replaces }
) {
    let patchedShader = shader;

    const replaceAll = (str, find, rep) => str.split(find).join(rep);
    Object.keys(replaces).forEach((key) => {
        patchedShader = replaceAll(patchedShader, key, replaces[key]);
    });

    patchedShader = patchedShader.replace(
        "void main() {",
        `
    ${header}
    void main() {
      ${main}
    `
    );

    return `
    ${defines}
    ${patchedShader}
  `;
}
