package prolongationENT;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

class Conf {

static class Main {
    String cas_base_url;
    String prolongationENT_url;
    String esupUserApps_url;
    String uportal_base_url;
    String layout_url;
    String theme = "theme-simple";
    List<String> plugins = new ArrayList<>();

    static class Themes {
        static class Alternatives {
            Set<String> list;
            String cookieName = "ProlongationENT_theme";
        }
        Alternatives alternatives;
    }
    Themes themes = new Themes();

    int time_before_checking_browser_cache_is_up_to_date = 60;

    static class Cas_impersonate {
        String cookie_name;
        String cookie_domain;
    };
    Cas_impersonate cas_impersonate;
    
    boolean disableLocalStorage;
    boolean disableServerCache;
    boolean disableCSSInlining;

    // below have valid default values
    String cas_login_url;
    String cas_logout_url;
    String ent_logout_url;

    Conf.Main init() {
        if (cas_base_url == null) throw new RuntimeException("config.json must set cas_base_url");
        if (cas_login_url == null) cas_login_url = cas_base_url + "/login";
        if (cas_logout_url == null) cas_logout_url = cas_base_url + "/logout";
        if (layout_url == null) layout_url = esupUserApps_url + "/layout";
        if (ent_logout_url == null) ent_logout_url = Utils.via_CAS(cas_logout_url, uportal_base_url + "/Logout"); // nb: esup logout may not logout of CAS if user was not logged in esup portail, so forcing CAS logout in case
        return this;
    }
}

}
