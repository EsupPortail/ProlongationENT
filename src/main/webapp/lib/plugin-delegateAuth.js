(function () {   
    var plugin = {
        onNotLogged: function() {
            if (args.delegateAuth) {
                var url = (args.esupUserApps_url || pE.CONF.esupUserApps_url) + (args.mfa ? "/login-mfa" : "/login") + "?target=" + encodeURIComponent(document.location.href);
                document.location.href = url;
            }
        },
    };
    pE.plugins.push(plugin);   
})();
