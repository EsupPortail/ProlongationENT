(function () {   
    var plugin = {
        onNotLogged: function() {
            if (args.delegateAuth) {
                var url = pE.CONF.prolongationENT_url + "/login?target=" + encodeURIComponent(document.location.href);
                document.location.href = pE.CONF.cas_login_url + "?service=" + encodeURIComponent(url);
            }
        },
    };
    pE.plugins.push(plugin);   
})();
