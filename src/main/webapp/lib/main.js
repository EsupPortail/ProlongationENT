pE.main = function (DATA, PARAMS, fromLocalStorage) {

if (!DATA.user) {
    pE.callPlugins('onNotLogged');
    if (args.onNotLogged)
        args.onNotLogged(pE);
    return;
}

var CONF = pE.CONF;
pE.DATA = DATA;
pE.PARAMS = PARAMS;

pE.callPlugins('main');
    
pE.personAttr = function(attrName) {
    var v = DATA.userAttrs && DATA.userAttrs[attrName];
    return v && v[0];
};

pE.relogUrl = function(app) {
    return app.url.replace(/^(https?:\/\/[^/]*).*/, "$1") + "/EsupUserApps/redirect?relog&impersonate&id=" + app.fname;
};

function computeAllApps() {
    var m = {};
    h.simpleEach(DATA.layout.folders, function (tab) {
        h.simpleEach(tab.portlets, function (app) {
            app.menuEntryTitle = tab.title
            m[app.fname] = app;
        });
    });
    return m;
}

function computeValidApps(allApps) {
    var m = {};
    h.simpleEachObject(allApps, function (fname, app) {
        if (!app.forbidden && !app.hide) m[fname] = app;
    });
    return m;
}

function computeCanImpersonateAppIds() {
    if (DATA.canImpersonate) {
        pE.canImpersonateAppIds = h.simpleMap(DATA.canImpersonate, function (app) { return app.fname });
    }
}

function computeBestCurrentAppId() {
    var ids = args.currentAppIds || [args.current];
    if (!ids) return;
    // multi ids for this app, hopefully only one id is allowed for this user...
    // this is useful for apps appearing with different titles based on user affiliation
    ids = h.simpleFilter(ids, function (id) { return pE.allApps[id]; });
    if (ids.length > 1) {
        h.mylog("multiple appIds (" + ids + ") for this user, choosing first");
    }
    return pE.allApps[ids[0]];
}

function bandeau_div_id() {
    return args.div_id || (args.div_is_uid && DATA.user) || 'bandeau_ENT';
}

function loadSpecificCss() {
    if (args.extra_css) {
        var v = args.extra_css;
        if (typeof v === "string")
            h.loadCSS(v, null);
    }
}

function find_DOM_elt(elt_spec) {
    if (typeof elt_spec === "string") {
        return h.simpleQuerySelector(elt_spec);
    } else if (typeof elt_spec === "boolean") {
        return elt_spec;
    } else if (elt_spec.selector) {
        return h.simpleQuerySelector(elt_spec.selector);
    } else if (elt_spec.fn) {
        return elt_spec.fn(h.simpleQuerySelector);
    } else {
        h.mylog("ignoring invalid DOM elt spec " + elt_spec);
        return undefined;
    }
}

function logout_DOM_elt() {
    if (args.logout)
        return find_DOM_elt(args.logout);
}

function isLogged() {
    if (args.login)
        return !find_DOM_elt(args.login);
    return args.is_logged && find_DOM_elt(args.is_logged);
}

function simulateClickElt(elt) {
    if (elt.href && elt.getAttribute('href') !== '#' && elt.getAttribute('href') !== 'javascript:;')  // for JSF (esup-annuaire2) & zoom.us
        document.location.href = elt.href;
    else if (elt.tagName === "FORM")
        elt.submit();
    else
        elt.click();
}

function asyncLogout() {
    removeSessionStorageCache();
    if (CONF.cas_impersonate) h.removeCookie(CONF.cas_impersonate.cookie_name, CONF.cas_impersonate.cookie_domain, '/');
    if (CONF.esupUserApps_url) {
        h.loadScript(CONF.esupUserApps_url + '/logout', [ 'callback=window.prolongation_ENT.onAsyncLogout' ]);
    } else {
        pE.onAsyncLogout();
    }
    return false;
}
pE.onAsyncLogout = function() {
    var elt = logout_DOM_elt();
    if (elt) {
        simulateClickElt(elt);
    } else {
        document.location.href = args.logout_href || CONF.ent_logout_url;
    }
};
function installLogout() {
    var logout_buttons = pE.callPlugins('logout_buttons');
    h.simpleEach(h.simpleQuerySelectorAll(logout_buttons),
                 function (elt) { 
                     elt['onclick'] = asyncLogout;
                 });
}

function installFooter() {
    var id = 'bandeau_ENT_Footer';
    var elt = document.getElementById(id);
    if (!elt) {
        elt = document.createElement("div");
        elt.setAttribute("id", id);
        document.body.appendChild(elt);
    }
    elt.innerHTML = pE.callPlugins("computeFooter") || pE.TEMPLATES.footer;
}

var currentApp;
var currentAppIds_string;

var installBandeau = pE.redisplay = function () {
    h.mylog("installBandeau");
    
    var html_elt = document.getElementsByTagName("html")[0];
    html_elt.className += ' pE-' + CONF.theme;

    loadSpecificCss();
    
    if (pE.CSS) 
        h.addCSS(pE.CSS.base);
    else
        h.loadCSS(CONF.prolongationENT_url + "/" + CONF.theme + "/main.css", null);

    var bandeau_html = pE.callPlugins("computeHeader");
    h.onIdOrBody(bandeau_div_id(), function () {
        h.set_div_innerHTML(bandeau_div_id(), bandeau_html);
        
        pE.callPlugins('post_header_add');
        
        if (CONF.cas_impersonate && !args.uid) detectImpersonationPbs();
        
        h.onReady(function () {
            installLogout();
            if (!args.no_footer) installFooter();
        });
        
        if (args.quirks && h.simpleContains(args.quirks, 'window-resize'))
            setTimeout(triggerWindowResize, 0);
        
        if (args.onload) args.onload(pE);
    });
    
}

function triggerWindowResize() {
    var evt = document.createEvent('UIEvents');
    evt.initUIEvent('resize', true, false,window,0);
    window.dispatchEvent(evt);
}

function detectImpersonationPbs() {
    var want = h.getCookie(CONF.cas_impersonate.cookie_name);
    // NB: explicit check with "!=" since we do not want null !== undefined
    if (want != pE.wanted_uid && (pE.wanted_uid || h.simpleContains(pE.canImpersonateAppIds, currentApp.fname))) {
        var msg = "Vous êtes encore identifié sous l'utilisateur " + DATA.user + ". Acceptez vous de perdre la session actuelle ?";
        if (window.confirm(msg)) {
            document.location.href = pE.relogUrl(currentApp);
        }
    }
}

pE.localStorageGet = function(field) {
    try {
        return localStorage.getItem(pE.localStorage_prefix + field);
    } catch (err) {
        return null;
    }
};
pE.localStorageSet = function(field, value) {
    try {
        localStorage.setItem(pE.localStorage_prefix + field, value);
    } catch (err) {}
};
function sessionStorageGet(field) {
    try {
        return sessionStorage.getItem(pE.localStorage_prefix + field);
    } catch (err) {
        return null;
    }
}
function sessionStorageSet(field, value) {
    try {
        sessionStorage.setItem(pE.localStorage_prefix + field, value);
    } catch (err) {}
}
function setSessionStorageCache(js_text) {
    sessionStorageSet(pE.localStorage_js_text_field, js_text);
    sessionStorageSet("url", pE.CONF.prolongationENT_url);
    sessionStorageSet(currentAppIds_string + ":time", h.now());
    
    // for old Prolongation, cleanup our mess
    if (window.localStorage) {
        h.simpleEachObject(localStorage, function (field) {
            if (field.match(pE.localStorage_prefix)) localStorage.removeItem(field);
        });
    }
}
function removeSessionStorageCache() {
    if (window.sessionStorage) {
        h.mylog("removing cached bandeau from sessionStorage");
        sessionStorageSet(pE.localStorage_js_text_field, '');
    }
}

function detectReload($time) {
    var $prev = sessionStorageGet('detectReload');
    if ($prev && $prev != $time) {
        h.mylog("reload detected, updating bandeau softly");
        loadBandeauJs([]);
    }
    sessionStorageSet('detectReload', $time);
}

function mayUpdate() {
    if (!fromLocalStorage) {
        if (window.sessionStorage) {
            h.mylog("caching bandeau in sessionStorage (" + pE.localStorage_prefix + " " + pE.localStorage_js_text_field + ")");
            var js_text =
                "window.prolongation_ENT.main(\n" + h.toJSON(DATA) + ",\n\n" + h.toJSON(pE.PARAMS) + "\n\n, true);\n";
            setSessionStorageCache(js_text);
        }
        if (PARAMS && PARAMS.is_old) {
            h.mylog("server said bandeau is old, forcing full bandeau update");
            loadBandeauJs(['noCache=1']);
        }
    } else {
        var known_last_update = h.getCookie("pE_last_update_time"); // cookie on domain telling some information has been modified (eg: favorites)
        var cache_time = parseInt(sessionStorageGet(currentAppIds_string + ":time"));
        var age = h.now() - cache_time;
        if (!cache_time ||
            age > CONF.time_before_checking_browser_cache_is_up_to_date || known_last_update && cache_time < parseInt(known_last_update)) {
            h.mylog((cache_time ? "cached bandeau is old (" + age + "s)" : "cached bandeau seems to be for a different app") + ", updating it softly");
            sessionStorageSet(currentAppIds_string + ":time", h.now()); // the new bandeau will update "time", but only if bandeau has changed!
            loadBandeauJs([]);
        } else if (CONF.esupUserApps_url) {
            // if user used "reload", the cached version of detectReload will change
            pE.detectReload = detectReload;
            h.loadScript(CONF.esupUserApps_url + "/detectReload");
        }
    }
}

pE.allApps = computeAllApps();
pE.validApps = computeValidApps(pE.allApps);
computeCanImpersonateAppIds();
currentApp = pE.currentApp = computeBestCurrentAppId() || {};
currentAppIds_string = (args.currentAppIds || [args.current]).join(",");

if (!args.is_logged)
args.is_logged = args.logout;

pE.callPlugins('post_compute_currentApp');

if (fromLocalStorage && pE.CONF.prolongationENT_url !== sessionStorageGet('url')) {
    h.mylog("not using bandeau from sessionStorage which was computed for " + sessionStorageGet('url') + " whereas " + pE.CONF.prolongationENT_url + " is wanted");
    return "invalid";
} else if ((args.is_logged || args.login) && !isLogged()) {
    h.onReady(function () {
        if (isLogged()) installBandeau();
        mayUpdate();
    });
} else {
    installBandeau();
    mayUpdate();
}

// things seem ok, cached js_text can be kept
return "OK";

};
