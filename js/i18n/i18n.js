/*
 * i18n.js — tiny localization engine. No build step, no dependencies.
 *
 * Usage:
 *   t('table.searchPlaceholder')
 *   t('common.interestCount', { n: 3 })   // one / other
 *   I18N.setLocale('ar')                  // later, after registering ar.js
 *   I18N.apply(document)                  // fills [data-i18n] in the shell
 *
 * Adding a language:
 *   1. Copy js/i18n/en.js → js/i18n/<code>.js
 *   2. Translate the strings; keep the same keys
 *   3. I18N.register('<code>', { ... }, { dir: 'rtl'|'ltr', name: '…' })
 *   4. Add <script src="js/i18n/<code>.js"> in index.html after en.js
 *
 * Not translated here (on purpose):
 *   slide copy in js/pages/, fund/manager names, strategy keys in the data.
 *   Those stay in source language until a dedicated pass.
 */
(function (global) {
  const STORAGE_KEY = 'psers-locale';
  const catalogs = Object.create(null);
  const meta = Object.create(null);

  function lookup(dict, key) {
    if (!dict || !key) return undefined;
    if (Object.prototype.hasOwnProperty.call(dict, key)) return dict[key];
    return key.split('.').reduce((o, k) => (o && typeof o === 'object' ? o[k] : undefined), dict);
  }

  function interpolate(str, vars) {
    if (!vars) return String(str);
    return String(str).replace(/\{(\w+)\}/g, (_, k) => (vars[k] == null ? '{' + k + '}' : String(vars[k])));
  }

  function resolve(entry, vars) {
    if (entry == null) return undefined;
    if (typeof entry === 'string') return interpolate(entry, vars);
    if (typeof entry === 'object' && (entry.one != null || entry.other != null)) {
      const n = Number(vars && vars.n);
      const form = n === 1 ? 'one' : 'other';
      return interpolate(entry[form] != null ? entry[form] : (entry.other || entry.one), vars);
    }
    return undefined;
  }

  const I18N = {
    fallback: 'en',
    locale: 'en',
    register(code, catalog, info) {
      catalogs[code] = catalog;
      meta[code] = Object.assign({ dir: 'ltr', name: code }, catalog && catalog.meta, info);
    },
    has(code) { return !!catalogs[code]; },
    t(key, vars) {
      const hit = resolve(lookup(catalogs[I18N.locale], key), vars)
        ?? resolve(lookup(catalogs[I18N.fallback], key), vars);
      return hit != null ? hit : key;
    },
    dir() { return (meta[I18N.locale] || {}).dir || 'ltr'; },
    setLocale(code) {
      if (!catalogs[code]) code = I18N.fallback;
      I18N.locale = code;
      try { localStorage.setItem(STORAGE_KEY, code); } catch (e) {}
      const html = document.documentElement;
      html.lang = code;
      html.dir = I18N.dir();
      I18N.apply(document);
    },
    apply(root) {
      const scope = root || document;
      const tr = I18N.t;
      scope.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = tr(el.getAttribute('data-i18n')); });
      scope.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = tr(el.getAttribute('data-i18n-title')); });
      scope.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', tr(el.getAttribute('data-i18n-aria'))); });
      scope.querySelectorAll('[data-i18n-placeholder]').forEach(el => { el.setAttribute('placeholder', tr(el.getAttribute('data-i18n-placeholder'))); });
      scope.querySelectorAll('[data-i18n-alt]').forEach(el => { el.setAttribute('alt', tr(el.getAttribute('data-i18n-alt'))); });
    },
    init() {
      let code = I18N.fallback;
      try { code = localStorage.getItem(STORAGE_KEY) || I18N.fallback; } catch (e) {}
      if (!catalogs[code]) code = I18N.fallback;
      I18N.locale = code;
      if (document.documentElement) {
        document.documentElement.lang = code;
        document.documentElement.dir = I18N.dir();
      }
      if (document.body) I18N.apply(document);
    }
  };

  global.I18N = I18N;
  global.t = I18N.t;
})(window);
