(function () {
    
    var menus = ['pE-buttons', 'pE-account'];
    function toggleMenu(id, id2) {
        var isOpen = h.toggleClass(document.getElementById(id), 'pE-menu-is-open');
        if (id2) h.toggleClass(document.getElementById(id2), 'pE-menu-is-open');

        // close other menus
        h.simpleEach(menus, function (otherId) {
            if (id !== otherId) h.removeClass(document.getElementById(otherId), 'pE-menu-is-open');
        });
        
        if (isOpen) {
            var close = function() {
                h.removeClass(document.getElementById(id), 'pE-menu-is-open');
                if (id2) h.removeClass(document.getElementById(id2), 'pE-menu-is-open');
                document.removeEventListener("click", close, false);
            };
            setTimeout(function () { document.addEventListener("click", close, false); }, 0);
        }
        return false;
    }

    function moreButtons_toggleMenu() {
        return toggleMenu('pE-buttons', 'pE-openMoreButtons');
    }

    function account_toggleMenu() {
        return toggleMenu('pE-account', 'pE-photo');
    }

    function set_css_variables(is_minimal) {
        document.documentElement.style.setProperty('--pE-header-height', is_minimal ? '7px' : '80px');
        document.documentElement.style.setProperty('--pE-header-bottom-margin', is_minimal ? '0px' : '10px');
    }
    function toggle_minimal_header(div, opts) {
        var is_minimal = h.toggleClass(div, 'pE-is-minimal')
        set_css_variables(is_minimal)
        div.classList.toggle('pE-is-minimal-ignore-hover', is_minimal)
        if (opts.save) pE.localStorageSet("minimal", is_minimal || '')

        if (is_minimal) {
            setTimeout(function () { div.classList.remove('pE-is-minimal-ignore-hover') }, 400) // cf CSS transition
        }
    }
    function install_minimal_header(enabled) {
        var button = document.getElementById('pE-toggle-minimal-header');
        var div = document.getElementById('pE-minimal-header');
        if (!button || !div) return;
        if (enabled) {
            button.onclick = function () { toggle_minimal_header(div, { save: true }) };
        } else {
            button.classList.add('pE-hide');
        }
        var state = pE.localStorageGet('minimal')
        if (enabled && (args.hide_menu ? state !== '' : state === 'true')) {
           toggle_minimal_header(div, {});
        }
    }
    // must be done ASAP for applications which rely on those variables on startup (before "layout" is loaded and pE computed/displayed)
    // (example : horde/imp)
    set_css_variables(false);

    function display_alert() {
        var alerts_url = 'https://ent-test.univ-paris1.fr/alertes/#app=' + pE.currentApp.fname; // pass the current app for alerts with "showIfCurrentAppIs" attr
        h.set_div_innerHTML('pE-alert-modal', '<iframe src="' + alerts_url + '"></iframe>');

        window.addEventListener("message", function (event) {
            var data = event.data || '';
            if (data.match(/ProlongationENT:alert:close/)) {
                const elt = document.getElementById('pE-alert-modal');
                elt.parentElement.removeChild(elt);
            }
        }, false);

    }

    function validAlerts() {
        return h.simpleFilter(Object.keys(pE.validApps), function (fname) { return !!fname.match(/^alert_/) });
    }

    pE['onRestdbAlerts'] = function (db) {
        var unseen = h.simpleFilter(validAlerts(), function (fname) {
            return !(db[fname] && db[fname].hide);
        });
        if (unseen.length > 0) display_alert();
    };

    function may_display_alert() {
        var restdb_url = 'https://restdb-test.univ-paris1.fr/';
        h.loadScript(restdb_url + 'alerts/msgs_info/$user', [ 'callback=window.prolongation_ENT.onRestdbAlerts' ]);
    }
    
    function themeUrl() {
        return pE.CONF.prolongationENT_url + "/" + pE.CONF.theme;
    }

    function computeLink(app) {
        // for uportal4 layout compatibility:
        if (!app.url.match(/^http/)) app.url = pE.CONF.uportal_base_url + app.url.replace(/\/detached\//, "/max/");
        
        var url = app.url;
        var classes = ['pE-button'];
        if (pE.canImpersonateAppIds) {
            url = pE.relogUrl(app);
        }
        var a = "<a title='" + h.escapeQuotes(app.description || app.title) + "' href='" + url + "' data-fname='" + app.fname + "'" + (app.openInNewTab ? " target='_blank'" : '') + " tabindex='-1'>" +
            "<img class='icon' alt='' src='" + themeUrl() + "/icon/" + app.fname + ".svg'><br>" +
          h.escapeQuotes(app.shortText || app.text || app.title) + "</a>";
        return "<div class='" + classes.join(' ') + "'>" + a + "</div>";
    }

    // in our Agimus, we simplify the fnames, we must handle this
    function simplifyFname(k) {
        k = k.replace(/^C([A-Z][a-z])/, "$1").replace(/-(etu|ens|gest|pers|teacher|staff|default)$/, '');
        return k.toLowerCase();
    }
    
    function computeMenu(currentApp) {
        // we must normalize
        var validApps = {};
        var positionedApps = [];
        h.simpleEachObject(pE.validApps, function (k, app) { 
            if (app.menuEntryTitle !== "__hidden__") {
                validApps[simplifyFname(k)] = app;
                if (app.position) positionedApps[app.position] = k;
            }
        });

        var list = [];
        var pos = 1;
        function mayAddPositionedApp() {
            var fname = positionedApps[pos];
            if (fname) addFname(fname);
        }
        function addFname(fname, no_favorites) {
            fname = simplifyFname(fname);
            var app = validApps[fname];
            delete validApps[fname];
            if (app) {
                list.push(computeLink(app));
                if (!no_favorites) {
                    pos++;
                    mayAddPositionedApp();
                }
            }
        }
        h.simpleEach(pE.DATA.favorites || [], function (fname) { addFname(fname, true) });
        mayAddPositionedApp();
        h.simpleEach(pE.DATA.topApps || Object.keys(pE.validApps), addFname);
        return list;
    }
 
    function computeHeader() {
        var app = pE.currentApp;
        var appLinks = computeMenu(app);
        var topApps = appLinks.slice(0, 12).join("<!--\n-->");

        var html_elt = document.getElementsByTagName("html")[0];
        if (!args.no_footer && !args.no_sticky_footer) html_elt.classList.add('pE-sticky-footer');

        // NB: to simplify, do not use browser cache for the photo if impersonated
        var photo_version = !pE.DATA.realUserId && pE.personAttr('modifyTimestamp');

        var appTitle = app.url ? "<a href='" + (args.currentApp_url || app.url) + "'><span class='pE-title-app-short'>" + 
           h.escapeQuotes(app.shortText || app.text || app.title) + "</span><h1 class='pE-title-app-long'>" +
           h.escapeQuotes(app.title) + "</h1></a>" : "Application non autorisée";
        return h.template(pE.TEMPLATES.header, {
            appTitle: appTitle + (args['title_suffix'] || ''),
            topApps: topApps,
            accueilUrl: (pE.validApps["caccueil"] || pE.validApps["accueil-federation"] || {}).url,
            photoUrl: document.location.hostname.match(/univ-paris1[.]fr$/) ? 
                "https://userphoto-test.univ-paris1.fr/?cas-test&ldap-test&uid=" + pE.DATA.user + (photo_version ? "&v=" + photo_version : '') :
                (args.layout_url ? args.layout_url.replace(/\/layout$/, '') : pE.CONF.esupUserApps_url) + "/proxyApp?id=userphoto&uid=" + encodeURIComponent(pE.DATA.user),
            themeUrl: themeUrl(),
            logout_url: pE.CONF.ent_logout_url,
            userDetails: pE.personAttr("displayName") || pE.personAttr("mail"),
            accountUrl: (pE.validApps["CCompte"] || {}).url,
            accountAnchorClass: pE.validApps["CCompte"] || pE.validApps["CCompte-pers"] || pE.validApps["CCompte-etu"] ? '' : 'pE-hide',
            pagePersoClass: pE.validApps["page-perso"] ? '' : 'pE-hide',
            impersonateClass: pE.validApps["impersonate"] || pE.canImpersonateAppIds ? '' : 'pE-hide',
        });
    }

    function innerHelp(app) {
        return "<span>Aide " + (app.shortText || app.text || app.title) + "</span> <img src='" + themeUrl() + "/help.svg'>";
    }

    function computeHelp(app) {
        if (app && app.helpUrl) {
            return "<a href='" + app.helpUrl + "' target='_blank' title=\"Voir l'aide du canal\">" + innerHelp(app) + "</a>";
        } else if (app && app.hashelp) {
            var href = "https://ent.univ-paris1.fr/assets/aide/canal/" + app.fname + ".html";
            var onclick = "window.open('','form_help','toolbar=no,location=no,directories=no,status=no,menubar=no,resizable=yes,scrollbars=yes,copyhistory=no,alwaysRaised,width=600,height=400')";
            return "<a href='" + href + "' onclick=\"" + onclick + "\" target='form_help' title=\"Voir l'aide du canal\">" + innerHelp(app) + "</a>";
        } else {
            return '';
        }
    }
    
    function computeFooter() {
        var app = pE.currentApp;
        return h.template(pE.TEMPLATES.footer, {
            themeUrl: themeUrl(),
            helpUrl: (pE.validApps['gun-etu'] || { url: "https://ent.univ-paris1.fr/gun-pers" }).url,
            appHelp: computeHelp(app),
        });
    }

    function server_log(params) {
        var l = [];
        h.simpleEachObject(params, function (k, v) {
            l.push(k + "=" + encodeURIComponent(v));
        });
        h.loadScript(pE.CONF.prolongationENT_url + "/log", l);
    }

    function log_button_click(event) {
        var container = this;
        function eltFname(elt) {
            return elt && elt.getAttribute('data-fname');
        }
        var fname = eltFname(h.eltClosest(event.target, "[data-fname]"));
        if (fname) {
            var index = 1 + h.simpleMap(container.querySelectorAll("[data-fname]"), eltFname).indexOf(fname);
            server_log({ user: pE.DATA.user, app: fname, index: index });
        }
    }
    
    var plugin = {
        main: function () {
            if (window.location.hostname === 'glpi.univ-paris1.fr') {
                var userAttrs = pE.DATA.userAttrs;
                var is_glpi_developper = userAttrs.supannAliasLogin.some(function (login) { return login === 'santerre' || login === 'pacomte' });
                var is_DSIUN_SAP = userAttrs.supannEntiteAffectation.some(function (affectation) { return affectation === 'DGHC' });
                if (!is_glpi_developper && !is_DSIUN_SAP) {
                    window.location.replace("https://glpi-front.univ-paris1.fr");
                }
            }
        },
        computeHeader: computeHeader,
        computeFooter: computeFooter,
        logout_buttons: function () { return ".pE-accountLogout"; },
        
        post_compute_currentApp: function () {      
            if (window['cssToLoadIfInsideIframe']) {
                // migrate to new syntax
                args.extra_css = window['cssToLoadIfInsideIframe'];
            }

            if (pE.currentApp.fname === "aleph") {
                delete args.logout;
                args.is_logged = { fn: function(find) { var e = find("span#meconnecter"); return e && e.innerHTML === "Consulter mon compte"; } };
            }
            if (pE.currentApp.fname === "domino") {
                args.extra_css = "https://ent.univ-paris1.fr/assets/canal/css/domino.css"; 
            }
            if (pE.currentApp.fname === "HyperPlanning-ens") {
                if (pE.currentApp.title)
                    pE.currentApp.title = "Mon emploi du temps";
            }
        }, 
        
        post_header_add: function() {
            var account = document.getElementById('pE-photo');
            if (account) account.onclick = account_toggleMenu;

            var open_menu = document.getElementById('pE-openMoreButtons');
            if (open_menu) open_menu.onclick = moreButtons_toggleMenu;

            var buttons = document.getElementById('pE-buttons');
            if (buttons) buttons.onmousedown = log_button_click;

            install_minimal_header(pE.currentApp.fname !== 'caccueil' && !document['documentMode']);

            if (validAlerts().length > 0) {
                var alert = document.getElementById('pE-alert');
                if (alert) {
                    alert.className = ''; // display it
                    alert.onclick = display_alert;
                    may_display_alert();
                }
            }

            h.simpleEach(h.simpleQuerySelectorAll('#pE-header .pE-button img'), function (elt) {
                elt['onerror'] = function () {
                    var src = this.src.replace(/[^/]*\.svg/, "default.svg");
                    if (src !== this.src) this.src = src;
                    console.log(this, this.src);
                };
            });
        },        
    };

    pE.plugins.push(plugin);
    
})();
