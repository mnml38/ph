(function () {
    'use strict';

    var PLUGIN_KEY = 'pornhub_lampa_viewer';
    var AGE_KEY = 'pornhub_lampa_age_confirmed';
    var VERSION = '1.0.0';
    var DOMAIN = 'www.pornhub.com';

    function text(value) {
        return String(value || '').replace(/^\s+|\s+$/g, '');
    }

    function siteUrl(path) {
        return 'https://' + DOMAIN + path;
    }

    function notify(message) {
        if (Lampa.Noty && Lampa.Noty.show) {
            Lampa.Noty.show(message);
        }
    }

    function openExternal(url) {
        try {
            if (typeof Android !== 'undefined' && Android && typeof Android.openLink === 'function') {
                Android.openLink(url);
                return;
            }
        } catch (error) {
            console.warn('[Pornhub Lampa] Android.openLink failed', error);
        }

        try {
            var popup = window.open(url, '_blank');
            if (popup) return;
        } catch (error2) {
            console.warn('[Pornhub Lampa] window.open failed', error2);
        }

        window.location.href = url;
    }

    function isAgeConfirmed() {
        return Lampa.Storage && Lampa.Storage.get(AGE_KEY, '') === '1';
    }

    function confirmAge(callback) {
        if (isAgeConfirmed()) {
            callback();
            return;
        }

        Lampa.Select.show({
            title: 'Контент 18+',
            items: [
                { title: 'Мне уже есть 18 лет', confirm: true },
                { title: 'Отмена' }
            ],
            onSelect: function (item) {
                if (!item.confirm) return;

                Lampa.Storage.set(AGE_KEY, '1');
                callback();
            },
            onBack: function () {
                Lampa.Controller.toggle('content');
            }
        });
    }

    function openSearch() {
        confirmAge(function () {
            Lampa.Input.edit({
                title: 'Поиск на Pornhub',
                value: '',
                free: true,
                nosave: true
            }, function (query) {
                query = text(query);
                if (!query) return;

                openExternal(siteUrl('/video/search?search=' + encodeURIComponent(query)));
            });
        });
    }

    function openVideoByLink() {
        confirmAge(function () {
            Lampa.Input.edit({
                title: 'Ссылка на ролик Pornhub',
                value: siteUrl('/view_video.php?viewkey='),
                free: true,
                nosave: true
            }, function (value) {
                var url = text(value);
                var allowed = /^https?:\/\/(?:[a-z0-9-]+\.)?pornhub\.com\/(?:view_video\.php\?viewkey=|embed\/|video\/show\?viewkey=)[^\s#]+$/i;

                if (!allowed.test(url)) {
                    notify('Нужна ссылка на ролик Pornhub с viewkey.');
                    return;
                }

                openExternal(url);
            });
        });
    }

    function openSite() {
        confirmAge(function () {
            openExternal(siteUrl('/'));
        });
    }

    function resetAgeConfirmation() {
        Lampa.Storage.set(AGE_KEY, '');
        notify('Подтверждение 18+ сброшено.');
    }

    function showMenu() {
        Lampa.Select.show({
            title: 'Pornhub',
            items: [
                { title: 'Поиск по сайту', action: openSearch },
                { title: 'Открыть ролик по ссылке', action: openVideoByLink },
                { title: 'Открыть главную страницу', action: openSite },
                { title: 'Сбросить подтверждение 18+', action: resetAgeConfirmation }
            ],
            onSelect: function (item) {
                if (item.action) item.action();
            },
            onBack: function () {
                Lampa.Controller.toggle('menu');
            }
        });
    }

    function addMenuButton() {
        if (!Lampa.Menu || typeof Lampa.Menu.addButton !== 'function') return;
        if (document.querySelector('.lampa-pornhub-menu-button')) return;

        var icon = '<svg class="lampa-pornhub-menu-button" width="36" height="36" viewBox="0 0 36 36" aria-hidden="true">' +
            '<circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" stroke-width="2"/>' +
            '<path d="M14 12.5v11l10-5.5z" fill="currentColor"/>' +
            '</svg>';

        Lampa.Menu.addButton(icon, 'Pornhub 18+', showMenu);
    }

    function startPlugin() {
        if (window[PLUGIN_KEY]) return;
        window[PLUGIN_KEY] = true;

        if (Lampa.Manifest) {
            Lampa.Manifest.plugins = {
                type: 'video',
                version: VERSION,
                name: 'Pornhub Viewer',
                description: 'Открывает официальный сайт Pornhub из меню Lampa для пользователей 18+.'
            };
        }

        addMenuButton();
    }

    if (window.appready) {
        startPlugin();
    } else if (window.Lampa && Lampa.Listener) {
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready') startPlugin();
        });
    }
}());
