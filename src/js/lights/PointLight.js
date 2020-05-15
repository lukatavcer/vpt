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
    this.position[0] = direction.x;
    this.position[1] = direction.y;
    this.position[2] = direction.z;
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
