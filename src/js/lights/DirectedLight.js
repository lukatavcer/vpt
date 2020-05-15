// #package js/main

class DirectedLight {

constructor(renderer) {
    this._renderer = renderer;

    Object.assign(this, {
        direction: [1.0, 1.0, 1.0],
        color: [1.0, 1.0, 1.0],
    });
}

resetRenderer() {
    this._renderer.reset();
}

setDirection(direction) {
    this.direction[0] = direction.x;
    this.direction[1] = direction.y;
    this.direction[2] = direction.z;
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
