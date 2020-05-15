// #package js/main

// #include ../AbstractDialog.js

// #include ../../../uispecs/lights/DirectedLightDialog.json

class DirectedLightDialog extends AbstractDialog {

constructor(light, options) {
    super(UISPECS.DirectedLightDialog, options);

    this._light = light;
    this._handleChange = this._handleChange.bind(this);

    this._binds.direction.addEventListener('input', this._handleChange);
}

_handleChange() {
    const direction = this._binds.direction.getValue();
    this._light.setDirection(direction);

    const color = CommonUtils.hex2rgb(this._binds.color.getValue());
    console.log(color);
    this._light.setColor(color);

    this._light.resetRenderer()
}

}
