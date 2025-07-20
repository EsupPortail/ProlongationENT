(function () {   
    var plugin = {
        onNotLogged: function() {
            if (args.delegateAuth) {
                var url = (args.esupUserApps_url || pE.CONF.esupUserApps_url) + "/login?target=" + encodeURIComponent(document.location.href);
                document.location.href = url;
            }
        },
    };
    pE.plugins.push(plugin);   
})();
