// #package js/main

class DirectedLight {

constructor(renderer) {
    this._renderer = renderer;

    Object.assign(this, {
        direction: [1.0, 1.0, 1.0],
    });
}

setDirection(direction) {
    this.direction[0] = direction.x;
    this.direction[1] = direction.y;
    this.direction[2] = direction.z;
}

destroy() {
    // Reset everything
}
}
