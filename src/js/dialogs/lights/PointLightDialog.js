// #package js/main

// #include ../AbstractDialog.js

// #include ../../../uispecs/lights/PointLightDialog.json

class PointLightDialog extends AbstractDialog {

constructor(light, options) {
    super(UISPECS.PointLightDialog, options);

    this._light = light;
    this._handleChange = this._handleChange.bind(this);

    this._binds.color.addEventListener('change', this._handleChange);
    this._binds.position.addEventListener('input', this._handleChange);
}

    _handleChange() {
        const position = this._binds.position.getValue();
        this._light.setPosition(position);

        const color = CommonUtils.hex2rgb(this._binds.color.getValue());
        this._light.setColor(color);

        this._light.resetRenderer()
    }
}
