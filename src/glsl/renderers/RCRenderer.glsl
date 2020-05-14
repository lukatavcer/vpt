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
uniform vec3 uLight;
uniform vec3 uDiffuse;

in vec3 vRayFrom;
in vec3 vRayTo;
out vec4 oColor;

float PHI = 1.61803398874989484820459;  // Φ = Golden Ratio

float gold_noise(in vec2 xy, in float seed){
    return fract(tan(distance(xy*PHI, xy)*seed)*xy.x);
}

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
        float val;
        vec4 voxel;
        vec3 gradient;
        vec4 colorSample;
        vec4 accumulator = vec4(0.0);
        vec3 light = normalize(uLight);
        float gradMagnitude;

        float offset = uOffset;

        // Sample through volume
        // Check if
        while (t < 1.0 && accumulator.a < 0.99) {

            pos = mix(from, to, t);
            // Random offset
//             pos = mix(from, to, offset);
            //             pos = mix(from, to, t + 0.01 * offset);

            // Get voxel value/intensity
            voxel = texture(uVolume, pos);
            val = voxel.r;
            gradient = voxel.gba;

            gradient -= 0.5;
            gradient *= 2.0;
            gradMagnitude = length(gradient);
            vec3 normal = normalize(gradient);

            float lambertBrightness = max(dot(normal, light), 0.0);

            // Map intensity & color from the transfer function
            //            float test = 1.0 - ();
            colorSample = texture(uTransferFunction, vec2(val, min(gradMagnitude, 0.3)));
            colorSample.a *= rayStepLength * uAlphaCorrection * gradMagnitude * 15.0;

            //            colorSample.a *= rayStepLength * uAlphaCorrection;
            colorSample.rgb *= colorSample.a * 2.0;
            //            colorSample.rgb *= uDiffuse;
//            colorSample.rgb *= lambertBrightness;
            colorSample.rgb *= lambertBrightness *0.7;

            accumulator += (1.0 - accumulator.a) * colorSample;
//            offset = mod(offset + uStepSize, 1.0);
            t += uStepSize;
        }

        if (accumulator.a > 1.0) {
            accumulator.rgb /= accumulator.a;
        }

        oColor = vec4(accumulator.rgb, 1.0); // black background
        //        oColor = vec4(vec3(1.0) - accumulator.rgb, 1.0); // white bounding box
        //        gl_FragColor = oColor;
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

in vec2 vPosition;
out vec4 oColor;

void main() {
    oColor = texture(uFrame, vPosition);
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
