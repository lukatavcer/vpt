// #package js/main

// #include ../AbstractDialog.js
// #include ../../TransferFunctionWidget.js

// #include ../../../uispecs/renderers/RCRendererDialog.json
// #include ../../lights
// #include ../lights

class RCRendererDialog extends AbstractDialog {

    constructor(renderer, options) {
        super(UISPECS.RCRendererDialog, options);

        this._renderer = renderer;

        this._handleChange = this._handleChange.bind(this);
        this._handleTFChange = this._handleTFChange.bind(this);
        this._handleFilterChange = this._handleFilterChange.bind(this);
        this._handleLightChange = this._handleLightChange.bind(this);
        this._handleReflectionModelChange = this._handleReflectionModelChange.bind(this);

        this._binds.steps.addEventListener('input', this._handleChange);
        this._binds.opacity.addEventListener('input', this._handleChange);
        this._binds.randomize.addEventListener('change', this._handleFilterChange);
        this._binds.reflectionModelSelect.addEventListener('change', this._handleReflectionModelChange);
        this._binds.lightSelect.addEventListener('change', this._handleLightChange);

        this._tfwidget = new TransferFunctionWidget();
        this._binds.tfcontainer.add(this._tfwidget);
        this._tfwidget.addEventListener('change', this._handleTFChange);

        this._handleChange();
        this._handleFilterChange();
        this._handleLightChange();
        this._handleReflectionModelChange();

    }

    destroy() {
        this._tfwidget.destroy();
        super.destroy();
    }

    _handleChange() {
        this._renderer._stepSize = 1 / this._binds.steps.getValue();
        this._renderer._alphaCorrection = this._binds.opacity.getValue();

        this._renderer.reset();
    }

    _handleTFChange() {
        this._renderer.setTransferFunction(this._tfwidget.getTransferFunction());
        this._renderer.reset();
    }

    _handleFilterChange() {
        this._renderer._randomize = !!this._binds.randomize.isChecked();
    }

    getSelectedReflectionModel() {
        const model = this._binds.reflectionModelSelect.getValue();
        switch (model) {
            case 'lambertian' : return 0;
            case 'phong' : return 1;
        }
    }

    _handleReflectionModelChange() {
        const model = this.getSelectedReflectionModel();
        this._renderer._reflectionModel = model;
        this._renderer.reset()
    }

    _getLightClass(light) {
        switch (light) {
            case 'ambient'    : return AmbientLight;
            case 'directed' : return DirectedLight;
            case 'point' : return PointLight;
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
        if (this._lightDialog) {
            this._lightDialog.destroy();
        }
        const which = this._binds.lightSelect.getValue();

        this.chooseLight(which);
        const light = this.getLight();
        const container = this.getLightSettingsContainer();
        const dialogClass = this._getDialogForLight(which);
        this._lightDialog = new dialogClass(light);
        this._lightDialog.appendTo(container);

        this._renderer._lightType = this.getSelectedLight();

        this._renderer.reset()

    }

    _getDialogForLight(light) {
        switch (light) {
            case 'ambient'  : return AmbientLightDialog;
            case 'directed' : return DirectedLightDialog;
            case 'point' : return PointLightDialog;
        }
    }

    getLightSettingsContainer() {
        return this._binds.lightSettingsContainer;
    }

    chooseLight(light) {
        if (this._light) {
            this._light.destroy();
        }
        const lightClass = this._getLightClass(light);
        this._light = new lightClass(this._renderer);
        this._renderer._light = this._light;
    }

    getLight() {
        return this._light;
    }
}
