package prolongationENT;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.Filter;
import javax.servlet.FilterRegistration;
import javax.servlet.Servlet;
import javax.servlet.ServletContext;
import javax.servlet.ServletRegistration;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

class Utils {
    
    static <V> MapBuilder<V> asMap(String key, V value) {
        return new MapBuilder<V>().add(key, value);
    }

    @SuppressWarnings("serial")
    static class MapBuilder<V> extends HashMap<String, V> {
        MapBuilder<V> add(String key, V value) {
            this.put(key, value);
            return this;
        }
    }

    private static Logger log() {
        return log(Utils.class);
    }
    
    static Logger log(Class<?> clazz) {
        return LoggerFactory.getLogger(clazz);
    }
    
    static String via_CAS(String cas_login_url, String href) {
        return cas_login_url + "?service="  + urlencode(href);
    }
    
    static String urlencode(String s) {
        try {
            return java.net.URLEncoder.encode(s, "UTF-8");
        }
        catch (java.io.UnsupportedEncodingException uee) {
            return s;
        }
    }

    static String urldecode(String s) {
        try {
            return java.net.URLDecoder.decode(s, "UTF-8");
        }
        catch (java.io.UnsupportedEncodingException uee) {
            return s;
        }
    }
  
    static String json_encode(Object o) {
        Gson gson = new GsonBuilder().disableHtmlEscaping().create();
        return gson.toJson(o);
    }

    private static final char[] DIGITS_UPPER = { '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F' };

    static String encodeHexString(byte[] data) {
        final StringBuilder hex = new StringBuilder(2 * data.length);
        for (final byte b : data) {
            hex.append(DIGITS_UPPER[(b & 0xF0) >>> 4]);
            hex.append(DIGITS_UPPER[(b & 0x0F)]);
        }
        return hex.toString();
    }

    static String computeMD5(String s) {
        try {
            //System.out.println("computing digest of " + file);
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] digest = md.digest(s.getBytes());
            return java.util.Base64.getEncoder().encodeToString(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }

    static String file_get_contents_raw(ServletContext sc, String file) throws IOException {
        InputStream in = sc.getResourceAsStream("/" + file);
        if (in == null) throw new FileNotFoundException("error reading file " + file);
        return IOUtils.toString(in, "UTF-8");
    }

    static String file_get_contents(ServletContext sc, String file, boolean mustExist) {
        try {
            return file_get_contents_raw(sc, file);
        } catch (FileNotFoundException e) {
            if (mustExist) throw new RuntimeException(e);
            return null;
        } catch (IOException e) {
            log().error("error reading file " + file, e);
            return null;
        }
    }
    
    static String file_get_contents(HttpServletRequest request, String file) {
        return file_get_contents(request.getServletContext(), file, true);
    }

    static String file_get_contents(File file) throws IOException {
        return new String(Files.readAllBytes(file.toPath()), "UTF-8");
    }

    static void setCacheControlMaxAge(HttpServletResponse response, long cacheMaxAge) {
        if (response.getHeader("Set-Cookie") != null) {
            log().error("never set public caching if you create a session: it would cause havoc with apache reverse proxy using mod_cache without 'CacheIgnoreHeaders Set-Cookie'");
        } else {
            response.setHeader("Cache-Control", "max-age=" + cacheMaxAge);
        }
    }

    /* sendRedirect with Content-Length to allow Apache caching without modifying CacheMinFileSize */
    /* (similar to std sendRedirect with "sendRedirectBody") */
    static void sendRedirect(HttpServletResponse response, String location) throws IOException {
        response.setStatus(302);
        response.setHeader("Location", location);
        response.setContentType("text/plain");
        response.getWriter().write("Redirecting...");
    }
    
    static void respond_js(HttpServletResponse response, long cacheMaxAge, String js) throws IOException {
        setCacheControlMaxAge(response, cacheMaxAge);
        respond_js(response, js);
    }
    static void respond_js(HttpServletResponse response, String js) throws IOException {
        response.setContentType("application/javascript; charset=utf8");
        response.getWriter().write(js);
    }
    static void addFilter(ServletContext sc, String name, Class<? extends Filter> clazz, Map<String,String> params, String... urls) {
        FilterRegistration.Dynamic o = sc.addFilter(name, clazz);
        if (params != null) o.setInitParameters(params);
        o.addMappingForUrlPatterns(null, true, urls);
    }
        
    static void addServlet(ServletContext sc, String name, Class<? extends Servlet> clazz, Map<String,String> params, String... urls) {
        ServletRegistration.Dynamic o = sc.addServlet(name, clazz);
        if (params != null) o.setInitParameters(params);
        o.addMapping(urls);
    }

    private static java.lang.reflect.Field getField(Class<?> c, String fieldName) throws NoSuchFieldException {
        while (true) {
            try {
                return c.getDeclaredField(fieldName);
            } catch (NoSuchFieldException e) {
                c = c.getSuperclass();
                if (c == null) throw e;
            }
        }
    }
    
    static MapBuilder<Object> objectFieldsToMap(Object o, String... fieldNames) {
        MapBuilder<Object> map = new MapBuilder<>();
        for (String name : fieldNames) {
            try {
                map.put(name, getField(o.getClass(), name).get(o));
            } catch (NoSuchFieldException | IllegalAccessException e) {
                log().error("error accessing field " + name, e);
            }
        }
        return map;
    }

}
