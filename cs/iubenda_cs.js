!function(n) {
        "use strict";
        let e = 0;
        const t = ["bg", "ca", "cs", "da", "de", "el", "en", "en-GB", "es", "fr", "it", "nl", "no", "pl", "pt", "pt-BR", "ro", "ru", "sv", "et", "fi", "hr", "hu", "lt", "lv", "sk", "sl"];
        function o() {
                let n;
                n = "https://cdn.iubenda.com/cookie_solution/iubenda_cs/1.72.0/core-" + _iub.csConfiguration.lang + ".js";
                let t = document.querySelector('script[src="' + n + '"]');
                if (!t) {
                        t = document.createElement("script");
                        const i = document.querySelector("script");
                        t.src = n,
                        t.setAttribute("charset", "UTF-8"),
                        t.addEventListener("error", (function() {
                                ++e,
                                e < 5 && (t.parentNode.removeChild(t),
                                setTimeout(o, 10))
                        }
                        )),
                        i.parentNode.insertBefore(t, i)
                }
        }
        function i(n, e, t) {
                const o = t.map((function(n) {
                        return n.toLowerCase()
                }
                )).indexOf(e.toLowerCase());
                -1 !== o && n.push(t[o])
        }
        function u(n) {
                const e = "object" == typeof _iub.csLangConfiguration && !!_iub.csLangConfiguration[n]
                  , o = -1 !== t.indexOf(n) || _iub.csConfiguration.i18n && _iub.csConfiguration.i18n[n];
                return e && o
        }
        _iub.invTcfC = Date.now() - 31104e6;
        _iub.csConfigLegacy = !1,
        _iub.GVL2 = _iub.GVL2 || 224,
        _iub.GVL3 = _iub.GVL3 || 87,
        _iub.vendorsCountGVL3 = _iub.vendorsCountGVL3 || 932;
        _iub.cc = 'EU',
        function() {
                const n = _iub.csConfiguration;
                if (!n.lang) {
                        const e = Object.keys(_iub.csLangConfiguration || {})
                          , t = function(n) {
                                const e = n.match(/^(.+?)-(.+)$/);
                                return e ? {
                                        language: e[1],
                                        region: e[2]
                                } : {
                                        language: n
                                }
                        }(document.documentElement.lang || navigator.language || "en")
                          , o = t.region
                          , r = t.language
                          , c = [];
                        if (o) {
                                i(c, r + "-" + o, e)
                        }
                        i(c, r, e),
                        c.push.apply(c, e);
                        for (let e = 0; e < c.length; ++e) {
                                const t = c[e];
                                if (u(t))
                                        return void (n.lang = t)
                        }
                        n.lang = "en"
                }
        }(),
        o(),
        n.loadCore = o,
        Object.defineProperty(n, "__esModule", {
                value: !0
        })
}({});
