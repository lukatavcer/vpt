// #package glsl/shaders

// #include ../mixins/unproject.glsl
// #include ../mixins/intersectCube.glsl

// #section RCGenerate/vertex

#version 300 es
precision mediump float;

uniform mat4 uMvpInverseMatrix;

layout(location = 0) in vec2 aPosition;
out vec3 vRayFrom;
out vec3 vRayTo;

@unproject

void main() {
    unproject(aPosition, uMvpInverseMatrix, vRayFrom, vRayTo);
    gl_Position = vec4(aPosition, 0.0, 1.0);
}

// #section RCGenerate/fragment

#version 300 es
precision mediump float;

uniform mediump sampler3D uVolume;
uniform mediump sampler2D uTransferFunction;
uniform float uStepSize;
uniform float uOffset;
uniform float uAlphaCorrection;  // Opacity
uniform bool uRandomize;
uniform float uReflectionModel;
uniform vec3 uLight;  // Position or direction
uniform float uLightType;
uniform vec3 uLightColor;
uniform float uLightAttenuation;
uniform float uLightIntensity;


in vec3 vRayFrom;
in vec3 vRayTo;
out vec4 oColor;


@intersectCube

void main() {
    vec3 rayDirection = vRayTo - vRayFrom;
    // Calculate where ray hits the bounding box and where it leaves it
    // tbounds.x: in
    // tbounds.y: out
    vec2 tbounds = max(intersectCube(vRayFrom, rayDirection), 0.0);

    // Check if ray is out of bounds, return black color
    if (tbounds.x >= tbounds.y) {
        oColor = vec4(0.0, 0.0, 0.0, 1.0);  // black background
        //        oColor = vec4(1.0, 1.0, 1.0, 1.0);  // white background
    } else {
        // Ray is inisde the volume, proceed with color accumulation
        // Get from and to points on the ray
        vec3 from = mix(vRayFrom, vRayTo, tbounds.x);
        vec3 to = mix(vRayFrom, vRayTo, tbounds.y);
        float rayStepLength = distance(from, to) * uStepSize;

        float t = 0.0;
        vec3 pos;
        vec4 voxel;
        float val;
        vec3 gradient;
        float gradMagnitude;
        vec4 colorSample;
        vec4 accumulator = vec4(0.0);
        vec3 light = uLight;

        // Phong parameters
        vec3 specColor = vec3(1.0, 1.0, 1.0);

        // Random sampling offset
        float offset = uOffset;

        // Sample through volume
        // Check if
        float diffMultiplier = 32.0;
        // Ambient Lighting
        if (uLightType == 0.0) {
            diffMultiplier /= 4.0;

            while (t < 1.0 && accumulator.a < 0.99) {
                // Random offset
                if (uRandomize == true) {
                    pos = mix(from, to, offset);
                } else {
                    pos = mix(from, to, t);
                }

                // Get voxel value/intensity
                voxel = texture(uVolume, pos);
                val = voxel.r;
                gradient = voxel.gba;

                gradient -= 0.5;
                gradient *= 2.0;
                gradMagnitude = length(gradient);

                // Map intensity & color from the transfer function
                colorSample = texture(uTransferFunction, vec2(val, gradMagnitude));
                colorSample.a *= rayStepLength * uAlphaCorrection * gradMagnitude * diffMultiplier;

                colorSample.rgb *= colorSample.a;
                colorSample.rgb = mix(colorSample.rgb, uLightColor, colorSample.a);

                accumulator += (1.0 - accumulator.a) * colorSample;
                offset = mod(offset + uStepSize, 1.0);
                t += uStepSize;
            }
        } else if (uLightType == 1.0) {
            // Directed Light
            light = normalize(light);

            while (t < 1.0 && accumulator.a < 0.99) {
                // Random offset
                if (uRandomize == true) {
                    pos = mix(from, to, offset);

                } else {
                    pos = mix(from, to, t);
                }

                // Get voxel value/intensity
                voxel = texture(uVolume, pos);
                val = voxel.r;
                gradient = voxel.gba;

                gradient -= 0.5;
                gradient *= 2.0;
                gradMagnitude = length(gradient);
                vec3 normal = normalize(gradient);
                float lambert = max(dot(normal, light), 0.15);

                // Map intensity & color from the transfer function
                colorSample = texture(uTransferFunction, vec2(val, gradMagnitude));

                // Mix light color (diffuse) with the material (transfer function) color
//                colorSample.rgb = mix(colorSample.rgb, uLightColor, colorSample.a);
                 colorSample.rgb += uLightColor;
                 colorSample.rgb *= lambert;

                if (uReflectionModel == 1.0) {
                    // Phong
                    vec3 reflectDir = reflect(-light, normal);
                    vec3 viewDir = normalize(-pos);
                    float specular = 0.0;

                    if (lambert > 0.0) {
                        float specAngle = max(dot(reflectDir, viewDir), 0.0);
                        specular = pow(specAngle, 4.0);
                    }

                    // vec4(ambientColor + lambert* diffuseColor + specular*specColor, 1.0);
                    // Hardcoded spec color & intensity, make it whiter
                    colorSample.rgb += specular*(mix(colorSample.rgb, vec3(0.8), 0.5)) * 0.9;
                }
                // Increase alpha on parts that are more shaded (make them less transparent)
                if (lambert > 0.5) {
                    colorSample.a *=  1.5;
                }
                colorSample.a *= rayStepLength * uAlphaCorrection * gradMagnitude * diffMultiplier;
                colorSample.rgb *= colorSample.a;

                accumulator += (1.0 - accumulator.a) * colorSample;
                offset = mod(offset + uStepSize, 1.0);
                t += uStepSize;
            }
        } else if (uLightType == 2.0) {
            // Point Light
            vec3 lightDirection;
            light = normalize(light);

            while (t < 1.0 && accumulator.a < 0.99) {
                // Random offset
                if (uRandomize == true) {
                    pos = mix(from, to, offset);

                } else {
                    pos = mix(from, to, t);
                }

                lightDirection = light - pos;
                // Get voxel value/intensity
                voxel = texture(uVolume, pos);
                val = voxel.r;
                gradient = voxel.gba;

                gradient -= 0.5;
                gradient *= 2.0;
                gradMagnitude = length(gradient);
                vec3 normal = normalize(gradient);
                float lambert = max(dot(normal, normalize(lightDirection)), 0.15);

                // Map intensity & color from the transfer function
                float koef = 1.0 - (exp(-0.5 * gradMagnitude));
                colorSample = texture(uTransferFunction, vec2(val, gradMagnitude));

                // Mix light color with the material (transfer function) color
//                colorSample.rgb = mix(colorSample.rgb, uLightColor, colorSample.a);
                colorSample.rgb += uLightColor;
                colorSample.rgb *= lambert;
                if (uReflectionModel == 1.0) {
                    // Phong
                    vec3 reflectDir = reflect(-light, normal);
                    vec3 viewDir = normalize(-pos);
                    float specular = 0.0;

                    if (lambert > 0.0) {
                        float specAngle = max(dot(reflectDir, viewDir), 0.0);
                        specular = pow(specAngle, 4.0);
                    }

                    // vec4(ambientColor + lambert* diffuseColor + specular*specColor, 1.0);
                    // Hardcoded spec color & intensity
//                    colorSample.rgb += specular*(colorSample.rgb+vec3(0.2)) * 0.9;
                    colorSample.rgb += specular*(mix(colorSample.rgb, vec3(0.8), 0.5)) * 0.9;
                }

                // Increase alpha on parts that are more shaded (make them less transparent)
                if (lambert > 0.5) {
                    colorSample.a *=  1.5;
                }
                colorSample.a *= rayStepLength * uAlphaCorrection * gradMagnitude * diffMultiplier;
                colorSample.rgb *= colorSample.a;

                float d = length(lightDirection);

                // Smooth attenuation
                // float attenuation = 1.0 / ((1.0 - uLightIntensity) + 1.0*d + uLightAttenuation*d*d);
                float attenuation = 1.0 / (0.2 + (1.0 - uLightIntensity)*d + uLightAttenuation*d*d);

                colorSample.rgb *= attenuation;

                accumulator += (1.0 - accumulator.a) * colorSample;
                offset = mod(offset + uStepSize, 1.0);
                t += uStepSize;
            }
        }

        if (accumulator.a > 1.0) {
            accumulator.rgb /= accumulator.a;
        }

        oColor = vec4(accumulator.rgb, 1.0); // black bounding box
        //        oColor = vec4(vec3(1.0) - accumulator.rgb, 1.0); // white bounding box
        //        gl_FragColor = oColor;
        // Debug light color
//        if (uReflectionModel == 0.0) {
//            oColor = vec4(0.0, 0.0, 1.0, 1.0);
//        } else if (uReflectionModel == 1.0) {
//            oColor = vec4(1.0, 1.0, 1.0, 1.0);
//        }
    }
}

