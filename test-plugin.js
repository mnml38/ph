/* Минимальная smoke-проверка синтаксиса и загрузки плагина в мок-окружении. */
var fs = require('fs');
var vm = require('vm');

var source = fs.readFileSync(__dirname + '/pornhub-viewer.js', 'utf8');
var listeners = {};
var context = {
    console: console,
    setTimeout: setTimeout,
    window: { appready: true, open: function () { return {}; }, location: {} },
    document: { querySelector: function () { return null; } },
    Lampa: {
        Manifest: {},
        Listener: { follow: function (name, fn) { listeners[name] = fn; } },
        Menu: { addButton: function () {} },
        Storage: { get: function () { return ''; }, set: function () {} },
        Noty: { show: function () {} },
        Select: { show: function () {} },
        Input: { edit: function () {} },
        Controller: { toggle: function () {} }
    }
};

vm.runInNewContext(source, context, { filename: 'pornhub-viewer.js' });

if (!context.window.pornhub_lampa_viewer) {
    throw new Error('Plugin did not initialize');
}

console.log('pornhub-viewer smoke test: OK');
