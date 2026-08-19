/* Минимальная smoke-проверка синтаксиса и загрузки плагина в мок-окружении. */
var fs = require('fs');
var vm = require('vm');

var source = fs.readFileSync(__dirname + '/pornhub-viewer.js', 'utf8');
var listeners = {};
var addButtonAttempts = 0;
var context = {
    console: console,
    setTimeout: function (callback) { callback(); return 1; },
    clearTimeout: function () {},
    window: { appready: true, open: function () { return {}; }, location: {} },
    document: { querySelector: function () { return null; } },
    Lampa: {
        Manifest: {},
        Listener: { follow: function (name, fn) { listeners[name] = fn; } },
        Menu: {
            addButton: function () {
                addButtonAttempts += 1;
                if (addButtonAttempts === 1) throw new Error('menu is still initializing');
                return { addClass: function () {} };
            }
        },
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

if (addButtonAttempts < 2) {
    throw new Error('Plugin did not retry menu initialization');
}

console.log('pornhub-viewer smoke test: OK');
