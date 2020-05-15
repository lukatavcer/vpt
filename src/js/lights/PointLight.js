// #package js/main

class PointLight {

constructor(renderer) {
    this._renderer = renderer;

    Object.assign(this, {
        position    : [1.0, 1.0, 1.0],
        color       : [0.3, 0.3, 0.3],
        attenuation : 0.15,
        intensity : 0.7,
    });
}

resetRenderer() {
    this._renderer.reset();
}

setPosition(position) {
    this.position[0] = position.x;
    this.position[1] = position.y;
    this.position[2] = position.z;
}

setColor(color) {
    this.color[0] = color.r;
    this.color[1] = color.g;
    this.color[2] = color.b;
}

setAttenuation(attenuation) {
    this.attenuation = attenuation;
}

setIntensity(intensity) {
    this.intensity = intensity;
}

destroy() {
    // Reset everything
}
}
