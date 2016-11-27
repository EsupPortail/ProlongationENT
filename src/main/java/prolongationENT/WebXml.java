package prolongationENT;

import javax.servlet.*;

import static prolongationENT.Utils.*;

public class WebXml implements ServletContextListener {
        
    public void contextDestroyed(ServletContextEvent event) {}

    public void contextInitialized(ServletContextEvent event) {
        configure(event.getServletContext());
    }

    private void configure(ServletContext sc) {
        Conf.Main conf = Main.getConf(sc);
                
        addServlet(sc, "ProlongationENT", Main.class, null, Main.mappings);
    }
}
