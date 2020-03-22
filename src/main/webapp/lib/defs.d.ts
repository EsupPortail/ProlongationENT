interface app {
  fname: string;
  text: string;
  shortText: string;
  title: string;
  description: string;
  url: string;
  position: number;
  hashelp: boolean;
  forbidden: boolean;
  hide: boolean;
}
interface menuEntry {
  title: string;
  portlets: app[];
}
interface DATA {
  user: string;
  userAttrs: { [attrName: string]: string[] };
  layout: { folders: menuEntry[] };
  topApps: string[];
  favorites: string[];
  realUserId: string;
  canImpersonate: app[];
}

interface PARAMS {
  hash: string;
  is_old: boolean;
}

interface CONF {
  theme: string;
  esupUserApps_url: string;
  prolongationENT_url: string;
  uportal_base_url: string;
  cas_login_url: string;
  ent_logout_url: string;
  layout_url: string;
  cas_impersonate: { cookie_name: string, cookie_domain: string };
  disableLocalStorage: boolean;
  time_before_checking_browser_cache_is_up_to_date: number;
}

interface CSS {
  base: string;
  desktop: string;
}

interface TEMPLATES {
  header: string;
  footer: string;
}

type logout_elt = string | { selector: string } | { fn: (find: (selector: string) => Element) => Element }

interface prolongation_ENT_args {
  quirks: ('window-resize')[];
  current: string;
  currentAppIds: string[];
  div_id: string;
  div_is_uid: boolean;
  extra_css: string;
  logout: logout_elt;
  login: boolean;
  is_logged: logout_elt | boolean;

  hide_menu: boolean;
  no_titlebar: boolean;
  no_footer: boolean;
  no_sticky_footer: boolean;

  delegateAuth: boolean;
    
  onNotLogged(pE: prolongation_ENT);
  onload(pE: prolongation_ENT): void;

  layout_url: string;
  uid: string;
}

interface prolongation_ENT {
  currentApp: app;
  wanted_uid: string;
  localStorage_prefix: string;
  localStorage_js_text_field: string;
  loadTime: number;
  
  maybe_loaded: boolean;
  
  allApps: {};
  validApps: {};
  canImpersonateAppIds: string[];
  DATA: DATA;
  CONF: CONF;
  PARAMS: PARAMS;
  CSS: CSS;
  TEMPLATES: TEMPLATES;
  
  helpers: helpers;
  localStorageSet(field: string, value: string);
  localStorageGet(field: string): string;
  personAttr(attr: string): string;  
  relogUrl(app: app): string;
  callPlugins(event: 'onNotLogged' | 'post_compute_currentApp' | 'post_header_add' | 'main' | 'logout_buttons' | 'computeFooter' | 'computeHeader'): any;
  plugins: plugin[];
  onAsyncLogout(): void;
  detectReload(time): void;
  redisplay(): void;
  main(DATA: DATA, PARAMS: PARAMS, notFromLocalStorage: boolean): string;
}

interface plugin {
  post_compute_currentApp?();
  post_header_add?();
  computeHeader?(): string;
  computeFooter?(): string;
  logout_buttons?(): string;
}
interface helpers {
  mylog(string);
  head(): HTMLElement;
  now(): number;
  removeClass(elt: Element, classToToggle: string); 
  toggleClass(elt: Element, classToToggle: string); 
  prependChild(e: Element, newNode: Element);
  insertAfter(e: Element, newNode: Element);
  eltMatches(e: Element, selector: string): boolean;
  eltClosest(e: Element, selector: string): Element;
  simpleQuerySelectorAll(selector: string): NodeListOf<Element>;
  simpleQuerySelector(selector: string): Element;
  getCookie(name: string): string;
  removeCookie(name: string, domain: string, path: string);
  simpleContains<T>(a: T[], val: T): boolean; 
  simpleEach<T>(a: ArrayLike<T>, val: (e: T) => void);
  simpleEachObject(o, fn: (k: string, v, o?) => void); 
  simpleFilter<T>(a: ArrayLike<T>, fn: (e: T) => boolean): T[]; 
  simpleMap<T,U>(a: ArrayLike<T>, fn: (e: T) => U): U[];
  toJSON(o: any): string;
  escapeQuotes(s: string): string;
  template(s: string, map: {}): string;
  onIdOrBody(id: string, f: () => void);
  onReady(f: () => void);
  set_div_innerHTML(div_id: string, content: string);
  loadCSS(url: string, media: string);
  unloadCSS(url: string);
  addCSS(css: string);
  loadScript(url: string, params?: string[]);
}

interface Window {
  prolongation_ENT: prolongation_ENT;
  prolongation_ENT_args: prolongation_ENT_args;
}
