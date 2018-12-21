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

    function display_alert() {
        var alerts_url = 'https://ent-test.univ-paris1.fr/alertes/';
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
            if (!h.simpleContains(pE.canImpersonateAppIds, app.fname)) {
                classes.push('pE-button-forbidden');
            }
        }
        var a = "<a title='" + h.escapeQuotes(app.description) + "' href='" + url + "' data-fname='" + app.fname + "' tabindex='-1'>" +
            "<img class='icon' alt='' src='" + themeUrl() + "/icon/" + simplifyFname(app.fname) + ".svg'><br>" +
          h.escapeQuotes(app.shortText || app.text || app.title) + "</a>";
        return "<div class='" + classes.join(' ') + "'>" + a + "</div>";
    }

    // in our Agimus, we simplify the fnames, we must handle this
    function simplifyFname(k) {
        k = k.replace(/^C([A-Z])/, "$1").replace(/-(etu|ens|gest|pers|teacher|default)$/, '');
        return k.toLowerCase();
    }
    
    function computeMenu(currentApp) {
        // we must normalize
        var validApps = {};
        var positionedApps = [];
        h.simpleEachObject(pE.validApps, function (k, app) { 
            validApps[simplifyFname(k)] = app;
            if (app.position) positionedApps[app.position] = k;
        });

        var list = [];
        var pos = 1;
        function mayAddPositionedApp() {
            var fname = positionedApps[pos];
            if (fname) addFname(fname);
        }
        function addFname(fname) {
            fname = simplifyFname(fname);
            var app = validApps[fname];
            delete validApps[fname];
            if (app) {
                list.push(computeLink(app));
                pos++;
                mayAddPositionedApp();
            }
        }
        mayAddPositionedApp();
        h.simpleEach(pE.DATA.topApps || Object.keys(pE.validApps), addFname);
        return list;
    }
 
    function computeHeader() {
        var app = pE.currentApp;
        var appLinks = computeMenu(app);
        var topApps = appLinks.slice(0, pE.canImpersonateAppIds ? 99 : 12).join("<!--\n-->");

        var html_elt = document.getElementsByTagName("html")[0];
        if (!args.no_footer && !args.no_sticky_footer) html_elt.classList.add('pE-sticky-footer');

        // NB: to simplify, do not use browser cache for the photo if impersonated
        var photo_version = !pE.DATA.realUserId && pE.personAttr('modifyTimestamp');

        var appTitle = app.url ? "<a href='" + app.url + "'><span class='pE-title-app-short'>" + 
           h.escapeQuotes(app.shortText || app.text || app.title) + "</span><h1 class='pE-title-app-long'>" +
           h.escapeQuotes(app.title) + "</h1></a>" : "Application non autorisée";
        return h.template(pE.TEMPLATES.header, {
            appTitle: appTitle,
            topApps: topApps,
            accueilUrl: (pE.validApps["caccueil"] || pE.validApps["accueil-federation"] || {}).url,
            photoUrl: "https://userphoto-test.univ-paris1.fr/?cas-test&ldap-test&uid=" + pE.DATA.user + (photo_version ? "&v=" + photo_version : ''),
            themeUrl: themeUrl(),
            logout_url: pE.CONF.ent_logout_url,
            userDetails: pE.personAttr("displayName") || pE.personAttr("mail"),
            accountAnchorClass: pE.validApps["CCompte"] || pE.validApps["CCompte-pers"] || pE.validApps["CCompte-etu"] ? '' : 'pE-hide',
            pagePersoClass: pE.validApps["page-perso"] ? '' : 'pE-hide',
            impersonateClass: pE.validApps["impersonate"] || pE.canImpersonateAppIds ? '' : 'pE-hide',
        });
    }

    function computeHelp(app) {
        if (app && app.hashelp) {
            var href = "https://ent.univ-paris1.fr/assets/aide/canal/" + app.fname + ".html";
            var onclick = "window.open('','form_help','toolbar=no,location=no,directories=no,status=no,menubar=no,resizable=yes,scrollbars=yes,copyhistory=no,alwaysRaised,width=600,height=400')";
            var inner = "<span>Aide " + (app.shortText || app.text || app.title) + "</span> <img src='" + themeUrl() + "/help.svg'>";
            return "<a href='" + href + "' onclick=\"" + onclick + "\" target='form_help' title=\"Voir l'aide du canal\">" + inner + "</a>";
        } else {
            return '';
        }
    }
    
    function computeFooter() {
        var app = pE.currentApp;
        return h.template(pE.TEMPLATES.footer, {
            themeUrl: themeUrl(),
            helpUrl: (pE.validApps['gun-etu'] || { url: "https://ent.univ-paris1.fr/gun-pers-flipbook" }).url,
            tchat: pE.callPlugins("computeFooterTchat") || '',
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
