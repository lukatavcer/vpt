// #package js/main

// #include ../AbstractDialog.js
// #include ../../TransferFunctionWidget.js

// #include ../../../uispecs/renderers/RCRendererDialog.json

class RCRendererDialog extends AbstractDialog {

    constructor(renderer, options) {
        super(UISPECS.RCRendererDialog, options);

        this._renderer = renderer;

        this._handleChange = this._handleChange.bind(this);
        this._handleTFChange = this._handleTFChange.bind(this);
        this._handleFilterChange = this._handleFilterChange.bind(this);
        this._handleLightChange = this._handleLightChange.bind(this);

        this._binds.steps.addEventListener('input', this._handleChange);
        this._binds.opacity.addEventListener('input', this._handleChange);
        this._binds.randomize.addEventListener('change', this._handleFilterChange);
        this._binds.lightSelect.addEventListener('change', this._handleLightChange);
        this._binds.direction.addEventListener('input', this._handleChange);

        this._tfwidget = new TransferFunctionWidget();
        this._binds.tfcontainer.add(this._tfwidget);
        this._tfwidget.addEventListener('change', this._handleTFChange);

        this._handleChange();
        this._handleFilterChange();

    }

    destroy() {
        this._tfwidget.destroy();
        super.destroy();
    }

    _handleChange() {
        this._renderer._stepSize = 1 / this._binds.steps.getValue();
        this._renderer._alphaCorrection = this._binds.opacity.getValue();

        // const color = CommonUtils.hex2rgb(this._binds.color.getValue());
        // this._renderer._diffuse[0] = color.r;
        // this._renderer._diffuse[1] = color.g;
        // this._renderer._diffuse[2] = color.b;

        const direction = this._binds.direction.getValue();
        this._renderer._light[0] = direction.x;
        this._renderer._light[1] = direction.y;
        this._renderer._light[2] = direction.z;

        this._renderer.reset();
    }

    _handleTFChange() {
        this._renderer.setTransferFunction(this._tfwidget.getTransferFunction());
        this._renderer.reset();
    }

    _handleFilterChange() {
        this._renderer._randomize = !!this._binds.randomize.isChecked();
    }

    _getLightClass(light) {
        switch (light) {
            case 'directed' : return DirectedLight;
            case 'point'    : return DirectedLight;
        }
    }

    getSelectedLight() {
        const light = this._binds.lightSelect.getValue();
        switch (light) {
            case 'ambient' : return 0;
            case 'directed' : return 1;
            case 'point'    : return 2;
        }
    }

    _handleLightChange() {
        const light = this.getSelectedLight();
        console.log(light);
        this._renderer._lightType = light;
    }
}
