// #package js/main

// #include ../WebGL.js
// #include AbstractRenderer.js
// #include ../lights/AmbientLight.js

class RCRenderer extends AbstractRenderer {

constructor(gl, volume, environmentTexture, options) {
    super(gl, volume, environmentTexture, options);

    Object.assign(this, {
        _stepSize        : 0.004,  // steps: 250
        _alphaCorrection : 40,
        _lightType       : 0,
        _light     : new AmbientLight(),
        _randomize       : false,
        _diffuse         : [1, 0.2, 0.9]
    }, options);

    this._programs = WebGL.buildPrograms(this._gl, {
        generate  : SHADERS.RCGenerate,
        integrate : SHADERS.RCIntegrate,
        render    : SHADERS.RCRender,
        reset     : SHADERS.RCReset
    }, MIXINS);

    this._frameNumber = 1;
}

destroy() {
    const gl = this._gl;
    Object.keys(this._programs).forEach(programName => {
        gl.deleteProgram(this._programs[programName].program);
    });

    super.destroy();
}

_resetFrame() {
    const gl = this._gl;

    const program = this._programs.reset;
    gl.useProgram(program.program);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    this._frameNumber = 1;
}

_generateFrame() {
    const gl = this._gl;

    const program = this._programs.generate;
    gl.useProgram(program.program);
    if (this._lightType === 0) {

    } else if (this._lightType === 1) {
        gl.uniform3fv(program.uniforms.uLight, this._light.direction);
    } else if (this._lightType === 2) {
        gl.uniform3fv(program.uniforms.uLight, this._light.position);
    }

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_3D, this._volume.getTexture());
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this._transferFunction);

    gl.uniform1i(program.uniforms.uTransferFunction, 1);
    gl.uniform1i(program.uniforms.uVolume, 0);
    gl.uniform1f(program.uniforms.uStepSize, this._stepSize);
    gl.uniform1f(program.uniforms.uRandomize, this._randomize);
    gl.uniform1f(program.uniforms.uLightType, this._lightType);
    gl.uniform3fv(program.uniforms.uLightColor,  this._light.color);
    gl.uniform1f(program.uniforms.uOffset, Math.random());
    gl.uniform1f(program.uniforms.uAlphaCorrection, this._alphaCorrection);
    gl.uniformMatrix4fv(program.uniforms.uMvpInverseMatrix, false, this._mvpInverseMatrix.m);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

_integrateFrame() {
    const gl = this._gl;

    const program = this._programs.integrate;
    gl.useProgram(program.program);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this._accumulationBuffer.getAttachments().color[0]);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this._frameBuffer.getAttachments().color[0]);

    gl.uniform1i(program.uniforms.uAccumulator, 0);
    gl.uniform1i(program.uniforms.uFrame, 1);
    gl.uniform1f(program.uniforms.uInvFrameNumber, 1 / this._frameNumber);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    this._frameNumber += 1;
}

_renderFrame() {
    const gl = this._gl;

    const program = this._programs.render;
    gl.useProgram(program.program);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this._accumulationBuffer.getAttachments().color[0]);

    gl.uniform1i(program.uniforms.uAccumulator, 0);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

_getFrameBufferSpec() {
    const gl = this._gl;
    return [{
        width          : this._bufferSize,
        height         : this._bufferSize,
        min            : gl.NEAREST,
        mag            : gl.NEAREST,
        format         : gl.RGBA,
        internalFormat : gl.RGBA,
        type           : gl.UNSIGNED_BYTE
    }];
}

_getAccumulationBufferSpec() {
    const gl = this._gl;
    return [{
        width          : this._bufferSize,
        height         : this._bufferSize,
        min            : gl.NEAREST,
        mag            : gl.NEAREST,
        format         : gl.RGBA,
        internalFormat : gl.RGBA,
        type           : gl.UNSIGNED_BYTE
    }];
}

}
