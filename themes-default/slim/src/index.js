import $ from 'jquery';
import Vue from 'vue';
import Vuex from 'vuex';
import VueMeta from 'vue-meta';
import VueRouter from 'vue-router';
import VueNativeSock from 'vue-native-websocket';
import AsyncComputed from 'vue-async-computed';
import ToggleButton from 'vue-js-toggle-button';
import Snotify from 'vue-snotify';
import domready from 'domready';
import axios from 'axios';
import store from './store';
import router from './router';
import { apiRoute, apiv1, api, webRoot, apiKey } from './api';
import { Asset, Backstretch, DisplayShow, PlotInfo, ShowSelector, ScrollButtons, FileBrowser, NamePattern, AppHeader, AppLink, SelectList, LanguageSelect, RootDirs } from './components';

if (window) {
    // Adding libs to window so mako files can use them
    window.Vue = Vue;
    window.Vuex = Vuex;
    window.VueMeta = VueMeta;
    window.VueRouter = VueRouter;
    window.VueNativeSock = VueNativeSock;
    window.AsyncComputed = AsyncComputed;
    window.ToggleButton = ToggleButton;
    window.Snotify = Snotify;
    window.axios = axios;
    window.store = store;
    window.router = router;
    window.apiRoute = apiRoute;
    window.apiv1 = apiv1;
    window.api = api;

    window.MEDUSA = {
        common: {},
        config: {},
        home: {},
        manage: {},
        history: {},
        errorlogs: {},
        schedule: {},
        addShows: {}
    };
    window.webRoot = webRoot;
    window.apiKey = apiKey;
    window.apiRoot = webRoot + '/api/v2/';

    // Push pages that load via a vue file but still use `el` for mounting
    window.components = [];
    window.components.push(AppHeader);
    window.components.push(AppLink);
    window.components.push(Asset);
    window.components.push(Backstretch);
    window.components.push(DisplayShow);
    window.components.push(FileBrowser);
    window.components.push(LanguageSelect);
    window.components.push(NamePattern);
    window.components.push(PlotInfo);
    window.components.push(RootDirs);
    window.components.push(ScrollButtons);
    window.components.push(SelectList);
    window.components.push(ShowSelector);
}
const UTIL = {
    exec(controller, action) {
        const { MEDUSA } = window;
        const ns = MEDUSA;
        action = (action === undefined) ? 'init' : action;

        if (controller !== '' && ns[controller] && typeof ns[controller][action] === 'function') {
            ns[controller][action]();
        }
    },
    init() {
        if (typeof startVue === 'function') { // eslint-disable-line no-undef
            startVue(); // eslint-disable-line no-undef
        } else {
            $('[v-cloak]').removeAttr('v-cloak');
        }

        const { body } = document;
        [...$('[asset]')].forEach(element => {
            const asset = element.getAttribute('asset');
            const series = element.getAttribute('series');
            const path = webRoot + '/api/v2/series/' + series + '/asset/' + asset + '?api_key=' + apiKey;

            if (element.tagName.toLowerCase() === 'img') {
                const defaultPath = element.getAttribute('src');

                if (element.getAttribute('lazy') === 'on') {
                    element.setAttribute('data-original', path);
                } else {
                    element.setAttribute('src', path);
                }
                element.setAttribute('onerror', 'this.src = "' + defaultPath + '"; return false;');
            }
            if (element.tagName.toLowerCase() === 'a') {
                element.setAttribute('href', path);
            }
        });
        const controller = body.getAttribute('data-controller');
        const action = body.getAttribute('data-action');

        UTIL.exec('common'); // Load common
        UTIL.exec(controller); // Load MEDUSA[controller]
        UTIL.exec(controller, action); // Load MEDUSA[controller][action]

        window.dispatchEvent(new Event('medusa-loaded'));
    }
};

if (!document.location.pathname.includes('/login')) {
    api.get('config/main').then(response => {
        const { MEDUSA } = window;
        // @TODO: Remove this hack
        MEDUSA.config = Object.assign(MEDUSA.config, response.data);

        MEDUSA.config.themeSpinner = MEDUSA.config.themeName === 'dark' ? '-dark' : '';
        MEDUSA.config.loading = '<img src="images/loading16' + MEDUSA.config.themeSpinner + '.gif" height="16" width="16" />';

        domready(UTIL.init);

        MEDUSA.config.indexers.indexerIdToName = indexerId => {
            if (!indexerId) {
                return '';
            }
            return Object.keys(MEDUSA.config.indexers.config.indexers).filter(indexer => { // eslint-disable-line array-callback-return
                if (MEDUSA.config.indexers.config.indexers[indexer].id === parseInt(indexerId, 10)) {
                    return MEDUSA.config.indexers.config.indexers[indexer].name;
                }
            })[0];
        };

        MEDUSA.config.indexers.nameToIndexerId = name => {
            if (!name) {
                return '';
            }
            return MEDUSA.config.indexers.config.indexers[name];
        };
    }).catch(error => {
        console.debug(error);
        alert('Unable to connect to Medusa!'); // eslint-disable-line no-alert
    });
}

