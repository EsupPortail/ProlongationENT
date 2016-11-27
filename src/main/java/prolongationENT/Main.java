package prolongationENT;

import java.io.IOException;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;

import org.apache.commons.logging.LogFactory;

import static prolongationENT.Utils.*;

@SuppressWarnings("serial")
public class Main extends HttpServlet {           
    Conf.Main conf = null;
    LoaderJs loaderJs;
    
    org.apache.commons.logging.Log log = LogFactory.getLog(Main.class);

    static String[] mappings = new String[] {
        "/loader.js", "/purgeCache", "/log",
    };
    
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        if (conf == null || conf.disableServerCache) initConf(request);
        switch (request.getServletPath()) {
            case "/loader.js":      loader_js     (request, response); break;
            case "/purgeCache":     purgeCache    (request, response); break;
            case "/log":            /* nothing to do */                break;
        }
    }
    
    void loader_js(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        loaderJs.loader_js(request, response);
    }
    
    void purgeCache(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        log.warn("purging cache");
        initConf(request);
    }
    
    synchronized void initConf(HttpServletRequest request) {
        ServletContext sc = request.getServletContext();
        conf = getConf(sc);
        loaderJs = new LoaderJs(request, conf);
    }   

    static Conf.Main getConf(ServletContext sc) {
        Gson gson = new Gson();
        Conf.Main conf = gson.fromJson(getConf(sc, "config.json", true), Conf.Main.class);
        conf.init();
        return conf;
    }

    static String getConf(ServletContext sc, String jsonFile, boolean mustExist) {
        String s = file_get_contents(sc, "WEB-INF/" + jsonFile, mustExist);
        if (s == null) return "{}"; // do not fail here, checks are done on required attrs
        // allow trailing commas
        s = s.replaceAll(",(\\s*[\\]}])", "$1");
        return s;
    }
        
}

