// Run with: node --test tests/panel_startup_test.js
// Execute the real extension/controller logic with Shell dependencies mocked.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import vm from 'node:vm';

class Signals {
    handlers = [];
    connectObject(signal, callback, owner) {
        this.handlers.push({signal, callback, owner});
    }
    disconnectObject(owner) {
        this.handlers = this.handlers.filter(handler => handler.owner !== owner);
    }
    emit(signal, ...args) {
        for (const handler of [...this.handlers]) {
            if (handler.signal === signal)
                handler.callback(this, ...args);
        }
    }
}

function load(name, context, binding) {
    const source = readFileSync(new URL(`../src/${name}.js`, import.meta.url), 'utf8')
        .replace(/^import .*;\n/gm, '')
        .replace(/^export (?:default )?/gm, '');
    return vm.runInContext(`${source}\n${binding};`, context);
}

function setup({active = true, multiMonitor = true, standalone = false} = {}) {
    const settings = new Signals();
    settings.get_boolean = key => ({
        'multi-monitor': multiMonitor,
        'dash-to-panel-standalone': standalone,
        'show-activities-button': false,
    })[key] ?? false;
    const extensionManager = new Signals();
    extensionManager.lookup = uuid => ({uuid, state: active ? 1 : 0});
    const makePanel = () => Object.assign(new Signals(), {
        statusArea: {activities: {visible: true}},
        addToStatusArea(name, button) { this.statusArea[name] = button; },
    });
    const mainPanel = makePanel();
    const global = Object.assign(new Signals(), {dashToPanel: new Signals()});
    const layoutManager = Object.assign(new Signals(), {
        panelBox: {}, primaryMonitor: {index: 0},
    });
    const resources = {buttons: 0, keybinders: 0, services: 0};
    class MenuButton {
        constructor() { resources.buttons++; }
        initiate() { this.ready = true; }
        toggleMenu() {
            assert.equal(this.ready, true);
            this.toggles = (this.toggles ?? 0) + 1;
        }
        closeContextMenu() {}
        destroy() { resources.buttons--; }
    }
    class Keybinder extends Signals {
        constructor() { super(); resources.keybinders++; }
        destroy() { resources.keybinders--; }
    }
    const inputSourceProto = {_getCurrentWindow() {}};
    const context = vm.createContext({
        console, global, MenuButton, Keybinder,
        InputSourceManager: {prototype: inputSourceProto},
        Gio: {Resource: {load() {}}, resources_register() {}, resources_unregister() {}},
        Config: {PACKAGE_VERSION: '50'},
        Extension: class {getSettings() { return settings; }},
        Main: {panel: mainPanel, layoutManager, extensionManager},
        Constants: {DASH_TO_PANEL_UUID: 'dtp', AZTASKBAR_UUID: 'az'},
        Utils: {
            ExtensionState: {ACTIVE: 1},
            Debouncer: class {destroy() {}},
            DBusService: class {
                constructor() { resources.services++; }
                destroy() { resources.services--; }
            },
        },
        SearchProviderEmitter: class {destroy() {}},
        UpdateNotification: class {destroy() {}},
        CustomStylesheet: class {destroy() {}},
    });
    const Manager = load('arcmenuManager', context, 'ArcMenuManager');
    context.ArcMenuManager = Manager;
    const Controller = load('menuController', context, 'MenuController');
    context.MenuController = Controller;
    // These methods depend on widget styling and desktop services, unrelated to
    // panel selection. Keep lifecycle, button insertion, and cleanup real.
    for (const method of ['_setButtonAppearance', '_setButtonText', '_setButtonIcon',
        '_setButtonIconSize', '_setButtonIconPadding', 'connectSettingsEvents',
        '_initRecentAppsTracker'])
        Controller.prototype[method] = () => {};
    context.Shell = {AppSystem: {get_default: () => new Signals()}};
    Controller.prototype._getMenuPosition = () => [0, 'left'];
    Controller.prototype._inputSourceManagerOverride = function () {
        this._inputSourceManagerProto = inputSourceProto;
        this._origGetCurrentWindow = inputSourceProto._getCurrentWindow;
        inputSourceProto._getCurrentWindow = () => this;
    };
    const originalInputSource = inputSourceProto._getCurrentWindow;
    const ArcMenu = load('extension', context, 'ArcMenu');
    const extension = new ArcMenu();
    // Only Dash to Panel is active in these scenarios.
    extensionManager.lookup = uuid => ({uuid, state: uuid === 'dtp' && active ? 1 : 0});
    const wrapper = index => ({
        panel: makePanel(), panelBox: {}, monitor: {index},
        isPrimary: index === 0, isStandalone: standalone,
    });
    return {extension, global, resources, wrapper, mainPanel, extensionManager, layoutManager,
        Controller, inputSourceProto, originalInputSource};
}

