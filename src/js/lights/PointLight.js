// #package js/main

class PointLight {

constructor(renderer) {
    this._renderer = renderer;

    Object.assign(this, {
        position: [1.0, 1.0, 1.0],
        color: [1.0, 1.0, 1.0],
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

destroy() {
    // Reset everything
}
}
