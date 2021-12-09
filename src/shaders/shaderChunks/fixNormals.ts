export function fixNormals() {
    const glsl = (x: TemplateStringsArray) => x;
    const fixNormals = glsl`
        float oceanDepthMult = uOceanDepthMultiplier;
        float oceanFloorDepth = uOceanFloorDepth;
        float oceanFloorSmoothing = uOceanFloorSmoothing;

        // Continent Normals
        vec3 contNormalPosition = position + normal * displace(position);
        vec3 newPos = position;
        vec3 tangent = orthogonal(normal);
        vec3 bitangent = normalize(cross(normal, tangent));
        vec3 neighbour1 = position + (tangent.xyz  * 0.01);
        vec3 neighbour2 = position + (bitangent * 0.01);
        
        vec3 contNeighbour1 = neighbour1 + normal * displace(neighbour1);
        vec3 contNeighbour2 = neighbour2 + normal * displace(neighbour2);

        vec3 contNormalTangent = contNeighbour1 - contNormalPosition;
        vec3 contNormalBitangent = contNeighbour2 - contNormalPosition;
        vec3 displacedNormal = normalize(cross(contNormalTangent, contNormalBitangent));

        // CONTENENT NOISE

        // Initial position being applied noise
        displacedPosition = displace(newPos);

        float oceanFloorShape = -oceanFloorDepth + displacedPosition * .15;
        displacedPosition = smoothmax(displacedPosition, -oceanFloorDepth, oceanFloorSmoothing);
        
        if (displacedPosition < 0.0) {
		    displacedPosition *= 1.0 + uOceanDepthMultiplier;
	    }

        newPos.xyz += ((displacedPosition+1.0)/2.0) * normal;

        // Tan being applied noise
        float displaceTangent = displace(neighbour1);
        neighbour1.xyz += ((displaceTangent+1.0)/2.0) * normal;

        // BiTan being applied noise
        float displaceBiTangent = displace(neighbour2);
        neighbour2.xyz += ((displaceBiTangent+1.0)/2.0) * normal;

        // Mountain Normals
        vec3 mntNormalPosition = position + normal * mountains(position);
        vec3 newPos2 = position;
        vec3 tangent2 = orthogonal(normal);
        vec3 bitangent2 = normalize(cross(normal, tangent2));
        vec3 neighbour3 = position + (tangent2.xyz  * 0.01);
        vec3 neighbour4 = position + (bitangent2 * 0.01);

        vec3 mntNeighbour1 = neighbour3 + normal * displace(neighbour3);
        vec3 mntNeighbour2 = neighbour4 + normal * displace(neighbour4);

        vec3 mntNormalTangent = mntNeighbour1 - mntNormalPosition;
        vec3 mntNormalBitangent = mntNeighbour2 - mntNormalPosition;
        vec3 mntNormal = normalize(cross(mntNormalTangent, mntNormalBitangent));


        // MOUNTAIN NOISE

        // Initial position being applied noise
        mountainPosition = mountains(newPos);
        newPos2.xyz += ((mountainPosition+1.0)/2.0) * normal;

        // Tan being applied noise
        float displaceTangent2 = mountains(neighbour3);
        neighbour3.xyz += ((displaceTangent2+1.0)/2.0) * normal;

        // BiTan being applied noise
        float displaceBiTangent2 = mountains(neighbour4);
        neighbour4.xyz += ((displaceBiTangent2+1.0)/2.0) * normal;

        vec3 vn2 = cross(neighbour4-newPos2, neighbour3-newPos2);
        
        // Waves Normals
        vec3 wavesNormalPosition = position + normal * waves(position);
        vec3 newPos3 = position;
        
        // WAVES NOISE
        float wavesPosition = waves(newPos);
        newPos3.xyz += ((wavesPosition+1.0)/2.0) * normal;

        
    `;
    return fixNormals;
}
