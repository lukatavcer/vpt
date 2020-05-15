// #package js/main

class AmbientLight {

constructor(renderer) {
    this._renderer = renderer;

    Object.assign(this, {
        color: [1.0, 1.0, 1.0]
    });
}

resetRenderer() {
    this._renderer.reset();
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