for (const missingPanels of [undefined, [], [null, {}]]) {
    test(`delayed panels (${JSON.stringify(missingPanels)}) recover through panels-created`, () => {
        const s = setup();
        s.global.dashToPanel.panels = missingPanels;
        s.extension.enable();
        assert.equal(s.extension.menuControllers.length, 0);
        assert.deepEqual(s.resources, {buttons: 0, keybinders: 0, services: 0});
        const panels = [s.wrapper(0), s.wrapper(1)];
        s.global.dashToPanel.panels = panels;
        s.global.dashToPanel.emit('panels-created');
        assert.equal(s.extension.menuControllers.length, 2);
        assert.equal(s.extension.menuControllers[1].panel, panels[1].panel);
        assert.equal(s.resources.keybinders, 1);
        s.layoutManager.currentMonitor = panels[1].monitor;
        s.extension.menuControllers[0]._keybinder.toggleArcMenu();
        assert.equal(s.extension.menuControllers[1].menuButton.toggles, 1);
        // Removing a secondary monitor must preserve the first panel's toggle.
        panels[1].panel.emit('destroy');
        assert.equal(typeof s.global.toggleArcMenu, 'function');
        s.extension.disable();
        assert.deepEqual(s.resources, {buttons: 0, keybinders: 0, services: 0});
        assert.equal(s.global.toggleArcMenu, undefined);
        assert.equal(s.inputSourceProto._getCurrentWindow, s.originalInputSource);
    });
}

test('ArcMenu enabled first switches from stock panel when Dash to Panel activates', () => {
    const s = setup({active: false});
    s.extension.enable();
    assert.equal(s.extension.menuControllers[0].panel, s.mainPanel);
    s.extensionManager.emit('extension-state-changed', {uuid: 'dtp', state: 1});
    assert.equal(s.extension.menuControllers.length, 0);
    s.global.dashToPanel.panels = [s.wrapper(0)];
    s.global.dashToPanel.emit('panels-created');
    s.global.toggleArcMenu();
    s.extension.disable();
    assert.deepEqual(s.resources, {buttons: 0, keybinders: 0, services: 0});
});

test('ready panels respect single-monitor and primary standalone settings', () => {
    const s = setup({multiMonitor: false, standalone: true});
    s.global.dashToPanel.panels = [s.wrapper(0), s.wrapper(1)];
    s.extension.enable();
    assert.equal(s.extension.menuControllers.length, 1);
    assert.equal(s.extension.menuControllers[0].panel, s.mainPanel);
    s.extension.disable();
});

test('disable before panels are created disconnects pending integration', () => {
    const s = setup();
    s.extension.enable();
    s.extension.disable();
    s.global.dashToPanel.panels = [s.wrapper(0)];
    s.global.dashToPanel.emit('panels-created');
    assert.deepEqual(s.resources, {buttons: 0, keybinders: 0, services: 0});
});

for (const stage of ['_configureActivitiesButton', 'enableButton', 'connectSettingsEvents']) {
    for (const failFirst of [true, false]) {
        test(`initialization failure in ${stage} (first=${failFirst}) rolls back all controllers`, () => {
            const s = setup();
            s.global.dashToPanel.panels = [s.wrapper(0), s.wrapper(1)];
            const original = s.Controller.prototype[stage];
            s.Controller.prototype[stage] = function () {
                if (this.isFirstPanel === failFirst)
                    throw new Error('injected failure');
                return original.call(this);
            };
            assert.throws(() => s.extension.enable(), /injected failure/);
            assert.equal(s.extension.menuControllers.length, 0);
            assert.deepEqual(s.resources, {buttons: 0, keybinders: 0, services: 0});
            assert.equal(s.global.toggleArcMenu, undefined);
            assert.equal(s.inputSourceProto._getCurrentWindow, s.originalInputSource);
            s.extension.disable();
        });
    }
}
