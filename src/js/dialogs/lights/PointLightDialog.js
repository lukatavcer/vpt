// #package js/main

// #include ../AbstractDialog.js

// #include ../../../uispecs/lights/PointLightDialog.json

class PointLightDialog extends AbstractDialog {

constructor(renderer, options) {
    super(UISPECS.PointLightDialog, options);

    this._renderer = renderer;
    this._handleChange = this._handleChange.bind(this);

    this._binds.direction.addEventListener('input', this._handleChange);
}

    _handleChange() {
        const direction = this._binds.direction.getValue();
        this._renderer._light[0] = direction.x;
        this._renderer._light[1] = direction.y;
        this._renderer._light[2] = direction.z;
    }

}