// #section RCIntegrate/vertex

#version 300 es
precision mediump float;

layout(location = 0) in vec2 aPosition;
out vec2 vPosition;

void main() {
    vPosition = (aPosition + 1.0) * 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
}

// #section RCIntegrate/fragment
#version 300 es
precision mediump float;

uniform mediump sampler2D uAccumulator;
uniform mediump sampler2D uFrame;
uniform float uInvFrameNumber;

in vec2 vPosition;
out vec4 oColor;

void main() {
//    oColor = texture(uFrame, vPosition);
    vec4 acc = texture(uAccumulator, vPosition);
    vec4 frame = texture(uFrame, vPosition);
    oColor = acc + (frame - acc) * uInvFrameNumber;
}

// #section RCRender/vertex

#version 300 es
precision mediump float;

layout(location = 0) in vec2 aPosition;
out vec2 vPosition;

void main() {
    vPosition = (aPosition + 1.0) * 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
}

// #section RCRender/fragment

#version 300 es
precision mediump float;

uniform mediump sampler2D uAccumulator;

in vec2 vPosition;
out vec4 oColor;

void main() {
    oColor = texture(uAccumulator, vPosition);
}

// #section RCReset/vertex

#version 300 es
precision mediump float;

layout(location = 0) in vec2 aPosition;

void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
}

// #section RCReset/fragment

#version 300 es
precision mediump float;

out vec4 oColor;

void main() {
    oColor = vec4(0.0, 0.0, 0.0, 1.0);
}
