// #package js/main

// #include ../AbstractDialog.js

// #include ../../../uispecs/lights/AmbientLightDialog.json

class AmbientLightDialog extends AbstractDialog {

constructor(light, options) {
    super(UISPECS.AmbientLightDialog, options);

    this._light = light;
    this._handleChange = this._handleChange.bind(this);

    this._binds.color.addEventListener('change', this._handleChange);
}

    _handleChange() {
        const color = CommonUtils.hex2rgb(this._binds.color.getValue());
        this._light.setColor(color);

        this._light.resetRenderer()
    }

}
