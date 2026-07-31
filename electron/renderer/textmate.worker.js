(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // node_modules/@codingame/monaco-vscode-api/_virtual/_commonjsHelpers.js
  function getDefaultExportFromCjs(x) {
    return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
  }
  var init_commonjsHelpers = __esm({
    "node_modules/@codingame/monaco-vscode-api/_virtual/_commonjsHelpers.js"() {
    }
  });

  // node_modules/@codingame/monaco-vscode-api/_virtual/main4.js
  var main;
  var init_main4 = __esm({
    "node_modules/@codingame/monaco-vscode-api/_virtual/main4.js"() {
      main = { exports: {} };
    }
  });

  // node_modules/@codingame/monaco-vscode-api/external/vscode-textmate/release/main.js
  function requireMain() {
    if (hasRequiredMain) return main.exports;
    hasRequiredMain = 1;
    (function(module, exports) {
      !(function(e, t) {
        module.exports = t();
      })(main2, (() => (() => {
        var e = { 185: (e2, t2) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.UseOnigurumaFindOptions = t2.DebugFlags = void 0, t2.DebugFlags = { InDebugMode: "undefined" != typeof process && !!process.env.VSCODE_TEXTMATE_DEBUG }, t2.UseOnigurumaFindOptions = false;
        }, 151: (e2, t2, n) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.applyStateStackDiff = t2.diffStateStacksRefEq = void 0;
          const s = n(752);
          t2.diffStateStacksRefEq = function(e3, t3) {
            let n2 = 0;
            const s2 = [];
            let r = e3, i = t3;
            for (; r !== i; ) r && (!i || r.depth >= i.depth) ? (n2++, r = r.parent) : (s2.push(i.toStateStackFrame()), i = i.parent);
            return { pops: n2, newFrames: s2.reverse() };
          }, t2.applyStateStackDiff = function(e3, t3) {
            let n2 = e3;
            for (let e4 = 0; e4 < t3.pops; e4++) n2 = n2.parent;
            for (const e4 of t3.newFrames) n2 = s.StateStackImpl.pushFrame(n2, e4);
            return n2;
          };
        }, 490: (e2, t2) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.toOptionalTokenType = t2.EncodedTokenAttributes = t2.FontAttribute = void 0;
          class n {
            constructor(e3, t3, n2) {
              this.fontFamily = e3, this.fontSize = t3, this.lineHeight = n2;
            }
            static _getKey(e3, t3, n2) {
              return `${e3}|${t3}|${n2}`;
            }
            static _get(e3, t3, s2) {
              const r = this._getKey(e3, t3, s2);
              let i = this._map.get(r);
              return i || (i = new n(e3, t3, s2), this._map.set(r, i)), i;
            }
            static from(e3, t3, s2) {
              return new n(e3, t3, s2);
            }
            with(e3) {
              return e3 ? n._get(e3.fontFamily || this.fontFamily, e3.fontSize || this.fontSize, e3.lineHeight || this.lineHeight) : this;
            }
          }
          var s;
          t2.FontAttribute = n, n._map = /* @__PURE__ */ new Map(), (s = t2.EncodedTokenAttributes || (t2.EncodedTokenAttributes = {})).toBinaryStr = function(e3) {
            return e3.toString(2).padStart(32, "0");
          }, s.print = function(e3) {
            const t3 = s.getLanguageId(e3), n2 = s.getTokenType(e3), r = s.getFontStyle(e3), i = s.getForeground(e3), o = s.getBackground(e3);
            console.log({ languageId: t3, tokenType: n2, fontStyle: r, foreground: i, background: o });
          }, s.getLanguageId = function(e3) {
            return (255 & e3) >>> 0;
          }, s.getTokenType = function(e3) {
            return (768 & e3) >>> 8;
          }, s.containsBalancedBrackets = function(e3) {
            return !!(1024 & e3);
          }, s.getFontStyle = function(e3) {
            return (30720 & e3) >>> 11;
          }, s.getForeground = function(e3) {
            return (16744448 & e3) >>> 15;
          }, s.getBackground = function(e3) {
            return (4278190080 & e3) >>> 24;
          }, s.set = function(e3, t3, n2, r, i, o, a) {
            let c = s.getLanguageId(e3), l = s.getTokenType(e3), u = s.containsBalancedBrackets(e3) ? 1 : 0, h = s.getFontStyle(e3), p = s.getForeground(e3), d = s.getBackground(e3);
            return 0 !== t3 && (c = t3), 8 !== n2 && (l = n2), null !== r && (u = r ? 1 : 0), -1 !== i && (h = i), 0 !== o && (p = o), 0 !== a && (d = a), (c | l << 8 | u << 10 | h << 11 | p << 15 | d << 24) >>> 0;
          }, t2.toOptionalTokenType = function(e3) {
            return e3;
          };
        }, 214: (e2, t2, n) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.BasicScopeAttributesProvider = t2.BasicScopeAttributes = void 0;
          const s = n(807);
          class r {
            constructor(e3, t3) {
              this.languageId = e3, this.tokenType = t3;
            }
          }
          t2.BasicScopeAttributes = r;
          class i {
            constructor(e3, t3) {
              this._getBasicScopeAttributes = new s.CachedFn(((e4) => {
                const t4 = this._scopeToLanguage(e4), n2 = this._toStandardTokenType(e4);
                return new r(t4, n2);
              })), this._defaultAttributes = new r(e3, 8), this._embeddedLanguagesMatcher = new o(Object.entries(t3 || {}));
            }
            getDefaultAttributes() {
              return this._defaultAttributes;
            }
            getBasicScopeAttributes(e3) {
              return null === e3 ? i._NULL_SCOPE_METADATA : this._getBasicScopeAttributes.get(e3);
            }
            _scopeToLanguage(e3) {
              return this._embeddedLanguagesMatcher.match(e3) || 0;
            }
            _toStandardTokenType(e3) {
              const t3 = e3.match(i.STANDARD_TOKEN_TYPE_REGEXP);
              if (!t3) return 8;
              switch (t3[1]) {
                case "comment":
                  return 1;
                case "string":
                  return 2;
                case "regex":
                  return 3;
                case "meta.embedded":
                  return 0;
              }
              throw new Error("Unexpected match for standard token type!");
            }
          }
          t2.BasicScopeAttributesProvider = i, i._NULL_SCOPE_METADATA = new r(0, 0), i.STANDARD_TOKEN_TYPE_REGEXP = /\b(comment|string|regex|meta\.embedded)\b/;
          class o {
            constructor(e3) {
              if (0 === e3.length) this.values = null, this.scopesRegExp = null;
              else {
                this.values = new Map(e3);
                const t3 = e3.map((([e4, t4]) => s.escapeRegExpCharacters(e4)));
                t3.sort(), t3.reverse(), this.scopesRegExp = new RegExp(`^((${t3.join(")|(")}))($|\\.)`, "");
              }
            }
            match(e3) {
              if (!this.scopesRegExp) return;
              const t3 = e3.match(this.scopesRegExp);
              return t3 ? this.values.get(t3[1]) : void 0;
            }
          }
        }, 929: (e2, t2, n) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.LineFonts = t2.FontInfo = t2.LineTokens = t2.BalancedBracketSelectors = t2.StateStackImpl = t2.AttributedScopeStack = t2.Grammar = t2.createGrammar = void 0;
          const s = n(185), r = n(490), i = n(916), o = n(810), a = n(666), c = n(63), l = n(807), u = n(214), h = n(398);
          function p(e3, t3, n2, s2, r2) {
            const o2 = i.createMatchers(t3, d), c2 = a.RuleFactory.getCompiledRuleId(n2, s2, r2.repository);
            for (const n3 of o2) e3.push({ debugSelector: t3, matcher: n3.matcher, ruleId: c2, grammar: r2, priority: n3.priority });
          }
          function d(e3, t3) {
            if (t3.length < e3.length) return false;
            let n2 = 0;
            return e3.every(((e4) => {
              for (let s2 = n2; s2 < t3.length; s2++) if (f(t3[s2], e4)) return n2 = s2 + 1, true;
              return false;
            }));
          }
          function f(e3, t3) {
            if (!e3) return false;
            if (e3 === t3) return true;
            const n2 = t3.length;
            return e3.length > n2 && e3.substr(0, n2) === t3 && "." === e3[n2];
          }
          t2.createGrammar = function(e3, t3, n2, s2, r2, i2, o2, a2) {
            return new m(e3, t3, n2, s2, r2, i2, o2, a2);
          };
          class m {
            constructor(e3, t3, n2, s2, r2, o2, a2, c2) {
              if (this._rootScopeName = e3, this.balancedBracketSelectors = o2, this._onigLib = c2, this._basicScopeAttributesProvider = new u.BasicScopeAttributesProvider(n2, s2), this._rootId = -1, this._lastRuleId = 0, this._ruleId2desc = [null], this._includedGrammars = {}, this._grammarRepository = a2, this._grammar = g(t3, null), this._injections = null, this._tokenTypeMatchers = [], r2) for (const e4 of Object.keys(r2)) {
                const t4 = i.createMatchers(e4, d);
                for (const n3 of t4) this._tokenTypeMatchers.push({ matcher: n3.matcher, type: r2[e4] });
              }
            }
            get themeProvider() {
              return this._grammarRepository;
            }
            dispose() {
              for (const e3 of this._ruleId2desc) e3 && e3.dispose();
            }
            createOnigScanner(e3) {
              return this._onigLib.createOnigScanner(e3);
            }
            createOnigString(e3) {
              return this._onigLib.createOnigString(e3);
            }
            getMetadataForScope(e3) {
              return this._basicScopeAttributesProvider.getBasicScopeAttributes(e3);
            }
            _collectInjections() {
              const e3 = [], t3 = this._rootScopeName, n2 = ((e4) => e4 === this._rootScopeName ? this._grammar : this.getExternalGrammar(e4))(t3);
              if (n2) {
                const s2 = n2.injections;
                if (s2) for (let t4 in s2) p(e3, t4, s2[t4], this, n2);
                const r2 = this._grammarRepository.injections(t3);
                r2 && r2.forEach(((t4) => {
                  const n3 = this.getExternalGrammar(t4);
                  if (n3) {
                    const t5 = n3.injectionSelector;
                    t5 && p(e3, t5, n3, this, n3);
                  }
                }));
              }
              return e3.sort(((e4, t4) => e4.priority - t4.priority)), e3;
            }
            getInjections() {
              if (null === this._injections && (this._injections = this._collectInjections(), s.DebugFlags.InDebugMode && this._injections.length > 0)) {
                console.log(`Grammar ${this._rootScopeName} contains the following injections:`);
                for (const e3 of this._injections) console.log(`  - ${e3.debugSelector}`);
              }
              return this._injections;
            }
            registerRule(e3) {
              const t3 = ++this._lastRuleId, n2 = e3(a.ruleIdFromNumber(t3));
              return this._ruleId2desc[t3] = n2, n2;
            }
            getRule(e3) {
              return this._ruleId2desc[a.ruleIdToNumber(e3)];
            }
            getExternalGrammar(e3, t3) {
              if (this._includedGrammars[e3]) return this._includedGrammars[e3];
              if (this._grammarRepository) {
                const n2 = this._grammarRepository.lookup(e3);
                if (n2) return this._includedGrammars[e3] = g(n2, t3 && t3.$base), this._includedGrammars[e3];
              }
            }
            tokenizeLine(e3, t3, n2 = 0) {
              const s2 = this._tokenize(e3, t3, false, n2);
              return { tokens: s2.lineTokens.getResult(s2.ruleStack, s2.lineLength), ruleStack: s2.ruleStack, stoppedEarly: s2.stoppedEarly, fonts: s2.lineFonts.getResult() };
            }
            tokenizeLine2(e3, t3, n2 = 0) {
              const s2 = this._tokenize(e3, t3, true, n2);
              return { tokens: s2.lineTokens.getBinaryResult(s2.ruleStack, s2.lineLength), ruleStack: s2.ruleStack, stoppedEarly: s2.stoppedEarly, fonts: s2.lineFonts.getResult() };
            }
            _tokenize(e3, t3, n2, s2) {
              let i2;
              if (-1 === this._rootId && (this._rootId = a.RuleFactory.getCompiledRuleId(this._grammar.repository.$self, this, this._grammar.repository), this.getInjections()), t3 && t3 !== b.NULL) i2 = false, t3.reset();
              else {
                i2 = true;
                const e4 = this._basicScopeAttributesProvider.getDefaultAttributes(), n3 = this.themeProvider.getDefaults(), s3 = r.EncodedTokenAttributes.set(0, e4.languageId, e4.tokenType, null, n3.fontStyle, n3.foregroundId, n3.backgroundId), o2 = r.FontAttribute.from(n3.fontFamily, n3.fontSize, n3.lineHeight), a2 = this.getRule(this._rootId).getName(null, null);
                let c3;
                c3 = a2 ? _.createRootAndLookUpScopeName(a2, s3, o2, this) : _.createRoot("unknown", s3, o2), t3 = new b(null, this._rootId, -1, -1, false, null, c3, c3);
              }
              e3 += "\n";
              const c2 = this.createOnigString(e3), l2 = c2.content.length, u2 = new y(n2, e3, this._tokenTypeMatchers, this.balancedBracketSelectors), p2 = new k(), d2 = h._tokenizeString(this, c2, i2, 0, t3, u2, p2, true, s2);
              return o.disposeOnigString(c2), { lineLength: l2, lineTokens: u2, lineFonts: p2, ruleStack: d2.stack, stoppedEarly: d2.stoppedEarly };
            }
          }
          function g(e3, t3) {
            return (e3 = l.clone(e3)).repository = e3.repository || {}, e3.repository.$self = { $vscodeTextmateLocation: e3.$vscodeTextmateLocation, patterns: e3.patterns, name: e3.scopeName }, e3.repository.$base = t3 || e3.repository.$self, e3;
          }
          t2.Grammar = m;
          class _ {
            constructor(e3, t3, n2, s2, r2) {
              this.parent = e3, this.scopePath = t3, this.tokenAttributes = n2, this.fontAttributes = s2, this.styleAttributes = r2;
            }
            static fromExtension(e3, t3) {
              let n2 = e3, s2 = e3?.scopePath ?? null;
              for (const e4 of t3) s2 = c.ScopeStack.push(s2, e4.scopeNames), n2 = new _(n2, s2, e4.encodedTokenAttributes, null, null);
              return n2;
            }
            static createRoot(e3, t3, n2) {
              return new _(null, new c.ScopeStack(null, e3), t3, n2, null);
            }
            static createRootAndLookUpScopeName(e3, t3, n2, s2) {
              const r2 = s2.getMetadataForScope(e3), i2 = new c.ScopeStack(null, e3), o2 = s2.themeProvider.themeMatch(i2), a2 = _.mergeAttributes(t3, r2, o2), l2 = n2.with(o2);
              return new _(null, i2, a2, l2, o2);
            }
            get scopeName() {
              return this.scopePath.scopeName;
            }
            toString() {
              return this.getScopeNames().join(" ");
            }
            equals(e3) {
              return _.equals(this, e3);
            }
            static equals(e3, t3) {
              for (; ; ) {
                if (e3 === t3) return true;
                if (!e3 && !t3) return true;
                if (!e3 || !t3) return false;
                if (e3.scopeName !== t3.scopeName || e3.tokenAttributes !== t3.tokenAttributes) return false;
                e3 = e3.parent, t3 = t3.parent;
              }
            }
            static mergeAttributes(e3, t3, n2) {
              let s2 = -1, i2 = 0, o2 = 0;
              return null !== n2 && (s2 = n2.fontStyle, i2 = n2.foregroundId, o2 = n2.backgroundId), r.EncodedTokenAttributes.set(e3, t3.languageId, t3.tokenType, null, s2, i2, o2);
            }
            pushAttributed(e3, t3) {
              if (null === e3) return this;
              if (-1 === e3.indexOf(" ")) return _._pushAttributed(this, e3, t3);
              const n2 = e3.split(/ /g);
              let s2 = this;
              for (const e4 of n2) s2 = _._pushAttributed(s2, e4, t3);
              return s2;
            }
            static _pushAttributed(e3, t3, n2) {
              const s2 = n2.getMetadataForScope(t3), r2 = e3.scopePath.push(t3), i2 = n2.themeProvider.themeMatch(r2), o2 = _.mergeAttributes(e3.tokenAttributes, s2, i2), a2 = e3.fontAttributes?.with(i2) ?? null;
              return new _(e3, r2, o2, a2, i2);
            }
            getScopeNames() {
              return this.scopePath.getSegments();
            }
            getExtensionIfDefined(e3) {
              const t3 = [];
              let n2 = this;
              for (; n2 && n2 !== e3; ) t3.push({ encodedTokenAttributes: n2.tokenAttributes, scopeNames: n2.scopePath.getExtensionIfDefined(n2.parent?.scopePath ?? null) }), n2 = n2.parent;
              return n2 === e3 ? t3.reverse() : void 0;
            }
          }
          t2.AttributedScopeStack = _;
          class b {
            constructor(e3, t3, n2, s2, r2, i2, o2, a2) {
              this.parent = e3, this.ruleId = t3, this.beginRuleCapturedEOL = r2, this.endRule = i2, this.nameScopesList = o2, this.contentNameScopesList = a2, this._stackElementBrand = void 0, this.depth = this.parent ? this.parent.depth + 1 : 1, this._enterPos = n2, this._anchorPos = s2;
            }
            equals(e3) {
              return null !== e3 && b._equals(this, e3);
            }
            static _equals(e3, t3) {
              return e3 === t3 || !!this._structuralEquals(e3, t3) && _.equals(e3.contentNameScopesList, t3.contentNameScopesList);
            }
            static _structuralEquals(e3, t3) {
              for (; ; ) {
                if (e3 === t3) return true;
                if (!e3 && !t3) return true;
                if (!e3 || !t3) return false;
                if (e3.depth !== t3.depth || e3.ruleId !== t3.ruleId || e3.endRule !== t3.endRule) return false;
                e3 = e3.parent, t3 = t3.parent;
              }
            }
            clone() {
              return this;
            }
            static _reset(e3) {
              for (; e3; ) e3._enterPos = -1, e3._anchorPos = -1, e3 = e3.parent;
            }
            reset() {
              b._reset(this);
            }
            pop() {
              return this.parent;
            }
            safePop() {
              return this.parent ? this.parent : this;
            }
            push(e3, t3, n2, s2, r2, i2, o2) {
              return new b(this, e3, t3, n2, s2, r2, i2, o2);
            }
            getEnterPos() {
              return this._enterPos;
            }
            getAnchorPos() {
              return this._anchorPos;
            }
            getRule(e3) {
              return e3.getRule(this.ruleId);
            }
            toString() {
              const e3 = [];
              return this._writeString(e3, 0), "[" + e3.join(",") + "]";
            }
            _writeString(e3, t3) {
              return this.parent && (t3 = this.parent._writeString(e3, t3)), e3[t3++] = `(${this.ruleId}, ${this.nameScopesList?.toString()}, ${this.contentNameScopesList?.toString()})`, t3;
            }
            withContentNameScopesList(e3) {
              return this.contentNameScopesList === e3 ? this : this.parent.push(this.ruleId, this._enterPos, this._anchorPos, this.beginRuleCapturedEOL, this.endRule, this.nameScopesList, e3);
            }
            withEndRule(e3) {
              return this.endRule === e3 ? this : new b(this.parent, this.ruleId, this._enterPos, this._anchorPos, this.beginRuleCapturedEOL, e3, this.nameScopesList, this.contentNameScopesList);
            }
            hasSameRuleAs(e3) {
              let t3 = this;
              for (; t3 && t3._enterPos === e3._enterPos; ) {
                if (t3.ruleId === e3.ruleId) return true;
                t3 = t3.parent;
              }
              return false;
            }
            toStateStackFrame() {
              return { ruleId: a.ruleIdToNumber(this.ruleId), beginRuleCapturedEOL: this.beginRuleCapturedEOL, endRule: this.endRule, nameScopesList: this.nameScopesList?.getExtensionIfDefined(this.parent?.nameScopesList ?? null) ?? [], contentNameScopesList: this.contentNameScopesList?.getExtensionIfDefined(this.nameScopesList) ?? [] };
            }
            static pushFrame(e3, t3) {
              const n2 = _.fromExtension(e3?.nameScopesList ?? null, t3.nameScopesList);
              return new b(e3, a.ruleIdFromNumber(t3.ruleId), t3.enterPos ?? -1, t3.anchorPos ?? -1, t3.beginRuleCapturedEOL, t3.endRule, n2, _.fromExtension(n2, t3.contentNameScopesList));
            }
          }
          t2.StateStackImpl = b, b.NULL = new b(null, 0, 0, 0, false, null, null, null), t2.BalancedBracketSelectors = class {
            constructor(e3, t3) {
              this.allowAny = false, this.balancedBracketScopes = e3.flatMap(((e4) => "*" === e4 ? (this.allowAny = true, []) : i.createMatchers(e4, d).map(((e5) => e5.matcher)))), this.unbalancedBracketScopes = t3.flatMap(((e4) => i.createMatchers(e4, d).map(((e5) => e5.matcher))));
            }
            get matchesAlways() {
              return this.allowAny && 0 === this.unbalancedBracketScopes.length;
            }
            get matchesNever() {
              return 0 === this.balancedBracketScopes.length && !this.allowAny;
            }
            match(e3) {
              for (const t3 of this.unbalancedBracketScopes) if (t3(e3)) return false;
              for (const t3 of this.balancedBracketScopes) if (t3(e3)) return true;
              return this.allowAny;
            }
          };
          class y {
            constructor(e3, t3, n2, r2) {
              this.balancedBracketSelectors = r2, this._emitBinaryTokens = e3, this._tokenTypeOverrides = n2, s.DebugFlags.InDebugMode ? this._lineText = t3 : this._lineText = null, this._mergeConsecutiveTokensWithEqualMetadata = !l.containsRTL(t3), this._tokens = [], this._binaryTokens = [], this._lastTokenEndIndex = 0;
            }
            produce(e3, t3) {
              this.produceFromScopes(e3.contentNameScopesList, t3);
            }
            produceFromScopes(e3, t3) {
              if (this._lastTokenEndIndex >= t3) return;
              if (this._emitBinaryTokens) {
                let n3 = e3?.tokenAttributes ?? 0, i2 = false;
                if (this.balancedBracketSelectors?.matchesAlways && (i2 = true), this._tokenTypeOverrides.length > 0 || this.balancedBracketSelectors && !this.balancedBracketSelectors.matchesAlways && !this.balancedBracketSelectors.matchesNever) {
                  const t4 = e3?.getScopeNames() ?? [];
                  for (const e4 of this._tokenTypeOverrides) e4.matcher(t4) && (n3 = r.EncodedTokenAttributes.set(n3, 0, r.toOptionalTokenType(e4.type), null, -1, 0, 0));
                  this.balancedBracketSelectors && (i2 = this.balancedBracketSelectors.match(t4));
                }
                if (i2 && (n3 = r.EncodedTokenAttributes.set(n3, 0, 8, i2, -1, 0, 0)), this._mergeConsecutiveTokensWithEqualMetadata && this._binaryTokens.length > 0 && this._binaryTokens[this._binaryTokens.length - 1] === n3) return void (this._lastTokenEndIndex = t3);
                if (s.DebugFlags.InDebugMode) {
                  const n4 = e3?.getScopeNames() ?? [];
                  console.log("  token: |" + this._lineText.substring(this._lastTokenEndIndex, t3).replace(/\n$/, "\\n") + "|");
                  for (let e4 = 0; e4 < n4.length; e4++) console.log("      * " + n4[e4]);
                }
                return this._binaryTokens.push(this._lastTokenEndIndex), this._binaryTokens.push(n3), void (this._lastTokenEndIndex = t3);
              }
              const n2 = e3?.getScopeNames() ?? [];
              if (s.DebugFlags.InDebugMode) {
                console.log("  token: |" + this._lineText.substring(this._lastTokenEndIndex, t3).replace(/\n$/, "\\n") + "|");
                for (let e4 = 0; e4 < n2.length; e4++) console.log("      * " + n2[e4]);
              }
              this._tokens.push({ startIndex: this._lastTokenEndIndex, endIndex: t3, scopes: n2 }), this._lastTokenEndIndex = t3;
            }
            getResult(e3, t3) {
              return this._tokens.length > 0 && this._tokens[this._tokens.length - 1].startIndex === t3 - 1 && this._tokens.pop(), 0 === this._tokens.length && (this._lastTokenEndIndex = -1, this.produce(e3, t3), this._tokens[this._tokens.length - 1].startIndex = 0), this._tokens;
            }
            getBinaryResult(e3, t3) {
              this._binaryTokens.length > 0 && this._binaryTokens[this._binaryTokens.length - 2] === t3 - 1 && (this._binaryTokens.pop(), this._binaryTokens.pop()), 0 === this._binaryTokens.length && (this._lastTokenEndIndex = -1, this.produce(e3, t3), this._binaryTokens[this._binaryTokens.length - 2] = 0);
              const n2 = new Uint32Array(this._binaryTokens.length);
              for (let e4 = 0, t4 = this._binaryTokens.length; e4 < t4; e4++) n2[e4] = this._binaryTokens[e4];
              return n2;
            }
          }
          t2.LineTokens = y;
          class S {
            constructor(e3, t3, n2, s2, r2) {
              this.startIndex = e3, this.endIndex = t3, this.fontFamily = n2, this.fontSizeMultiplier = s2, this.lineHeightMultiplier = r2;
            }
            optionsEqual(e3) {
              return this.fontFamily === e3.fontFamily && this.fontSizeMultiplier === e3.fontSizeMultiplier && this.lineHeightMultiplier === e3.lineHeightMultiplier;
            }
          }
          t2.FontInfo = S;
          class k {
            constructor() {
              this._fonts = [], this._lastIndex = 0;
            }
            produce(e3, t3) {
              this.produceFromScopes(e3.contentNameScopesList, t3);
            }
            produceFromScopes(e3, t3) {
              if (!e3?.fontAttributes) return void (this._lastIndex = t3);
              const n2 = e3.fontAttributes.fontFamily, s2 = e3.fontAttributes.fontSize, r2 = e3.fontAttributes.lineHeight;
              if (!n2 && !s2 && !r2) return void (this._lastIndex = t3);
              const i2 = new S(this._lastIndex, t3, n2, s2, r2), o2 = this._fonts[this._fonts.length - 1];
              o2 && o2.endIndex === this._lastIndex && o2.optionsEqual(i2) ? o2.endIndex = i2.endIndex : this._fonts.push(i2), this._lastIndex = t3;
            }
            getResult() {
              return this._fonts;
            }
          }
          t2.LineFonts = k;
        }, 784: (e2, t2, n) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.parseInclude = t2.TopLevelRepositoryReference = t2.TopLevelReference = t2.RelativeReference = t2.SelfReference = t2.BaseReference = t2.ScopeDependencyProcessor = t2.ExternalReferenceCollector = t2.TopLevelRepositoryRuleReference = t2.TopLevelRuleReference = void 0;
          const s = n(807);
          class r {
            constructor(e3) {
              this.scopeName = e3;
            }
            toKey() {
              return this.scopeName;
            }
          }
          t2.TopLevelRuleReference = r;
          class i {
            constructor(e3, t3) {
              this.scopeName = e3, this.ruleName = t3;
            }
            toKey() {
              return `${this.scopeName}#${this.ruleName}`;
            }
          }
          t2.TopLevelRepositoryRuleReference = i;
          class o {
            constructor() {
              this._references = [], this._seenReferenceKeys = /* @__PURE__ */ new Set(), this.visitedRule = /* @__PURE__ */ new Set();
            }
            get references() {
              return this._references;
            }
            add(e3) {
              const t3 = e3.toKey();
              this._seenReferenceKeys.has(t3) || (this._seenReferenceKeys.add(t3), this._references.push(e3));
            }
          }
          function a(e3, t3, n2, s2) {
            const i2 = n2.lookup(e3.scopeName);
            if (!i2) {
              if (e3.scopeName === t3) throw new Error(`No grammar provided for <${t3}>`);
              return;
            }
            const o2 = n2.lookup(t3);
            e3 instanceof r ? l({ baseGrammar: o2, selfGrammar: i2 }, s2) : c(e3.ruleName, { baseGrammar: o2, selfGrammar: i2, repository: i2.repository }, s2);
            const a2 = n2.injections(e3.scopeName);
            if (a2) for (const e4 of a2) s2.add(new r(e4));
          }
          function c(e3, t3, n2) {
            t3.repository && t3.repository[e3] && u([t3.repository[e3]], t3, n2);
          }
          function l(e3, t3) {
            e3.selfGrammar.patterns && Array.isArray(e3.selfGrammar.patterns) && u(e3.selfGrammar.patterns, { ...e3, repository: e3.selfGrammar.repository }, t3), e3.selfGrammar.injections && u(Object.values(e3.selfGrammar.injections), { ...e3, repository: e3.selfGrammar.repository }, t3);
          }
          function u(e3, t3, n2) {
            for (const o2 of e3) {
              if (n2.visitedRule.has(o2)) continue;
              n2.visitedRule.add(o2);
              const e4 = o2.repository ? s.mergeObjects({}, t3.repository, o2.repository) : t3.repository;
              Array.isArray(o2.patterns) && u(o2.patterns, { ...t3, repository: e4 }, n2);
              const a2 = o2.include;
              if (!a2) continue;
              const h2 = g(a2);
              switch (h2.kind) {
                case 0:
                  l({ ...t3, selfGrammar: t3.baseGrammar }, n2);
                  break;
                case 1:
                  l(t3, n2);
                  break;
                case 2:
                  c(h2.ruleName, { ...t3, repository: e4 }, n2);
                  break;
                case 3:
                case 4:
                  const s2 = h2.scopeName === t3.selfGrammar.scopeName ? t3.selfGrammar : h2.scopeName === t3.baseGrammar.scopeName ? t3.baseGrammar : void 0;
                  if (s2) {
                    const r2 = { baseGrammar: t3.baseGrammar, selfGrammar: s2, repository: e4 };
                    4 === h2.kind ? c(h2.ruleName, r2, n2) : l(r2, n2);
                  } else 4 === h2.kind ? n2.add(new i(h2.scopeName, h2.ruleName)) : n2.add(new r(h2.scopeName));
              }
            }
          }
          t2.ExternalReferenceCollector = o, t2.ScopeDependencyProcessor = class {
            constructor(e3, t3) {
              this.repo = e3, this.initialScopeName = t3, this.seenFullScopeRequests = /* @__PURE__ */ new Set(), this.seenPartialScopeRequests = /* @__PURE__ */ new Set(), this.seenFullScopeRequests.add(this.initialScopeName), this.Q = [new r(this.initialScopeName)];
            }
            processQueue() {
              const e3 = this.Q;
              this.Q = [];
              const t3 = new o();
              for (const n2 of e3) a(n2, this.initialScopeName, this.repo, t3);
              for (const e4 of t3.references) if (e4 instanceof r) {
                if (this.seenFullScopeRequests.has(e4.scopeName)) continue;
                this.seenFullScopeRequests.add(e4.scopeName), this.Q.push(e4);
              } else {
                if (this.seenFullScopeRequests.has(e4.scopeName)) continue;
                if (this.seenPartialScopeRequests.has(e4.toKey())) continue;
                this.seenPartialScopeRequests.add(e4.toKey()), this.Q.push(e4);
              }
            }
          };
          class h {
            constructor() {
              this.kind = 0;
            }
          }
          t2.BaseReference = h;
          class p {
            constructor() {
              this.kind = 1;
            }
          }
          t2.SelfReference = p;
          class d {
            constructor(e3) {
              this.ruleName = e3, this.kind = 2;
            }
          }
          t2.RelativeReference = d;
          class f {
            constructor(e3) {
              this.scopeName = e3, this.kind = 3;
            }
          }
          t2.TopLevelReference = f;
          class m {
            constructor(e3, t3) {
              this.scopeName = e3, this.ruleName = t3, this.kind = 4;
            }
          }
          function g(e3) {
            if ("$base" === e3) return new h();
            if ("$self" === e3) return new p();
            const t3 = e3.indexOf("#");
            if (-1 === t3) return new f(e3);
            if (0 === t3) return new d(e3.substring(1));
            {
              const n2 = e3.substring(0, t3), s2 = e3.substring(t3 + 1);
              return new m(n2, s2);
            }
          }
          t2.TopLevelRepositoryReference = m, t2.parseInclude = g;
        }, 752: function(e2, t2, n) {
          var s = this && this.__createBinding || (Object.create ? function(e3, t3, n2, s2) {
            void 0 === s2 && (s2 = n2), Object.defineProperty(e3, s2, { enumerable: true, get: function() {
              return t3[n2];
            } });
          } : function(e3, t3, n2, s2) {
            void 0 === s2 && (s2 = n2), e3[s2] = t3[n2];
          }), r = this && this.__exportStar || function(e3, t3) {
            for (var n2 in e3) "default" === n2 || Object.prototype.hasOwnProperty.call(t3, n2) || s(t3, e3, n2);
          };
          Object.defineProperty(t2, "__esModule", { value: true }), r(n(929), t2);
        }, 398: (e2, t2, n) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.LocalStackElement = t2._tokenizeString = void 0;
          const s = n(185), r = n(810), i = n(666), o = n(807);
          class a {
            constructor(e3, t3) {
              this.stack = e3, this.stoppedEarly = t3;
            }
          }
          function c(e3, t3, n2, r2, c2, h2, d2, f, m) {
            const g = (e4, t4) => {
              h2.produce(e4, t4), d2.produce(e4, t4);
            }, _ = t3.content.length;
            let b = false, y = -1;
            if (f) {
              const o2 = (function(e4, t4, n3, r3, o3, a2, c3) {
                const l2 = (e5, t5) => {
                  a2.produce(e5, t5), c3.produce(e5, t5);
                };
                let h3 = o3.beginRuleCapturedEOL ? 0 : -1;
                const d3 = [];
                for (let t5 = o3; t5; t5 = t5.pop()) {
                  const n4 = t5.getRule(e4);
                  n4 instanceof i.BeginWhileRule && d3.push({ rule: n4, stack: t5 });
                }
                for (let f2 = d3.pop(); f2; f2 = d3.pop()) {
                  const { ruleScanner: d4, findOptions: m2 } = u(f2.rule, e4, f2.stack.endRule, n3, r3 === h3), g2 = d4.findNextMatchSync(t4, r3, m2);
                  if (s.DebugFlags.InDebugMode && (console.log("  scanning for while rule"), console.log(d4.toString())), !g2) {
                    s.DebugFlags.InDebugMode && console.log("  popping " + f2.rule.debugName + " - " + f2.rule.debugWhileRegExp), o3 = f2.stack.pop();
                    break;
                  }
                  if (g2.ruleId !== i.whileRuleId) {
                    o3 = f2.stack.pop();
                    break;
                  }
                  g2.captureIndices && g2.captureIndices.length && (l2(f2.stack, g2.captureIndices[0].start), p(e4, t4, n3, f2.stack, a2, c3, f2.rule.whileCaptures, g2.captureIndices), l2(f2.stack, g2.captureIndices[0].end), h3 = g2.captureIndices[0].end, g2.captureIndices[0].end > r3 && (r3 = g2.captureIndices[0].end, n3 = false));
                }
                return { stack: o3, linePos: r3, anchorPosition: h3, isFirstLine: n3 };
              })(e3, t3, n2, r2, c2, h2, d2);
              c2 = o2.stack, r2 = o2.linePos, n2 = o2.isFirstLine, y = o2.anchorPosition;
            }
            const S = Date.now();
            for (; !b; ) {
              if (0 !== m && Date.now() - S > m) return new a(c2, true);
              k();
            }
            return new a(c2, false);
            function k() {
              s.DebugFlags.InDebugMode && (console.log(""), console.log(`@@scanNext ${r2}: |${t3.content.substr(r2).replace(/\n$/, "\\n")}|`));
              const a2 = (function(e4, t4, n3, r3, i2, a3) {
                const c3 = (function(e5, t5, n4, r4, i3, a4) {
                  const c4 = i3.getRule(e5), { ruleScanner: u4, findOptions: h4 } = l(c4, e5, i3.endRule, n4, r4 === a4);
                  let p3 = 0;
                  s.DebugFlags.InDebugMode && (p3 = o.performanceNow());
                  const d4 = u4.findNextMatchSync(t5, r4, h4);
                  if (s.DebugFlags.InDebugMode) {
                    const e6 = o.performanceNow() - p3;
                    e6 > 5 && console.warn(`Rule ${c4.debugName} (${c4.id}) matching took ${e6} against '${t5}'`), console.log(`  scanning for (linePos: ${r4}, anchorPosition: ${a4})`), console.log(u4.toString()), d4 && console.log(`matched rule id: ${d4.ruleId} from ${d4.captureIndices[0].start} to ${d4.captureIndices[0].end}`);
                  }
                  return d4 ? { captureIndices: d4.captureIndices, matchedRuleId: d4.ruleId } : null;
                })(e4, t4, n3, r3, i2, a3), u3 = e4.getInjections();
                if (0 === u3.length) return c3;
                const h3 = (function(e5, t5, n4, r4, i3, o2, a4) {
                  let c4, u4 = Number.MAX_VALUE, h4 = null, p3 = 0;
                  const d4 = o2.contentNameScopesList.getScopeNames();
                  for (let o3 = 0, f3 = e5.length; o3 < f3; o3++) {
                    const f4 = e5[o3];
                    if (!f4.matcher(d4)) continue;
                    const m3 = t5.getRule(f4.ruleId), { ruleScanner: g2, findOptions: _2 } = l(m3, t5, null, r4, i3 === a4), b2 = g2.findNextMatchSync(n4, i3, _2);
                    if (!b2) continue;
                    s.DebugFlags.InDebugMode && (console.log(`  matched injection: ${f4.debugSelector}`), console.log(g2.toString()));
                    const y2 = b2.captureIndices[0].start;
                    if (!(y2 >= u4) && (u4 = y2, h4 = b2.captureIndices, c4 = b2.ruleId, p3 = f4.priority, u4 === i3)) break;
                  }
                  return h4 ? { priorityMatch: -1 === p3, captureIndices: h4, matchedRuleId: c4 } : null;
                })(u3, e4, t4, n3, r3, i2, a3);
                if (!h3) return c3;
                if (!c3) return h3;
                const p2 = c3.captureIndices[0].start, d3 = h3.captureIndices[0].start;
                return d3 < p2 || h3.priorityMatch && d3 === p2 ? h3 : c3;
              })(e3, t3, n2, r2, c2, y);
              if (!a2) return s.DebugFlags.InDebugMode && console.log("  no more matches."), g(c2, _), void (b = true);
              const u2 = a2.captureIndices, f2 = a2.matchedRuleId, m2 = !!(u2 && u2.length > 0) && u2[0].end > r2;
              if (f2 === i.endRuleId) {
                const i2 = c2.getRule(e3);
                s.DebugFlags.InDebugMode && console.log("  popping " + i2.debugName + " - " + i2.debugEndRegExp), g(c2, u2[0].start), c2 = c2.withContentNameScopesList(c2.nameScopesList), p(e3, t3, n2, c2, h2, d2, i2.endCaptures, u2), g(c2, u2[0].end);
                const o2 = c2;
                if (c2 = c2.parent, y = o2.getAnchorPos(), !m2 && o2.getEnterPos() === r2) return s.DebugFlags.InDebugMode && console.error("[1] - Grammar is in an endless loop - Grammar pushed & popped a rule without advancing"), g(c2 = o2, _), void (b = true);
              } else {
                const o2 = e3.getRule(f2);
                g(c2, u2[0].start);
                const a3 = c2, l2 = o2.getName(t3.content, u2), S2 = c2.contentNameScopesList.pushAttributed(l2, e3);
                if (c2 = c2.push(f2, r2, y, u2[0].end === _, null, S2, S2), o2 instanceof i.BeginEndRule) {
                  const r3 = o2;
                  s.DebugFlags.InDebugMode && console.log("  pushing " + r3.debugName + " - " + r3.debugBeginRegExp), p(e3, t3, n2, c2, h2, d2, r3.beginCaptures, u2), g(c2, u2[0].end), y = u2[0].end;
                  const i2 = r3.getContentName(t3.content, u2), l3 = S2.pushAttributed(i2, e3);
                  if (c2 = c2.withContentNameScopesList(l3), r3.endHasBackReferences && (c2 = c2.withEndRule(r3.getEndWithResolvedBackReferences(t3.content, u2))), !m2 && a3.hasSameRuleAs(c2)) return s.DebugFlags.InDebugMode && console.error("[2] - Grammar is in an endless loop - Grammar pushed the same rule without advancing"), c2 = c2.pop(), g(c2, _), void (b = true);
                } else if (o2 instanceof i.BeginWhileRule) {
                  const r3 = o2;
                  s.DebugFlags.InDebugMode && console.log("  pushing " + r3.debugName), p(e3, t3, n2, c2, h2, d2, r3.beginCaptures, u2), g(c2, u2[0].end), y = u2[0].end;
                  const i2 = r3.getContentName(t3.content, u2), l3 = S2.pushAttributed(i2, e3);
                  if (c2 = c2.withContentNameScopesList(l3), r3.whileHasBackReferences && (c2 = c2.withEndRule(r3.getWhileWithResolvedBackReferences(t3.content, u2))), !m2 && a3.hasSameRuleAs(c2)) return s.DebugFlags.InDebugMode && console.error("[3] - Grammar is in an endless loop - Grammar pushed the same rule without advancing"), c2 = c2.pop(), g(c2, _), void (b = true);
                } else {
                  const r3 = o2;
                  if (s.DebugFlags.InDebugMode && console.log("  matched " + r3.debugName + " - " + r3.debugMatchRegExp), p(e3, t3, n2, c2, h2, d2, r3.captures, u2), g(c2, u2[0].end), c2 = c2.pop(), !m2) return s.DebugFlags.InDebugMode && console.error("[4] - Grammar is in an endless loop - Grammar is not advancing, nor is it pushing/popping"), c2 = c2.safePop(), g(c2, _), void (b = true);
                }
              }
              u2[0].end > r2 && (r2 = u2[0].end, n2 = false);
            }
          }
          function l(e3, t3, n2, r2, i2) {
            return s.UseOnigurumaFindOptions ? { ruleScanner: e3.compile(t3, n2), findOptions: h(r2, i2) } : { ruleScanner: e3.compileAG(t3, n2, r2, i2), findOptions: 0 };
          }
          function u(e3, t3, n2, r2, i2) {
            return s.UseOnigurumaFindOptions ? { ruleScanner: e3.compileWhile(t3, n2), findOptions: h(r2, i2) } : { ruleScanner: e3.compileWhileAG(t3, n2, r2, i2), findOptions: 0 };
          }
          function h(e3, t3) {
            let n2 = 0;
            return e3 || (n2 |= 1), t3 || (n2 |= 4), n2;
          }
          function p(e3, t3, n2, s2, i2, o2, a2, l2) {
            const u2 = (e4, t4) => {
              i2.produceFromScopes(e4, t4), o2.produceFromScopes(e4, t4);
            }, h2 = (e4, t4) => {
              i2.produce(e4, t4), o2.produce(e4, t4);
            };
            if (0 === a2.length) return;
            const p2 = t3.content, f = Math.min(a2.length, l2.length), m = [], g = l2[0].end;
            for (let t4 = 0; t4 < f; t4++) {
              const f2 = a2[t4];
              if (null === f2) continue;
              const _ = l2[t4];
              if (0 === _.length) continue;
              if (_.start > g) break;
              for (; m.length > 0 && m[m.length - 1].endPos <= _.start; ) u2(m[m.length - 1].scopes, m[m.length - 1].endPos), m.pop();
              if (m.length > 0 ? u2(m[m.length - 1].scopes, _.start) : h2(s2, _.start), f2.retokenizeCapturedWithRuleId) {
                const t5 = f2.getName(p2, l2), a3 = s2.contentNameScopesList.pushAttributed(t5, e3), u3 = f2.getContentName(p2, l2), h3 = a3.pushAttributed(u3, e3), d2 = s2.push(f2.retokenizeCapturedWithRuleId, _.start, -1, false, null, a3, h3), m2 = e3.createOnigString(p2.substring(0, _.end));
                c(e3, m2, n2 && 0 === _.start, _.start, d2, i2, o2, false, 0), r.disposeOnigString(m2);
                continue;
              }
              const b = f2.getName(p2, l2);
              if (null !== b) {
                const t5 = (m.length > 0 ? m[m.length - 1].scopes : s2.contentNameScopesList).pushAttributed(b, e3);
                m.push(new d(t5, _.end));
              }
            }
            for (; m.length > 0; ) u2(m[m.length - 1].scopes, m[m.length - 1].endPos), m.pop();
          }
          t2._tokenizeString = c;
          class d {
            constructor(e3, t3) {
              this.scopes = e3, this.endPos = t3;
            }
          }
          t2.LocalStackElement = d;
        }, 726: (e2, t2) => {
          function n(e3, t3) {
            throw new Error("Near offset " + e3.pos + ": " + t3 + " ~~~" + e3.source.substr(e3.pos, 50) + "~~~");
          }
          Object.defineProperty(t2, "__esModule", { value: true }), t2.parseJSON = void 0, t2.parseJSON = function(e3, t3, o) {
            let a = new s(e3), c = new r(), l = 0, u = null, h = [], p = [];
            function d() {
              h.push(l), p.push(u);
            }
            function f() {
              l = h.pop(), u = p.pop();
            }
            function m(e4) {
              n(a, e4);
            }
            for (; i(a, c); ) {
              if (0 === l) {
                if (null !== u && m("too many constructs in root"), 3 === c.type) {
                  u = {}, o && (u.$vscodeTextmateLocation = c.toLocation(t3)), d(), l = 1;
                  continue;
                }
                if (2 === c.type) {
                  u = [], d(), l = 4;
                  continue;
                }
                m("unexpected token in root");
              }
              if (2 === l) {
                if (5 === c.type) {
                  f();
                  continue;
                }
                if (7 === c.type) {
                  l = 3;
                  continue;
                }
                m("expected , or }");
              }
              if (1 === l || 3 === l) {
                if (1 === l && 5 === c.type) {
                  f();
                  continue;
                }
                if (1 === c.type) {
                  let e4 = c.value;
                  if (i(a, c) && 6 === c.type || m("expected colon"), i(a, c) || m("expected value"), l = 2, 1 === c.type) {
                    u[e4] = c.value;
                    continue;
                  }
                  if (8 === c.type) {
                    u[e4] = null;
                    continue;
                  }
                  if (9 === c.type) {
                    u[e4] = true;
                    continue;
                  }
                  if (10 === c.type) {
                    u[e4] = false;
                    continue;
                  }
                  if (11 === c.type) {
                    u[e4] = parseFloat(c.value);
                    continue;
                  }
                  if (2 === c.type) {
                    let t4 = [];
                    u[e4] = t4, d(), l = 4, u = t4;
                    continue;
                  }
                  if (3 === c.type) {
                    let n2 = {};
                    o && (n2.$vscodeTextmateLocation = c.toLocation(t3)), u[e4] = n2, d(), l = 1, u = n2;
                    continue;
                  }
                }
                m("unexpected token in dict");
              }
              if (5 === l) {
                if (4 === c.type) {
                  f();
                  continue;
                }
                if (7 === c.type) {
                  l = 6;
                  continue;
                }
                m("expected , or ]");
              }
              if (4 === l || 6 === l) {
                if (4 === l && 4 === c.type) {
                  f();
                  continue;
                }
                if (l = 5, 1 === c.type) {
                  u.push(c.value);
                  continue;
                }
                if (8 === c.type) {
                  u.push(null);
                  continue;
                }
                if (9 === c.type) {
                  u.push(true);
                  continue;
                }
                if (10 === c.type) {
                  u.push(false);
                  continue;
                }
                if (11 === c.type) {
                  u.push(parseFloat(c.value));
                  continue;
                }
                if (2 === c.type) {
                  let e4 = [];
                  u.push(e4), d(), l = 4, u = e4;
                  continue;
                }
                if (3 === c.type) {
                  let e4 = {};
                  o && (e4.$vscodeTextmateLocation = c.toLocation(t3)), u.push(e4), d(), l = 1, u = e4;
                  continue;
                }
                m("unexpected token in array");
              }
              m("unknown state");
            }
            return 0 !== p.length && m("unclosed constructs"), u;
          };
          class s {
            constructor(e3) {
              this.source = e3, this.pos = 0, this.len = e3.length, this.line = 1, this.char = 0;
            }
          }
          class r {
            constructor() {
              this.value = null, this.type = 0, this.offset = -1, this.len = -1, this.line = -1, this.char = -1;
            }
            toLocation(e3) {
              return { filename: e3, line: this.line, char: this.char };
            }
          }
          function i(e3, t3) {
            t3.value = null, t3.type = 0, t3.offset = -1, t3.len = -1, t3.line = -1, t3.char = -1;
            let s2, r2 = e3.source, i2 = e3.pos, o = e3.len, a = e3.line, c = e3.char;
            for (; ; ) {
              if (i2 >= o) return false;
              if (s2 = r2.charCodeAt(i2), 32 !== s2 && 9 !== s2 && 13 !== s2) {
                if (10 !== s2) break;
                i2++, a++, c = 0;
              } else i2++, c++;
            }
            if (t3.offset = i2, t3.line = a, t3.char = c, 34 === s2) {
              for (t3.type = 1, i2++, c++; ; ) {
                if (i2 >= o) return false;
                if (s2 = r2.charCodeAt(i2), i2++, c++, 92 !== s2) {
                  if (34 === s2) break;
                } else i2++, c++;
              }
              t3.value = r2.substring(t3.offset + 1, i2 - 1).replace(/\\u([0-9A-Fa-f]{4})/g, ((e4, t4) => String.fromCodePoint(parseInt(t4, 16)))).replace(/\\(.)/g, ((t4, s3) => {
                switch (s3) {
                  case '"':
                    return '"';
                  case "\\":
                    return "\\";
                  case "/":
                    return "/";
                  case "b":
                    return "\b";
                  case "f":
                    return "\f";
                  case "n":
                    return "\n";
                  case "r":
                    return "\r";
                  case "t":
                    return "	";
                  default:
                    n(e3, "invalid escape sequence");
                }
                throw new Error("unreachable");
              }));
            } else if (91 === s2) t3.type = 2, i2++, c++;
            else if (123 === s2) t3.type = 3, i2++, c++;
            else if (93 === s2) t3.type = 4, i2++, c++;
            else if (125 === s2) t3.type = 5, i2++, c++;
            else if (58 === s2) t3.type = 6, i2++, c++;
            else if (44 === s2) t3.type = 7, i2++, c++;
            else if (110 === s2) {
              if (t3.type = 8, i2++, c++, s2 = r2.charCodeAt(i2), 117 !== s2) return false;
              if (i2++, c++, s2 = r2.charCodeAt(i2), 108 !== s2) return false;
              if (i2++, c++, s2 = r2.charCodeAt(i2), 108 !== s2) return false;
              i2++, c++;
            } else if (116 === s2) {
              if (t3.type = 9, i2++, c++, s2 = r2.charCodeAt(i2), 114 !== s2) return false;
              if (i2++, c++, s2 = r2.charCodeAt(i2), 117 !== s2) return false;
              if (i2++, c++, s2 = r2.charCodeAt(i2), 101 !== s2) return false;
              i2++, c++;
            } else if (102 === s2) {
              if (t3.type = 10, i2++, c++, s2 = r2.charCodeAt(i2), 97 !== s2) return false;
              if (i2++, c++, s2 = r2.charCodeAt(i2), 108 !== s2) return false;
              if (i2++, c++, s2 = r2.charCodeAt(i2), 115 !== s2) return false;
              if (i2++, c++, s2 = r2.charCodeAt(i2), 101 !== s2) return false;
              i2++, c++;
            } else for (t3.type = 11; ; ) {
              if (i2 >= o) return false;
              if (s2 = r2.charCodeAt(i2), !(46 === s2 || s2 >= 48 && s2 <= 57 || 101 === s2 || 69 === s2 || 45 === s2 || 43 === s2)) break;
              i2++, c++;
            }
            return t3.len = i2 - t3.offset, null === t3.value && (t3.value = r2.substr(t3.offset, t3.len)), e3.pos = i2, e3.line = a, e3.char = c, true;
          }
        }, 625: function(e2, t2, n) {
          var s = this && this.__createBinding || (Object.create ? function(e3, t3, n2, s2) {
            void 0 === s2 && (s2 = n2), Object.defineProperty(e3, s2, { enumerable: true, get: function() {
              return t3[n2];
            } });
          } : function(e3, t3, n2, s2) {
            void 0 === s2 && (s2 = n2), e3[s2] = t3[n2];
          }), r = this && this.__exportStar || function(e3, t3) {
            for (var n2 in e3) "default" === n2 || Object.prototype.hasOwnProperty.call(t3, n2) || s(t3, e3, n2);
          };
          Object.defineProperty(t2, "__esModule", { value: true }), t2.applyStateStackDiff = t2.diffStateStacksRefEq = t2.parseRawGrammar = t2.INITIAL = t2.Registry = void 0;
          const i = n(752), o = n(150), a = n(583), c = n(63), l = n(784), u = n(151);
          Object.defineProperty(t2, "applyStateStackDiff", { enumerable: true, get: function() {
            return u.applyStateStackDiff;
          } }), Object.defineProperty(t2, "diffStateStacksRefEq", { enumerable: true, get: function() {
            return u.diffStateStacksRefEq;
          } }), r(n(810), t2), t2.Registry = class {
            constructor(e3) {
              this._options = e3, this._syncRegistry = new a.SyncRegistry(c.Theme.createFromRawTheme(e3.theme, e3.colorMap), e3.onigLib), this._ensureGrammarCache = /* @__PURE__ */ new Map();
            }
            dispose() {
              this._syncRegistry.dispose();
            }
            setTheme(e3, t3) {
              this._syncRegistry.setTheme(c.Theme.createFromRawTheme(e3, t3));
            }
            getColorMap() {
              return this._syncRegistry.getColorMap();
            }
            loadGrammarWithEmbeddedLanguages(e3, t3, n2) {
              return this.loadGrammarWithConfiguration(e3, t3, { embeddedLanguages: n2 });
            }
            loadGrammarWithConfiguration(e3, t3, n2) {
              return this._loadGrammar(e3, t3, n2.embeddedLanguages, n2.tokenTypes, new i.BalancedBracketSelectors(n2.balancedBracketSelectors || [], n2.unbalancedBracketSelectors || []));
            }
            loadGrammar(e3) {
              return this._loadGrammar(e3, 0, null, null, null);
            }
            async _loadGrammar(e3, t3, n2, s2, r2) {
              const i2 = new l.ScopeDependencyProcessor(this._syncRegistry, e3);
              for (; i2.Q.length > 0; ) await Promise.all(i2.Q.map(((e4) => this._loadSingleGrammar(e4.scopeName)))), i2.processQueue();
              return this._grammarForScopeName(e3, t3, n2, s2, r2);
            }
            async _loadSingleGrammar(e3) {
              return this._ensureGrammarCache.has(e3) || this._ensureGrammarCache.set(e3, this._doLoadSingleGrammar(e3)), this._ensureGrammarCache.get(e3);
            }
            async _doLoadSingleGrammar(e3) {
              const t3 = await this._options.loadGrammar(e3);
              if (t3) {
                const n2 = "function" == typeof this._options.getInjections ? this._options.getInjections(e3) : void 0;
                this._syncRegistry.addGrammar(t3, n2);
              }
            }
            async addGrammar(e3, t3 = [], n2 = 0, s2 = null) {
              return this._syncRegistry.addGrammar(e3, t3), await this._grammarForScopeName(e3.scopeName, n2, s2);
            }
            _grammarForScopeName(e3, t3 = 0, n2 = null, s2 = null, r2 = null) {
              return this._syncRegistry.grammarForScopeName(e3, t3, n2, s2, r2);
            }
          }, t2.INITIAL = i.StateStackImpl.NULL, t2.parseRawGrammar = o.parseRawGrammar;
        }, 916: (e2, t2) => {
          function n(e3) {
            return !!e3 && !!e3.match(/[\w\.:]+/);
          }
          Object.defineProperty(t2, "__esModule", { value: true }), t2.createMatchers = void 0, t2.createMatchers = function(e3, t3) {
            const s = [], r = (function(e4) {
              let t4 = /([LR]:|[\w\.:][\w\.:\-]*|[\,\|\-\(\)])/g, n2 = t4.exec(e4);
              return { next: () => {
                if (!n2) return null;
                const s2 = n2[0];
                return n2 = t4.exec(e4), s2;
              } };
            })(e3);
            let i = r.next();
            for (; null !== i; ) {
              let e4 = 0;
              if (2 === i.length && ":" === i.charAt(1)) {
                switch (i.charAt(0)) {
                  case "R":
                    e4 = 1;
                    break;
                  case "L":
                    e4 = -1;
                    break;
                  default:
                    console.log(`Unknown priority ${i} in scope selector`);
                }
                i = r.next();
              }
              let t4 = a();
              if (s.push({ matcher: t4, priority: e4 }), "," !== i) break;
              i = r.next();
            }
            return s;
            function o() {
              if ("-" === i) {
                i = r.next();
                const e4 = o();
                return (t4) => !!e4 && !e4(t4);
              }
              if ("(" === i) {
                i = r.next();
                const e4 = (function() {
                  const e5 = [];
                  let t4 = a();
                  for (; t4 && (e5.push(t4), "|" === i || "," === i); ) {
                    do {
                      i = r.next();
                    } while ("|" === i || "," === i);
                    t4 = a();
                  }
                  return (t5) => e5.some(((e6) => e6(t5)));
                })();
                return ")" === i && (i = r.next()), e4;
              }
              if (n(i)) {
                const e4 = [];
                do {
                  e4.push(i), i = r.next();
                } while (n(i));
                return (n2) => t3(e4, n2);
              }
              return null;
            }
            function a() {
              const e4 = [];
              let t4 = o();
              for (; t4; ) e4.push(t4), t4 = o();
              return (t5) => e4.every(((e5) => e5(t5)));
            }
          };
        }, 810: (e2, t2) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.disposeOnigString = void 0, t2.disposeOnigString = function(e3) {
            "function" == typeof e3.dispose && e3.dispose();
          };
        }, 150: (e2, t2, n) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.parseRawGrammar = void 0;
          const s = n(578), r = n(185), i = n(726);
          t2.parseRawGrammar = function(e3, t3 = null) {
            return null !== t3 && /\.json$/.test(t3) ? (n2 = e3, o = t3, r.DebugFlags.InDebugMode ? i.parseJSON(n2, o, true) : JSON.parse(n2)) : (function(e4, t4) {
              return r.DebugFlags.InDebugMode ? s.parseWithLocation(e4, t4, "$vscodeTextmateLocation") : s.parsePLIST(e4);
            })(e3, t3);
            var n2, o;
          };
        }, 578: (e2, t2) => {
          function n(e3, t3, n2) {
            const s = e3.length;
            let r = 0, i = 1, o = 0;
            function a(t4) {
              if (null === n2) r += t4;
              else for (; t4 > 0; ) 10 === e3.charCodeAt(r) ? (r++, i++, o = 0) : (r++, o++), t4--;
            }
            function c(e4) {
              null === n2 ? r = e4 : a(e4 - r);
            }
            function l() {
              for (; r < s; ) {
                let t4 = e3.charCodeAt(r);
                if (32 !== t4 && 9 !== t4 && 13 !== t4 && 10 !== t4) break;
                a(1);
              }
            }
            function u(t4) {
              return e3.substr(r, t4.length) === t4 && (a(t4.length), true);
            }
            function h(t4) {
              let n3 = e3.indexOf(t4, r);
              c(-1 !== n3 ? n3 + t4.length : s);
            }
            function p(t4) {
              let n3 = e3.indexOf(t4, r);
              if (-1 !== n3) {
                let s2 = e3.substring(r, n3);
                return c(n3 + t4.length), s2;
              }
              {
                let t5 = e3.substr(r);
                return c(s), t5;
              }
            }
            s > 0 && 65279 === e3.charCodeAt(0) && (r = 1);
            let d = 0, f = null, m = [], g = [], _ = null;
            function b(e4, t4) {
              m.push(d), g.push(f), d = e4, f = t4;
            }
            function y() {
              if (0 === m.length) return S("illegal state stack");
              d = m.pop(), f = g.pop();
            }
            function S(t4) {
              throw new Error("Near offset " + r + ": " + t4 + " ~~~" + e3.substr(r, 50) + "~~~");
            }
            const k = function() {
              if (null === _) return S("missing <key>");
              let e4 = {};
              null !== n2 && (e4[n2] = { filename: t3, line: i, char: o }), f[_] = e4, _ = null, b(1, e4);
            }, C = function() {
              if (null === _) return S("missing <key>");
              let e4 = [];
              f[_] = e4, _ = null, b(2, e4);
            }, R = function() {
              let e4 = {};
              null !== n2 && (e4[n2] = { filename: t3, line: i, char: o }), f.push(e4), b(1, e4);
            }, A = function() {
              let e4 = [];
              f.push(e4), b(2, e4);
            };
            function w() {
              if (1 !== d) return S("unexpected </dict>");
              y();
            }
            function I() {
              return 1 === d || 2 !== d ? S("unexpected </array>") : void y();
            }
            function P(e4) {
              if (1 === d) {
                if (null === _) return S("missing <key>");
                f[_] = e4, _ = null;
              } else 2 === d ? f.push(e4) : f = e4;
            }
            function v(e4) {
              if (isNaN(e4)) return S("cannot parse float");
              if (1 === d) {
                if (null === _) return S("missing <key>");
                f[_] = e4, _ = null;
              } else 2 === d ? f.push(e4) : f = e4;
            }
            function x(e4) {
              if (isNaN(e4)) return S("cannot parse integer");
              if (1 === d) {
                if (null === _) return S("missing <key>");
                f[_] = e4, _ = null;
              } else 2 === d ? f.push(e4) : f = e4;
            }
            function N(e4) {
              if (1 === d) {
                if (null === _) return S("missing <key>");
                f[_] = e4, _ = null;
              } else 2 === d ? f.push(e4) : f = e4;
            }
            function E(e4) {
              if (1 === d) {
                if (null === _) return S("missing <key>");
                f[_] = e4, _ = null;
              } else 2 === d ? f.push(e4) : f = e4;
            }
            function F(e4) {
              if (1 === d) {
                if (null === _) return S("missing <key>");
                f[_] = e4, _ = null;
              } else 2 === d ? f.push(e4) : f = e4;
            }
            function T() {
              let e4 = p(">"), t4 = false;
              return 47 === e4.charCodeAt(e4.length - 1) && (t4 = true, e4 = e4.substring(0, e4.length - 1)), { name: e4.trim(), isClosed: t4 };
            }
            function D(e4) {
              if (e4.isClosed) return "";
              let t4 = p("</");
              return h(">"), t4.replace(/&#([0-9]+);/g, (function(e5, t5) {
                return String.fromCodePoint(parseInt(t5, 10));
              })).replace(/&#x([0-9a-f]+);/g, (function(e5, t5) {
                return String.fromCodePoint(parseInt(t5, 16));
              })).replace(/&amp;|&lt;|&gt;|&quot;|&apos;/g, (function(e5) {
                switch (e5) {
                  case "&amp;":
                    return "&";
                  case "&lt;":
                    return "<";
                  case "&gt;":
                    return ">";
                  case "&quot;":
                    return '"';
                  case "&apos;":
                    return "'";
                }
                return e5;
              }));
            }
            for (; r < s && (l(), !(r >= s)); ) {
              const c2 = e3.charCodeAt(r);
              if (a(1), 60 !== c2) return S("expected <");
              if (r >= s) return S("unexpected end of input");
              const p2 = e3.charCodeAt(r);
              if (63 === p2) {
                a(1), h("?>");
                continue;
              }
              if (33 === p2) {
                if (a(1), u("--")) {
                  h("-->");
                  continue;
                }
                h(">");
                continue;
              }
              if (47 === p2) {
                if (a(1), l(), u("plist")) {
                  h(">");
                  continue;
                }
                if (u("dict")) {
                  h(">"), w();
                  continue;
                }
                if (u("array")) {
                  h(">"), I();
                  continue;
                }
                return S("unexpected closed tag");
              }
              let m2 = T();
              switch (m2.name) {
                case "dict":
                  1 === d ? k() : 2 === d ? R() : (f = {}, null !== n2 && (f[n2] = { filename: t3, line: i, char: o }), b(1, f)), m2.isClosed && w();
                  continue;
                case "array":
                  1 === d ? C() : 2 === d ? A() : (f = [], b(2, f)), m2.isClosed && I();
                  continue;
                case "key":
                  G = D(m2), 1 !== d ? S("unexpected <key>") : null !== _ ? S("too many <key>") : _ = G;
                  continue;
                case "string":
                  P(D(m2));
                  continue;
                case "real":
                  v(parseFloat(D(m2)));
                  continue;
                case "integer":
                  x(parseInt(D(m2), 10));
                  continue;
                case "date":
                  N(new Date(D(m2)));
                  continue;
                case "data":
                  E(D(m2));
                  continue;
                case "true":
                  D(m2), F(true);
                  continue;
                case "false":
                  D(m2), F(false);
                  continue;
              }
              if (!/^plist/.test(m2.name)) return S("unexpected opened tag " + m2.name);
            }
            var G;
            return f;
          }
          Object.defineProperty(t2, "__esModule", { value: true }), t2.parsePLIST = t2.parseWithLocation = void 0, t2.parseWithLocation = function(e3, t3, s) {
            return n(e3, t3, s);
          }, t2.parsePLIST = function(e3) {
            return n(e3, null, null);
          };
        }, 583: (e2, t2, n) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.SyncRegistry = void 0;
          const s = n(752);
          t2.SyncRegistry = class {
            constructor(e3, t3) {
              this._onigLibPromise = t3, this._grammars = /* @__PURE__ */ new Map(), this._rawGrammars = /* @__PURE__ */ new Map(), this._injectionGrammars = /* @__PURE__ */ new Map(), this._theme = e3;
            }
            dispose() {
              for (const e3 of this._grammars.values()) e3.dispose();
            }
            setTheme(e3) {
              this._theme = e3;
            }
            getColorMap() {
              return this._theme.getColorMap();
            }
            addGrammar(e3, t3) {
              this._rawGrammars.set(e3.scopeName, e3), t3 && this._injectionGrammars.set(e3.scopeName, t3);
            }
            lookup(e3) {
              return this._rawGrammars.get(e3);
            }
            injections(e3) {
              return this._injectionGrammars.get(e3);
            }
            getDefaults() {
              return this._theme.getDefaults();
            }
            themeMatch(e3) {
              return this._theme.match(e3);
            }
            async grammarForScopeName(e3, t3, n2, r, i) {
              if (!this._grammars.has(e3)) {
                let o = this._rawGrammars.get(e3);
                if (!o) return null;
                this._grammars.set(e3, s.createGrammar(e3, o, t3, n2, r, i, this, await this._onigLibPromise));
              }
              return this._grammars.get(e3);
            }
          };
        }, 666: (e2, t2, n) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.CompiledRule = t2.RegExpSourceList = t2.RegExpSource = t2.RuleFactory = t2.BeginWhileRule = t2.BeginEndRule = t2.IncludeOnlyRule = t2.MatchRule = t2.CaptureRule = t2.Rule = t2.ruleIdToNumber = t2.ruleIdFromNumber = t2.whileRuleId = t2.endRuleId = void 0;
          const s = n(807), r = n(784), i = /\\(\d+)/, o = /\\(\d+)/g;
          t2.endRuleId = -1, t2.whileRuleId = -2, t2.ruleIdFromNumber = function(e3) {
            return e3;
          }, t2.ruleIdToNumber = function(e3) {
            return e3;
          };
          class a {
            constructor(e3, t3, n2, r2) {
              this.$location = e3, this.id = t3, this._name = n2 || null, this._nameIsCapturing = s.RegexSource.hasCaptures(this._name), this._contentName = r2 || null, this._contentNameIsCapturing = s.RegexSource.hasCaptures(this._contentName);
            }
            get debugName() {
              const e3 = this.$location ? `${s.basename(this.$location.filename)}:${this.$location.line}` : "unknown";
              return `${this.constructor.name}#${this.id} @ ${e3}`;
            }
            getName(e3, t3) {
              return this._nameIsCapturing && null !== this._name && null !== e3 && null !== t3 ? s.RegexSource.replaceCaptures(this._name, e3, t3) : this._name;
            }
            getContentName(e3, t3) {
              return this._contentNameIsCapturing && null !== this._contentName ? s.RegexSource.replaceCaptures(this._contentName, e3, t3) : this._contentName;
            }
          }
          t2.Rule = a;
          class c extends a {
            constructor(e3, t3, n2, s2, r2) {
              super(e3, t3, n2, s2), this.retokenizeCapturedWithRuleId = r2;
            }
            dispose() {
            }
            collectPatterns(e3, t3) {
              throw new Error("Not supported!");
            }
            compile(e3, t3) {
              throw new Error("Not supported!");
            }
            compileAG(e3, t3, n2, s2) {
              throw new Error("Not supported!");
            }
          }
          t2.CaptureRule = c;
          class l extends a {
            constructor(e3, t3, n2, s2, r2) {
              super(e3, t3, n2, null), this._match = new f(s2, this.id), this.captures = r2, this._cachedCompiledPatterns = null;
            }
            dispose() {
              this._cachedCompiledPatterns && (this._cachedCompiledPatterns.dispose(), this._cachedCompiledPatterns = null);
            }
            get debugMatchRegExp() {
              return `${this._match.source}`;
            }
            collectPatterns(e3, t3) {
              t3.push(this._match);
            }
            compile(e3, t3) {
              return this._getCachedCompiledPatterns(e3).compile(e3);
            }
            compileAG(e3, t3, n2, s2) {
              return this._getCachedCompiledPatterns(e3).compileAG(e3, n2, s2);
            }
            _getCachedCompiledPatterns(e3) {
              return this._cachedCompiledPatterns || (this._cachedCompiledPatterns = new m(), this.collectPatterns(e3, this._cachedCompiledPatterns)), this._cachedCompiledPatterns;
            }
          }
          t2.MatchRule = l;
          class u extends a {
            constructor(e3, t3, n2, s2, r2) {
              super(e3, t3, n2, s2), this.patterns = r2.patterns, this.hasMissingPatterns = r2.hasMissingPatterns, this._cachedCompiledPatterns = null;
            }
            dispose() {
              this._cachedCompiledPatterns && (this._cachedCompiledPatterns.dispose(), this._cachedCompiledPatterns = null);
            }
            collectPatterns(e3, t3) {
              for (const n2 of this.patterns) e3.getRule(n2).collectPatterns(e3, t3);
            }
            compile(e3, t3) {
              return this._getCachedCompiledPatterns(e3).compile(e3);
            }
            compileAG(e3, t3, n2, s2) {
              return this._getCachedCompiledPatterns(e3).compileAG(e3, n2, s2);
            }
            _getCachedCompiledPatterns(e3) {
              return this._cachedCompiledPatterns || (this._cachedCompiledPatterns = new m(), this.collectPatterns(e3, this._cachedCompiledPatterns)), this._cachedCompiledPatterns;
            }
          }
          t2.IncludeOnlyRule = u;
          class h extends a {
            constructor(e3, t3, n2, s2, r2, i2, o2, a2, c2, l2) {
              super(e3, t3, n2, s2), this._begin = new f(r2, this.id), this.beginCaptures = i2, this._end = new f(o2 || "\uFFFF", -1), this.endHasBackReferences = this._end.hasBackReferences, this.endCaptures = a2, this.applyEndPatternLast = c2 || false, this.patterns = l2.patterns, this.hasMissingPatterns = l2.hasMissingPatterns, this._cachedCompiledPatterns = null;
            }
            dispose() {
              this._cachedCompiledPatterns && (this._cachedCompiledPatterns.dispose(), this._cachedCompiledPatterns = null);
            }
            get debugBeginRegExp() {
              return `${this._begin.source}`;
            }
            get debugEndRegExp() {
              return `${this._end.source}`;
            }
            getEndWithResolvedBackReferences(e3, t3) {
              return this._end.resolveBackReferences(e3, t3);
            }
            collectPatterns(e3, t3) {
              t3.push(this._begin);
            }
            compile(e3, t3) {
              return this._getCachedCompiledPatterns(e3, t3).compile(e3);
            }
            compileAG(e3, t3, n2, s2) {
              return this._getCachedCompiledPatterns(e3, t3).compileAG(e3, n2, s2);
            }
            _getCachedCompiledPatterns(e3, t3) {
              if (!this._cachedCompiledPatterns) {
                this._cachedCompiledPatterns = new m();
                for (const t4 of this.patterns) e3.getRule(t4).collectPatterns(e3, this._cachedCompiledPatterns);
                this.applyEndPatternLast ? this._cachedCompiledPatterns.push(this._end.hasBackReferences ? this._end.clone() : this._end) : this._cachedCompiledPatterns.unshift(this._end.hasBackReferences ? this._end.clone() : this._end);
              }
              return this._end.hasBackReferences && (this.applyEndPatternLast ? this._cachedCompiledPatterns.setSource(this._cachedCompiledPatterns.length() - 1, t3) : this._cachedCompiledPatterns.setSource(0, t3)), this._cachedCompiledPatterns;
            }
          }
          t2.BeginEndRule = h;
          class p extends a {
            constructor(e3, n2, s2, r2, i2, o2, a2, c2, l2) {
              super(e3, n2, s2, r2), this._begin = new f(i2, this.id), this.beginCaptures = o2, this.whileCaptures = c2, this._while = new f(a2, t2.whileRuleId), this.whileHasBackReferences = this._while.hasBackReferences, this.patterns = l2.patterns, this.hasMissingPatterns = l2.hasMissingPatterns, this._cachedCompiledPatterns = null, this._cachedCompiledWhilePatterns = null;
            }
            dispose() {
              this._cachedCompiledPatterns && (this._cachedCompiledPatterns.dispose(), this._cachedCompiledPatterns = null), this._cachedCompiledWhilePatterns && (this._cachedCompiledWhilePatterns.dispose(), this._cachedCompiledWhilePatterns = null);
            }
            get debugBeginRegExp() {
              return `${this._begin.source}`;
            }
            get debugWhileRegExp() {
              return `${this._while.source}`;
            }
            getWhileWithResolvedBackReferences(e3, t3) {
              return this._while.resolveBackReferences(e3, t3);
            }
            collectPatterns(e3, t3) {
              t3.push(this._begin);
            }
            compile(e3, t3) {
              return this._getCachedCompiledPatterns(e3).compile(e3);
            }
            compileAG(e3, t3, n2, s2) {
              return this._getCachedCompiledPatterns(e3).compileAG(e3, n2, s2);
            }
            _getCachedCompiledPatterns(e3) {
              if (!this._cachedCompiledPatterns) {
                this._cachedCompiledPatterns = new m();
                for (const t3 of this.patterns) e3.getRule(t3).collectPatterns(e3, this._cachedCompiledPatterns);
              }
              return this._cachedCompiledPatterns;
            }
            compileWhile(e3, t3) {
              return this._getCachedCompiledWhilePatterns(e3, t3).compile(e3);
            }
            compileWhileAG(e3, t3, n2, s2) {
              return this._getCachedCompiledWhilePatterns(e3, t3).compileAG(e3, n2, s2);
            }
            _getCachedCompiledWhilePatterns(e3, t3) {
              return this._cachedCompiledWhilePatterns || (this._cachedCompiledWhilePatterns = new m(), this._cachedCompiledWhilePatterns.push(this._while.hasBackReferences ? this._while.clone() : this._while)), this._while.hasBackReferences && this._cachedCompiledWhilePatterns.setSource(0, t3 || "\uFFFF"), this._cachedCompiledWhilePatterns;
            }
          }
          t2.BeginWhileRule = p;
          class d {
            static createCaptureRule(e3, t3, n2, s2, r2) {
              return e3.registerRule(((e4) => new c(t3, e4, n2, s2, r2)));
            }
            static getCompiledRuleId(e3, t3, n2) {
              return e3.id || t3.registerRule(((r2) => {
                if (e3.id = r2, e3.match) return new l(e3.$vscodeTextmateLocation, e3.id, e3.name, e3.match, d._compileCaptures(e3.captures, t3, n2));
                if (void 0 === e3.begin) {
                  e3.repository && (n2 = s.mergeObjects({}, n2, e3.repository));
                  let r3 = e3.patterns;
                  return void 0 === r3 && e3.include && (r3 = [{ include: e3.include }]), new u(e3.$vscodeTextmateLocation, e3.id, e3.name, e3.contentName, d._compilePatterns(r3, t3, n2));
                }
                return e3.while ? new p(e3.$vscodeTextmateLocation, e3.id, e3.name, e3.contentName, e3.begin, d._compileCaptures(e3.beginCaptures || e3.captures, t3, n2), e3.while, d._compileCaptures(e3.whileCaptures || e3.captures, t3, n2), d._compilePatterns(e3.patterns, t3, n2)) : new h(e3.$vscodeTextmateLocation, e3.id, e3.name, e3.contentName, e3.begin, d._compileCaptures(e3.beginCaptures || e3.captures, t3, n2), e3.end, d._compileCaptures(e3.endCaptures || e3.captures, t3, n2), e3.applyEndPatternLast, d._compilePatterns(e3.patterns, t3, n2));
              })), e3.id;
            }
            static _compileCaptures(e3, t3, n2) {
              let s2 = [];
              if (e3) {
                let r2 = 0;
                for (const t4 in e3) {
                  if ("$vscodeTextmateLocation" === t4) continue;
                  const e4 = parseInt(t4, 10);
                  e4 > r2 && (r2 = e4);
                }
                for (let e4 = 0; e4 <= r2; e4++) s2[e4] = null;
                for (const r3 in e3) {
                  if ("$vscodeTextmateLocation" === r3) continue;
                  const i2 = parseInt(r3, 10);
                  let o2 = 0;
                  e3[r3].patterns && (o2 = d.getCompiledRuleId(e3[r3], t3, n2)), s2[i2] = d.createCaptureRule(t3, e3[r3].$vscodeTextmateLocation, e3[r3].name, e3[r3].contentName, o2);
                }
              }
              return s2;
            }
            static _compilePatterns(e3, t3, n2) {
              let s2 = [];
              if (e3) for (let i2 = 0, o2 = e3.length; i2 < o2; i2++) {
                const o3 = e3[i2];
                let a2 = -1;
                if (o3.include) {
                  const e4 = r.parseInclude(o3.include);
                  switch (e4.kind) {
                    case 0:
                    case 1:
                      a2 = d.getCompiledRuleId(n2[o3.include], t3, n2);
                      break;
                    case 2:
                      let s3 = n2[e4.ruleName];
                      s3 && (a2 = d.getCompiledRuleId(s3, t3, n2));
                      break;
                    case 3:
                    case 4:
                      const r2 = e4.scopeName, i3 = 4 === e4.kind ? e4.ruleName : null, c2 = t3.getExternalGrammar(r2, n2);
                      if (c2) if (i3) {
                        let e5 = c2.repository[i3];
                        e5 && (a2 = d.getCompiledRuleId(e5, t3, c2.repository));
                      } else a2 = d.getCompiledRuleId(c2.repository.$self, t3, c2.repository);
                  }
                } else a2 = d.getCompiledRuleId(o3, t3, n2);
                if (-1 !== a2) {
                  const e4 = t3.getRule(a2);
                  let n3 = false;
                  if ((e4 instanceof u || e4 instanceof h || e4 instanceof p) && e4.hasMissingPatterns && 0 === e4.patterns.length && (n3 = true), n3) continue;
                  s2.push(a2);
                }
              }
              return { patterns: s2, hasMissingPatterns: (e3 ? e3.length : 0) !== s2.length };
            }
          }
          t2.RuleFactory = d;
          class f {
            constructor(e3, t3) {
              if (e3) {
                const t4 = e3.length;
                let n2 = 0, s2 = [], r2 = false;
                for (let i2 = 0; i2 < t4; i2++) if ("\\" === e3.charAt(i2) && i2 + 1 < t4) {
                  const t5 = e3.charAt(i2 + 1);
                  "z" === t5 ? (s2.push(e3.substring(n2, i2)), s2.push("$(?!\\n)(?<!\\n)"), n2 = i2 + 2) : "A" !== t5 && "G" !== t5 || (r2 = true), i2++;
                }
                this.hasAnchor = r2, 0 === n2 ? this.source = e3 : (s2.push(e3.substring(n2, t4)), this.source = s2.join(""));
              } else this.hasAnchor = false, this.source = e3;
              this.hasAnchor ? this._anchorCache = this._buildAnchorCache() : this._anchorCache = null, this.ruleId = t3, this.hasBackReferences = i.test(this.source);
            }
            clone() {
              return new f(this.source, this.ruleId);
            }
            setSource(e3) {
              this.source !== e3 && (this.source = e3, this.hasAnchor && (this._anchorCache = this._buildAnchorCache()));
            }
            resolveBackReferences(e3, t3) {
              let n2 = t3.map(((t4) => e3.substring(t4.start, t4.end)));
              return o.lastIndex = 0, this.source.replace(o, ((e4, t4) => s.escapeRegExpCharacters(n2[parseInt(t4, 10)] || "")));
            }
            _buildAnchorCache() {
              let e3, t3, n2, s2, r2 = [], i2 = [], o2 = [], a2 = [];
              for (e3 = 0, t3 = this.source.length; e3 < t3; e3++) n2 = this.source.charAt(e3), r2[e3] = n2, i2[e3] = n2, o2[e3] = n2, a2[e3] = n2, "\\" === n2 && e3 + 1 < t3 && (s2 = this.source.charAt(e3 + 1), "A" === s2 ? (r2[e3 + 1] = "\uFFFF", i2[e3 + 1] = "\uFFFF", o2[e3 + 1] = "A", a2[e3 + 1] = "A") : "G" === s2 ? (r2[e3 + 1] = "\uFFFF", i2[e3 + 1] = "G", o2[e3 + 1] = "\uFFFF", a2[e3 + 1] = "G") : (r2[e3 + 1] = s2, i2[e3 + 1] = s2, o2[e3 + 1] = s2, a2[e3 + 1] = s2), e3++);
              return { A0_G0: r2.join(""), A0_G1: i2.join(""), A1_G0: o2.join(""), A1_G1: a2.join("") };
            }
            resolveAnchors(e3, t3) {
              return this.hasAnchor && this._anchorCache ? e3 ? t3 ? this._anchorCache.A1_G1 : this._anchorCache.A1_G0 : t3 ? this._anchorCache.A0_G1 : this._anchorCache.A0_G0 : this.source;
            }
          }
          t2.RegExpSource = f;
          class m {
            constructor() {
              this._items = [], this._hasAnchors = false, this._cached = null, this._anchorCache = { A0_G0: null, A0_G1: null, A1_G0: null, A1_G1: null };
            }
            dispose() {
              this._disposeCaches();
            }
            _disposeCaches() {
              this._cached && (this._cached.dispose(), this._cached = null), this._anchorCache.A0_G0 && (this._anchorCache.A0_G0.dispose(), this._anchorCache.A0_G0 = null), this._anchorCache.A0_G1 && (this._anchorCache.A0_G1.dispose(), this._anchorCache.A0_G1 = null), this._anchorCache.A1_G0 && (this._anchorCache.A1_G0.dispose(), this._anchorCache.A1_G0 = null), this._anchorCache.A1_G1 && (this._anchorCache.A1_G1.dispose(), this._anchorCache.A1_G1 = null);
            }
            push(e3) {
              this._items.push(e3), this._hasAnchors = this._hasAnchors || e3.hasAnchor;
            }
            unshift(e3) {
              this._items.unshift(e3), this._hasAnchors = this._hasAnchors || e3.hasAnchor;
            }
            length() {
              return this._items.length;
            }
            setSource(e3, t3) {
              this._items[e3].source !== t3 && (this._disposeCaches(), this._items[e3].setSource(t3));
            }
            compile(e3) {
              if (!this._cached) {
                let t3 = this._items.map(((e4) => e4.source));
                this._cached = new g(e3, t3, this._items.map(((e4) => e4.ruleId)));
              }
              return this._cached;
            }
            compileAG(e3, t3, n2) {
              return this._hasAnchors ? t3 ? n2 ? (this._anchorCache.A1_G1 || (this._anchorCache.A1_G1 = this._resolveAnchors(e3, t3, n2)), this._anchorCache.A1_G1) : (this._anchorCache.A1_G0 || (this._anchorCache.A1_G0 = this._resolveAnchors(e3, t3, n2)), this._anchorCache.A1_G0) : n2 ? (this._anchorCache.A0_G1 || (this._anchorCache.A0_G1 = this._resolveAnchors(e3, t3, n2)), this._anchorCache.A0_G1) : (this._anchorCache.A0_G0 || (this._anchorCache.A0_G0 = this._resolveAnchors(e3, t3, n2)), this._anchorCache.A0_G0) : this.compile(e3);
            }
            _resolveAnchors(e3, t3, n2) {
              let s2 = this._items.map(((e4) => e4.resolveAnchors(t3, n2)));
              return new g(e3, s2, this._items.map(((e4) => e4.ruleId)));
            }
          }
          t2.RegExpSourceList = m;
          class g {
            constructor(e3, t3, n2) {
              this.regExps = t3, this.rules = n2, this.scanner = e3.createOnigScanner(t3);
            }
            dispose() {
              "function" == typeof this.scanner.dispose && this.scanner.dispose();
            }
            toString() {
              const e3 = [];
              for (let t3 = 0, n2 = this.rules.length; t3 < n2; t3++) e3.push("   - " + this.rules[t3] + ": " + this.regExps[t3]);
              return e3.join("\n");
            }
            findNextMatchSync(e3, t3, n2) {
              const s2 = this.scanner.findNextMatchSync(e3, t3, n2);
              return s2 ? { ruleId: this.rules[s2.index], captureIndices: s2.captureIndices } : null;
            }
          }
          t2.CompiledRule = g;
        }, 63: (e2, t2, n) => {
          Object.defineProperty(t2, "__esModule", { value: true }), t2.ThemeTrieElement = t2.ThemeTrieElementRule = t2.ColorMap = t2.fontStyleToString = t2.ParsedThemeRule = t2.parseTheme = t2.StyleAttributes = t2.ScopeStack = t2.Theme = void 0;
          const s = n(807);
          class r {
            constructor(e3, t3, n2) {
              this._colorMap = e3, this._defaults = t3, this._root = n2, this._cachedMatchRoot = new s.CachedFn(((e4) => this._root.match(e4)));
            }
            static createFromRawTheme(e3, t3) {
              return this.createFromParsedTheme(c(e3), t3);
            }
            static createFromParsedTheme(e3, t3) {
              return (function(e4, t4) {
                e4.sort(((e5, t5) => {
                  let n3 = s.strcmp(e5.scope, t5.scope);
                  return 0 !== n3 ? n3 : (n3 = s.strArrCmp(e5.parentScopes, t5.parentScopes), 0 !== n3 ? n3 : e5.index - t5.index);
                }));
                let n2 = 0, i2 = "#000000", o2 = "#ffffff", c2 = "", l2 = 0, h2 = 0;
                for (; e4.length >= 1 && "" === e4[0].scope; ) {
                  let t5 = e4.shift();
                  -1 !== t5.fontStyle && (n2 = t5.fontStyle), null !== t5.foreground && (i2 = t5.foreground), null !== t5.background && (o2 = t5.background), null !== t5.fontFamily && (c2 = t5.fontFamily), null !== t5.fontSize && (l2 = t5.fontSize), null !== t5.lineHeight && (h2 = t5.lineHeight);
                }
                let f = new u(t4), m = new a(n2, f.getId(i2), f.getId(o2), c2, l2, h2), g = new d(new p(0, null, -1, 0, 0, c2, l2, h2), []);
                for (let t5 = 0, n3 = e4.length; t5 < n3; t5++) {
                  let n4 = e4[t5];
                  g.insert(0, n4.scope, n4.parentScopes, n4.fontStyle, f.getId(n4.foreground), f.getId(n4.background), n4.fontFamily, n4.fontSize, n4.lineHeight);
                }
                return new r(f, m, g);
              })(e3, t3);
            }
            getColorMap() {
              return this._colorMap.getColorMap();
            }
            getDefaults() {
              return this._defaults;
            }
            match(e3) {
              if (null === e3) return this._defaults;
              const t3 = e3.scopeName, n2 = this._cachedMatchRoot.get(t3).find(((t4) => (function(e4, t5) {
                if (0 === t5.length) return true;
                for (let n3 = 0; n3 < t5.length; n3++) {
                  let s2 = t5[n3], r2 = false;
                  if (">" === s2) {
                    if (n3 === t5.length - 1) return false;
                    s2 = t5[++n3], r2 = true;
                  }
                  for (; e4 && !o(e4.scopeName, s2); ) {
                    if (r2) return false;
                    e4 = e4.parent;
                  }
                  if (!e4) return false;
                  e4 = e4.parent;
                }
                return true;
              })(e3.parent, t4.parentScopes)));
              return n2 ? new a(n2.fontStyle, n2.foreground, n2.background, n2.fontFamily, n2.fontSize, n2.lineHeight) : null;
            }
          }
          t2.Theme = r;
          class i {
            constructor(e3, t3) {
              this.parent = e3, this.scopeName = t3;
            }
            static push(e3, t3) {
              for (const n2 of t3) e3 = new i(e3, n2);
              return e3;
            }
            static from(...e3) {
              let t3 = null;
              for (let n2 = 0; n2 < e3.length; n2++) t3 = new i(t3, e3[n2]);
              return t3;
            }
            push(e3) {
              return new i(this, e3);
            }
            getSegments() {
              let e3 = this;
              const t3 = [];
              for (; e3; ) t3.push(e3.scopeName), e3 = e3.parent;
              return t3.reverse(), t3;
            }
            toString() {
              return this.getSegments().join(" ");
            }
            extends(e3) {
              return this === e3 || null !== this.parent && this.parent.extends(e3);
            }
            getExtensionIfDefined(e3) {
              const t3 = [];
              let n2 = this;
              for (; n2 && n2 !== e3; ) t3.push(n2.scopeName), n2 = n2.parent;
              return n2 === e3 ? t3.reverse() : void 0;
            }
          }
          function o(e3, t3) {
            return t3 === e3 || e3.startsWith(t3) && "." === e3[t3.length];
          }
          t2.ScopeStack = i;
          class a {
            constructor(e3, t3, n2, s2, r2, i2) {
              this.fontStyle = e3, this.foregroundId = t3, this.backgroundId = n2, this.fontFamily = s2, this.fontSize = r2, this.lineHeight = i2;
            }
          }
          function c(e3) {
            if (!e3) return [];
            if (!e3.settings || !Array.isArray(e3.settings)) return [];
            let t3 = e3.settings, n2 = [], r2 = 0;
            for (let e4 = 0, i2 = t3.length; e4 < i2; e4++) {
              let i3, o2 = t3[e4];
              if (!o2.settings) continue;
              if ("string" == typeof o2.scope) {
                let e5 = o2.scope;
                e5 = e5.replace(/^[,]+/, ""), e5 = e5.replace(/[,]+$/, ""), i3 = e5.split(",");
              } else i3 = Array.isArray(o2.scope) ? o2.scope : [""];
              let a2 = -1;
              if ("string" == typeof o2.settings.fontStyle) {
                a2 = 0;
                let e5 = o2.settings.fontStyle.split(" ");
                for (let t4 = 0, n3 = e5.length; t4 < n3; t4++) switch (e5[t4]) {
                  case "italic":
                    a2 |= 1;
                    break;
                  case "bold":
                    a2 |= 2;
                    break;
                  case "underline":
                    a2 |= 4;
                    break;
                  case "strikethrough":
                    a2 |= 8;
                }
              }
              let c2 = null;
              "string" == typeof o2.settings.foreground && s.isValidHexColor(o2.settings.foreground) && (c2 = o2.settings.foreground);
              let u2 = null;
              "string" == typeof o2.settings.background && s.isValidHexColor(o2.settings.background) && (u2 = o2.settings.background);
              let h2 = "";
              "string" == typeof o2.settings.fontFamily && (h2 = o2.settings.fontFamily);
              let p2 = 0;
              "number" == typeof o2.settings.fontSize && (p2 = o2.settings.fontSize);
              let d2 = 0;
              "number" == typeof o2.settings.lineHeight && (d2 = o2.settings.lineHeight);
              for (let t4 = 0, s2 = i3.length; t4 < s2; t4++) {
                let s3 = i3[t4].trim().split(" "), o3 = s3[s3.length - 1], f = null;
                s3.length > 1 && (f = s3.slice(0, s3.length - 1), f.reverse()), n2[r2++] = new l(o3, f, e4, a2, c2, u2, h2, p2, d2);
              }
            }
            return n2;
          }
          t2.StyleAttributes = a, t2.parseTheme = c;
          class l {
            constructor(e3, t3, n2, s2, r2, i2, o2, a2, c2) {
              this.scope = e3, this.parentScopes = t3, this.index = n2, this.fontStyle = s2, this.foreground = r2, this.background = i2, this.fontFamily = o2, this.fontSize = a2, this.lineHeight = c2;
            }
          }
          t2.ParsedThemeRule = l, t2.fontStyleToString = function(e3) {
            if (-1 === e3) return "not set";
            let t3 = "";
            return 1 & e3 && (t3 += "italic "), 2 & e3 && (t3 += "bold "), 4 & e3 && (t3 += "underline "), 8 & e3 && (t3 += "strikethrough "), "" === t3 && (t3 = "none"), t3.trim();
          };
          class u {
            constructor(e3) {
              if (this._lastColorId = 0, this._id2color = [], this._color2id = /* @__PURE__ */ Object.create(null), Array.isArray(e3)) {
                this._isFrozen = true;
                for (let t3 = 0, n2 = e3.length; t3 < n2; t3++) this._color2id[e3[t3]] = t3, this._id2color[t3] = e3[t3];
              } else this._isFrozen = false;
            }
            getId(e3) {
              if (null === e3) return 0;
              e3 = e3.toUpperCase();
              let t3 = this._color2id[e3];
              if (t3) return t3;
              if (this._isFrozen) throw new Error(`Missing color in color map - ${e3}`);
              return t3 = ++this._lastColorId, this._color2id[e3] = t3, this._id2color[t3] = e3, t3;
            }
            getColorMap() {
              return this._id2color.slice(0);
            }
          }
          t2.ColorMap = u;
          const h = Object.freeze([]);
          class p {
            constructor(e3, t3, n2, s2, r2, i2, o2, a2) {
              this.scopeDepth = e3, this.parentScopes = t3 || h, this.fontStyle = n2, this.foreground = s2, this.background = r2, this.fontFamily = i2, this.fontSize = o2, this.lineHeight = a2;
            }
            clone() {
              return new p(this.scopeDepth, this.parentScopes, this.fontStyle, this.foreground, this.background, this.fontFamily, this.fontSize, this.lineHeight);
            }
            static cloneArr(e3) {
              let t3 = [];
              for (let n2 = 0, s2 = e3.length; n2 < s2; n2++) t3[n2] = e3[n2].clone();
              return t3;
            }
            acceptOverwrite(e3, t3, n2, s2, r2, i2, o2) {
              this.scopeDepth > e3 ? console.log("how did this happen?") : this.scopeDepth = e3, -1 !== t3 && (this.fontStyle = t3), 0 !== n2 && (this.foreground = n2), 0 !== s2 && (this.background = s2), "" !== r2 && (this.fontFamily = r2), 0 !== i2 && (this.fontSize = i2), 0 !== o2 && (this.lineHeight = o2);
            }
          }
          t2.ThemeTrieElementRule = p;
          class d {
            constructor(e3, t3 = [], n2 = {}) {
              this._mainRule = e3, this._children = n2, this._rulesWithParentScopes = t3;
            }
            static _cmpBySpecificity(e3, t3) {
              if (e3.scopeDepth !== t3.scopeDepth) return t3.scopeDepth - e3.scopeDepth;
              let n2 = 0, s2 = 0;
              for (; ">" === e3.parentScopes[n2] && n2++, ">" === t3.parentScopes[s2] && s2++, !(n2 >= e3.parentScopes.length || s2 >= t3.parentScopes.length); ) {
                const r2 = t3.parentScopes[s2].length - e3.parentScopes[n2].length;
                if (0 !== r2) return r2;
                n2++, s2++;
              }
              return t3.parentScopes.length - e3.parentScopes.length;
            }
            match(e3) {
              if ("" !== e3) {
                let t4, n2, s2 = e3.indexOf(".");
                if (-1 === s2 ? (t4 = e3, n2 = "") : (t4 = e3.substring(0, s2), n2 = e3.substring(s2 + 1)), this._children.hasOwnProperty(t4)) return this._children[t4].match(n2);
              }
              const t3 = this._rulesWithParentScopes.concat(this._mainRule);
              return t3.sort(d._cmpBySpecificity), t3;
            }
            insert(e3, t3, n2, s2, r2, i2, o2, a2, c2) {
              if ("" === t3) return void this._doInsertHere(e3, n2, s2, r2, i2, o2, a2, c2);
              let l2, u2, h2, f = t3.indexOf(".");
              -1 === f ? (l2 = t3, u2 = "") : (l2 = t3.substring(0, f), u2 = t3.substring(f + 1)), this._children.hasOwnProperty(l2) ? h2 = this._children[l2] : (h2 = new d(this._mainRule.clone(), p.cloneArr(this._rulesWithParentScopes)), this._children[l2] = h2), h2.insert(e3 + 1, u2, n2, s2, r2, i2, o2, a2, c2);
            }
            _doInsertHere(e3, t3, n2, r2, i2, o2, a2, c2) {
              if (null !== t3) {
                for (let l2 = 0, u2 = this._rulesWithParentScopes.length; l2 < u2; l2++) {
                  let u3 = this._rulesWithParentScopes[l2];
                  if (0 === s.strArrCmp(u3.parentScopes, t3)) return void u3.acceptOverwrite(e3, n2, r2, i2, o2, a2, c2);
                }
                -1 === n2 && (n2 = this._mainRule.fontStyle), 0 === r2 && (r2 = this._mainRule.foreground), 0 === i2 && (i2 = this._mainRule.background), "" === o2 && (o2 = this._mainRule.fontFamily), 0 === a2 && (a2 = this._mainRule.fontSize), 0 === c2 && (c2 = this._mainRule.lineHeight), this._rulesWithParentScopes.push(new p(e3, t3, n2, r2, i2, o2, a2, c2));
              } else this._mainRule.acceptOverwrite(e3, n2, r2, i2, o2, a2, c2);
            }
          }
          t2.ThemeTrieElement = d;
        }, 807: (e2, t2) => {
          function n(e3) {
            return Array.isArray(e3) ? (function(e4) {
              let t3 = [];
              for (let s2 = 0, r2 = e4.length; s2 < r2; s2++) t3[s2] = n(e4[s2]);
              return t3;
            })(e3) : "object" == typeof e3 ? (function(e4) {
              let t3 = {};
              for (let s2 in e4) t3[s2] = n(e4[s2]);
              return t3;
            })(e3) : e3;
          }
          Object.defineProperty(t2, "__esModule", { value: true }), t2.containsRTL = t2.performanceNow = t2.CachedFn = t2.escapeRegExpCharacters = t2.isValidHexColor = t2.strArrCmp = t2.strcmp = t2.RegexSource = t2.basename = t2.mergeObjects = t2.clone = void 0, t2.clone = function(e3) {
            return n(e3);
          }, t2.mergeObjects = function(e3, ...t3) {
            return t3.forEach(((t4) => {
              for (let n2 in t4) e3[n2] = t4[n2];
            })), e3;
          }, t2.basename = function e3(t3) {
            const n2 = ~t3.lastIndexOf("/") || ~t3.lastIndexOf("\\");
            return 0 === n2 ? t3 : ~n2 == t3.length - 1 ? e3(t3.substring(0, t3.length - 1)) : t3.substr(1 + ~n2);
          };
          let s, r = /\$(\d+)|\${(\d+):\/(downcase|upcase)}/g;
          function i(e3, t3) {
            return e3 < t3 ? -1 : e3 > t3 ? 1 : 0;
          }
          t2.RegexSource = class {
            static hasCaptures(e3) {
              return null !== e3 && (r.lastIndex = 0, r.test(e3));
            }
            static replaceCaptures(e3, t3, n2) {
              return e3.replace(r, ((e4, s2, r2, i2) => {
                let o = n2[parseInt(s2 || r2, 10)];
                if (!o) return e4;
                {
                  let e5 = t3.substring(o.start, o.end);
                  for (; "." === e5[0]; ) e5 = e5.substring(1);
                  switch (i2) {
                    case "downcase":
                      return e5.toLowerCase();
                    case "upcase":
                      return e5.toUpperCase();
                    default:
                      return e5;
                  }
                }
              }));
            }
          }, t2.strcmp = i, t2.strArrCmp = function(e3, t3) {
            if (null === e3 && null === t3) return 0;
            if (!e3) return -1;
            if (!t3) return 1;
            let n2 = e3.length, s2 = t3.length;
            if (n2 === s2) {
              for (let s3 = 0; s3 < n2; s3++) {
                let n3 = i(e3[s3], t3[s3]);
                if (0 !== n3) return n3;
              }
              return 0;
            }
            return n2 - s2;
          }, t2.isValidHexColor = function(e3) {
            return !!(/^#[0-9a-f]{6}$/i.test(e3) || /^#[0-9a-f]{8}$/i.test(e3) || /^#[0-9a-f]{3}$/i.test(e3) || /^#[0-9a-f]{4}$/i.test(e3));
          }, t2.escapeRegExpCharacters = function(e3) {
            return e3.replace(/[\-\\\{\}\*\+\?\|\^\$\.\,\[\]\(\)\#\s]/g, "\\$&");
          }, t2.CachedFn = class {
            constructor(e3) {
              this.fn = e3, this.cache = /* @__PURE__ */ new Map();
            }
            get(e3) {
              if (this.cache.has(e3)) return this.cache.get(e3);
              const t3 = this.fn(e3);
              return this.cache.set(e3, t3), t3;
            }
          }, t2.performanceNow = "undefined" == typeof performance ? function() {
            return Date.now();
          } : function() {
            return performance.now();
          }, t2.containsRTL = function(e3) {
            return s || (s = /(?:[\u05BE\u05C0\u05C3\u05C6\u05D0-\u05F4\u0608\u060B\u060D\u061B-\u064A\u066D-\u066F\u0671-\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u0710\u0712-\u072F\u074D-\u07A5\u07B1-\u07EA\u07F4\u07F5\u07FA\u07FE-\u0815\u081A\u0824\u0828\u0830-\u0858\u085E-\u088E\u08A0-\u08C9\u200F\uFB1D\uFB1F-\uFB28\uFB2A-\uFD3D\uFD50-\uFDC7\uFDF0-\uFDFC\uFE70-\uFEFC]|\uD802[\uDC00-\uDD1B\uDD20-\uDE00\uDE10-\uDE35\uDE40-\uDEE4\uDEEB-\uDF35\uDF40-\uDFFF]|\uD803[\uDC00-\uDD23\uDE80-\uDEA9\uDEAD-\uDF45\uDF51-\uDF81\uDF86-\uDFF6]|\uD83A[\uDC00-\uDCCF\uDD00-\uDD43\uDD4B-\uDFFF]|\uD83B[\uDC00-\uDEBB])/), s.test(e3);
          };
        } }, t = {};
        return (function n(s) {
          var r = t[s];
          if (void 0 !== r) return r.exports;
          var i = t[s] = { exports: {} };
          return e[s].call(i.exports, i, i.exports, n), i.exports;
        })(625);
      })()));
    })(main);
    return main.exports;
  }
  var main2, hasRequiredMain;
  var init_main = __esm({
    "node_modules/@codingame/monaco-vscode-api/external/vscode-textmate/release/main.js"() {
      init_main4();
      main2 = main.exports;
    }
  });

  // node_modules/@codingame/monaco-vscode-api/_virtual/main.js
  var main_exports = {};
  __export(main_exports, {
    default: () => main3,
    main: () => main$1
  });
  function _mergeNamespaces$1(n, m) {
    m.forEach(function(e) {
      e && typeof e !== "string" && !Array.isArray(e) && Object.keys(e).forEach(function(k) {
        if (k !== "default" && !(k in n)) {
          var d = Object.getOwnPropertyDescriptor(e, k);
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: function() {
              return e[k];
            }
          });
        }
      });
    });
    return Object.freeze(n);
  }
  var mainExports, main3, main$1;
  var init_main2 = __esm({
    "node_modules/@codingame/monaco-vscode-api/_virtual/main.js"() {
      init_commonjsHelpers();
      init_main();
      mainExports = requireMain();
      main3 = getDefaultExportFromCjs(mainExports);
      main$1 = _mergeNamespaces$1({
        __proto__: null,
        default: main3
      }, [mainExports]);
    }
  });

  // node_modules/@codingame/monaco-vscode-textmate-service-override/_virtual/main3.js
  var main4;
  var init_main3 = __esm({
    "node_modules/@codingame/monaco-vscode-textmate-service-override/_virtual/main3.js"() {
      main4 = { exports: {} };
    }
  });

  // node_modules/@codingame/monaco-vscode-textmate-service-override/external/vscode-oniguruma/release/main.js
  function requireMain2() {
    if (hasRequiredMain2) return main4.exports;
    hasRequiredMain2 = 1;
    (function(module, exports) {
      !(function(t, n) {
        module.exports = n();
      })(main5, (() => {
        return t = { 770: function(t2, n2, e) {
          var r = this && this.__importDefault || function(t3) {
            return t3 && t3.__esModule ? t3 : { default: t3 };
          };
          Object.defineProperty(n2, "__esModule", { value: true }), n2.setDefaultDebugCall = n2.createOnigScanner = n2.createOnigString = n2.loadWASM = n2.OnigScanner = n2.OnigString = void 0;
          const i = r(e(418));
          let o = null, a = false;
          class f {
            static _utf8ByteLength(t3) {
              let n3 = 0;
              for (let e2 = 0, r2 = t3.length; e2 < r2; e2++) {
                const i2 = t3.charCodeAt(e2);
                let o2 = i2, a2 = false;
                if (i2 >= 55296 && i2 <= 56319 && e2 + 1 < r2) {
                  const n4 = t3.charCodeAt(e2 + 1);
                  n4 >= 56320 && n4 <= 57343 && (o2 = 65536 + (i2 - 55296 << 10) | n4 - 56320, a2 = true);
                }
                n3 += o2 <= 127 ? 1 : o2 <= 2047 ? 2 : o2 <= 65535 ? 3 : 4, a2 && e2++;
              }
              return n3;
            }
            constructor(t3) {
              const n3 = t3.length, e2 = f._utf8ByteLength(t3), r2 = e2 !== n3, i2 = r2 ? new Uint32Array(n3 + 1) : null;
              r2 && (i2[n3] = e2);
              const o2 = r2 ? new Uint32Array(e2 + 1) : null;
              r2 && (o2[e2] = n3);
              const a2 = new Uint8Array(e2);
              let s2 = 0;
              for (let e3 = 0; e3 < n3; e3++) {
                const f2 = t3.charCodeAt(e3);
                let u2 = f2, c2 = false;
                if (f2 >= 55296 && f2 <= 56319 && e3 + 1 < n3) {
                  const n4 = t3.charCodeAt(e3 + 1);
                  n4 >= 56320 && n4 <= 57343 && (u2 = 65536 + (f2 - 55296 << 10) | n4 - 56320, c2 = true);
                }
                r2 && (i2[e3] = s2, c2 && (i2[e3 + 1] = s2), u2 <= 127 ? o2[s2 + 0] = e3 : u2 <= 2047 ? (o2[s2 + 0] = e3, o2[s2 + 1] = e3) : u2 <= 65535 ? (o2[s2 + 0] = e3, o2[s2 + 1] = e3, o2[s2 + 2] = e3) : (o2[s2 + 0] = e3, o2[s2 + 1] = e3, o2[s2 + 2] = e3, o2[s2 + 3] = e3)), u2 <= 127 ? a2[s2++] = u2 : u2 <= 2047 ? (a2[s2++] = 192 | (1984 & u2) >>> 6, a2[s2++] = 128 | (63 & u2) >>> 0) : u2 <= 65535 ? (a2[s2++] = 224 | (61440 & u2) >>> 12, a2[s2++] = 128 | (4032 & u2) >>> 6, a2[s2++] = 128 | (63 & u2) >>> 0) : (a2[s2++] = 240 | (1835008 & u2) >>> 18, a2[s2++] = 128 | (258048 & u2) >>> 12, a2[s2++] = 128 | (4032 & u2) >>> 6, a2[s2++] = 128 | (63 & u2) >>> 0), c2 && e3++;
              }
              this.utf16Length = n3, this.utf8Length = e2, this.utf16Value = t3, this.utf8Value = a2, this.utf16OffsetToUtf8 = i2, this.utf8OffsetToUtf16 = o2;
            }
            createString(t3) {
              const n3 = t3._omalloc(this.utf8Length);
              return t3.HEAPU8.set(this.utf8Value, n3), n3;
            }
          }
          class s {
            constructor(t3) {
              if (this.id = ++s.LAST_ID, !o) throw new Error("Must invoke loadWASM first.");
              this._onigBinding = o, this.content = t3;
              const n3 = new f(t3);
              this.utf16Length = n3.utf16Length, this.utf8Length = n3.utf8Length, this.utf16OffsetToUtf8 = n3.utf16OffsetToUtf8, this.utf8OffsetToUtf16 = n3.utf8OffsetToUtf16, this.utf8Length < 1e4 && !s._sharedPtrInUse ? (s._sharedPtr || (s._sharedPtr = o._omalloc(1e4)), s._sharedPtrInUse = true, o.HEAPU8.set(n3.utf8Value, s._sharedPtr), this.ptr = s._sharedPtr) : this.ptr = n3.createString(o);
            }
            convertUtf8OffsetToUtf16(t3) {
              return this.utf8OffsetToUtf16 ? t3 < 0 ? 0 : t3 > this.utf8Length ? this.utf16Length : this.utf8OffsetToUtf16[t3] : t3;
            }
            convertUtf16OffsetToUtf8(t3) {
              return this.utf16OffsetToUtf8 ? t3 < 0 ? 0 : t3 > this.utf16Length ? this.utf8Length : this.utf16OffsetToUtf8[t3] : t3;
            }
            dispose() {
              this.ptr === s._sharedPtr ? s._sharedPtrInUse = false : this._onigBinding._ofree(this.ptr);
            }
          }
          n2.OnigString = s, s.LAST_ID = 0, s._sharedPtr = 0, s._sharedPtrInUse = false;
          class u {
            constructor(t3) {
              if (!o) throw new Error("Must invoke loadWASM first.");
              const n3 = [], e2 = [];
              for (let r3 = 0, i3 = t3.length; r3 < i3; r3++) {
                const i4 = new f(t3[r3]);
                n3[r3] = i4.createString(o), e2[r3] = i4.utf8Length;
              }
              const r2 = o._omalloc(4 * t3.length);
              o.HEAPU32.set(n3, r2 / 4);
              const i2 = o._omalloc(4 * t3.length);
              o.HEAPU32.set(e2, i2 / 4);
              const a2 = o._createOnigScanner(r2, i2, t3.length);
              for (let e3 = 0, r3 = t3.length; e3 < r3; e3++) o._ofree(n3[e3]);
              o._ofree(i2), o._ofree(r2), 0 === a2 && (function(t4) {
                throw new Error(t4.UTF8ToString(t4._getLastOnigError()));
              })(o), this._onigBinding = o, this._ptr = a2;
            }
            dispose() {
              this._onigBinding._freeOnigScanner(this._ptr);
            }
            findNextMatchSync(t3, n3, e2) {
              let r2 = a, i2 = 0;
              if ("number" == typeof e2 ? (8 & e2 && (r2 = true), i2 = e2) : "boolean" == typeof e2 && (r2 = e2), "string" == typeof t3) {
                t3 = new s(t3);
                const e3 = this._findNextMatchSync(t3, n3, r2, i2);
                return t3.dispose(), e3;
              }
              return this._findNextMatchSync(t3, n3, r2, i2);
            }
            _findNextMatchSync(t3, n3, e2, r2) {
              const i2 = this._onigBinding;
              let o2;
              if (o2 = e2 ? i2._findNextOnigScannerMatchDbg(this._ptr, t3.id, t3.ptr, t3.utf8Length, t3.convertUtf16OffsetToUtf8(n3), r2) : i2._findNextOnigScannerMatch(this._ptr, t3.id, t3.ptr, t3.utf8Length, t3.convertUtf16OffsetToUtf8(n3), r2), 0 === o2) return null;
              const a2 = i2.HEAPU32;
              let f2 = o2 / 4;
              const s2 = a2[f2++], u2 = a2[f2++];
              let c2 = [];
              for (let n4 = 0; n4 < u2; n4++) {
                const e3 = t3.convertUtf8OffsetToUtf16(a2[f2++]), r3 = t3.convertUtf8OffsetToUtf16(a2[f2++]);
                c2[n4] = { start: e3, end: r3, length: r3 - e3 };
              }
              return { index: s2, captureIndices: c2 };
            }
          }
          n2.OnigScanner = u;
          let c = false, l = null;
          n2.loadWASM = function(t3) {
            if (c) return l;
            let n3, e2, r2, a2;
            if (c = true, (function(t4) {
              return "function" == typeof t4.instantiator;
            })(t3)) n3 = t3.instantiator, e2 = t3.print;
            else {
              let r3;
              !(function(t4) {
                return void 0 !== t4.data;
              })(t3) ? r3 = t3 : (r3 = t3.data, e2 = t3.print), n3 = (function(t4) {
                return "undefined" != typeof Response && t4 instanceof Response;
              })(r3) ? "function" == typeof WebAssembly.instantiateStreaming ? /* @__PURE__ */ (function(t4) {
                return (n4) => WebAssembly.instantiateStreaming(t4, n4);
              })(r3) : /* @__PURE__ */ (function(t4) {
                return async (n4) => {
                  const e3 = await t4.arrayBuffer();
                  return WebAssembly.instantiate(e3, n4);
                };
              })(r3) : /* @__PURE__ */ (function(t4) {
                return (n4) => WebAssembly.instantiate(t4, n4);
              })(r3);
            }
            return l = new Promise(((t4, n4) => {
              r2 = t4, a2 = n4;
            })), (function(t4, n4, e3, r3) {
              (0, i.default)({ print: n4, instantiateWasm: (n5, e4) => {
                if ("undefined" == typeof performance) {
                  const t5 = () => Date.now();
                  n5.env.emscripten_get_now = t5, n5.wasi_snapshot_preview1.emscripten_get_now = t5;
                }
                return t4(n5).then(((t5) => e4(t5.instance)), r3), {};
              } }).then(((t5) => {
                o = t5, e3();
              }));
            })(n3, e2, r2, a2), l;
          }, n2.createOnigString = function(t3) {
            return new s(t3);
          }, n2.createOnigScanner = function(t3) {
            return new u(t3);
          }, n2.setDefaultDebugCall = function(t3) {
            a = t3;
          };
        }, 418: (t2) => {
          var n2 = (function(t3) {
            var n3, e, r = void 0 !== (t3 = t3 || {}) ? t3 : {};
            r.ready = new Promise((function(t4, r2) {
              n3 = t4, e = r2;
            }));
            var i, o = Object.assign({}, r), c = "";
            function l(t4) {
              return r.locateFile ? r.locateFile(t4, c) : c + t4;
            }
            i = function(t4) {
              let n4;
              return "function" == typeof readbuffer ? new Uint8Array(readbuffer(t4)) : (n4 = read(t4, "binary"), m("object" == typeof n4), n4);
            }, "undefined" != typeof onig_print && ("undefined" == typeof console && (console = {}), console.log = onig_print, console.warn = console.error = "undefined" != typeof printErr ? printErr : onig_print);
            var h, p, d = r.print || console.log.bind(console), g = r.printErr || console.warn.bind(console);
            Object.assign(r, o), o = null, r.wasmBinary && (h = r.wasmBinary), "object" != typeof WebAssembly && k("no native wasm support detected");
            var _ = false;
            function m(t4, n4) {
              t4 || k(n4);
            }
            var y, w, S, v = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0;
            function A(t4, n4, e2) {
              for (var r2 = n4 + e2, i2 = n4; t4[i2] && !(i2 >= r2); ) ++i2;
              if (i2 - n4 > 16 && t4.buffer && v) return v.decode(t4.subarray(n4, i2));
              for (var o2 = ""; n4 < i2; ) {
                var a = t4[n4++];
                if (128 & a) {
                  var f = 63 & t4[n4++];
                  if (192 != (224 & a)) {
                    var s = 63 & t4[n4++];
                    if ((a = 224 == (240 & a) ? (15 & a) << 12 | f << 6 | s : (7 & a) << 18 | f << 12 | s << 6 | 63 & t4[n4++]) < 65536) o2 += String.fromCharCode(a);
                    else {
                      var u = a - 65536;
                      o2 += String.fromCharCode(55296 | u >> 10, 56320 | 1023 & u);
                    }
                  } else o2 += String.fromCharCode((31 & a) << 6 | f);
                } else o2 += String.fromCharCode(a);
              }
              return o2;
            }
            function b(t4, n4) {
              return t4 ? A(w, t4, n4) : "";
            }
            function O(t4) {
              y = t4, r.HEAP8 = new Int8Array(t4), r.HEAP16 = new Int16Array(t4), r.HEAP32 = new Int32Array(t4), r.HEAPU8 = w = new Uint8Array(t4), r.HEAPU16 = new Uint16Array(t4), r.HEAPU32 = S = new Uint32Array(t4), r.HEAPF32 = new Float32Array(t4), r.HEAPF64 = new Float64Array(t4);
            }
            var U = [], P = [], R = [];
            function x() {
              if (r.preRun) for ("function" == typeof r.preRun && (r.preRun = [r.preRun]); r.preRun.length; ) M(r.preRun.shift());
              G(U);
            }
            function T() {
              G(P);
            }
            function E() {
              if (r.postRun) for ("function" == typeof r.postRun && (r.postRun = [r.postRun]); r.postRun.length; ) I(r.postRun.shift());
              G(R);
            }
            function M(t4) {
              U.unshift(t4);
            }
            function L(t4) {
              P.unshift(t4);
            }
            function I(t4) {
              R.unshift(t4);
            }
            var W = 0, C = null;
            function N(t4) {
              W++, r.monitorRunDependencies && r.monitorRunDependencies(W);
            }
            function j(t4) {
              if (W--, r.monitorRunDependencies && r.monitorRunDependencies(W), 0 == W && C) {
                var n4 = C;
                C = null, n4();
              }
            }
            function k(t4) {
              r.onAbort && r.onAbort(t4), g(t4 = "Aborted(" + t4 + ")"), _ = true, t4 += ". Build with -sASSERTIONS for more info.";
              var n4 = new WebAssembly.RuntimeError(t4);
              throw e(n4), n4;
            }
            var B, H, F = "data:application/octet-stream;base64,";
            function V(t4) {
              return t4.startsWith(F);
            }
            function z(t4) {
              try {
                if (t4 == B && h) return new Uint8Array(h);
                if (i) return i(t4);
                throw "both async and sync fetching of the wasm failed";
              } catch (t5) {
                k(t5);
              }
            }
            function q() {
              return Promise.resolve().then((function() {
                return z(B);
              }));
            }
            function Y() {
              var t4 = { env: nt, wasi_snapshot_preview1: nt };
              function n4(t5, n5) {
                var e2 = t5.exports;
                r.asm = e2, O((p = r.asm.memory).buffer), L(r.asm.__wasm_call_ctors), j();
              }
              function i2(t5) {
                n4(t5.instance);
              }
              function o2(n5) {
                return q().then((function(n6) {
                  return WebAssembly.instantiate(n6, t4);
                })).then((function(t5) {
                  return t5;
                })).then(n5, (function(t5) {
                  g("failed to asynchronously prepare wasm: " + t5), k(t5);
                }));
              }
              if (N(), r.instantiateWasm) try {
                return r.instantiateWasm(t4, n4);
              } catch (t5) {
                g("Module.instantiateWasm callback failed with error: " + t5), e(t5);
              }
              return (h || "function" != typeof WebAssembly.instantiateStreaming || V(B) || "function" != typeof fetch ? o2(i2) : fetch(B, { credentials: "same-origin" }).then((function(n5) {
                return WebAssembly.instantiateStreaming(n5, t4).then(i2, (function(t5) {
                  return g("wasm streaming compile failed: " + t5), g("falling back to ArrayBuffer instantiation"), o2(i2);
                }));
              }))).catch(e), {};
            }
            function G(t4) {
              for (; t4.length > 0; ) t4.shift()(r);
            }
            function J(t4, n4, e2) {
              w.copyWithin(t4, n4, n4 + e2);
            }
            function K(t4) {
              try {
                return p.grow(t4 - y.byteLength + 65535 >>> 16), O(p.buffer), 1;
              } catch (t5) {
              }
            }
            function Q(t4) {
              var n4, e2 = w.length, r2 = 2147483648;
              if ((t4 >>>= 0) > r2) return false;
              for (var i2 = 1; i2 <= 4; i2 *= 2) {
                var o2 = e2 * (1 + 0.2 / i2);
                if (o2 = Math.min(o2, t4 + 100663296), K(Math.min(r2, (n4 = Math.max(t4, o2)) + (65536 - n4 % 65536) % 65536))) return true;
              }
              return false;
            }
            V(B = "onig.wasm") || (B = l(B)), H = "undefined" != typeof dateNow ? dateNow : () => performance.now();
            var X = [null, [], []];
            function Z(t4, n4) {
              var e2 = X[t4];
              0 === n4 || 10 === n4 ? ((1 === t4 ? d : g)(A(e2, 0)), e2.length = 0) : e2.push(n4);
            }
            function $(t4, n4, e2, r2) {
              for (var i2 = 0, o2 = 0; o2 < e2; o2++) {
                var a = S[n4 >> 2], f = S[n4 + 4 >> 2];
                n4 += 8;
                for (var s = 0; s < f; s++) Z(t4, w[a + s]);
                i2 += f;
              }
              return S[r2 >> 2] = i2, 0;
            }
            var tt, nt = { emscripten_get_now: H, emscripten_memcpy_big: J, emscripten_resize_heap: Q, fd_write: $ };
            function et(t4) {
              function e2() {
                tt || (tt = true, r.calledRun = true, _ || (T(), n3(r), r.onRuntimeInitialized && r.onRuntimeInitialized(), E()));
              }
              W > 0 || (x(), W > 0 || (r.setStatus ? (r.setStatus("Running..."), setTimeout((function() {
                setTimeout((function() {
                  r.setStatus("");
                }), 1), e2();
              }), 1)) : e2()));
            }
            if (Y(), r.___wasm_call_ctors = function() {
              return (r.___wasm_call_ctors = r.asm.__wasm_call_ctors).apply(null, arguments);
            }, r.___errno_location = function() {
              return (r.___errno_location = r.asm.__errno_location).apply(null, arguments);
            }, r._omalloc = function() {
              return (r._omalloc = r.asm.omalloc).apply(null, arguments);
            }, r._ofree = function() {
              return (r._ofree = r.asm.ofree).apply(null, arguments);
            }, r._getLastOnigError = function() {
              return (r._getLastOnigError = r.asm.getLastOnigError).apply(null, arguments);
            }, r._createOnigScanner = function() {
              return (r._createOnigScanner = r.asm.createOnigScanner).apply(null, arguments);
            }, r._freeOnigScanner = function() {
              return (r._freeOnigScanner = r.asm.freeOnigScanner).apply(null, arguments);
            }, r._findNextOnigScannerMatch = function() {
              return (r._findNextOnigScannerMatch = r.asm.findNextOnigScannerMatch).apply(null, arguments);
            }, r._findNextOnigScannerMatchDbg = function() {
              return (r._findNextOnigScannerMatchDbg = r.asm.findNextOnigScannerMatchDbg).apply(null, arguments);
            }, r.stackSave = function() {
              return (r.stackSave = r.asm.stackSave).apply(null, arguments);
            }, r.stackRestore = function() {
              return (r.stackRestore = r.asm.stackRestore).apply(null, arguments);
            }, r.stackAlloc = function() {
              return (r.stackAlloc = r.asm.stackAlloc).apply(null, arguments);
            }, r.dynCall_jiji = function() {
              return (r.dynCall_jiji = r.asm.dynCall_jiji).apply(null, arguments);
            }, r.UTF8ToString = b, C = function t4() {
              tt || et(), tt || (C = t4);
            }, r.preInit) for ("function" == typeof r.preInit && (r.preInit = [r.preInit]); r.preInit.length > 0; ) r.preInit.pop()();
            return et(), t3.ready;
          });
          t2.exports = n2;
        } }, n = {}, (function e(r) {
          var i = n[r];
          if (void 0 !== i) return i.exports;
          var o = n[r] = { exports: {} };
          return t[r].call(o.exports, o, o.exports, e), o.exports;
        })(770);
        var t, n;
      }));
    })(main4);
    return main4.exports;
  }
  var main5, hasRequiredMain2;
  var init_main5 = __esm({
    "node_modules/@codingame/monaco-vscode-textmate-service-override/external/vscode-oniguruma/release/main.js"() {
      init_main3();
      main5 = main4.exports;
    }
  });

  // node_modules/@codingame/monaco-vscode-textmate-service-override/_virtual/main2.js
  var main2_exports = {};
  __export(main2_exports, {
    default: () => main6,
    main: () => main$12
  });
  function _mergeNamespaces$12(n, m) {
    m.forEach(function(e) {
      e && typeof e !== "string" && !Array.isArray(e) && Object.keys(e).forEach(function(k) {
        if (k !== "default" && !(k in n)) {
          var d = Object.getOwnPropertyDescriptor(e, k);
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: function() {
              return e[k];
            }
          });
        }
      });
    });
    return Object.freeze(n);
  }
  var mainExports2, main6, main$12;
  var init_main22 = __esm({
    "node_modules/@codingame/monaco-vscode-textmate-service-override/_virtual/main2.js"() {
      init_commonjsHelpers();
      init_main5();
      mainExports2 = requireMain2();
      main6 = getDefaultExportFromCjs(mainExports2);
      main$12 = _mergeNamespaces$12({
        __proto__: null,
        default: main6
      }, [mainExports2]);
    }
  });

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/charCode.js
  var CharCode;
  (function(CharCode2) {
    CharCode2[CharCode2["Null"] = 0] = "Null";
    CharCode2[CharCode2["Backspace"] = 8] = "Backspace";
    CharCode2[CharCode2["Tab"] = 9] = "Tab";
    CharCode2[CharCode2["LineFeed"] = 10] = "LineFeed";
    CharCode2[CharCode2["CarriageReturn"] = 13] = "CarriageReturn";
    CharCode2[CharCode2["Space"] = 32] = "Space";
    CharCode2[CharCode2["ExclamationMark"] = 33] = "ExclamationMark";
    CharCode2[CharCode2["DoubleQuote"] = 34] = "DoubleQuote";
    CharCode2[CharCode2["Hash"] = 35] = "Hash";
    CharCode2[CharCode2["DollarSign"] = 36] = "DollarSign";
    CharCode2[CharCode2["PercentSign"] = 37] = "PercentSign";
    CharCode2[CharCode2["Ampersand"] = 38] = "Ampersand";
    CharCode2[CharCode2["SingleQuote"] = 39] = "SingleQuote";
    CharCode2[CharCode2["OpenParen"] = 40] = "OpenParen";
    CharCode2[CharCode2["CloseParen"] = 41] = "CloseParen";
    CharCode2[CharCode2["Asterisk"] = 42] = "Asterisk";
    CharCode2[CharCode2["Plus"] = 43] = "Plus";
    CharCode2[CharCode2["Comma"] = 44] = "Comma";
    CharCode2[CharCode2["Dash"] = 45] = "Dash";
    CharCode2[CharCode2["Period"] = 46] = "Period";
    CharCode2[CharCode2["Slash"] = 47] = "Slash";
    CharCode2[CharCode2["Digit0"] = 48] = "Digit0";
    CharCode2[CharCode2["Digit1"] = 49] = "Digit1";
    CharCode2[CharCode2["Digit2"] = 50] = "Digit2";
    CharCode2[CharCode2["Digit3"] = 51] = "Digit3";
    CharCode2[CharCode2["Digit4"] = 52] = "Digit4";
    CharCode2[CharCode2["Digit5"] = 53] = "Digit5";
    CharCode2[CharCode2["Digit6"] = 54] = "Digit6";
    CharCode2[CharCode2["Digit7"] = 55] = "Digit7";
    CharCode2[CharCode2["Digit8"] = 56] = "Digit8";
    CharCode2[CharCode2["Digit9"] = 57] = "Digit9";
    CharCode2[CharCode2["Colon"] = 58] = "Colon";
    CharCode2[CharCode2["Semicolon"] = 59] = "Semicolon";
    CharCode2[CharCode2["LessThan"] = 60] = "LessThan";
    CharCode2[CharCode2["Equals"] = 61] = "Equals";
    CharCode2[CharCode2["GreaterThan"] = 62] = "GreaterThan";
    CharCode2[CharCode2["QuestionMark"] = 63] = "QuestionMark";
    CharCode2[CharCode2["AtSign"] = 64] = "AtSign";
    CharCode2[CharCode2["A"] = 65] = "A";
    CharCode2[CharCode2["B"] = 66] = "B";
    CharCode2[CharCode2["C"] = 67] = "C";
    CharCode2[CharCode2["D"] = 68] = "D";
    CharCode2[CharCode2["E"] = 69] = "E";
    CharCode2[CharCode2["F"] = 70] = "F";
    CharCode2[CharCode2["G"] = 71] = "G";
    CharCode2[CharCode2["H"] = 72] = "H";
    CharCode2[CharCode2["I"] = 73] = "I";
    CharCode2[CharCode2["J"] = 74] = "J";
    CharCode2[CharCode2["K"] = 75] = "K";
    CharCode2[CharCode2["L"] = 76] = "L";
    CharCode2[CharCode2["M"] = 77] = "M";
    CharCode2[CharCode2["N"] = 78] = "N";
    CharCode2[CharCode2["O"] = 79] = "O";
    CharCode2[CharCode2["P"] = 80] = "P";
    CharCode2[CharCode2["Q"] = 81] = "Q";
    CharCode2[CharCode2["R"] = 82] = "R";
    CharCode2[CharCode2["S"] = 83] = "S";
    CharCode2[CharCode2["T"] = 84] = "T";
    CharCode2[CharCode2["U"] = 85] = "U";
    CharCode2[CharCode2["V"] = 86] = "V";
    CharCode2[CharCode2["W"] = 87] = "W";
    CharCode2[CharCode2["X"] = 88] = "X";
    CharCode2[CharCode2["Y"] = 89] = "Y";
    CharCode2[CharCode2["Z"] = 90] = "Z";
    CharCode2[CharCode2["OpenSquareBracket"] = 91] = "OpenSquareBracket";
    CharCode2[CharCode2["Backslash"] = 92] = "Backslash";
    CharCode2[CharCode2["CloseSquareBracket"] = 93] = "CloseSquareBracket";
    CharCode2[CharCode2["Caret"] = 94] = "Caret";
    CharCode2[CharCode2["Underline"] = 95] = "Underline";
    CharCode2[CharCode2["BackTick"] = 96] = "BackTick";
    CharCode2[CharCode2["a"] = 97] = "a";
    CharCode2[CharCode2["b"] = 98] = "b";
    CharCode2[CharCode2["c"] = 99] = "c";
    CharCode2[CharCode2["d"] = 100] = "d";
    CharCode2[CharCode2["e"] = 101] = "e";
    CharCode2[CharCode2["f"] = 102] = "f";
    CharCode2[CharCode2["g"] = 103] = "g";
    CharCode2[CharCode2["h"] = 104] = "h";
    CharCode2[CharCode2["i"] = 105] = "i";
    CharCode2[CharCode2["j"] = 106] = "j";
    CharCode2[CharCode2["k"] = 107] = "k";
    CharCode2[CharCode2["l"] = 108] = "l";
    CharCode2[CharCode2["m"] = 109] = "m";
    CharCode2[CharCode2["n"] = 110] = "n";
    CharCode2[CharCode2["o"] = 111] = "o";
    CharCode2[CharCode2["p"] = 112] = "p";
    CharCode2[CharCode2["q"] = 113] = "q";
    CharCode2[CharCode2["r"] = 114] = "r";
    CharCode2[CharCode2["s"] = 115] = "s";
    CharCode2[CharCode2["t"] = 116] = "t";
    CharCode2[CharCode2["u"] = 117] = "u";
    CharCode2[CharCode2["v"] = 118] = "v";
    CharCode2[CharCode2["w"] = 119] = "w";
    CharCode2[CharCode2["x"] = 120] = "x";
    CharCode2[CharCode2["y"] = 121] = "y";
    CharCode2[CharCode2["z"] = 122] = "z";
    CharCode2[CharCode2["OpenCurlyBrace"] = 123] = "OpenCurlyBrace";
    CharCode2[CharCode2["Pipe"] = 124] = "Pipe";
    CharCode2[CharCode2["CloseCurlyBrace"] = 125] = "CloseCurlyBrace";
    CharCode2[CharCode2["Tilde"] = 126] = "Tilde";
    CharCode2[CharCode2["NoBreakSpace"] = 160] = "NoBreakSpace";
    CharCode2[CharCode2["U_Combining_Grave_Accent"] = 768] = "U_Combining_Grave_Accent";
    CharCode2[CharCode2["U_Combining_Acute_Accent"] = 769] = "U_Combining_Acute_Accent";
    CharCode2[CharCode2["U_Combining_Circumflex_Accent"] = 770] = "U_Combining_Circumflex_Accent";
    CharCode2[CharCode2["U_Combining_Tilde"] = 771] = "U_Combining_Tilde";
    CharCode2[CharCode2["U_Combining_Macron"] = 772] = "U_Combining_Macron";
    CharCode2[CharCode2["U_Combining_Overline"] = 773] = "U_Combining_Overline";
    CharCode2[CharCode2["U_Combining_Breve"] = 774] = "U_Combining_Breve";
    CharCode2[CharCode2["U_Combining_Dot_Above"] = 775] = "U_Combining_Dot_Above";
    CharCode2[CharCode2["U_Combining_Diaeresis"] = 776] = "U_Combining_Diaeresis";
    CharCode2[CharCode2["U_Combining_Hook_Above"] = 777] = "U_Combining_Hook_Above";
    CharCode2[CharCode2["U_Combining_Ring_Above"] = 778] = "U_Combining_Ring_Above";
    CharCode2[CharCode2["U_Combining_Double_Acute_Accent"] = 779] = "U_Combining_Double_Acute_Accent";
    CharCode2[CharCode2["U_Combining_Caron"] = 780] = "U_Combining_Caron";
    CharCode2[CharCode2["U_Combining_Vertical_Line_Above"] = 781] = "U_Combining_Vertical_Line_Above";
    CharCode2[CharCode2["U_Combining_Double_Vertical_Line_Above"] = 782] = "U_Combining_Double_Vertical_Line_Above";
    CharCode2[CharCode2["U_Combining_Double_Grave_Accent"] = 783] = "U_Combining_Double_Grave_Accent";
    CharCode2[CharCode2["U_Combining_Candrabindu"] = 784] = "U_Combining_Candrabindu";
    CharCode2[CharCode2["U_Combining_Inverted_Breve"] = 785] = "U_Combining_Inverted_Breve";
    CharCode2[CharCode2["U_Combining_Turned_Comma_Above"] = 786] = "U_Combining_Turned_Comma_Above";
    CharCode2[CharCode2["U_Combining_Comma_Above"] = 787] = "U_Combining_Comma_Above";
    CharCode2[CharCode2["U_Combining_Reversed_Comma_Above"] = 788] = "U_Combining_Reversed_Comma_Above";
    CharCode2[CharCode2["U_Combining_Comma_Above_Right"] = 789] = "U_Combining_Comma_Above_Right";
    CharCode2[CharCode2["U_Combining_Grave_Accent_Below"] = 790] = "U_Combining_Grave_Accent_Below";
    CharCode2[CharCode2["U_Combining_Acute_Accent_Below"] = 791] = "U_Combining_Acute_Accent_Below";
    CharCode2[CharCode2["U_Combining_Left_Tack_Below"] = 792] = "U_Combining_Left_Tack_Below";
    CharCode2[CharCode2["U_Combining_Right_Tack_Below"] = 793] = "U_Combining_Right_Tack_Below";
    CharCode2[CharCode2["U_Combining_Left_Angle_Above"] = 794] = "U_Combining_Left_Angle_Above";
    CharCode2[CharCode2["U_Combining_Horn"] = 795] = "U_Combining_Horn";
    CharCode2[CharCode2["U_Combining_Left_Half_Ring_Below"] = 796] = "U_Combining_Left_Half_Ring_Below";
    CharCode2[CharCode2["U_Combining_Up_Tack_Below"] = 797] = "U_Combining_Up_Tack_Below";
    CharCode2[CharCode2["U_Combining_Down_Tack_Below"] = 798] = "U_Combining_Down_Tack_Below";
    CharCode2[CharCode2["U_Combining_Plus_Sign_Below"] = 799] = "U_Combining_Plus_Sign_Below";
    CharCode2[CharCode2["U_Combining_Minus_Sign_Below"] = 800] = "U_Combining_Minus_Sign_Below";
    CharCode2[CharCode2["U_Combining_Palatalized_Hook_Below"] = 801] = "U_Combining_Palatalized_Hook_Below";
    CharCode2[CharCode2["U_Combining_Retroflex_Hook_Below"] = 802] = "U_Combining_Retroflex_Hook_Below";
    CharCode2[CharCode2["U_Combining_Dot_Below"] = 803] = "U_Combining_Dot_Below";
    CharCode2[CharCode2["U_Combining_Diaeresis_Below"] = 804] = "U_Combining_Diaeresis_Below";
    CharCode2[CharCode2["U_Combining_Ring_Below"] = 805] = "U_Combining_Ring_Below";
    CharCode2[CharCode2["U_Combining_Comma_Below"] = 806] = "U_Combining_Comma_Below";
    CharCode2[CharCode2["U_Combining_Cedilla"] = 807] = "U_Combining_Cedilla";
    CharCode2[CharCode2["U_Combining_Ogonek"] = 808] = "U_Combining_Ogonek";
    CharCode2[CharCode2["U_Combining_Vertical_Line_Below"] = 809] = "U_Combining_Vertical_Line_Below";
    CharCode2[CharCode2["U_Combining_Bridge_Below"] = 810] = "U_Combining_Bridge_Below";
    CharCode2[CharCode2["U_Combining_Inverted_Double_Arch_Below"] = 811] = "U_Combining_Inverted_Double_Arch_Below";
    CharCode2[CharCode2["U_Combining_Caron_Below"] = 812] = "U_Combining_Caron_Below";
    CharCode2[CharCode2["U_Combining_Circumflex_Accent_Below"] = 813] = "U_Combining_Circumflex_Accent_Below";
    CharCode2[CharCode2["U_Combining_Breve_Below"] = 814] = "U_Combining_Breve_Below";
    CharCode2[CharCode2["U_Combining_Inverted_Breve_Below"] = 815] = "U_Combining_Inverted_Breve_Below";
    CharCode2[CharCode2["U_Combining_Tilde_Below"] = 816] = "U_Combining_Tilde_Below";
    CharCode2[CharCode2["U_Combining_Macron_Below"] = 817] = "U_Combining_Macron_Below";
    CharCode2[CharCode2["U_Combining_Low_Line"] = 818] = "U_Combining_Low_Line";
    CharCode2[CharCode2["U_Combining_Double_Low_Line"] = 819] = "U_Combining_Double_Low_Line";
    CharCode2[CharCode2["U_Combining_Tilde_Overlay"] = 820] = "U_Combining_Tilde_Overlay";
    CharCode2[CharCode2["U_Combining_Short_Stroke_Overlay"] = 821] = "U_Combining_Short_Stroke_Overlay";
    CharCode2[CharCode2["U_Combining_Long_Stroke_Overlay"] = 822] = "U_Combining_Long_Stroke_Overlay";
    CharCode2[CharCode2["U_Combining_Short_Solidus_Overlay"] = 823] = "U_Combining_Short_Solidus_Overlay";
    CharCode2[CharCode2["U_Combining_Long_Solidus_Overlay"] = 824] = "U_Combining_Long_Solidus_Overlay";
    CharCode2[CharCode2["U_Combining_Right_Half_Ring_Below"] = 825] = "U_Combining_Right_Half_Ring_Below";
    CharCode2[CharCode2["U_Combining_Inverted_Bridge_Below"] = 826] = "U_Combining_Inverted_Bridge_Below";
    CharCode2[CharCode2["U_Combining_Square_Below"] = 827] = "U_Combining_Square_Below";
    CharCode2[CharCode2["U_Combining_Seagull_Below"] = 828] = "U_Combining_Seagull_Below";
    CharCode2[CharCode2["U_Combining_X_Above"] = 829] = "U_Combining_X_Above";
    CharCode2[CharCode2["U_Combining_Vertical_Tilde"] = 830] = "U_Combining_Vertical_Tilde";
    CharCode2[CharCode2["U_Combining_Double_Overline"] = 831] = "U_Combining_Double_Overline";
    CharCode2[CharCode2["U_Combining_Grave_Tone_Mark"] = 832] = "U_Combining_Grave_Tone_Mark";
    CharCode2[CharCode2["U_Combining_Acute_Tone_Mark"] = 833] = "U_Combining_Acute_Tone_Mark";
    CharCode2[CharCode2["U_Combining_Greek_Perispomeni"] = 834] = "U_Combining_Greek_Perispomeni";
    CharCode2[CharCode2["U_Combining_Greek_Koronis"] = 835] = "U_Combining_Greek_Koronis";
    CharCode2[CharCode2["U_Combining_Greek_Dialytika_Tonos"] = 836] = "U_Combining_Greek_Dialytika_Tonos";
    CharCode2[CharCode2["U_Combining_Greek_Ypogegrammeni"] = 837] = "U_Combining_Greek_Ypogegrammeni";
    CharCode2[CharCode2["U_Combining_Bridge_Above"] = 838] = "U_Combining_Bridge_Above";
    CharCode2[CharCode2["U_Combining_Equals_Sign_Below"] = 839] = "U_Combining_Equals_Sign_Below";
    CharCode2[CharCode2["U_Combining_Double_Vertical_Line_Below"] = 840] = "U_Combining_Double_Vertical_Line_Below";
    CharCode2[CharCode2["U_Combining_Left_Angle_Below"] = 841] = "U_Combining_Left_Angle_Below";
    CharCode2[CharCode2["U_Combining_Not_Tilde_Above"] = 842] = "U_Combining_Not_Tilde_Above";
    CharCode2[CharCode2["U_Combining_Homothetic_Above"] = 843] = "U_Combining_Homothetic_Above";
    CharCode2[CharCode2["U_Combining_Almost_Equal_To_Above"] = 844] = "U_Combining_Almost_Equal_To_Above";
    CharCode2[CharCode2["U_Combining_Left_Right_Arrow_Below"] = 845] = "U_Combining_Left_Right_Arrow_Below";
    CharCode2[CharCode2["U_Combining_Upwards_Arrow_Below"] = 846] = "U_Combining_Upwards_Arrow_Below";
    CharCode2[CharCode2["U_Combining_Grapheme_Joiner"] = 847] = "U_Combining_Grapheme_Joiner";
    CharCode2[CharCode2["U_Combining_Right_Arrowhead_Above"] = 848] = "U_Combining_Right_Arrowhead_Above";
    CharCode2[CharCode2["U_Combining_Left_Half_Ring_Above"] = 849] = "U_Combining_Left_Half_Ring_Above";
    CharCode2[CharCode2["U_Combining_Fermata"] = 850] = "U_Combining_Fermata";
    CharCode2[CharCode2["U_Combining_X_Below"] = 851] = "U_Combining_X_Below";
    CharCode2[CharCode2["U_Combining_Left_Arrowhead_Below"] = 852] = "U_Combining_Left_Arrowhead_Below";
    CharCode2[CharCode2["U_Combining_Right_Arrowhead_Below"] = 853] = "U_Combining_Right_Arrowhead_Below";
    CharCode2[CharCode2["U_Combining_Right_Arrowhead_And_Up_Arrowhead_Below"] = 854] = "U_Combining_Right_Arrowhead_And_Up_Arrowhead_Below";
    CharCode2[CharCode2["U_Combining_Right_Half_Ring_Above"] = 855] = "U_Combining_Right_Half_Ring_Above";
    CharCode2[CharCode2["U_Combining_Dot_Above_Right"] = 856] = "U_Combining_Dot_Above_Right";
    CharCode2[CharCode2["U_Combining_Asterisk_Below"] = 857] = "U_Combining_Asterisk_Below";
    CharCode2[CharCode2["U_Combining_Double_Ring_Below"] = 858] = "U_Combining_Double_Ring_Below";
    CharCode2[CharCode2["U_Combining_Zigzag_Above"] = 859] = "U_Combining_Zigzag_Above";
    CharCode2[CharCode2["U_Combining_Double_Breve_Below"] = 860] = "U_Combining_Double_Breve_Below";
    CharCode2[CharCode2["U_Combining_Double_Breve"] = 861] = "U_Combining_Double_Breve";
    CharCode2[CharCode2["U_Combining_Double_Macron"] = 862] = "U_Combining_Double_Macron";
    CharCode2[CharCode2["U_Combining_Double_Macron_Below"] = 863] = "U_Combining_Double_Macron_Below";
    CharCode2[CharCode2["U_Combining_Double_Tilde"] = 864] = "U_Combining_Double_Tilde";
    CharCode2[CharCode2["U_Combining_Double_Inverted_Breve"] = 865] = "U_Combining_Double_Inverted_Breve";
    CharCode2[CharCode2["U_Combining_Double_Rightwards_Arrow_Below"] = 866] = "U_Combining_Double_Rightwards_Arrow_Below";
    CharCode2[CharCode2["U_Combining_Latin_Small_Letter_A"] = 867] = "U_Combining_Latin_Small_Letter_A";
    CharCode2[CharCode2["U_Combining_Latin_Small_Letter_E"] = 868] = "U_Combining_Latin_Small_Letter_E";
    CharCode2[CharCode2["U_Combining_Latin_Small_Letter_I"] = 869] = "U_Combining_Latin_Small_Letter_I";
    CharCode2[CharCode2["U_Combining_Latin_Small_Letter_O"] = 870] = "U_Combining_Latin_Small_Letter_O";
    CharCode2[CharCode2["U_Combining_Latin_Small_Letter_U"] = 871] = "U_Combining_Latin_Small_Letter_U";
    CharCode2[CharCode2["U_Combining_Latin_Small_Letter_C"] = 872] = "U_Combining_Latin_Small_Letter_C";
    CharCode2[CharCode2["U_Combining_Latin_Small_Letter_D"] = 873] = "U_Combining_Latin_Small_Letter_D";
    CharCode2[CharCode2["U_Combining_Latin_Small_Letter_H"] = 874] = "U_Combining_Latin_Small_Letter_H";
    CharCode2[CharCode2["U_Combining_Latin_Small_Letter_M"] = 875] = "U_Combining_Latin_Small_Letter_M";
    CharCode2[CharCode2["U_Combining_Latin_Small_Letter_R"] = 876] = "U_Combining_Latin_Small_Letter_R";
    CharCode2[CharCode2["U_Combining_Latin_Small_Letter_T"] = 877] = "U_Combining_Latin_Small_Letter_T";
    CharCode2[CharCode2["U_Combining_Latin_Small_Letter_V"] = 878] = "U_Combining_Latin_Small_Letter_V";
    CharCode2[CharCode2["U_Combining_Latin_Small_Letter_X"] = 879] = "U_Combining_Latin_Small_Letter_X";
    CharCode2[CharCode2["LINE_SEPARATOR"] = 8232] = "LINE_SEPARATOR";
    CharCode2[CharCode2["PARAGRAPH_SEPARATOR"] = 8233] = "PARAGRAPH_SEPARATOR";
    CharCode2[CharCode2["NEXT_LINE"] = 133] = "NEXT_LINE";
    CharCode2[CharCode2["U_CIRCUMFLEX"] = 94] = "U_CIRCUMFLEX";
    CharCode2[CharCode2["U_GRAVE_ACCENT"] = 96] = "U_GRAVE_ACCENT";
    CharCode2[CharCode2["U_DIAERESIS"] = 168] = "U_DIAERESIS";
    CharCode2[CharCode2["U_MACRON"] = 175] = "U_MACRON";
    CharCode2[CharCode2["U_ACUTE_ACCENT"] = 180] = "U_ACUTE_ACCENT";
    CharCode2[CharCode2["U_CEDILLA"] = 184] = "U_CEDILLA";
    CharCode2[CharCode2["U_MODIFIER_LETTER_LEFT_ARROWHEAD"] = 706] = "U_MODIFIER_LETTER_LEFT_ARROWHEAD";
    CharCode2[CharCode2["U_MODIFIER_LETTER_RIGHT_ARROWHEAD"] = 707] = "U_MODIFIER_LETTER_RIGHT_ARROWHEAD";
    CharCode2[CharCode2["U_MODIFIER_LETTER_UP_ARROWHEAD"] = 708] = "U_MODIFIER_LETTER_UP_ARROWHEAD";
    CharCode2[CharCode2["U_MODIFIER_LETTER_DOWN_ARROWHEAD"] = 709] = "U_MODIFIER_LETTER_DOWN_ARROWHEAD";
    CharCode2[CharCode2["U_MODIFIER_LETTER_CENTRED_RIGHT_HALF_RING"] = 722] = "U_MODIFIER_LETTER_CENTRED_RIGHT_HALF_RING";
    CharCode2[CharCode2["U_MODIFIER_LETTER_CENTRED_LEFT_HALF_RING"] = 723] = "U_MODIFIER_LETTER_CENTRED_LEFT_HALF_RING";
    CharCode2[CharCode2["U_MODIFIER_LETTER_UP_TACK"] = 724] = "U_MODIFIER_LETTER_UP_TACK";
    CharCode2[CharCode2["U_MODIFIER_LETTER_DOWN_TACK"] = 725] = "U_MODIFIER_LETTER_DOWN_TACK";
    CharCode2[CharCode2["U_MODIFIER_LETTER_PLUS_SIGN"] = 726] = "U_MODIFIER_LETTER_PLUS_SIGN";
    CharCode2[CharCode2["U_MODIFIER_LETTER_MINUS_SIGN"] = 727] = "U_MODIFIER_LETTER_MINUS_SIGN";
    CharCode2[CharCode2["U_BREVE"] = 728] = "U_BREVE";
    CharCode2[CharCode2["U_DOT_ABOVE"] = 729] = "U_DOT_ABOVE";
    CharCode2[CharCode2["U_RING_ABOVE"] = 730] = "U_RING_ABOVE";
    CharCode2[CharCode2["U_OGONEK"] = 731] = "U_OGONEK";
    CharCode2[CharCode2["U_SMALL_TILDE"] = 732] = "U_SMALL_TILDE";
    CharCode2[CharCode2["U_DOUBLE_ACUTE_ACCENT"] = 733] = "U_DOUBLE_ACUTE_ACCENT";
    CharCode2[CharCode2["U_MODIFIER_LETTER_RHOTIC_HOOK"] = 734] = "U_MODIFIER_LETTER_RHOTIC_HOOK";
    CharCode2[CharCode2["U_MODIFIER_LETTER_CROSS_ACCENT"] = 735] = "U_MODIFIER_LETTER_CROSS_ACCENT";
    CharCode2[CharCode2["U_MODIFIER_LETTER_EXTRA_HIGH_TONE_BAR"] = 741] = "U_MODIFIER_LETTER_EXTRA_HIGH_TONE_BAR";
    CharCode2[CharCode2["U_MODIFIER_LETTER_HIGH_TONE_BAR"] = 742] = "U_MODIFIER_LETTER_HIGH_TONE_BAR";
    CharCode2[CharCode2["U_MODIFIER_LETTER_MID_TONE_BAR"] = 743] = "U_MODIFIER_LETTER_MID_TONE_BAR";
    CharCode2[CharCode2["U_MODIFIER_LETTER_LOW_TONE_BAR"] = 744] = "U_MODIFIER_LETTER_LOW_TONE_BAR";
    CharCode2[CharCode2["U_MODIFIER_LETTER_EXTRA_LOW_TONE_BAR"] = 745] = "U_MODIFIER_LETTER_EXTRA_LOW_TONE_BAR";
    CharCode2[CharCode2["U_MODIFIER_LETTER_YIN_DEPARTING_TONE_MARK"] = 746] = "U_MODIFIER_LETTER_YIN_DEPARTING_TONE_MARK";
    CharCode2[CharCode2["U_MODIFIER_LETTER_YANG_DEPARTING_TONE_MARK"] = 747] = "U_MODIFIER_LETTER_YANG_DEPARTING_TONE_MARK";
    CharCode2[CharCode2["U_MODIFIER_LETTER_UNASPIRATED"] = 749] = "U_MODIFIER_LETTER_UNASPIRATED";
    CharCode2[CharCode2["U_MODIFIER_LETTER_LOW_DOWN_ARROWHEAD"] = 751] = "U_MODIFIER_LETTER_LOW_DOWN_ARROWHEAD";
    CharCode2[CharCode2["U_MODIFIER_LETTER_LOW_UP_ARROWHEAD"] = 752] = "U_MODIFIER_LETTER_LOW_UP_ARROWHEAD";
    CharCode2[CharCode2["U_MODIFIER_LETTER_LOW_LEFT_ARROWHEAD"] = 753] = "U_MODIFIER_LETTER_LOW_LEFT_ARROWHEAD";
    CharCode2[CharCode2["U_MODIFIER_LETTER_LOW_RIGHT_ARROWHEAD"] = 754] = "U_MODIFIER_LETTER_LOW_RIGHT_ARROWHEAD";
    CharCode2[CharCode2["U_MODIFIER_LETTER_LOW_RING"] = 755] = "U_MODIFIER_LETTER_LOW_RING";
    CharCode2[CharCode2["U_MODIFIER_LETTER_MIDDLE_GRAVE_ACCENT"] = 756] = "U_MODIFIER_LETTER_MIDDLE_GRAVE_ACCENT";
    CharCode2[CharCode2["U_MODIFIER_LETTER_MIDDLE_DOUBLE_GRAVE_ACCENT"] = 757] = "U_MODIFIER_LETTER_MIDDLE_DOUBLE_GRAVE_ACCENT";
    CharCode2[CharCode2["U_MODIFIER_LETTER_MIDDLE_DOUBLE_ACUTE_ACCENT"] = 758] = "U_MODIFIER_LETTER_MIDDLE_DOUBLE_ACUTE_ACCENT";
    CharCode2[CharCode2["U_MODIFIER_LETTER_LOW_TILDE"] = 759] = "U_MODIFIER_LETTER_LOW_TILDE";
    CharCode2[CharCode2["U_MODIFIER_LETTER_RAISED_COLON"] = 760] = "U_MODIFIER_LETTER_RAISED_COLON";
    CharCode2[CharCode2["U_MODIFIER_LETTER_BEGIN_HIGH_TONE"] = 761] = "U_MODIFIER_LETTER_BEGIN_HIGH_TONE";
    CharCode2[CharCode2["U_MODIFIER_LETTER_END_HIGH_TONE"] = 762] = "U_MODIFIER_LETTER_END_HIGH_TONE";
    CharCode2[CharCode2["U_MODIFIER_LETTER_BEGIN_LOW_TONE"] = 763] = "U_MODIFIER_LETTER_BEGIN_LOW_TONE";
    CharCode2[CharCode2["U_MODIFIER_LETTER_END_LOW_TONE"] = 764] = "U_MODIFIER_LETTER_END_LOW_TONE";
    CharCode2[CharCode2["U_MODIFIER_LETTER_SHELF"] = 765] = "U_MODIFIER_LETTER_SHELF";
    CharCode2[CharCode2["U_MODIFIER_LETTER_OPEN_SHELF"] = 766] = "U_MODIFIER_LETTER_OPEN_SHELF";
    CharCode2[CharCode2["U_MODIFIER_LETTER_LOW_LEFT_ARROW"] = 767] = "U_MODIFIER_LETTER_LOW_LEFT_ARROW";
    CharCode2[CharCode2["U_GREEK_LOWER_NUMERAL_SIGN"] = 885] = "U_GREEK_LOWER_NUMERAL_SIGN";
    CharCode2[CharCode2["U_GREEK_TONOS"] = 900] = "U_GREEK_TONOS";
    CharCode2[CharCode2["U_GREEK_DIALYTIKA_TONOS"] = 901] = "U_GREEK_DIALYTIKA_TONOS";
    CharCode2[CharCode2["U_GREEK_KORONIS"] = 8125] = "U_GREEK_KORONIS";
    CharCode2[CharCode2["U_GREEK_PSILI"] = 8127] = "U_GREEK_PSILI";
    CharCode2[CharCode2["U_GREEK_PERISPOMENI"] = 8128] = "U_GREEK_PERISPOMENI";
    CharCode2[CharCode2["U_GREEK_DIALYTIKA_AND_PERISPOMENI"] = 8129] = "U_GREEK_DIALYTIKA_AND_PERISPOMENI";
    CharCode2[CharCode2["U_GREEK_PSILI_AND_VARIA"] = 8141] = "U_GREEK_PSILI_AND_VARIA";
    CharCode2[CharCode2["U_GREEK_PSILI_AND_OXIA"] = 8142] = "U_GREEK_PSILI_AND_OXIA";
    CharCode2[CharCode2["U_GREEK_PSILI_AND_PERISPOMENI"] = 8143] = "U_GREEK_PSILI_AND_PERISPOMENI";
    CharCode2[CharCode2["U_GREEK_DASIA_AND_VARIA"] = 8157] = "U_GREEK_DASIA_AND_VARIA";
    CharCode2[CharCode2["U_GREEK_DASIA_AND_OXIA"] = 8158] = "U_GREEK_DASIA_AND_OXIA";
    CharCode2[CharCode2["U_GREEK_DASIA_AND_PERISPOMENI"] = 8159] = "U_GREEK_DASIA_AND_PERISPOMENI";
    CharCode2[CharCode2["U_GREEK_DIALYTIKA_AND_VARIA"] = 8173] = "U_GREEK_DIALYTIKA_AND_VARIA";
    CharCode2[CharCode2["U_GREEK_DIALYTIKA_AND_OXIA"] = 8174] = "U_GREEK_DIALYTIKA_AND_OXIA";
    CharCode2[CharCode2["U_GREEK_VARIA"] = 8175] = "U_GREEK_VARIA";
    CharCode2[CharCode2["U_GREEK_OXIA"] = 8189] = "U_GREEK_OXIA";
    CharCode2[CharCode2["U_GREEK_DASIA"] = 8190] = "U_GREEK_DASIA";
    CharCode2[CharCode2["U_IDEOGRAPHIC_FULL_STOP"] = 12290] = "U_IDEOGRAPHIC_FULL_STOP";
    CharCode2[CharCode2["U_LEFT_CORNER_BRACKET"] = 12300] = "U_LEFT_CORNER_BRACKET";
    CharCode2[CharCode2["U_RIGHT_CORNER_BRACKET"] = 12301] = "U_RIGHT_CORNER_BRACKET";
    CharCode2[CharCode2["U_LEFT_BLACK_LENTICULAR_BRACKET"] = 12304] = "U_LEFT_BLACK_LENTICULAR_BRACKET";
    CharCode2[CharCode2["U_RIGHT_BLACK_LENTICULAR_BRACKET"] = 12305] = "U_RIGHT_BLACK_LENTICULAR_BRACKET";
    CharCode2[CharCode2["U_OVERLINE"] = 8254] = "U_OVERLINE";
    CharCode2[CharCode2["UTF8_BOM"] = 65279] = "UTF8_BOM";
    CharCode2[CharCode2["U_FULLWIDTH_SEMICOLON"] = 65307] = "U_FULLWIDTH_SEMICOLON";
    CharCode2[CharCode2["U_FULLWIDTH_COMMA"] = 65292] = "U_FULLWIDTH_COMMA";
  })(CharCode || (CharCode = {}));

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/marshallingIds.js
  var MarshalledId;
  (function(MarshalledId2) {
    MarshalledId2[MarshalledId2["Uri"] = 1] = "Uri";
    MarshalledId2[MarshalledId2["Regexp"] = 2] = "Regexp";
    MarshalledId2[MarshalledId2["ScmResource"] = 3] = "ScmResource";
    MarshalledId2[MarshalledId2["ScmResourceGroup"] = 4] = "ScmResourceGroup";
    MarshalledId2[MarshalledId2["ScmProvider"] = 5] = "ScmProvider";
    MarshalledId2[MarshalledId2["CommentController"] = 6] = "CommentController";
    MarshalledId2[MarshalledId2["CommentThread"] = 7] = "CommentThread";
    MarshalledId2[MarshalledId2["CommentThreadInstance"] = 8] = "CommentThreadInstance";
    MarshalledId2[MarshalledId2["CommentThreadReply"] = 9] = "CommentThreadReply";
    MarshalledId2[MarshalledId2["CommentNode"] = 10] = "CommentNode";
    MarshalledId2[MarshalledId2["CommentThreadNode"] = 11] = "CommentThreadNode";
    MarshalledId2[MarshalledId2["TimelineActionContext"] = 12] = "TimelineActionContext";
    MarshalledId2[MarshalledId2["NotebookCellActionContext"] = 13] = "NotebookCellActionContext";
    MarshalledId2[MarshalledId2["NotebookActionContext"] = 14] = "NotebookActionContext";
    MarshalledId2[MarshalledId2["TerminalContext"] = 15] = "TerminalContext";
    MarshalledId2[MarshalledId2["TestItemContext"] = 16] = "TestItemContext";
    MarshalledId2[MarshalledId2["Date"] = 17] = "Date";
    MarshalledId2[MarshalledId2["TestMessageMenuArgs"] = 18] = "TestMessageMenuArgs";
    MarshalledId2[MarshalledId2["ChatViewContext"] = 19] = "ChatViewContext";
    MarshalledId2[MarshalledId2["LanguageModelToolResult"] = 20] = "LanguageModelToolResult";
    MarshalledId2[MarshalledId2["LanguageModelTextPart"] = 21] = "LanguageModelTextPart";
    MarshalledId2[MarshalledId2["LanguageModelThinkingPart"] = 22] = "LanguageModelThinkingPart";
    MarshalledId2[MarshalledId2["LanguageModelPromptTsxPart"] = 23] = "LanguageModelPromptTsxPart";
    MarshalledId2[MarshalledId2["LanguageModelDataPart"] = 24] = "LanguageModelDataPart";
    MarshalledId2[MarshalledId2["AgentSessionContext"] = 25] = "AgentSessionContext";
    MarshalledId2[MarshalledId2["ChatResponsePullRequestPart"] = 26] = "ChatResponsePullRequestPart";
  })(MarshalledId || (MarshalledId = {}));

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/nls.js
  function getNLSMessages() {
    return globalThis._VSCODE_NLS_MESSAGES;
  }
  function getNLSLanguage() {
    return globalThis._VSCODE_NLS_LANGUAGE;
  }
  var isPseudo = getNLSLanguage() === "pseudo" || typeof document !== "undefined" && document.location && typeof document.location.hash === "string" && document.location.hash.indexOf("pseudo=true") >= 0;
  function _format(message, args) {
    let result;
    if (args.length === 0) {
      result = message;
    } else {
      result = message.replace(/\{(\d+)\}/g, (match, rest) => {
        const index = rest[0];
        const arg = args[index];
        let result2 = match;
        if (typeof arg === "string") {
          result2 = arg;
        } else if (typeof arg === "number" || typeof arg === "boolean" || arg === void 0 || arg === null) {
          result2 = String(arg);
        }
        return result2;
      });
    }
    if (isPseudo) {
      result = "\uFF3B" + result.replace(/[aouei]/g, "$&$&") + "\uFF3D";
    }
    return result;
  }
  var initialized = false;
  function localize(data, message, ...args) {
    if (typeof data === "number") {
      return _format(lookupMessage(data, message), args);
    }
    return _format(message, args);
  }
  function lookupMessage(index, fallback) {
    initialized = true;
    const message = getNLSMessages()?.[index];
    if (typeof message !== "string") {
      if (typeof fallback === "string") {
        return fallback;
      }
      throw new Error(`!!! NLS MISSING: ${index} !!!`);
    }
    return message;
  }

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/platform.js
  var LANGUAGE_DEFAULT = "en";
  var _isWindows = false;
  var _isMacintosh = false;
  var _isLinux = false;
  var _isLinuxSnap = false;
  var _isNative = false;
  var _isWeb = false;
  var _isElectron = false;
  var _isIOS = false;
  var _isCI = false;
  var _isMobile = false;
  var _locale = void 0;
  var _language = LANGUAGE_DEFAULT;
  var _platformLocale = LANGUAGE_DEFAULT;
  var _translationsConfigFile = void 0;
  var _userAgent = void 0;
  var $globalThis = globalThis;
  var nodeProcess = void 0;
  if (typeof $globalThis.vscode !== "undefined" && typeof $globalThis.vscode.process !== "undefined") {
    nodeProcess = $globalThis.vscode.process;
  } else if (typeof process !== "undefined" && typeof process?.versions?.node === "string") {
    nodeProcess = process;
  }
  var isElectronProcess = typeof nodeProcess?.versions?.electron === "string";
  var isElectronRenderer = isElectronProcess && nodeProcess?.type === "renderer";
  if (typeof nodeProcess === "object") {
    _isWindows = nodeProcess.platform === "win32";
    _isMacintosh = nodeProcess.platform === "darwin";
    _isLinux = nodeProcess.platform === "linux";
    _isLinuxSnap = _isLinux && !!nodeProcess.env["SNAP"] && !!nodeProcess.env["SNAP_REVISION"];
    _isElectron = isElectronProcess;
    _isCI = !!nodeProcess.env["CI"] || !!nodeProcess.env["BUILD_ARTIFACTSTAGINGDIRECTORY"] || !!nodeProcess.env["GITHUB_WORKSPACE"];
    _locale = LANGUAGE_DEFAULT;
    _language = LANGUAGE_DEFAULT;
    const rawNlsConfig = nodeProcess.env["VSCODE_NLS_CONFIG"];
    if (rawNlsConfig) {
      try {
        const nlsConfig = JSON.parse(rawNlsConfig);
        _locale = nlsConfig.userLocale;
        _platformLocale = nlsConfig.osLocale;
        _language = nlsConfig.resolvedLanguage || LANGUAGE_DEFAULT;
        _translationsConfigFile = nlsConfig.languagePack?.translationsConfigFile;
      } catch (e) {
      }
    }
    _isNative = true;
  } else if (typeof navigator === "object" && !isElectronRenderer) {
    _userAgent = navigator.userAgent;
    _isWindows = _userAgent.indexOf("Windows") >= 0;
    _isMacintosh = _userAgent.indexOf("Macintosh") >= 0;
    _isIOS = (_userAgent.indexOf("Macintosh") >= 0 || _userAgent.indexOf("iPad") >= 0 || _userAgent.indexOf("iPhone") >= 0) && !!navigator.maxTouchPoints && navigator.maxTouchPoints > 0;
    _isLinux = _userAgent.indexOf("Linux") >= 0;
    _isMobile = _userAgent?.indexOf("Mobi") >= 0;
    _isWeb = true;
    _language = getNLSLanguage() || LANGUAGE_DEFAULT;
    _locale = navigator.language.toLowerCase();
    _platformLocale = _locale;
  } else {
    console.error("Unable to resolve platform.");
  }
  var Platform;
  (function(Platform2) {
    Platform2[Platform2["Web"] = 0] = "Web";
    Platform2[Platform2["Mac"] = 1] = "Mac";
    Platform2[Platform2["Linux"] = 2] = "Linux";
    Platform2[Platform2["Windows"] = 3] = "Windows";
  })(Platform || (Platform = {}));
  var _platform = Platform.Web;
  if (_isMacintosh) {
    _platform = Platform.Mac;
  } else if (_isWindows) {
    _platform = Platform.Windows;
  } else if (_isLinux) {
    _platform = Platform.Linux;
  }
  var isWindows = _isWindows;
  var isMacintosh = _isMacintosh;
  var isLinux = _isLinux;
  var isNative = _isNative;
  var isWeb = _isWeb;
  var isWebWorker = _isWeb && typeof $globalThis.importScripts === "function";
  var webWorkerOrigin = isWebWorker ? $globalThis.origin : void 0;
  var userAgent = _userAgent;
  var language = _language;
  var Language;
  (function(Language2) {
    function value() {
      return language;
    }
    Language2.value = value;
    function isDefaultVariant() {
      if (language.length === 2) {
        return language === "en";
      } else if (language.length >= 3) {
        return language[0] === "e" && language[1] === "n" && language[2] === "-";
      } else {
        return false;
      }
    }
    Language2.isDefaultVariant = isDefaultVariant;
    function isDefault() {
      return language === "en";
    }
    Language2.isDefault = isDefault;
  })(Language || (Language = {}));
  var setTimeout0IsFaster = typeof $globalThis.postMessage === "function" && !$globalThis.importScripts;
  var setTimeout0 = (() => {
    if (setTimeout0IsFaster) {
      const pending = [];
      $globalThis.addEventListener("message", (e) => {
        if (e.data && e.data.vscodeScheduleAsyncWork) {
          for (let i = 0, len = pending.length; i < len; i++) {
            const candidate = pending[i];
            if (candidate.id === e.data.vscodeScheduleAsyncWork) {
              pending.splice(i, 1);
              candidate.callback();
              return;
            }
          }
        }
      });
      let lastId = 0;
      return (callback) => {
        const myId = ++lastId;
        pending.push({
          id: myId,
          callback
        });
        $globalThis.postMessage({
          vscodeScheduleAsyncWork: myId
        }, "*");
      };
    }
    return (callback) => setTimeout(callback);
  })();
  var OperatingSystem;
  (function(OperatingSystem2) {
    OperatingSystem2[OperatingSystem2["Windows"] = 1] = "Windows";
    OperatingSystem2[OperatingSystem2["Macintosh"] = 2] = "Macintosh";
    OperatingSystem2[OperatingSystem2["Linux"] = 3] = "Linux";
  })(OperatingSystem || (OperatingSystem = {}));
  var OS = _isMacintosh || _isIOS ? OperatingSystem.Macintosh : _isWindows ? OperatingSystem.Windows : OperatingSystem.Linux;
  var isChrome = !!(userAgent && userAgent.indexOf("Chrome") >= 0);
  var isFirefox = !!(userAgent && userAgent.indexOf("Firefox") >= 0);
  var isSafari = !!(!isChrome && (userAgent && userAgent.indexOf("Safari") >= 0));
  var isEdge = !!(userAgent && userAgent.indexOf("Edg/") >= 0);
  var isAndroid = !!(userAgent && userAgent.indexOf("Android") >= 0);

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/process.js
  var safeProcess;
  var vscodeGlobal = globalThis.vscode;
  if (typeof vscodeGlobal !== "undefined" && typeof vscodeGlobal.process !== "undefined") {
    const sandboxProcess = vscodeGlobal.process;
    safeProcess = {
      get platform() {
        return sandboxProcess.platform;
      },
      get arch() {
        return sandboxProcess.arch;
      },
      get env() {
        return sandboxProcess.env;
      },
      cwd() {
        return sandboxProcess.cwd();
      }
    };
  } else if (typeof process !== "undefined" && typeof process?.versions?.node === "string") {
    safeProcess = {
      get platform() {
        return process.platform;
      },
      get arch() {
        return process.arch;
      },
      get env() {
        return process.env;
      },
      cwd() {
        return process.env["VSCODE_CWD"] || process.cwd();
      }
    };
  } else {
    safeProcess = {
      get platform() {
        return isWindows ? "win32" : isMacintosh ? "darwin" : "linux";
      },
      get arch() {
        return void 0;
      },
      get env() {
        return {};
      },
      cwd() {
        return "/";
      }
    };
  }
  var cwd = safeProcess.cwd;
  var env = safeProcess.env;
  var platform = safeProcess.platform;
  var arch = safeProcess.arch;

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/path.js
  var CHAR_UPPERCASE_A = 65;
  var CHAR_LOWERCASE_A = 97;
  var CHAR_UPPERCASE_Z = 90;
  var CHAR_LOWERCASE_Z = 122;
  var CHAR_DOT = 46;
  var CHAR_FORWARD_SLASH = 47;
  var CHAR_BACKWARD_SLASH = 92;
  var CHAR_COLON = 58;
  var CHAR_QUESTION_MARK = 63;
  var ErrorInvalidArgType = class extends Error {
    constructor(name, expected, actual) {
      let determiner;
      if (typeof expected === "string" && expected.indexOf("not ") === 0) {
        determiner = "must not be";
        expected = expected.replace(/^not /, "");
      } else {
        determiner = "must be";
      }
      const type = name.indexOf(".") !== -1 ? "property" : "argument";
      let msg = `The "${name}" ${type} ${determiner} of type ${expected}`;
      msg += `. Received type ${typeof actual}`;
      super(msg);
      this.code = "ERR_INVALID_ARG_TYPE";
    }
  };
  function validateObject(pathObject, name) {
    if (pathObject === null || typeof pathObject !== "object") {
      throw new ErrorInvalidArgType(name, "Object", pathObject);
    }
  }
  function validateString(value, name) {
    if (typeof value !== "string") {
      throw new ErrorInvalidArgType(name, "string", value);
    }
  }
  var platformIsWin32 = platform === "win32";
  function isPathSeparator(code) {
    return code === CHAR_FORWARD_SLASH || code === CHAR_BACKWARD_SLASH;
  }
  function isPosixPathSeparator(code) {
    return code === CHAR_FORWARD_SLASH;
  }
  function isWindowsDeviceRoot(code) {
    return code >= CHAR_UPPERCASE_A && code <= CHAR_UPPERCASE_Z || code >= CHAR_LOWERCASE_A && code <= CHAR_LOWERCASE_Z;
  }
  function normalizeString(path, allowAboveRoot, separator, isPathSeparator3) {
    let res = "";
    let lastSegmentLength = 0;
    let lastSlash = -1;
    let dots = 0;
    let code = 0;
    for (let i = 0; i <= path.length; ++i) {
      if (i < path.length) {
        code = path.charCodeAt(i);
      } else if (isPathSeparator3(code)) {
        break;
      } else {
        code = CHAR_FORWARD_SLASH;
      }
      if (isPathSeparator3(code)) {
        if (lastSlash === i - 1 || dots === 1)
          ;
        else if (dots === 2) {
          if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== CHAR_DOT || res.charCodeAt(res.length - 2) !== CHAR_DOT) {
            if (res.length > 2) {
              const lastSlashIndex = res.lastIndexOf(separator);
              if (lastSlashIndex === -1) {
                res = "";
                lastSegmentLength = 0;
              } else {
                res = res.slice(0, lastSlashIndex);
                lastSegmentLength = res.length - 1 - res.lastIndexOf(separator);
              }
              lastSlash = i;
              dots = 0;
              continue;
            } else if (res.length !== 0) {
              res = "";
              lastSegmentLength = 0;
              lastSlash = i;
              dots = 0;
              continue;
            }
          }
          if (allowAboveRoot) {
            res += res.length > 0 ? `${separator}..` : "..";
            lastSegmentLength = 2;
          }
        } else {
          if (res.length > 0) {
            res += `${separator}${path.slice(lastSlash + 1, i)}`;
          } else {
            res = path.slice(lastSlash + 1, i);
          }
          lastSegmentLength = i - lastSlash - 1;
        }
        lastSlash = i;
        dots = 0;
      } else if (code === CHAR_DOT && dots !== -1) {
        ++dots;
      } else {
        dots = -1;
      }
    }
    return res;
  }
  function formatExt(ext) {
    return ext ? `${ext[0] === "." ? "" : "."}${ext}` : "";
  }
  function _format2(sep2, pathObject) {
    validateObject(pathObject, "pathObject");
    const dir = pathObject.dir || pathObject.root;
    const base = pathObject.base || `${pathObject.name || ""}${formatExt(pathObject.ext)}`;
    if (!dir) {
      return base;
    }
    return dir === pathObject.root ? `${dir}${base}` : `${dir}${sep2}${base}`;
  }
  var win32 = {
    resolve(...pathSegments) {
      let resolvedDevice = "";
      let resolvedTail = "";
      let resolvedAbsolute = false;
      for (let i = pathSegments.length - 1; i >= -1; i--) {
        let path;
        if (i >= 0) {
          path = pathSegments[i];
          validateString(path, `paths[${i}]`);
          if (path.length === 0) {
            continue;
          }
        } else if (resolvedDevice.length === 0) {
          path = cwd();
        } else {
          path = env[`=${resolvedDevice}`] || cwd();
          if (path === void 0 || path.slice(0, 2).toLowerCase() !== resolvedDevice.toLowerCase() && path.charCodeAt(2) === CHAR_BACKWARD_SLASH) {
            path = `${resolvedDevice}\\`;
          }
        }
        const len = path.length;
        let rootEnd = 0;
        let device = "";
        let isAbsolute2 = false;
        const code = path.charCodeAt(0);
        if (len === 1) {
          if (isPathSeparator(code)) {
            rootEnd = 1;
            isAbsolute2 = true;
          }
        } else if (isPathSeparator(code)) {
          isAbsolute2 = true;
          if (isPathSeparator(path.charCodeAt(1))) {
            let j = 2;
            let last = j;
            while (j < len && !isPathSeparator(path.charCodeAt(j))) {
              j++;
            }
            if (j < len && j !== last) {
              const firstPart = path.slice(last, j);
              last = j;
              while (j < len && isPathSeparator(path.charCodeAt(j))) {
                j++;
              }
              if (j < len && j !== last) {
                last = j;
                while (j < len && !isPathSeparator(path.charCodeAt(j))) {
                  j++;
                }
                if (j === len || j !== last) {
                  device = `\\\\${firstPart}\\${path.slice(last, j)}`;
                  rootEnd = j;
                }
              }
            }
          } else {
            rootEnd = 1;
          }
        } else if (isWindowsDeviceRoot(code) && path.charCodeAt(1) === CHAR_COLON) {
          device = path.slice(0, 2);
          rootEnd = 2;
          if (len > 2 && isPathSeparator(path.charCodeAt(2))) {
            isAbsolute2 = true;
            rootEnd = 3;
          }
        }
        if (device.length > 0) {
          if (resolvedDevice.length > 0) {
            if (device.toLowerCase() !== resolvedDevice.toLowerCase()) {
              continue;
            }
          } else {
            resolvedDevice = device;
          }
        }
        if (resolvedAbsolute) {
          if (resolvedDevice.length > 0) {
            break;
          }
        } else {
          resolvedTail = `${path.slice(rootEnd)}\\${resolvedTail}`;
          resolvedAbsolute = isAbsolute2;
          if (isAbsolute2 && resolvedDevice.length > 0) {
            break;
          }
        }
      }
      resolvedTail = normalizeString(resolvedTail, !resolvedAbsolute, "\\", isPathSeparator);
      return resolvedAbsolute ? `${resolvedDevice}\\${resolvedTail}` : `${resolvedDevice}${resolvedTail}` || ".";
    },
    normalize(path) {
      validateString(path, "path");
      const len = path.length;
      if (len === 0) {
        return ".";
      }
      let rootEnd = 0;
      let device;
      let isAbsolute2 = false;
      const code = path.charCodeAt(0);
      if (len === 1) {
        return isPosixPathSeparator(code) ? "\\" : path;
      }
      if (isPathSeparator(code)) {
        isAbsolute2 = true;
        if (isPathSeparator(path.charCodeAt(1))) {
          let j = 2;
          let last = j;
          while (j < len && !isPathSeparator(path.charCodeAt(j))) {
            j++;
          }
          if (j < len && j !== last) {
            const firstPart = path.slice(last, j);
            last = j;
            while (j < len && isPathSeparator(path.charCodeAt(j))) {
              j++;
            }
            if (j < len && j !== last) {
              last = j;
              while (j < len && !isPathSeparator(path.charCodeAt(j))) {
                j++;
              }
              if (j === len) {
                return `\\\\${firstPart}\\${path.slice(last)}\\`;
              }
              if (j !== last) {
                device = `\\\\${firstPart}\\${path.slice(last, j)}`;
                rootEnd = j;
              }
            }
          }
        } else {
          rootEnd = 1;
        }
      } else if (isWindowsDeviceRoot(code) && path.charCodeAt(1) === CHAR_COLON) {
        device = path.slice(0, 2);
        rootEnd = 2;
        if (len > 2 && isPathSeparator(path.charCodeAt(2))) {
          isAbsolute2 = true;
          rootEnd = 3;
        }
      }
      let tail = rootEnd < len ? normalizeString(path.slice(rootEnd), !isAbsolute2, "\\", isPathSeparator) : "";
      if (tail.length === 0 && !isAbsolute2) {
        tail = ".";
      }
      if (tail.length > 0 && isPathSeparator(path.charCodeAt(len - 1))) {
        tail += "\\";
      }
      if (!isAbsolute2 && device === void 0 && path.includes(":")) {
        if (tail.length >= 2 && isWindowsDeviceRoot(tail.charCodeAt(0)) && tail.charCodeAt(1) === CHAR_COLON) {
          return `.\\${tail}`;
        }
        let index = path.indexOf(":");
        do {
          if (index === len - 1 || isPathSeparator(path.charCodeAt(index + 1))) {
            return `.\\${tail}`;
          }
        } while ((index = path.indexOf(":", index + 1)) !== -1);
      }
      if (device === void 0) {
        return isAbsolute2 ? `\\${tail}` : tail;
      }
      return isAbsolute2 ? `${device}\\${tail}` : `${device}${tail}`;
    },
    isAbsolute(path) {
      validateString(path, "path");
      const len = path.length;
      if (len === 0) {
        return false;
      }
      const code = path.charCodeAt(0);
      return isPathSeparator(code) || len > 2 && isWindowsDeviceRoot(code) && path.charCodeAt(1) === CHAR_COLON && isPathSeparator(path.charCodeAt(2));
    },
    join(...paths) {
      if (paths.length === 0) {
        return ".";
      }
      let joined;
      let firstPart;
      for (let i = 0; i < paths.length; ++i) {
        const arg = paths[i];
        validateString(arg, "path");
        if (arg.length > 0) {
          if (joined === void 0) {
            joined = firstPart = arg;
          } else {
            joined += `\\${arg}`;
          }
        }
      }
      if (joined === void 0) {
        return ".";
      }
      let needsReplace = true;
      let slashCount = 0;
      if (typeof firstPart === "string" && isPathSeparator(firstPart.charCodeAt(0))) {
        ++slashCount;
        const firstLen = firstPart.length;
        if (firstLen > 1 && isPathSeparator(firstPart.charCodeAt(1))) {
          ++slashCount;
          if (firstLen > 2) {
            if (isPathSeparator(firstPart.charCodeAt(2))) {
              ++slashCount;
            } else {
              needsReplace = false;
            }
          }
        }
      }
      if (needsReplace) {
        while (slashCount < joined.length && isPathSeparator(joined.charCodeAt(slashCount))) {
          slashCount++;
        }
        if (slashCount >= 2) {
          joined = `\\${joined.slice(slashCount)}`;
        }
      }
      return win32.normalize(joined);
    },
    relative(from, to) {
      validateString(from, "from");
      validateString(to, "to");
      if (from === to) {
        return "";
      }
      const fromOrig = win32.resolve(from);
      const toOrig = win32.resolve(to);
      if (fromOrig === toOrig) {
        return "";
      }
      from = fromOrig.toLowerCase();
      to = toOrig.toLowerCase();
      if (from === to) {
        return "";
      }
      if (fromOrig.length !== from.length || toOrig.length !== to.length) {
        const fromSplit = fromOrig.split("\\");
        const toSplit = toOrig.split("\\");
        if (fromSplit[fromSplit.length - 1] === "") {
          fromSplit.pop();
        }
        if (toSplit[toSplit.length - 1] === "") {
          toSplit.pop();
        }
        const fromLen2 = fromSplit.length;
        const toLen2 = toSplit.length;
        const length2 = fromLen2 < toLen2 ? fromLen2 : toLen2;
        let i2;
        for (i2 = 0; i2 < length2; i2++) {
          if (fromSplit[i2].toLowerCase() !== toSplit[i2].toLowerCase()) {
            break;
          }
        }
        if (i2 === 0) {
          return toOrig;
        } else if (i2 === length2) {
          if (toLen2 > length2) {
            return toSplit.slice(i2).join("\\");
          }
          if (fromLen2 > length2) {
            return "..\\".repeat(fromLen2 - 1 - i2) + "..";
          }
          return "";
        }
        return "..\\".repeat(fromLen2 - i2) + toSplit.slice(i2).join("\\");
      }
      let fromStart = 0;
      while (fromStart < from.length && from.charCodeAt(fromStart) === CHAR_BACKWARD_SLASH) {
        fromStart++;
      }
      let fromEnd = from.length;
      while (fromEnd - 1 > fromStart && from.charCodeAt(fromEnd - 1) === CHAR_BACKWARD_SLASH) {
        fromEnd--;
      }
      const fromLen = fromEnd - fromStart;
      let toStart = 0;
      while (toStart < to.length && to.charCodeAt(toStart) === CHAR_BACKWARD_SLASH) {
        toStart++;
      }
      let toEnd = to.length;
      while (toEnd - 1 > toStart && to.charCodeAt(toEnd - 1) === CHAR_BACKWARD_SLASH) {
        toEnd--;
      }
      const toLen = toEnd - toStart;
      const length = fromLen < toLen ? fromLen : toLen;
      let lastCommonSep = -1;
      let i = 0;
      for (; i < length; i++) {
        const fromCode = from.charCodeAt(fromStart + i);
        if (fromCode !== to.charCodeAt(toStart + i)) {
          break;
        } else if (fromCode === CHAR_BACKWARD_SLASH) {
          lastCommonSep = i;
        }
      }
      if (i !== length) {
        if (lastCommonSep === -1) {
          return toOrig;
        }
      } else {
        if (toLen > length) {
          if (to.charCodeAt(toStart + i) === CHAR_BACKWARD_SLASH) {
            return toOrig.slice(toStart + i + 1);
          }
          if (i === 2) {
            return toOrig.slice(toStart + i);
          }
        }
        if (fromLen > length) {
          if (from.charCodeAt(fromStart + i) === CHAR_BACKWARD_SLASH) {
            lastCommonSep = i;
          } else if (i === 2) {
            lastCommonSep = 3;
          }
        }
        if (lastCommonSep === -1) {
          lastCommonSep = 0;
        }
      }
      let out = "";
      for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
        if (i === fromEnd || from.charCodeAt(i) === CHAR_BACKWARD_SLASH) {
          out += out.length === 0 ? ".." : "\\..";
        }
      }
      toStart += lastCommonSep;
      if (out.length > 0) {
        return `${out}${toOrig.slice(toStart, toEnd)}`;
      }
      if (toOrig.charCodeAt(toStart) === CHAR_BACKWARD_SLASH) {
        ++toStart;
      }
      return toOrig.slice(toStart, toEnd);
    },
    toNamespacedPath(path) {
      if (typeof path !== "string" || path.length === 0) {
        return path;
      }
      const resolvedPath = win32.resolve(path);
      if (resolvedPath.length <= 2) {
        return path;
      }
      if (resolvedPath.charCodeAt(0) === CHAR_BACKWARD_SLASH) {
        if (resolvedPath.charCodeAt(1) === CHAR_BACKWARD_SLASH) {
          const code = resolvedPath.charCodeAt(2);
          if (code !== CHAR_QUESTION_MARK && code !== CHAR_DOT) {
            return `\\\\?\\UNC\\${resolvedPath.slice(2)}`;
          }
        }
      } else if (isWindowsDeviceRoot(resolvedPath.charCodeAt(0)) && resolvedPath.charCodeAt(1) === CHAR_COLON && resolvedPath.charCodeAt(2) === CHAR_BACKWARD_SLASH) {
        return `\\\\?\\${resolvedPath}`;
      }
      return resolvedPath;
    },
    dirname(path) {
      validateString(path, "path");
      const len = path.length;
      if (len === 0) {
        return ".";
      }
      let rootEnd = -1;
      let offset = 0;
      const code = path.charCodeAt(0);
      if (len === 1) {
        return isPathSeparator(code) ? path : ".";
      }
      if (isPathSeparator(code)) {
        rootEnd = offset = 1;
        if (isPathSeparator(path.charCodeAt(1))) {
          let j = 2;
          let last = j;
          while (j < len && !isPathSeparator(path.charCodeAt(j))) {
            j++;
          }
          if (j < len && j !== last) {
            last = j;
            while (j < len && isPathSeparator(path.charCodeAt(j))) {
              j++;
            }
            if (j < len && j !== last) {
              last = j;
              while (j < len && !isPathSeparator(path.charCodeAt(j))) {
                j++;
              }
              if (j === len) {
                return path;
              }
              if (j !== last) {
                rootEnd = offset = j + 1;
              }
            }
          }
        }
      } else if (isWindowsDeviceRoot(code) && path.charCodeAt(1) === CHAR_COLON) {
        rootEnd = len > 2 && isPathSeparator(path.charCodeAt(2)) ? 3 : 2;
        offset = rootEnd;
      }
      let end = -1;
      let matchedSlash = true;
      for (let i = len - 1; i >= offset; --i) {
        if (isPathSeparator(path.charCodeAt(i))) {
          if (!matchedSlash) {
            end = i;
            break;
          }
        } else {
          matchedSlash = false;
        }
      }
      if (end === -1) {
        if (rootEnd === -1) {
          return ".";
        }
        end = rootEnd;
      }
      return path.slice(0, end);
    },
    basename(path, suffix) {
      if (suffix !== void 0) {
        validateString(suffix, "suffix");
      }
      validateString(path, "path");
      let start = 0;
      let end = -1;
      let matchedSlash = true;
      let i;
      if (path.length >= 2 && isWindowsDeviceRoot(path.charCodeAt(0)) && path.charCodeAt(1) === CHAR_COLON) {
        start = 2;
      }
      if (suffix !== void 0 && suffix.length > 0 && suffix.length <= path.length) {
        if (suffix === path) {
          return "";
        }
        let extIdx = suffix.length - 1;
        let firstNonSlashEnd = -1;
        for (i = path.length - 1; i >= start; --i) {
          const code = path.charCodeAt(i);
          if (isPathSeparator(code)) {
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else {
            if (firstNonSlashEnd === -1) {
              matchedSlash = false;
              firstNonSlashEnd = i + 1;
            }
            if (extIdx >= 0) {
              if (code === suffix.charCodeAt(extIdx)) {
                if (--extIdx === -1) {
                  end = i;
                }
              } else {
                extIdx = -1;
                end = firstNonSlashEnd;
              }
            }
          }
        }
        if (start === end) {
          end = firstNonSlashEnd;
        } else if (end === -1) {
          end = path.length;
        }
        return path.slice(start, end);
      }
      for (i = path.length - 1; i >= start; --i) {
        if (isPathSeparator(path.charCodeAt(i))) {
          if (!matchedSlash) {
            start = i + 1;
            break;
          }
        } else if (end === -1) {
          matchedSlash = false;
          end = i + 1;
        }
      }
      if (end === -1) {
        return "";
      }
      return path.slice(start, end);
    },
    extname(path) {
      validateString(path, "path");
      let start = 0;
      let startDot = -1;
      let startPart = 0;
      let end = -1;
      let matchedSlash = true;
      let preDotState = 0;
      if (path.length >= 2 && path.charCodeAt(1) === CHAR_COLON && isWindowsDeviceRoot(path.charCodeAt(0))) {
        start = startPart = 2;
      }
      for (let i = path.length - 1; i >= start; --i) {
        const code = path.charCodeAt(i);
        if (isPathSeparator(code)) {
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
        if (end === -1) {
          matchedSlash = false;
          end = i + 1;
        }
        if (code === CHAR_DOT) {
          if (startDot === -1) {
            startDot = i;
          } else if (preDotState !== 1) {
            preDotState = 1;
          }
        } else if (startDot !== -1) {
          preDotState = -1;
        }
      }
      if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        return "";
      }
      return path.slice(startDot, end);
    },
    format: _format2.bind(null, "\\"),
    parse(path) {
      validateString(path, "path");
      const ret = {
        root: "",
        dir: "",
        base: "",
        ext: "",
        name: ""
      };
      if (path.length === 0) {
        return ret;
      }
      const len = path.length;
      let rootEnd = 0;
      let code = path.charCodeAt(0);
      if (len === 1) {
        if (isPathSeparator(code)) {
          ret.root = ret.dir = path;
          return ret;
        }
        ret.base = ret.name = path;
        return ret;
      }
      if (isPathSeparator(code)) {
        rootEnd = 1;
        if (isPathSeparator(path.charCodeAt(1))) {
          let j = 2;
          let last = j;
          while (j < len && !isPathSeparator(path.charCodeAt(j))) {
            j++;
          }
          if (j < len && j !== last) {
            last = j;
            while (j < len && isPathSeparator(path.charCodeAt(j))) {
              j++;
            }
            if (j < len && j !== last) {
              last = j;
              while (j < len && !isPathSeparator(path.charCodeAt(j))) {
                j++;
              }
              if (j === len) {
                rootEnd = j;
              } else if (j !== last) {
                rootEnd = j + 1;
              }
            }
          }
        }
      } else if (isWindowsDeviceRoot(code) && path.charCodeAt(1) === CHAR_COLON) {
        if (len <= 2) {
          ret.root = ret.dir = path;
          return ret;
        }
        rootEnd = 2;
        if (isPathSeparator(path.charCodeAt(2))) {
          if (len === 3) {
            ret.root = ret.dir = path;
            return ret;
          }
          rootEnd = 3;
        }
      }
      if (rootEnd > 0) {
        ret.root = path.slice(0, rootEnd);
      }
      let startDot = -1;
      let startPart = rootEnd;
      let end = -1;
      let matchedSlash = true;
      let i = path.length - 1;
      let preDotState = 0;
      for (; i >= rootEnd; --i) {
        code = path.charCodeAt(i);
        if (isPathSeparator(code)) {
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
        if (end === -1) {
          matchedSlash = false;
          end = i + 1;
        }
        if (code === CHAR_DOT) {
          if (startDot === -1) {
            startDot = i;
          } else if (preDotState !== 1) {
            preDotState = 1;
          }
        } else if (startDot !== -1) {
          preDotState = -1;
        }
      }
      if (end !== -1) {
        if (startDot === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
          ret.base = ret.name = path.slice(startPart, end);
        } else {
          ret.name = path.slice(startPart, startDot);
          ret.base = path.slice(startPart, end);
          ret.ext = path.slice(startDot, end);
        }
      }
      if (startPart > 0 && startPart !== rootEnd) {
        ret.dir = path.slice(0, startPart - 1);
      } else {
        ret.dir = ret.root;
      }
      return ret;
    },
    sep: "\\",
    delimiter: ";",
    win32: null,
    posix: null
  };
  var posixCwd = (() => {
    if (platformIsWin32) {
      const regexp = /\\/g;
      return () => {
        const cwd$1 = cwd().replace(regexp, "/");
        return cwd$1.slice(cwd$1.indexOf("/"));
      };
    }
    return () => cwd();
  })();
  var posix = {
    resolve(...pathSegments) {
      let resolvedPath = "";
      let resolvedAbsolute = false;
      for (let i = pathSegments.length - 1; i >= 0 && !resolvedAbsolute; i--) {
        const path = pathSegments[i];
        validateString(path, `paths[${i}]`);
        if (path.length === 0) {
          continue;
        }
        resolvedPath = `${path}/${resolvedPath}`;
        resolvedAbsolute = path.charCodeAt(0) === CHAR_FORWARD_SLASH;
      }
      if (!resolvedAbsolute) {
        const cwd2 = posixCwd();
        resolvedPath = `${cwd2}/${resolvedPath}`;
        resolvedAbsolute = cwd2.charCodeAt(0) === CHAR_FORWARD_SLASH;
      }
      resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute, "/", isPosixPathSeparator);
      if (resolvedAbsolute) {
        return `/${resolvedPath}`;
      }
      return resolvedPath.length > 0 ? resolvedPath : ".";
    },
    normalize(path) {
      validateString(path, "path");
      if (path.length === 0) {
        return ".";
      }
      const isAbsolute2 = path.charCodeAt(0) === CHAR_FORWARD_SLASH;
      const trailingSeparator = path.charCodeAt(path.length - 1) === CHAR_FORWARD_SLASH;
      path = normalizeString(path, !isAbsolute2, "/", isPosixPathSeparator);
      if (path.length === 0) {
        if (isAbsolute2) {
          return "/";
        }
        return trailingSeparator ? "./" : ".";
      }
      if (trailingSeparator) {
        path += "/";
      }
      return isAbsolute2 ? `/${path}` : path;
    },
    isAbsolute(path) {
      validateString(path, "path");
      return path.length > 0 && path.charCodeAt(0) === CHAR_FORWARD_SLASH;
    },
    join(...paths) {
      if (paths.length === 0) {
        return ".";
      }
      const path = [];
      for (let i = 0; i < paths.length; ++i) {
        const arg = paths[i];
        validateString(arg, "path");
        if (arg.length > 0) {
          path.push(arg);
        }
      }
      if (path.length === 0) {
        return ".";
      }
      return posix.normalize(path.join("/"));
    },
    relative(from, to) {
      validateString(from, "from");
      validateString(to, "to");
      if (from === to) {
        return "";
      }
      from = posix.resolve(from);
      to = posix.resolve(to);
      if (from === to) {
        return "";
      }
      const fromStart = 1;
      const fromEnd = from.length;
      const fromLen = fromEnd - fromStart;
      const toStart = 1;
      const toLen = to.length - toStart;
      const length = fromLen < toLen ? fromLen : toLen;
      let lastCommonSep = -1;
      let i = 0;
      for (; i < length; i++) {
        const fromCode = from.charCodeAt(fromStart + i);
        if (fromCode !== to.charCodeAt(toStart + i)) {
          break;
        } else if (fromCode === CHAR_FORWARD_SLASH) {
          lastCommonSep = i;
        }
      }
      if (i === length) {
        if (toLen > length) {
          if (to.charCodeAt(toStart + i) === CHAR_FORWARD_SLASH) {
            return to.slice(toStart + i + 1);
          }
          if (i === 0) {
            return to.slice(toStart + i);
          }
        } else if (fromLen > length) {
          if (from.charCodeAt(fromStart + i) === CHAR_FORWARD_SLASH) {
            lastCommonSep = i;
          } else if (i === 0) {
            lastCommonSep = 0;
          }
        }
      }
      let out = "";
      for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
        if (i === fromEnd || from.charCodeAt(i) === CHAR_FORWARD_SLASH) {
          out += out.length === 0 ? ".." : "/..";
        }
      }
      return `${out}${to.slice(toStart + lastCommonSep)}`;
    },
    toNamespacedPath(path) {
      return path;
    },
    dirname(path) {
      validateString(path, "path");
      if (path.length === 0) {
        return ".";
      }
      const hasRoot = path.charCodeAt(0) === CHAR_FORWARD_SLASH;
      let end = -1;
      let matchedSlash = true;
      for (let i = path.length - 1; i >= 1; --i) {
        if (path.charCodeAt(i) === CHAR_FORWARD_SLASH) {
          if (!matchedSlash) {
            end = i;
            break;
          }
        } else {
          matchedSlash = false;
        }
      }
      if (end === -1) {
        return hasRoot ? "/" : ".";
      }
      if (hasRoot && end === 1) {
        return "//";
      }
      return path.slice(0, end);
    },
    basename(path, suffix) {
      if (suffix !== void 0) {
        validateString(suffix, "suffix");
      }
      validateString(path, "path");
      let start = 0;
      let end = -1;
      let matchedSlash = true;
      let i;
      if (suffix !== void 0 && suffix.length > 0 && suffix.length <= path.length) {
        if (suffix === path) {
          return "";
        }
        let extIdx = suffix.length - 1;
        let firstNonSlashEnd = -1;
        for (i = path.length - 1; i >= 0; --i) {
          const code = path.charCodeAt(i);
          if (code === CHAR_FORWARD_SLASH) {
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else {
            if (firstNonSlashEnd === -1) {
              matchedSlash = false;
              firstNonSlashEnd = i + 1;
            }
            if (extIdx >= 0) {
              if (code === suffix.charCodeAt(extIdx)) {
                if (--extIdx === -1) {
                  end = i;
                }
              } else {
                extIdx = -1;
                end = firstNonSlashEnd;
              }
            }
          }
        }
        if (start === end) {
          end = firstNonSlashEnd;
        } else if (end === -1) {
          end = path.length;
        }
        return path.slice(start, end);
      }
      for (i = path.length - 1; i >= 0; --i) {
        if (path.charCodeAt(i) === CHAR_FORWARD_SLASH) {
          if (!matchedSlash) {
            start = i + 1;
            break;
          }
        } else if (end === -1) {
          matchedSlash = false;
          end = i + 1;
        }
      }
      if (end === -1) {
        return "";
      }
      return path.slice(start, end);
    },
    extname(path) {
      validateString(path, "path");
      let startDot = -1;
      let startPart = 0;
      let end = -1;
      let matchedSlash = true;
      let preDotState = 0;
      for (let i = path.length - 1; i >= 0; --i) {
        const char = path[i];
        if (char === "/") {
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
        if (end === -1) {
          matchedSlash = false;
          end = i + 1;
        }
        if (char === ".") {
          if (startDot === -1) {
            startDot = i;
          } else if (preDotState !== 1) {
            preDotState = 1;
          }
        } else if (startDot !== -1) {
          preDotState = -1;
        }
      }
      if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        return "";
      }
      return path.slice(startDot, end);
    },
    format: _format2.bind(null, "/"),
    parse(path) {
      validateString(path, "path");
      const ret = {
        root: "",
        dir: "",
        base: "",
        ext: "",
        name: ""
      };
      if (path.length === 0) {
        return ret;
      }
      const isAbsolute2 = path.charCodeAt(0) === CHAR_FORWARD_SLASH;
      let start;
      if (isAbsolute2) {
        ret.root = "/";
        start = 1;
      } else {
        start = 0;
      }
      let startDot = -1;
      let startPart = 0;
      let end = -1;
      let matchedSlash = true;
      let i = path.length - 1;
      let preDotState = 0;
      for (; i >= start; --i) {
        const code = path.charCodeAt(i);
        if (code === CHAR_FORWARD_SLASH) {
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
        if (end === -1) {
          matchedSlash = false;
          end = i + 1;
        }
        if (code === CHAR_DOT) {
          if (startDot === -1) {
            startDot = i;
          } else if (preDotState !== 1) {
            preDotState = 1;
          }
        } else if (startDot !== -1) {
          preDotState = -1;
        }
      }
      if (end !== -1) {
        const start2 = startPart === 0 && isAbsolute2 ? 1 : startPart;
        if (startDot === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
          ret.base = ret.name = path.slice(start2, end);
        } else {
          ret.name = path.slice(start2, startDot);
          ret.base = path.slice(start2, end);
          ret.ext = path.slice(startDot, end);
        }
      }
      if (startPart > 0) {
        ret.dir = path.slice(0, startPart - 1);
      } else if (isAbsolute2) {
        ret.dir = "/";
      }
      return ret;
    },
    sep: "/",
    delimiter: ":",
    win32: null,
    posix: null
  };
  posix.win32 = win32.win32 = win32;
  posix.posix = win32.posix = posix;
  var normalize = platformIsWin32 ? win32.normalize : posix.normalize;
  var isAbsolute = platformIsWin32 ? win32.isAbsolute : posix.isAbsolute;
  var join = platformIsWin32 ? win32.join : posix.join;
  var resolve = platformIsWin32 ? win32.resolve : posix.resolve;
  var relative = platformIsWin32 ? win32.relative : posix.relative;
  var dirname = platformIsWin32 ? win32.dirname : posix.dirname;
  var basename = platformIsWin32 ? win32.basename : posix.basename;
  var extname = platformIsWin32 ? win32.extname : posix.extname;
  var parse = platformIsWin32 ? win32.parse : posix.parse;
  var sep = platformIsWin32 ? win32.sep : posix.sep;

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/uri.js
  var _schemePattern = /^\w[\w\d+.-]*$/;
  var _singleSlashStart = /^\//;
  var _doubleSlashStart = /^\/\//;
  function _validateUri(ret, _strict) {
    if (!ret.scheme && _strict) {
      throw new Error(
        `[UriError]: Scheme is missing: {scheme: "", authority: "${ret.authority}", path: "${ret.path}", query: "${ret.query}", fragment: "${ret.fragment}"}`
      );
    }
    if (ret.scheme && !_schemePattern.test(ret.scheme)) {
      const matches = [...ret.scheme.matchAll(/[^\w\d+.-]/gu)];
      const detail = matches.length > 0 ? ` Found '${matches[0][0]}' at index ${matches[0].index} (${matches.length} total)` : "";
      throw new Error(
        `[UriError]: Scheme contains illegal characters.${detail} (len:${ret.scheme.length})`
      );
    }
    if (ret.path) {
      if (ret.authority) {
        if (!_singleSlashStart.test(ret.path)) {
          throw new Error(
            '[UriError]: If a URI contains an authority component, then the path component must either be empty or begin with a slash ("/") character'
          );
        }
      } else {
        if (_doubleSlashStart.test(ret.path)) {
          throw new Error(
            '[UriError]: If a URI does not contain an authority component, then the path cannot begin with two slash characters ("//")'
          );
        }
      }
    }
  }
  function _schemeFix(scheme, _strict) {
    if (!scheme && !_strict) {
      return "file";
    }
    return scheme;
  }
  function _referenceResolution(scheme, path) {
    switch (scheme) {
      case "https":
      case "http":
      case "file":
        if (!path) {
          path = _slash;
        } else if (path[0] !== _slash) {
          path = _slash + path;
        }
        break;
    }
    return path;
  }
  var _empty = "";
  var _slash = "/";
  var _regexp = /^(([^:/?#]+?):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;
  var URI = class _URI {
    static isUri(thing) {
      if (thing instanceof _URI) {
        return true;
      }
      if (!thing || typeof thing !== "object") {
        return false;
      }
      return typeof thing.authority === "string" && typeof thing.fragment === "string" && typeof thing.path === "string" && typeof thing.query === "string" && typeof thing.scheme === "string" && typeof thing.fsPath === "string" && typeof thing.with === "function" && typeof thing.toString === "function";
    }
    constructor(schemeOrData, authority, path, query, fragment, _strict = false) {
      if (typeof schemeOrData === "object") {
        this.scheme = schemeOrData.scheme || _empty;
        this.authority = schemeOrData.authority || _empty;
        this.path = schemeOrData.path || _empty;
        this.query = schemeOrData.query || _empty;
        this.fragment = schemeOrData.fragment || _empty;
      } else {
        this.scheme = _schemeFix(schemeOrData, _strict);
        this.authority = authority || _empty;
        this.path = _referenceResolution(this.scheme, path || _empty);
        this.query = query || _empty;
        this.fragment = fragment || _empty;
        _validateUri(this, _strict);
      }
    }
    get fsPath() {
      return uriToFsPath(this, false);
    }
    with(change) {
      if (!change) {
        return this;
      }
      let {
        scheme,
        authority,
        path,
        query,
        fragment
      } = change;
      if (scheme === void 0) {
        scheme = this.scheme;
      } else if (scheme === null) {
        scheme = _empty;
      }
      if (authority === void 0) {
        authority = this.authority;
      } else if (authority === null) {
        authority = _empty;
      }
      if (path === void 0) {
        path = this.path;
      } else if (path === null) {
        path = _empty;
      }
      if (query === void 0) {
        query = this.query;
      } else if (query === null) {
        query = _empty;
      }
      if (fragment === void 0) {
        fragment = this.fragment;
      } else if (fragment === null) {
        fragment = _empty;
      }
      if (scheme === this.scheme && authority === this.authority && path === this.path && query === this.query && fragment === this.fragment) {
        return this;
      }
      return new Uri(scheme, authority, path, query, fragment);
    }
    static parse(value, _strict = false) {
      const match = _regexp.exec(value);
      if (!match) {
        return new Uri(_empty, _empty, _empty, _empty, _empty);
      }
      return new Uri(
        match[2] || _empty,
        percentDecode(match[4] || _empty),
        percentDecode(match[5] || _empty),
        percentDecode(match[7] || _empty),
        percentDecode(match[9] || _empty),
        _strict
      );
    }
    static file(path) {
      let authority = _empty;
      if (isWindows) {
        path = path.replace(/\\/g, _slash);
      }
      if (path[0] === _slash && path[1] === _slash) {
        const idx = path.indexOf(_slash, 2);
        if (idx === -1) {
          authority = path.substring(2);
          path = _slash;
        } else {
          authority = path.substring(2, idx);
          path = path.substring(idx) || _slash;
        }
      }
      return new Uri("file", authority, path, _empty, _empty);
    }
    static from(components, strict) {
      const result = new Uri(
        components.scheme,
        components.authority,
        components.path,
        components.query,
        components.fragment,
        strict
      );
      return result;
    }
    static joinPath(uri, ...pathFragment) {
      if (!uri.path) {
        throw new Error(`[UriError]: cannot call joinPath on URI without path: ${uri.toString()}`);
      }
      let newPath;
      if (isWindows && uri.scheme === "file") {
        newPath = _URI.file(win32.join(uriToFsPath(uri, true), ...pathFragment)).path;
      } else {
        newPath = posix.join(uri.path, ...pathFragment);
      }
      return uri.with({
        path: newPath
      });
    }
    toString(skipEncoding = false) {
      return _asFormatted(this, skipEncoding);
    }
    toJSON() {
      return this;
    }
    static revive(data) {
      if (!data) {
        return data;
      } else if (data instanceof _URI) {
        return data;
      } else {
        const result = new Uri(data);
        result._formatted = data.external ?? null;
        result._fsPath = data._sep === _pathSepMarker ? data.fsPath ?? null : null;
        return result;
      }
    }
    [Symbol.for("debug.description")]() {
      return `URI(${this.toString()})`;
    }
  };
  var _pathSepMarker = isWindows ? 1 : void 0;
  var Uri = class extends URI {
    constructor() {
      super(...arguments);
      this._formatted = null;
      this._fsPath = null;
    }
    get fsPath() {
      if (!this._fsPath) {
        this._fsPath = uriToFsPath(this, false);
      }
      return this._fsPath;
    }
    toString(skipEncoding = false) {
      if (!skipEncoding) {
        if (!this._formatted) {
          this._formatted = _asFormatted(this, false);
        }
        return this._formatted;
      } else {
        return _asFormatted(this, true);
      }
    }
    toJSON() {
      const res = {
        $mid: MarshalledId.Uri
      };
      if (this._fsPath) {
        res.fsPath = this._fsPath;
        res._sep = _pathSepMarker;
      }
      if (this._formatted) {
        res.external = this._formatted;
      }
      if (this.path) {
        res.path = this.path;
      }
      if (this.scheme) {
        res.scheme = this.scheme;
      }
      if (this.authority) {
        res.authority = this.authority;
      }
      if (this.query) {
        res.query = this.query;
      }
      if (this.fragment) {
        res.fragment = this.fragment;
      }
      return res;
    }
  };
  var encodeTable = {
    [CharCode.Colon]: "%3A",
    [CharCode.Slash]: "%2F",
    [CharCode.QuestionMark]: "%3F",
    [CharCode.Hash]: "%23",
    [CharCode.OpenSquareBracket]: "%5B",
    [CharCode.CloseSquareBracket]: "%5D",
    [CharCode.AtSign]: "%40",
    [CharCode.ExclamationMark]: "%21",
    [CharCode.DollarSign]: "%24",
    [CharCode.Ampersand]: "%26",
    [CharCode.SingleQuote]: "%27",
    [CharCode.OpenParen]: "%28",
    [CharCode.CloseParen]: "%29",
    [CharCode.Asterisk]: "%2A",
    [CharCode.Plus]: "%2B",
    [CharCode.Comma]: "%2C",
    [CharCode.Semicolon]: "%3B",
    [CharCode.Equals]: "%3D",
    [CharCode.Space]: "%20"
  };
  function encodeURIComponentFast(uriComponent, isPath, isAuthority) {
    let res = void 0;
    let nativeEncodePos = -1;
    for (let pos = 0; pos < uriComponent.length; pos++) {
      const code = uriComponent.charCodeAt(pos);
      if (code >= CharCode.a && code <= CharCode.z || code >= CharCode.A && code <= CharCode.Z || code >= CharCode.Digit0 && code <= CharCode.Digit9 || code === CharCode.Dash || code === CharCode.Period || code === CharCode.Underline || code === CharCode.Tilde || isPath && code === CharCode.Slash || isAuthority && code === CharCode.OpenSquareBracket || isAuthority && code === CharCode.CloseSquareBracket || isAuthority && code === CharCode.Colon) {
        if (nativeEncodePos !== -1) {
          res += encodeURIComponent(uriComponent.substring(nativeEncodePos, pos));
          nativeEncodePos = -1;
        }
        if (res !== void 0) {
          res += uriComponent.charAt(pos);
        }
      } else {
        if (res === void 0) {
          res = uriComponent.substr(0, pos);
        }
        const escaped = encodeTable[code];
        if (escaped !== void 0) {
          if (nativeEncodePos !== -1) {
            res += encodeURIComponent(uriComponent.substring(nativeEncodePos, pos));
            nativeEncodePos = -1;
          }
          res += escaped;
        } else if (nativeEncodePos === -1) {
          nativeEncodePos = pos;
        }
      }
    }
    if (nativeEncodePos !== -1) {
      res += encodeURIComponent(uriComponent.substring(nativeEncodePos));
    }
    return res !== void 0 ? res : uriComponent;
  }
  function encodeURIComponentMinimal(path) {
    let res = void 0;
    for (let pos = 0; pos < path.length; pos++) {
      const code = path.charCodeAt(pos);
      if (code === CharCode.Hash || code === CharCode.QuestionMark) {
        if (res === void 0) {
          res = path.substr(0, pos);
        }
        res += encodeTable[code];
      } else {
        if (res !== void 0) {
          res += path[pos];
        }
      }
    }
    return res !== void 0 ? res : path;
  }
  function uriToFsPath(uri, keepDriveLetterCasing) {
    let value;
    if (uri.authority && uri.path.length > 1 && uri.scheme === "file") {
      value = `//${uri.authority}${uri.path}`;
    } else if (uri.path.charCodeAt(0) === CharCode.Slash && (uri.path.charCodeAt(1) >= CharCode.A && uri.path.charCodeAt(1) <= CharCode.Z || uri.path.charCodeAt(1) >= CharCode.a && uri.path.charCodeAt(1) <= CharCode.z) && uri.path.charCodeAt(2) === CharCode.Colon) {
      if (!keepDriveLetterCasing) {
        value = uri.path[1].toLowerCase() + uri.path.substr(2);
      } else {
        value = uri.path.substr(1);
      }
    } else {
      value = uri.path;
    }
    if (isWindows) {
      value = value.replace(/\//g, "\\");
    }
    return value;
  }
  function _asFormatted(uri, skipEncoding) {
    const encoder = !skipEncoding ? encodeURIComponentFast : encodeURIComponentMinimal;
    let res = "";
    let {
      scheme,
      authority,
      path,
      query,
      fragment
    } = uri;
    if (scheme) {
      res += scheme;
      res += ":";
    }
    if (authority || scheme === "file") {
      res += _slash;
      res += _slash;
    }
    if (authority) {
      let idx = authority.indexOf("@");
      if (idx !== -1) {
        const userinfo = authority.substr(0, idx);
        authority = authority.substr(idx + 1);
        idx = userinfo.lastIndexOf(":");
        if (idx === -1) {
          res += encoder(userinfo, false, false);
        } else {
          res += encoder(userinfo.substr(0, idx), false, false);
          res += ":";
          res += encoder(userinfo.substr(idx + 1), false, true);
        }
        res += "@";
      }
      authority = authority.toLowerCase();
      idx = authority.lastIndexOf(":");
      if (idx === -1) {
        res += encoder(authority, false, true);
      } else {
        res += encoder(authority.substr(0, idx), false, true);
        res += authority.substr(idx);
      }
    }
    if (path) {
      if (path.length >= 3 && path.charCodeAt(0) === CharCode.Slash && path.charCodeAt(2) === CharCode.Colon) {
        const code = path.charCodeAt(1);
        if (code >= CharCode.A && code <= CharCode.Z) {
          path = `/${String.fromCharCode(code + 32)}:${path.substr(3)}`;
        }
      } else if (path.length >= 2 && path.charCodeAt(1) === CharCode.Colon) {
        const code = path.charCodeAt(0);
        if (code >= CharCode.A && code <= CharCode.Z) {
          path = `${String.fromCharCode(code + 32)}:${path.substr(2)}`;
        }
      }
      res += encoder(path, true, false);
    }
    if (query) {
      res += "?";
      res += encoder(query, false, false);
    }
    if (fragment) {
      res += "#";
      res += !skipEncoding ? encodeURIComponentFast(fragment, false, false) : fragment;
    }
    return res;
  }
  function decodeURIComponentGraceful(str) {
    try {
      return decodeURIComponent(str);
    } catch {
      if (str.length > 3) {
        return str.substr(0, 3) + decodeURIComponentGraceful(str.substr(3));
      } else {
        return str;
      }
    }
  }
  var _rEncodedAsHex = /(%[0-9A-Za-z][0-9A-Za-z])+/g;
  function percentDecode(str) {
    if (!str.match(_rEncodedAsHex)) {
      return str;
    }
    return str.replace(_rEncodedAsHex, (match) => decodeURIComponentGraceful(match));
  }

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/arraysFind.js
  function findLastMonotonous(array, predicate) {
    const idx = findLastIdxMonotonous(array, predicate);
    return idx === -1 ? void 0 : array[idx];
  }
  function findLastIdxMonotonous(array, predicate, startIdx = 0, endIdxEx = array.length) {
    let i = startIdx;
    let j = endIdxEx;
    while (i < j) {
      const k = Math.floor((i + j) / 2);
      if (predicate(array[k])) {
        i = k + 1;
      } else {
        j = k;
      }
    }
    return i - 1;
  }
  function findFirstIdxMonotonousOrArrLen(array, predicate, startIdx = 0, endIdxEx = array.length) {
    let i = startIdx;
    let j = endIdxEx;
    while (i < j) {
      const k = Math.floor((i + j) / 2);
      if (predicate(array[k])) {
        j = k;
      } else {
        i = k + 1;
      }
    }
    return i;
  }
  var MonotonousArray = class _MonotonousArray {
    static {
      this.assertInvariants = false;
    }
    constructor(_array) {
      this._array = _array;
      this._findLastMonotonousLastIdx = 0;
    }
    findLastMonotonous(predicate) {
      if (_MonotonousArray.assertInvariants) {
        if (this._prevFindLastPredicate) {
          for (const item of this._array) {
            if (this._prevFindLastPredicate(item) && !predicate(item)) {
              throw new Error(
                "MonotonousArray: current predicate must be weaker than (or equal to) the previous predicate."
              );
            }
          }
        }
        this._prevFindLastPredicate = predicate;
      }
      const idx = findLastIdxMonotonous(this._array, predicate, this._findLastMonotonousLastIdx);
      this._findLastMonotonousLastIdx = idx + 1;
      return idx === -1 ? void 0 : this._array[idx];
    }
  };

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/errors.js
  var ErrorHandler = class {
    constructor() {
      this.listeners = [];
      this.unexpectedErrorHandler = function(e) {
        setTimeout(() => {
          if (e.stack) {
            if (ErrorNoTelemetry.isErrorNoTelemetry(e)) {
              throw new ErrorNoTelemetry(e.message + "\n\n" + e.stack);
            }
            throw new Error(e.message + "\n\n" + e.stack);
          }
          throw e;
        }, 0);
      };
    }
    addListener(listener) {
      this.listeners.push(listener);
      return () => {
        this._removeListener(listener);
      };
    }
    emit(e) {
      this.listeners.forEach((listener) => {
        listener(e);
      });
    }
    _removeListener(listener) {
      this.listeners.splice(this.listeners.indexOf(listener), 1);
    }
    setUnexpectedErrorHandler(newUnexpectedErrorHandler) {
      this.unexpectedErrorHandler = newUnexpectedErrorHandler;
    }
    getUnexpectedErrorHandler() {
      return this.unexpectedErrorHandler;
    }
    onUnexpectedError(e) {
      this.unexpectedErrorHandler(e);
      this.emit(e);
    }
    onUnexpectedExternalError(e) {
      this.unexpectedErrorHandler(e);
    }
  };
  var errorHandler = new ErrorHandler();
  function onBugIndicatingError(e) {
    errorHandler.onUnexpectedError(e);
    return void 0;
  }
  function onUnexpectedError(e) {
    if (!isCancellationError(e)) {
      errorHandler.onUnexpectedError(e);
    }
    return void 0;
  }
  function onUnexpectedExternalError(e) {
    if (!isCancellationError(e)) {
      errorHandler.onUnexpectedExternalError(e);
    }
    return void 0;
  }
  function transformErrorForSerialization(error) {
    if (error instanceof Error) {
      const {
        name,
        message,
        cause
      } = error;
      const stack = error.stacktrace || error.stack;
      return {
        $isError: true,
        name,
        message,
        stack,
        noTelemetry: ErrorNoTelemetry.isErrorNoTelemetry(error),
        cause: cause ? transformErrorForSerialization(cause) : void 0,
        code: error.code
      };
    }
    return error;
  }
  var canceledName = "Canceled";
  function isCancellationError(error) {
    if (error instanceof CancellationError) {
      return true;
    }
    return error instanceof Error && error.name === canceledName && error.message === canceledName;
  }
  var CancellationError = class extends Error {
    constructor() {
      super(canceledName);
      this.name = this.message;
    }
  };
  var PendingMigrationError = class _PendingMigrationError extends Error {
    static {
      this._name = "PendingMigrationError";
    }
    static is(error) {
      return error instanceof _PendingMigrationError || error instanceof Error && error.name === _PendingMigrationError._name;
    }
    constructor(message) {
      super(message);
      this.name = _PendingMigrationError._name;
    }
  };
  var ErrorNoTelemetry = class _ErrorNoTelemetry extends Error {
    constructor(msg) {
      super(msg);
      this.name = "CodeExpectedError";
    }
    static fromError(err) {
      if (err instanceof _ErrorNoTelemetry) {
        return err;
      }
      const result = new _ErrorNoTelemetry();
      result.message = err.message;
      result.stack = err.stack;
      return result;
    }
    static isErrorNoTelemetry(err) {
      return err.name === "CodeExpectedError";
    }
  };
  var BugIndicatingError = class _BugIndicatingError extends Error {
    constructor(message) {
      super(message || "An unexpected bug occurred.");
      Object.setPrototypeOf(this, _BugIndicatingError.prototype);
    }
  };

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/arrays.js
  function equals(one, other, itemEquals = (a, b) => a === b) {
    if (one === other) {
      return true;
    }
    if (!one || !other) {
      return false;
    }
    if (one.length !== other.length) {
      return false;
    }
    for (let i = 0, len = one.length; i < len; i++) {
      if (!itemEquals(one[i], other[i])) {
        return false;
      }
    }
    return true;
  }
  function binarySearch2(length, compareToKey) {
    let low = 0, high = length - 1;
    while (low <= high) {
      const mid = (low + high) / 2 | 0;
      const comp = compareToKey(mid);
      if (comp < 0) {
        low = mid + 1;
      } else if (comp > 0) {
        high = mid - 1;
      } else {
        return mid;
      }
    }
    return -(low + 1);
  }
  function arrayInsert(target, insertIndex, insertArr) {
    const before = target.slice(0, insertIndex);
    const after = target.slice(insertIndex);
    return before.concat(insertArr, after);
  }
  var CompareResult;
  (function(CompareResult2) {
    function isLessThan(result) {
      return result < 0;
    }
    CompareResult2.isLessThan = isLessThan;
    function isLessThanOrEqual(result) {
      return result <= 0;
    }
    CompareResult2.isLessThanOrEqual = isLessThanOrEqual;
    function isGreaterThan(result) {
      return result > 0;
    }
    CompareResult2.isGreaterThan = isGreaterThan;
    function isNeitherLessOrGreaterThan(result) {
      return result === 0;
    }
    CompareResult2.isNeitherLessOrGreaterThan = isNeitherLessOrGreaterThan;
    CompareResult2.greaterThan = 1;
    CompareResult2.lessThan = -1;
    CompareResult2.neitherLessOrGreaterThan = 0;
  })(CompareResult || (CompareResult = {}));
  function compareBy(selector, comparator) {
    return (a, b) => comparator(selector(a), selector(b));
  }
  var numberComparator = (a, b) => a - b;
  var CallbackIterable = class _CallbackIterable {
    static {
      this.empty = new _CallbackIterable((_callback) => {
      });
    }
    constructor(iterate) {
      this.iterate = iterate;
    }
    forEach(handler) {
      this.iterate((item) => {
        handler(item);
        return true;
      });
    }
    toArray() {
      const result = [];
      this.iterate((item) => {
        result.push(item);
        return true;
      });
      return result;
    }
    filter(predicate) {
      return new _CallbackIterable((cb) => this.iterate((item) => predicate(item) ? cb(item) : true));
    }
    map(mapFn) {
      return new _CallbackIterable((cb) => this.iterate((item) => cb(mapFn(item))));
    }
    some(predicate) {
      let result = false;
      this.iterate((item) => {
        result = predicate(item);
        return !result;
      });
      return result;
    }
    findFirst(predicate) {
      let result;
      this.iterate((item) => {
        if (predicate(item)) {
          result = item;
          return false;
        }
        return true;
      });
      return result;
    }
    findLast(predicate) {
      let result;
      this.iterate((item) => {
        if (predicate(item)) {
          result = item;
        }
        return true;
      });
      return result;
    }
    findLastMaxBy(comparator) {
      let result;
      let first = true;
      this.iterate((item) => {
        if (first || CompareResult.isGreaterThan(comparator(item, result))) {
          first = false;
          result = item;
        }
        return true;
      });
      return result;
    }
  };

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/collections.js
  var _a;
  function groupBy(data, groupFn) {
    const result = /* @__PURE__ */ Object.create(null);
    for (const element of data) {
      const key = groupFn(element);
      let target = result[key];
      if (!target) {
        target = result[key] = [];
      }
      target.push(element);
    }
    return result;
  }
  var SetWithKey = class {
    static {
      _a = Symbol.toStringTag;
    }
    constructor(values, toKey) {
      this.toKey = toKey;
      this._map = /* @__PURE__ */ new Map();
      this[_a] = "SetWithKey";
      for (const value of values) {
        this.add(value);
      }
    }
    get size() {
      return this._map.size;
    }
    add(value) {
      const key = this.toKey(value);
      this._map.set(key, value);
      return this;
    }
    delete(value) {
      return this._map.delete(this.toKey(value));
    }
    has(value) {
      return this._map.has(this.toKey(value));
    }
    *entries() {
      for (const entry of this._map.values()) {
        yield [entry, entry];
      }
    }
    keys() {
      return this.values();
    }
    *values() {
      for (const entry of this._map.values()) {
        yield entry;
      }
    }
    clear() {
      this._map.clear();
    }
    forEach(callbackfn, thisArg) {
      this._map.forEach((entry) => callbackfn.call(thisArg, entry, entry, this));
    }
    [Symbol.iterator]() {
      return this.values();
    }
  };

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/map.js
  var _a2;
  var _b;
  var _c;
  var ResourceMapEntry = class {
    constructor(uri, value) {
      this.uri = uri;
      this.value = value;
    }
  };
  function isEntries(arg) {
    return Array.isArray(arg);
  }
  var ResourceMap = class _ResourceMap {
    static {
      this.defaultToKey = (resource) => resource.toString();
    }
    constructor(arg, toKey) {
      this[_a2] = "ResourceMap";
      if (arg instanceof _ResourceMap) {
        this.map = new Map(arg.map);
        this.toKey = toKey ?? _ResourceMap.defaultToKey;
      } else if (isEntries(arg)) {
        this.map = /* @__PURE__ */ new Map();
        this.toKey = toKey ?? _ResourceMap.defaultToKey;
        for (const [resource, value] of arg) {
          this.set(resource, value);
        }
      } else {
        this.map = /* @__PURE__ */ new Map();
        this.toKey = arg ?? _ResourceMap.defaultToKey;
      }
    }
    set(resource, value) {
      this.map.set(this.toKey(resource), new ResourceMapEntry(resource, value));
      return this;
    }
    get(resource) {
      return this.map.get(this.toKey(resource))?.value;
    }
    has(resource) {
      return this.map.has(this.toKey(resource));
    }
    get size() {
      return this.map.size;
    }
    clear() {
      this.map.clear();
    }
    delete(resource) {
      return this.map.delete(this.toKey(resource));
    }
    forEach(clb, thisArg) {
      if (typeof thisArg !== "undefined") {
        clb = clb.bind(thisArg);
      }
      for (const [_, entry] of this.map) {
        clb(entry.value, entry.uri, this);
      }
    }
    *values() {
      for (const entry of this.map.values()) {
        yield entry.value;
      }
    }
    *keys() {
      for (const entry of this.map.values()) {
        yield entry.uri;
      }
    }
    *entries() {
      for (const entry of this.map.values()) {
        yield [entry.uri, entry.value];
      }
    }
    *[(_a2 = Symbol.toStringTag, Symbol.iterator)]() {
      for (const [, entry] of this.map) {
        yield [entry.uri, entry.value];
      }
    }
  };
  var ResourceSet = class {
    constructor(entriesOrKey, toKey) {
      this[_b] = "ResourceSet";
      if (!entriesOrKey || typeof entriesOrKey === "function") {
        this._map = new ResourceMap(entriesOrKey);
      } else {
        this._map = new ResourceMap(toKey);
        entriesOrKey.forEach(this.add, this);
      }
    }
    get size() {
      return this._map.size;
    }
    add(value) {
      this._map.set(value, value);
      return this;
    }
    clear() {
      this._map.clear();
    }
    delete(value) {
      return this._map.delete(value);
    }
    forEach(callbackfn, thisArg) {
      this._map.forEach((_value, key) => callbackfn.call(thisArg, key, key, this));
    }
    has(value) {
      return this._map.has(value);
    }
    entries() {
      return this._map.entries();
    }
    keys() {
      return this._map.keys();
    }
    values() {
      return this._map.keys();
    }
    [(_b = Symbol.toStringTag, Symbol.iterator)]() {
      return this.keys();
    }
  };
  var Touch;
  (function(Touch2) {
    Touch2[Touch2["None"] = 0] = "None";
    Touch2[Touch2["AsOld"] = 1] = "AsOld";
    Touch2[Touch2["AsNew"] = 2] = "AsNew";
  })(Touch || (Touch = {}));
  var LinkedMap = class {
    constructor() {
      this[_c] = "LinkedMap";
      this._map = /* @__PURE__ */ new Map();
      this._head = void 0;
      this._tail = void 0;
      this._size = 0;
      this._state = 0;
    }
    clear() {
      this._map.clear();
      this._head = void 0;
      this._tail = void 0;
      this._size = 0;
      this._state++;
    }
    isEmpty() {
      return !this._head && !this._tail;
    }
    get size() {
      return this._size;
    }
    get first() {
      return this._head?.value;
    }
    get last() {
      return this._tail?.value;
    }
    has(key) {
      return this._map.has(key);
    }
    get(key, touch = Touch.None) {
      const item = this._map.get(key);
      if (!item) {
        return void 0;
      }
      if (touch !== Touch.None) {
        this.touch(item, touch);
      }
      return item.value;
    }
    set(key, value, touch = Touch.None) {
      let item = this._map.get(key);
      if (item) {
        item.value = value;
        if (touch !== Touch.None) {
          this.touch(item, touch);
        }
      } else {
        item = {
          key,
          value,
          next: void 0,
          previous: void 0
        };
        switch (touch) {
          case Touch.None:
            this.addItemLast(item);
            break;
          case Touch.AsOld:
            this.addItemFirst(item);
            break;
          case Touch.AsNew:
            this.addItemLast(item);
            break;
          default:
            this.addItemLast(item);
            break;
        }
        this._map.set(key, item);
        this._size++;
      }
      return this;
    }
    delete(key) {
      return !!this.remove(key);
    }
    remove(key) {
      const item = this._map.get(key);
      if (!item) {
        return void 0;
      }
      this._map.delete(key);
      this.removeItem(item);
      this._size--;
      return item.value;
    }
    shift() {
      if (!this._head && !this._tail) {
        return void 0;
      }
      if (!this._head || !this._tail) {
        throw new Error("Invalid list");
      }
      const item = this._head;
      this._map.delete(item.key);
      this.removeItem(item);
      this._size--;
      return item.value;
    }
    forEach(callbackfn, thisArg) {
      const state = this._state;
      let current = this._head;
      while (current) {
        if (thisArg) {
          callbackfn.bind(thisArg)(current.value, current.key, this);
        } else {
          callbackfn(current.value, current.key, this);
        }
        if (this._state !== state) {
          throw new Error(`LinkedMap got modified during iteration.`);
        }
        current = current.next;
      }
    }
    keys() {
      const map = this;
      const state = this._state;
      let current = this._head;
      const iterator = {
        [Symbol.iterator]() {
          return iterator;
        },
        [Symbol.dispose]() {
        },
        next() {
          if (map._state !== state) {
            throw new Error(`LinkedMap got modified during iteration.`);
          }
          if (current) {
            const result = {
              value: current.key,
              done: false
            };
            current = current.next;
            return result;
          } else {
            return {
              value: void 0,
              done: true
            };
          }
        }
      };
      return iterator;
    }
    values() {
      const map = this;
      const state = this._state;
      let current = this._head;
      const iterator = {
        [Symbol.iterator]() {
          return iterator;
        },
        [Symbol.dispose]() {
        },
        next() {
          if (map._state !== state) {
            throw new Error(`LinkedMap got modified during iteration.`);
          }
          if (current) {
            const result = {
              value: current.value,
              done: false
            };
            current = current.next;
            return result;
          } else {
            return {
              value: void 0,
              done: true
            };
          }
        }
      };
      return iterator;
    }
    entries() {
      const map = this;
      const state = this._state;
      let current = this._head;
      const iterator = {
        [Symbol.iterator]() {
          return iterator;
        },
        [Symbol.dispose]() {
        },
        next() {
          if (map._state !== state) {
            throw new Error(`LinkedMap got modified during iteration.`);
          }
          if (current) {
            const result = {
              value: [current.key, current.value],
              done: false
            };
            current = current.next;
            return result;
          } else {
            return {
              value: void 0,
              done: true
            };
          }
        }
      };
      return iterator;
    }
    [(_c = Symbol.toStringTag, Symbol.iterator)]() {
      return this.entries();
    }
    trimOld(newSize) {
      if (newSize >= this.size) {
        return;
      }
      if (newSize === 0) {
        this.clear();
        return;
      }
      let current = this._head;
      let currentSize = this.size;
      while (current && currentSize > newSize) {
        this._map.delete(current.key);
        current = current.next;
        currentSize--;
      }
      this._head = current;
      this._size = currentSize;
      if (current) {
        current.previous = void 0;
      }
      this._state++;
    }
    trimNew(newSize) {
      if (newSize >= this.size) {
        return;
      }
      if (newSize === 0) {
        this.clear();
        return;
      }
      let current = this._tail;
      let currentSize = this.size;
      while (current && currentSize > newSize) {
        this._map.delete(current.key);
        current = current.previous;
        currentSize--;
      }
      this._tail = current;
      this._size = currentSize;
      if (current) {
        current.next = void 0;
      }
      this._state++;
    }
    addItemFirst(item) {
      if (!this._head && !this._tail) {
        this._tail = item;
      } else if (!this._head) {
        throw new Error("Invalid list");
      } else {
        item.next = this._head;
        this._head.previous = item;
      }
      this._head = item;
      this._state++;
    }
    addItemLast(item) {
      if (!this._head && !this._tail) {
        this._head = item;
      } else if (!this._tail) {
        throw new Error("Invalid list");
      } else {
        item.previous = this._tail;
        this._tail.next = item;
      }
      this._tail = item;
      this._state++;
    }
    removeItem(item) {
      if (item === this._head && item === this._tail) {
        this._head = void 0;
        this._tail = void 0;
      } else if (item === this._head) {
        if (!item.next) {
          throw new Error("Invalid list");
        }
        item.next.previous = void 0;
        this._head = item.next;
      } else if (item === this._tail) {
        if (!item.previous) {
          throw new Error("Invalid list");
        }
        item.previous.next = void 0;
        this._tail = item.previous;
      } else {
        const next = item.next;
        const previous = item.previous;
        if (!next || !previous) {
          throw new Error("Invalid list");
        }
        next.previous = previous;
        previous.next = next;
      }
      item.next = void 0;
      item.previous = void 0;
      this._state++;
    }
    touch(item, touch) {
      if (!this._head || !this._tail) {
        throw new Error("Invalid list");
      }
      if (touch !== Touch.AsOld && touch !== Touch.AsNew) {
        return;
      }
      if (touch === Touch.AsOld) {
        if (item === this._head) {
          return;
        }
        const next = item.next;
        const previous = item.previous;
        if (item === this._tail) {
          previous.next = void 0;
          this._tail = previous;
        } else {
          next.previous = previous;
          previous.next = next;
        }
        item.previous = void 0;
        item.next = this._head;
        this._head.previous = item;
        this._head = item;
        this._state++;
      } else if (touch === Touch.AsNew) {
        if (item === this._tail) {
          return;
        }
        const next = item.next;
        const previous = item.previous;
        if (item === this._head) {
          next.previous = void 0;
          this._head = next;
        } else {
          next.previous = previous;
          previous.next = next;
        }
        item.next = void 0;
        item.previous = this._tail;
        this._tail.next = item;
        this._tail = item;
        this._state++;
      }
    }
    toJSON() {
      const data = [];
      this.forEach((value, key) => {
        data.push([key, value]);
      });
      return data;
    }
    fromJSON(data) {
      this.clear();
      for (const [key, value] of data) {
        this.set(key, value);
      }
    }
  };
  var SetMap = class {
    constructor() {
      this.map = /* @__PURE__ */ new Map();
    }
    add(key, value) {
      let values = this.map.get(key);
      if (!values) {
        values = /* @__PURE__ */ new Set();
        this.map.set(key, values);
      }
      values.add(value);
    }
    delete(key, value) {
      const values = this.map.get(key);
      if (!values) {
        return;
      }
      values.delete(value);
      if (values.size === 0) {
        this.map.delete(key);
      }
    }
    forEach(key, fn) {
      const values = this.map.get(key);
      if (!values) {
        return;
      }
      values.forEach(fn);
    }
    get(key) {
      const values = this.map.get(key);
      if (!values) {
        return /* @__PURE__ */ new Set();
      }
      return values;
    }
  };

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/assert.js
  function assertFn(condition) {
    if (!condition()) {
      debugger;
      condition();
      onUnexpectedError(new BugIndicatingError("Assertion Failed"));
    }
  }

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/types.js
  function isString(str) {
    return typeof str === "string";
  }
  function isIterable(obj) {
    return !!obj && typeof obj[Symbol.iterator] === "function";
  }
  function isUndefined(obj) {
    return typeof obj === "undefined";
  }
  function isDefined(arg) {
    return !isUndefinedOrNull(arg);
  }
  function isUndefinedOrNull(obj) {
    return isUndefined(obj) || obj === null;
  }

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/iterator.js
  var Iterable;
  (function(Iterable2) {
    function is(thing) {
      return !!thing && typeof thing === "object" && typeof thing[Symbol.iterator] === "function";
    }
    Iterable2.is = is;
    const _empty2 = Object.freeze([]);
    function empty() {
      return _empty2;
    }
    Iterable2.empty = empty;
    function* single(element) {
      yield element;
    }
    Iterable2.single = single;
    function wrap(iterableOrElement) {
      if (is(iterableOrElement)) {
        return iterableOrElement;
      } else {
        return single(iterableOrElement);
      }
    }
    Iterable2.wrap = wrap;
    function from(iterable) {
      return iterable ?? _empty2;
    }
    Iterable2.from = from;
    function* reverse(array) {
      for (let i = array.length - 1; i >= 0; i--) {
        yield array[i];
      }
    }
    Iterable2.reverse = reverse;
    function isEmpty(iterable) {
      return !iterable || iterable[Symbol.iterator]().next().done === true;
    }
    Iterable2.isEmpty = isEmpty;
    function first(iterable) {
      return iterable[Symbol.iterator]().next().value;
    }
    Iterable2.first = first;
    function some(iterable, predicate) {
      let i = 0;
      for (const element of iterable) {
        if (predicate(element, i++)) {
          return true;
        }
      }
      return false;
    }
    Iterable2.some = some;
    function every(iterable, predicate) {
      let i = 0;
      for (const element of iterable) {
        if (!predicate(element, i++)) {
          return false;
        }
      }
      return true;
    }
    Iterable2.every = every;
    function find(iterable, predicate) {
      for (const element of iterable) {
        if (predicate(element)) {
          return element;
        }
      }
      return void 0;
    }
    Iterable2.find = find;
    function* filter(iterable, predicate) {
      for (const element of iterable) {
        if (predicate(element)) {
          yield element;
        }
      }
    }
    Iterable2.filter = filter;
    function* map(iterable, fn) {
      let index = 0;
      for (const element of iterable) {
        yield fn(element, index++);
      }
    }
    Iterable2.map = map;
    function* flatMap(iterable, fn) {
      let index = 0;
      for (const element of iterable) {
        yield* fn(element, index++);
      }
    }
    Iterable2.flatMap = flatMap;
    function* concat(...iterables) {
      for (const item of iterables) {
        if (isIterable(item)) {
          yield* item;
        } else {
          yield item;
        }
      }
    }
    Iterable2.concat = concat;
    function reduce(iterable, reducer, initialValue) {
      let value = initialValue;
      for (const element of iterable) {
        value = reducer(value, element);
      }
      return value;
    }
    Iterable2.reduce = reduce;
    function length(iterable) {
      let count = 0;
      for (const _ of iterable) {
        count++;
      }
      return count;
    }
    Iterable2.length = length;
    function* slice(arr, from2, to = arr.length) {
      if (from2 < -arr.length) {
        from2 = 0;
      }
      if (from2 < 0) {
        from2 += arr.length;
      }
      if (to < 0) {
        to += arr.length;
      } else if (to > arr.length) {
        to = arr.length;
      }
      for (; from2 < to; from2++) {
        yield arr[from2];
      }
    }
    Iterable2.slice = slice;
    function consume(iterable, atMost = Number.POSITIVE_INFINITY) {
      const consumed = [];
      if (atMost === 0) {
        return [consumed, iterable];
      }
      const iterator = iterable[Symbol.iterator]();
      for (let i = 0; i < atMost; i++) {
        const next = iterator.next();
        if (next.done) {
          return [consumed, Iterable2.empty()];
        }
        consumed.push(next.value);
      }
      return [consumed, {
        [Symbol.iterator]() {
          return iterator;
        }
      }];
    }
    Iterable2.consume = consume;
    async function asyncToArray(iterable) {
      const result = [];
      for await (const item of iterable) {
        result.push(item);
      }
      return result;
    }
    Iterable2.asyncToArray = asyncToArray;
    async function asyncToArrayFlat(iterable) {
      let result = [];
      for await (const item of iterable) {
        result = result.concat(item);
      }
      return result;
    }
    Iterable2.asyncToArrayFlat = asyncToArrayFlat;
  })(Iterable || (Iterable = {}));

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/lifecycle.js
  var disposableTracker = null;
  var DisposableTracker = class _DisposableTracker {
    constructor() {
      this.livingDisposables = /* @__PURE__ */ new Map();
    }
    static {
      this.idx = 0;
    }
    getDisposableData(d) {
      let val = this.livingDisposables.get(d);
      if (!val) {
        val = {
          parent: null,
          source: null,
          isSingleton: false,
          value: d,
          idx: _DisposableTracker.idx++
        };
        this.livingDisposables.set(d, val);
      }
      return val;
    }
    trackDisposable(d) {
      const data = this.getDisposableData(d);
      if (!data.source) {
        data.source = new Error().stack;
      }
    }
    setParent(child, parent) {
      const data = this.getDisposableData(child);
      data.parent = parent;
    }
    markAsDisposed(x) {
      this.livingDisposables.delete(x);
    }
    markAsSingleton(disposable) {
      this.getDisposableData(disposable).isSingleton = true;
    }
    getRootParent(data, cache) {
      const cacheValue = cache.get(data);
      if (cacheValue) {
        return cacheValue;
      }
      const result = data.parent ? this.getRootParent(this.getDisposableData(data.parent), cache) : data;
      cache.set(data, result);
      return result;
    }
    getTrackedDisposables() {
      const rootParentCache = /* @__PURE__ */ new Map();
      const leaking = [...this.livingDisposables.entries()].filter(
        ([, v]) => v.source !== null && !this.getRootParent(v, rootParentCache).isSingleton
      ).flatMap(([k]) => k);
      return leaking;
    }
    computeLeakingDisposables(maxReported = 10, preComputedLeaks) {
      let uncoveredLeakingObjs;
      if (preComputedLeaks) {
        uncoveredLeakingObjs = preComputedLeaks;
      } else {
        const rootParentCache = /* @__PURE__ */ new Map();
        const leakingObjects = [...this.livingDisposables.values()].filter(
          (info) => info.source !== null && !this.getRootParent(info, rootParentCache).isSingleton
        );
        if (leakingObjects.length === 0) {
          return;
        }
        const leakingObjsSet = new Set(leakingObjects.map((o) => o.value));
        uncoveredLeakingObjs = leakingObjects.filter((l) => {
          return !(l.parent && leakingObjsSet.has(l.parent));
        });
        if (uncoveredLeakingObjs.length === 0) {
          throw new Error("There are cyclic diposable chains!");
        }
      }
      if (!uncoveredLeakingObjs) {
        return void 0;
      }
      function getStackTracePath(leaking) {
        function removePrefix(array, linesToRemove) {
          while (array.length > 0 && linesToRemove.some(
            (regexp) => typeof regexp === "string" ? regexp === array[0] : array[0].match(regexp)
          )) {
            array.shift();
          }
        }
        const lines = leaking.source.split("\n").map((p) => p.trim().replace("at ", "")).filter((l) => l !== "");
        removePrefix(lines, [
          "Error",
          /^trackDisposable \(.*\)$/,
          /^DisposableTracker.trackDisposable \(.*\)$/
        ]);
        return lines.reverse();
      }
      const stackTraceStarts = new SetMap();
      for (const leaking of uncoveredLeakingObjs) {
        const stackTracePath = getStackTracePath(leaking);
        for (let i2 = 0; i2 <= stackTracePath.length; i2++) {
          stackTraceStarts.add(stackTracePath.slice(0, i2).join("\n"), leaking);
        }
      }
      uncoveredLeakingObjs.sort(compareBy((l) => l.idx, numberComparator));
      let message = "";
      let i = 0;
      for (const leaking of uncoveredLeakingObjs.slice(0, maxReported)) {
        i++;
        const stackTracePath = getStackTracePath(leaking);
        const stackTraceFormattedLines = [];
        for (let i2 = 0; i2 < stackTracePath.length; i2++) {
          let line = stackTracePath[i2];
          const starts = stackTraceStarts.get(stackTracePath.slice(0, i2 + 1).join("\n"));
          line = `(shared with ${starts.size}/${uncoveredLeakingObjs.length} leaks) at ${line}`;
          const prevStarts = stackTraceStarts.get(stackTracePath.slice(0, i2).join("\n"));
          const continuations = groupBy([...prevStarts].map((d) => getStackTracePath(d)[i2]), (v) => v);
          delete continuations[stackTracePath[i2]];
          for (const [cont, set] of Object.entries(continuations)) {
            if (set) {
              stackTraceFormattedLines.unshift(`    - stacktraces of ${set.length} other leaks continue with ${cont}`);
            }
          }
          stackTraceFormattedLines.unshift(line);
        }
        message += `


==================== Leaking disposable ${i}/${uncoveredLeakingObjs.length}: ${leaking.value.constructor.name} ====================
${stackTraceFormattedLines.join("\n")}
============================================================

`;
      }
      if (uncoveredLeakingObjs.length > maxReported) {
        message += `


... and ${uncoveredLeakingObjs.length - maxReported} more leaking disposables

`;
      }
      return {
        leaks: uncoveredLeakingObjs,
        details: message
      };
    }
  };
  function trackDisposable(x) {
    disposableTracker?.trackDisposable(x);
    return x;
  }
  function markAsDisposed(disposable) {
    disposableTracker?.markAsDisposed(disposable);
  }
  function setParentOfDisposable(child, parent) {
    disposableTracker?.setParent(child, parent);
  }
  function setParentOfDisposables(children, parent) {
    if (!disposableTracker) {
      return;
    }
    for (const child of children) {
      disposableTracker.setParent(child, parent);
    }
  }
  function dispose(arg) {
    if (Iterable.is(arg)) {
      const errors = [];
      for (const d of arg) {
        if (d) {
          try {
            d.dispose();
          } catch (e) {
            errors.push(e);
          }
        }
      }
      if (errors.length === 1) {
        throw errors[0];
      } else if (errors.length > 1) {
        throw new AggregateError(errors, "Encountered errors while disposing of store");
      }
      return Array.isArray(arg) ? [] : arg;
    } else if (arg) {
      arg.dispose();
      return arg;
    }
  }
  function combinedDisposable(...disposables) {
    const parent = toDisposable(() => dispose(disposables));
    setParentOfDisposables(disposables, parent);
    return parent;
  }
  var FunctionDisposable = class {
    constructor(fn) {
      this._isDisposed = false;
      this._fn = fn;
      trackDisposable(this);
    }
    dispose() {
      if (this._isDisposed) {
        return;
      }
      if (!this._fn) {
        throw new Error(
          `Unbound disposable context: Need to use an arrow function to preserve the value of this`
        );
      }
      this._isDisposed = true;
      markAsDisposed(this);
      this._fn();
    }
  };
  function toDisposable(fn) {
    return new FunctionDisposable(fn);
  }
  var DisposableStore = class _DisposableStore {
    static {
      this.DISABLE_DISPOSED_WARNING = false;
    }
    constructor() {
      this._toDispose = /* @__PURE__ */ new Set();
      this._isDisposed = false;
      trackDisposable(this);
    }
    dispose() {
      if (this._isDisposed) {
        return;
      }
      markAsDisposed(this);
      this._isDisposed = true;
      this.clear();
    }
    get isDisposed() {
      return this._isDisposed;
    }
    clear() {
      if (this._toDispose.size === 0) {
        return;
      }
      try {
        dispose(this._toDispose);
      } finally {
        this._toDispose.clear();
      }
    }
    add(o) {
      if (!o || o === Disposable.None) {
        return o;
      }
      if (o === this) {
        throw new Error("Cannot register a disposable on itself!");
      }
      setParentOfDisposable(o, this);
      if (this._isDisposed) {
        if (!_DisposableStore.DISABLE_DISPOSED_WARNING) {
          console.warn(new Error(
            "Trying to add a disposable to a DisposableStore that has already been disposed of. The added object will be leaked!"
          ).stack);
        }
      } else {
        this._toDispose.add(o);
      }
      return o;
    }
    delete(o) {
      if (!o) {
        return;
      }
      if (o === this) {
        throw new Error("Cannot dispose a disposable on itself!");
      }
      this._toDispose.delete(o);
      o.dispose();
    }
    deleteAndLeak(o) {
      if (!o) {
        return;
      }
      if (this._toDispose.delete(o)) {
        setParentOfDisposable(o, null);
      }
    }
    assertNotDisposed() {
      if (this._isDisposed) {
        onUnexpectedError(new BugIndicatingError("Object disposed"));
      }
    }
  };
  var Disposable = class {
    static {
      this.None = Object.freeze({
        dispose() {
        }
      });
    }
    constructor() {
      this._store = new DisposableStore();
      trackDisposable(this);
      setParentOfDisposable(this._store, this);
    }
    dispose() {
      markAsDisposed(this);
      this._store.dispose();
    }
    _register(o) {
      if (o === this) {
        throw new Error("Cannot register a disposable on itself!");
      }
      return this._store.add(o);
    }
  };

  // node_modules/@codingame/monaco-vscode-textmate-service-override/vscode/src/vs/workbench/services/textMate/common/TMScopeRegistry.js
  var TMScopeRegistry = class {
    constructor() {
      this._scopeNameToLanguageRegistration = /* @__PURE__ */ Object.create(null);
    }
    reset() {
      this._scopeNameToLanguageRegistration = /* @__PURE__ */ Object.create(null);
    }
    register(def) {
      this._scopeNameToLanguageRegistration[def.scopeName] = def;
    }
    getGrammarDefinition(scopeName) {
      return this._scopeNameToLanguageRegistration[scopeName] || null;
    }
  };

  // node_modules/@codingame/monaco-vscode-textmate-service-override/vscode/src/vs/workbench/services/textMate/common/TMGrammarFactory.js
  var missingTMGrammarErrorMessage = "No TM Grammar registered for this language.";
  var TMGrammarFactory = class extends Disposable {
    constructor(host, grammarDefinitions, vscodeTextmate, onigLib) {
      super();
      this._host = host;
      this._initialState = vscodeTextmate.INITIAL;
      this._scopeRegistry = new TMScopeRegistry();
      this._injections = {};
      this._injectedEmbeddedLanguages = {};
      this._languageToScope = /* @__PURE__ */ new Map();
      this._grammarRegistry = this._register(new vscodeTextmate.Registry({
        onigLib,
        loadGrammar: async (scopeName) => {
          const grammarDefinition = this._scopeRegistry.getGrammarDefinition(scopeName);
          if (!grammarDefinition) {
            this._host.logTrace(`No grammar found for scope ${scopeName}`);
            return null;
          }
          const location = grammarDefinition.location;
          try {
            const content = await this._host.readFile(location);
            return vscodeTextmate.parseRawGrammar(content, location.path);
          } catch (e) {
            this._host.logError(
              `Unable to load and parse grammar for scope ${scopeName} from ${location}`,
              e
            );
            return null;
          }
        },
        getInjections: (scopeName) => {
          const scopeParts = scopeName.split(".");
          let injections = [];
          for (let i = 1; i <= scopeParts.length; i++) {
            const subScopeName = scopeParts.slice(0, i).join(".");
            injections = [...injections, ...this._injections[subScopeName] || []];
          }
          return injections;
        }
      }));
      for (const validGrammar of grammarDefinitions) {
        this._scopeRegistry.register(validGrammar);
        if (validGrammar.injectTo) {
          for (const injectScope of validGrammar.injectTo) {
            let injections = this._injections[injectScope];
            if (!injections) {
              this._injections[injectScope] = injections = [];
            }
            injections.push(validGrammar.scopeName);
          }
          if (validGrammar.embeddedLanguages) {
            for (const injectScope of validGrammar.injectTo) {
              let injectedEmbeddedLanguages = this._injectedEmbeddedLanguages[injectScope];
              if (!injectedEmbeddedLanguages) {
                this._injectedEmbeddedLanguages[injectScope] = injectedEmbeddedLanguages = [];
              }
              injectedEmbeddedLanguages.push(validGrammar.embeddedLanguages);
            }
          }
        }
        if (validGrammar.language) {
          this._languageToScope.set(validGrammar.language, validGrammar.scopeName);
        }
      }
    }
    has(languageId) {
      return this._languageToScope.has(languageId);
    }
    setTheme(theme, colorMap) {
      this._grammarRegistry.setTheme(theme, colorMap);
    }
    getColorMap() {
      return this._grammarRegistry.getColorMap();
    }
    async createGrammar(languageId, encodedLanguageId) {
      const scopeName = this._languageToScope.get(languageId);
      if (typeof scopeName !== "string") {
        throw new Error(missingTMGrammarErrorMessage);
      }
      const grammarDefinition = this._scopeRegistry.getGrammarDefinition(scopeName);
      if (!grammarDefinition) {
        throw new Error(missingTMGrammarErrorMessage);
      }
      const embeddedLanguages = grammarDefinition.embeddedLanguages;
      if (this._injectedEmbeddedLanguages[scopeName]) {
        const injectedEmbeddedLanguages = this._injectedEmbeddedLanguages[scopeName];
        for (const injected of injectedEmbeddedLanguages) {
          for (const scope of Object.keys(injected)) {
            embeddedLanguages[scope] = injected[scope];
          }
        }
      }
      const containsEmbeddedLanguages = Object.keys(embeddedLanguages).length > 0;
      let grammar;
      try {
        grammar = await this._grammarRegistry.loadGrammarWithConfiguration(scopeName, encodedLanguageId, {
          embeddedLanguages,
          tokenTypes: grammarDefinition.tokenTypes,
          balancedBracketSelectors: grammarDefinition.balancedBracketSelectors,
          unbalancedBracketSelectors: grammarDefinition.unbalancedBracketSelectors
        });
      } catch (err) {
        if (err.message && err.message.startsWith("No grammar provided for")) {
          throw new Error(missingTMGrammarErrorMessage);
        }
        throw err;
      }
      return {
        languageId,
        grammar,
        initialState: this._initialState,
        containsEmbeddedLanguages,
        sourceExtensionId: grammarDefinition.sourceExtensionId
      };
    }
  };

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/linkedList.js
  var Node = class _Node {
    static {
      this.Undefined = new _Node(void 0);
    }
    constructor(element) {
      this.element = element;
      this.next = _Node.Undefined;
      this.prev = _Node.Undefined;
    }
  };

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/stopwatch.js
  var performanceNow = globalThis.performance.now.bind(globalThis.performance);
  var StopWatch = class _StopWatch {
    static create(highResolution) {
      return new _StopWatch(highResolution);
    }
    constructor(highResolution) {
      this._now = highResolution === false ? Date.now : performanceNow;
      this._startTime = this._now();
      this._stopTime = -1;
    }
    stop() {
      this._stopTime = this._now();
    }
    reset() {
      this._startTime = this._now();
      this._stopTime = -1;
    }
    elapsed() {
      if (this._stopTime !== -1) {
        return this._stopTime - this._startTime;
      }
      return this._now() - this._startTime;
    }
  };

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/event.js
  var _bufferLeakWarnCountThreshold = 100;
  var _bufferLeakWarnTimeThreshold = 6e4;
  function _isBufferLeakWarningEnabled() {
    return !!env["VSCODE_DEV"];
  }
  var Event;
  (function(Event2) {
    Event2.None = () => Disposable.None;
    function defer(event, flushOnListenerRemove, disposable) {
      return debounce(
        event,
        () => void 0,
        0,
        void 0,
        flushOnListenerRemove ?? true,
        void 0,
        disposable
      );
    }
    Event2.defer = defer;
    function once(event) {
      return (listener, thisArgs = null, disposables) => {
        let didFire = false;
        let result = void 0;
        result = event((e) => {
          if (didFire) {
            return;
          } else if (result) {
            result.dispose();
          } else {
            didFire = true;
          }
          return listener.call(thisArgs, e);
        }, null, disposables);
        if (didFire) {
          result.dispose();
        }
        return result;
      };
    }
    Event2.once = once;
    function onceIf(event, condition) {
      return Event2.once(Event2.filter(event, condition));
    }
    Event2.onceIf = onceIf;
    function map(event, map2, disposable) {
      return snapshot(
        (listener, thisArgs = null, disposables) => event((i) => listener.call(thisArgs, map2(i)), null, disposables),
        disposable
      );
    }
    Event2.map = map;
    function forEach(event, each, disposable) {
      return snapshot((listener, thisArgs = null, disposables) => event((i) => {
        each(i);
        listener.call(thisArgs, i);
      }, null, disposables), disposable);
    }
    Event2.forEach = forEach;
    function filter(event, filter2, disposable) {
      return snapshot(
        (listener, thisArgs = null, disposables) => event((e) => filter2(e) && listener.call(thisArgs, e), null, disposables),
        disposable
      );
    }
    Event2.filter = filter;
    function signal(event) {
      return event;
    }
    Event2.signal = signal;
    function any(...events) {
      return (listener, thisArgs = null, disposables) => {
        const disposable = combinedDisposable(...events.map((event) => event((e) => listener.call(thisArgs, e))));
        return addAndReturnDisposable(disposable, disposables);
      };
    }
    Event2.any = any;
    function reduce(event, merge, initial, disposable) {
      let output = initial;
      return map(event, (e) => {
        output = merge(output, e);
        return output;
      }, disposable);
    }
    Event2.reduce = reduce;
    function snapshot(event, disposable) {
      let listener;
      const options = {
        onWillAddFirstListener() {
          listener = event(emitter.fire, emitter);
        },
        onDidRemoveLastListener() {
          listener?.dispose();
        }
      };
      const emitter = new Emitter(options);
      disposable?.add(emitter);
      return emitter.event;
    }
    function addAndReturnDisposable(d, store) {
      if (store instanceof Array) {
        store.push(d);
      } else if (store) {
        store.add(d);
      }
      return d;
    }
    function debounce(event, merge, delay = 100, leading = false, flushOnListenerRemove = false, leakWarningThreshold, disposable) {
      let subscription;
      let output = void 0;
      let handle = void 0;
      let numDebouncedCalls = 0;
      let doFire;
      const options = {
        leakWarningThreshold,
        onWillAddFirstListener() {
          subscription = event((cur) => {
            numDebouncedCalls++;
            output = merge(output, cur);
            if (leading && !handle) {
              emitter.fire(output);
              output = void 0;
            }
            doFire = () => {
              const _output = output;
              output = void 0;
              handle = void 0;
              if (!leading || numDebouncedCalls > 1) {
                emitter.fire(_output);
              }
              numDebouncedCalls = 0;
            };
            if (typeof delay === "number") {
              if (handle) {
                clearTimeout(handle);
              }
              handle = setTimeout(doFire, delay);
            } else {
              if (handle === void 0) {
                handle = null;
                queueMicrotask(doFire);
              }
            }
          });
        },
        onWillRemoveListener() {
          if (flushOnListenerRemove && numDebouncedCalls > 0) {
            doFire?.();
          }
        },
        onDidRemoveLastListener() {
          doFire = void 0;
          subscription.dispose();
        }
      };
      const emitter = new Emitter(options);
      disposable?.add(emitter);
      return emitter.event;
    }
    Event2.debounce = debounce;
    function accumulate(event, delay = 0, flushOnListenerRemove, disposable) {
      return Event2.debounce(event, (last, e) => {
        if (!last) {
          return [e];
        }
        last.push(e);
        return last;
      }, delay, void 0, flushOnListenerRemove ?? true, void 0, disposable);
    }
    Event2.accumulate = accumulate;
    function throttle(event, merge, delay = 100, leading = true, trailing = true, leakWarningThreshold, disposable) {
      let subscription;
      let output = void 0;
      let handle = void 0;
      let numThrottledCalls = 0;
      const options = {
        leakWarningThreshold,
        onWillAddFirstListener() {
          subscription = event((cur) => {
            numThrottledCalls++;
            output = merge(output, cur);
            if (handle === void 0) {
              if (leading) {
                emitter.fire(output);
                output = void 0;
                numThrottledCalls = 0;
              }
              if (typeof delay === "number") {
                handle = setTimeout(() => {
                  if (trailing && numThrottledCalls > 0) {
                    emitter.fire(output);
                  }
                  output = void 0;
                  handle = void 0;
                  numThrottledCalls = 0;
                }, delay);
              } else {
                handle = 0;
                queueMicrotask(() => {
                  if (trailing && numThrottledCalls > 0) {
                    emitter.fire(output);
                  }
                  output = void 0;
                  handle = void 0;
                  numThrottledCalls = 0;
                });
              }
            }
          });
        },
        onDidRemoveLastListener() {
          subscription.dispose();
        }
      };
      const emitter = new Emitter(options);
      disposable?.add(emitter);
      return emitter.event;
    }
    Event2.throttle = throttle;
    function latch(event, equals3 = (a, b) => a === b, disposable) {
      let firstCall = true;
      let cache;
      return filter(event, (value) => {
        const shouldEmit = firstCall || !equals3(value, cache);
        firstCall = false;
        cache = value;
        return shouldEmit;
      }, disposable);
    }
    Event2.latch = latch;
    function split(event, isT, disposable) {
      return [
        Event2.filter(event, isT, disposable),
        Event2.filter(event, (e) => !isT(e), disposable)
      ];
    }
    Event2.split = split;
    function buffer(event, debugName, flushAfterTimeout = false, _buffer = [], disposable) {
      let buffer2 = _buffer.slice();
      let bufferLeakWarningData;
      if (_isBufferLeakWarningEnabled()) {
        bufferLeakWarningData = {
          stack: Stacktrace.create(),
          timerId: setTimeout(() => {
            if (buffer2 && buffer2.length > 0 && bufferLeakWarningData && !bufferLeakWarningData.warned) {
              bufferLeakWarningData.warned = true;
              console.warn(
                `[Event.buffer][${debugName}] potential LEAK detected: ${buffer2.length} events buffered for ${_bufferLeakWarnTimeThreshold / 1e3}s without being consumed. Buffered here:`
              );
              bufferLeakWarningData.stack.print();
            }
          }, _bufferLeakWarnTimeThreshold),
          warned: false
        };
        if (disposable) {
          disposable.add(toDisposable(() => clearTimeout(bufferLeakWarningData.timerId)));
        }
      }
      const clearLeakWarningTimer = () => {
        if (bufferLeakWarningData) {
          clearTimeout(bufferLeakWarningData.timerId);
        }
      };
      let listener = event((e) => {
        if (buffer2) {
          buffer2.push(e);
          if (_isBufferLeakWarningEnabled() && bufferLeakWarningData && !bufferLeakWarningData.warned && buffer2.length >= _bufferLeakWarnCountThreshold) {
            bufferLeakWarningData.warned = true;
            console.warn(
              `[Event.buffer][${debugName}] potential LEAK detected: ${buffer2.length} events buffered without being consumed. Buffered here:`
            );
            bufferLeakWarningData.stack.print();
          }
        } else {
          emitter.fire(e);
        }
      });
      if (disposable) {
        disposable.add(listener);
      }
      const flush = () => {
        buffer2?.forEach((e) => emitter.fire(e));
        buffer2 = null;
        clearLeakWarningTimer();
      };
      const emitter = new Emitter({
        onWillAddFirstListener() {
          if (!listener) {
            listener = event((e) => emitter.fire(e));
            if (disposable) {
              disposable.add(listener);
            }
          }
        },
        onDidAddFirstListener() {
          if (buffer2) {
            if (flushAfterTimeout) {
              setTimeout(flush);
            } else {
              flush();
            }
          }
        },
        onDidRemoveLastListener() {
          if (listener) {
            listener.dispose();
          }
          listener = null;
          clearLeakWarningTimer();
        }
      });
      if (disposable) {
        disposable.add(emitter);
      }
      return emitter.event;
    }
    Event2.buffer = buffer;
    function chain(event, sythensize) {
      const fn = (listener, thisArgs, disposables) => {
        const cs = sythensize(new ChainableSynthesis());
        return event(function(value) {
          const result = cs.evaluate(value);
          if (result !== HaltChainable) {
            listener.call(thisArgs, result);
          }
        }, void 0, disposables);
      };
      return fn;
    }
    Event2.chain = chain;
    const HaltChainable = Symbol("HaltChainable");
    class ChainableSynthesis {
      constructor() {
        this.steps = [];
      }
      map(fn) {
        this.steps.push(fn);
        return this;
      }
      forEach(fn) {
        this.steps.push((v) => {
          fn(v);
          return v;
        });
        return this;
      }
      filter(fn) {
        this.steps.push((v) => fn(v) ? v : HaltChainable);
        return this;
      }
      reduce(merge, initial) {
        let last = initial;
        this.steps.push((v) => {
          last = merge(last, v);
          return last;
        });
        return this;
      }
      latch(equals3 = (a, b) => a === b) {
        let firstCall = true;
        let cache;
        this.steps.push((value) => {
          const shouldEmit = firstCall || !equals3(value, cache);
          firstCall = false;
          cache = value;
          return shouldEmit ? value : HaltChainable;
        });
        return this;
      }
      evaluate(value) {
        for (const step of this.steps) {
          value = step(value);
          if (value === HaltChainable) {
            break;
          }
        }
        return value;
      }
    }
    function fromNodeEventEmitter(emitter, eventName, map2 = (id2) => id2) {
      const fn = (...args) => result.fire(map2(...args));
      const onFirstListenerAdd = () => emitter.on(eventName, fn);
      const onLastListenerRemove = () => emitter.removeListener(eventName, fn);
      const result = new Emitter({
        onWillAddFirstListener: onFirstListenerAdd,
        onDidRemoveLastListener: onLastListenerRemove
      });
      return result.event;
    }
    Event2.fromNodeEventEmitter = fromNodeEventEmitter;
    function fromDOMEventEmitter(emitter, eventName, map2 = (id2) => id2) {
      const fn = (...args) => result.fire(map2(...args));
      const onFirstListenerAdd = () => emitter.addEventListener(eventName, fn);
      const onLastListenerRemove = () => emitter.removeEventListener(eventName, fn);
      const result = new Emitter({
        onWillAddFirstListener: onFirstListenerAdd,
        onDidRemoveLastListener: onLastListenerRemove
      });
      return result.event;
    }
    Event2.fromDOMEventEmitter = fromDOMEventEmitter;
    function toPromise(event, disposables) {
      let cancelRef;
      let listener;
      const promise = new Promise((resolve2) => {
        listener = once(event)(resolve2);
        addToDisposables(listener, disposables);
        cancelRef = () => {
          disposeAndRemove(listener, disposables);
        };
      });
      promise.cancel = cancelRef;
      if (disposables) {
        promise.finally(() => disposeAndRemove(listener, disposables));
      }
      return promise;
    }
    Event2.toPromise = toPromise;
    function forward(from, to) {
      return from((e) => to.fire(e));
    }
    Event2.forward = forward;
    function runAndSubscribe(event, handler, initial) {
      handler(initial);
      return event((e) => handler(e));
    }
    Event2.runAndSubscribe = runAndSubscribe;
    class EmitterObserver {
      constructor(_observable, store) {
        this._observable = _observable;
        this._counter = 0;
        this._hasChanged = false;
        const options = {
          onWillAddFirstListener: () => {
            _observable.addObserver(this);
            this._observable.reportChanges();
          },
          onDidRemoveLastListener: () => {
            _observable.removeObserver(this);
          }
        };
        this.emitter = new Emitter(options);
        if (store) {
          store.add(this.emitter);
        }
      }
      beginUpdate(_observable) {
        this._counter++;
      }
      handlePossibleChange(_observable) {
      }
      handleChange(_observable, _change) {
        this._hasChanged = true;
      }
      endUpdate(_observable) {
        this._counter--;
        if (this._counter === 0) {
          this._observable.reportChanges();
          if (this._hasChanged) {
            this._hasChanged = false;
            this.emitter.fire(this._observable.get());
          }
        }
      }
    }
    function fromObservable(obs, store) {
      const observer = new EmitterObserver(obs, store);
      return observer.emitter.event;
    }
    Event2.fromObservable = fromObservable;
    function fromObservableLight(observable) {
      return (listener, thisArgs, disposables) => {
        let count = 0;
        let didChange = false;
        const observer = {
          beginUpdate() {
            count++;
          },
          endUpdate() {
            count--;
            if (count === 0) {
              observable.reportChanges();
              if (didChange) {
                didChange = false;
                listener.call(thisArgs);
              }
            }
          },
          handlePossibleChange() {
          },
          handleChange() {
            didChange = true;
          }
        };
        observable.addObserver(observer);
        observable.reportChanges();
        const disposable = {
          dispose() {
            observable.removeObserver(observer);
          }
        };
        addToDisposables(disposable, disposables);
        return disposable;
      };
    }
    Event2.fromObservableLight = fromObservableLight;
  })(Event || (Event = {}));
  var EventProfiling = class _EventProfiling {
    static {
      this.all = /* @__PURE__ */ new Set();
    }
    static {
      this._idPool = 0;
    }
    constructor(name) {
      this.listenerCount = 0;
      this.invocationCount = 0;
      this.elapsedOverall = 0;
      this.durations = [];
      this.name = `${name}_${_EventProfiling._idPool++}`;
      _EventProfiling.all.add(this);
    }
    start(listenerCount) {
      this._stopWatch = new StopWatch();
      this.listenerCount = listenerCount;
    }
    stop() {
      if (this._stopWatch) {
        const elapsed = this._stopWatch.elapsed();
        this.durations.push(elapsed);
        this.elapsedOverall += elapsed;
        this.invocationCount += 1;
        this._stopWatch = void 0;
      }
    }
  };
  var _globalLeakWarningThreshold = -1;
  var LeakageMonitor = class _LeakageMonitor {
    static {
      this._idPool = 1;
    }
    constructor(_errorHandler, threshold, name = (_LeakageMonitor._idPool++).toString(16).padStart(3, "0")) {
      this._errorHandler = _errorHandler;
      this.threshold = threshold;
      this.name = name;
      this._warnCountdown = 0;
    }
    dispose() {
      this._stacks?.clear();
    }
    check(stack, listenerCount) {
      const threshold = this.threshold;
      if (threshold <= 0 || listenerCount < threshold) {
        return void 0;
      }
      if (!this._stacks) {
        this._stacks = /* @__PURE__ */ new Map();
      }
      const count = this._stacks.get(stack.value) || 0;
      this._stacks.set(stack.value, count + 1);
      this._warnCountdown -= 1;
      if (this._warnCountdown <= 0) {
        this._warnCountdown = threshold * 0.5;
        const [topStack, topCount] = this.getMostFrequentStack();
        const emitterName = /^[0-9a-f]+$/i.test(this.name) ? void 0 : this.name;
        const message = `[${this.name}] potential listener LEAK detected, having ${listenerCount} listeners already. MOST frequent listener (${topCount}):`;
        console.warn(message);
        console.warn(topStack);
        const kind = topCount / listenerCount > 0.3 ? "dominated" : "popular";
        const error = new ListenerLeakError(kind, message, topStack, listenerCount, emitterName);
        this._errorHandler(error);
      }
      return () => {
        const count2 = this._stacks.get(stack.value) || 0;
        this._stacks.set(stack.value, count2 - 1);
      };
    }
    getMostFrequentStack() {
      if (!this._stacks) {
        return void 0;
      }
      let topStack;
      let topCount = 0;
      for (const [stack, count] of this._stacks) {
        if (!topStack || topCount < count) {
          topStack = [stack, count];
          topCount = count;
        }
      }
      return topStack;
    }
  };
  var Stacktrace = class _Stacktrace {
    static create() {
      const err = new Error();
      return new _Stacktrace(err.stack ?? "");
    }
    constructor(value) {
      this.value = value;
    }
    print() {
      console.warn(this.value.split("\n").slice(2).join("\n"));
    }
  };
  var ListenerLeakError = class _ListenerLeakError extends Error {
    constructor(kind, details, stack, listenerCount, emitterName) {
      super(
        emitterName ? `[${emitterName}] potential listener LEAK detected, ${kind}` : `potential listener LEAK detected, ${kind}`
      );
      this.name = "ListenerLeakError";
      this.kind = kind;
      this.listenerCount = listenerCount;
      this.details = details;
      this.stack = stack;
    }
    static is(err) {
      return err instanceof _ListenerLeakError || err instanceof Error && typeof err.kind === "string" && typeof err.listenerCount === "number";
    }
  };
  var ListenerRefusalError = class extends ListenerLeakError {
    constructor(kind, details, stack, listenerCount, emitterName) {
      super(kind, details, stack, listenerCount, emitterName);
      this.name = "ListenerRefusalError";
    }
  };
  var id = 0;
  var UniqueContainer = class {
    constructor(value) {
      this.value = value;
      this.id = id++;
    }
  };
  var compactionThreshold = 2;
  var Emitter = class {
    constructor(options) {
      this._size = 0;
      this._options = options;
      this._leakageMon = _globalLeakWarningThreshold > 0 || this._options?.leakWarningThreshold ? new LeakageMonitor(
        options?.onListenerError ?? onUnexpectedError,
        this._options?.leakWarningThreshold ?? _globalLeakWarningThreshold,
        this._options?.leakWarningName
      ) : void 0;
      this._perfMon = this._options?._profName ? new EventProfiling(this._options._profName) : void 0;
      this._deliveryQueue = this._options?.deliveryQueue;
    }
    dispose() {
      if (!this._disposed) {
        this._disposed = true;
        if (this._deliveryQueue?.current === this) {
          this._deliveryQueue.reset();
        }
        if (this._listeners) {
          this._listeners = void 0;
          this._size = 0;
        }
        this._options?.onDidRemoveLastListener?.();
        this._leakageMon?.dispose();
      }
    }
    get event() {
      this._event ??= (callback, thisArgs, disposables) => {
        if (this._leakageMon && this._size > this._leakageMon.threshold ** 2) {
          const message = `[${this._leakageMon.name}] REFUSES to accept new listeners because it exceeded its threshold by far (${this._size} vs ${this._leakageMon.threshold})`;
          console.warn(message);
          const tuple = this._leakageMon.getMostFrequentStack() ?? ["UNKNOWN stack", -1];
          const kind = tuple[1] / this._size > 0.3 ? "dominated" : "popular";
          const error = new ListenerRefusalError(
            kind,
            `${message}. HINT: Stack shows most frequent listener (${tuple[1]}-times)`,
            tuple[0],
            this._size,
            this._options?.leakWarningName
          );
          const errorHandler2 = this._options?.onListenerError || onUnexpectedError;
          errorHandler2(error);
          return Disposable.None;
        }
        if (this._disposed) {
          return Disposable.None;
        }
        if (thisArgs) {
          callback = callback.bind(thisArgs);
        }
        const contained = new UniqueContainer(callback);
        let removeMonitor;
        if (this._leakageMon && this._size >= Math.ceil(this._leakageMon.threshold * 0.2)) {
          contained.stack = Stacktrace.create();
          removeMonitor = this._leakageMon.check(contained.stack, this._size + 1);
        }
        if (!this._listeners) {
          this._options?.onWillAddFirstListener?.(this);
          this._listeners = contained;
          this._options?.onDidAddFirstListener?.(this);
        } else if (this._listeners instanceof UniqueContainer) {
          this._deliveryQueue ??= new EventDeliveryQueuePrivate();
          this._listeners = [this._listeners, contained];
        } else {
          this._listeners.push(contained);
        }
        this._options?.onDidAddListener?.(this);
        this._size++;
        const result = toDisposable(() => {
          removeMonitor?.();
          this._removeListener(contained);
        });
        addToDisposables(result, disposables);
        return result;
      };
      return this._event;
    }
    _removeListener(listener) {
      this._options?.onWillRemoveListener?.(this);
      if (!this._listeners) {
        return;
      }
      if (this._size === 1) {
        this._listeners = void 0;
        this._options?.onDidRemoveLastListener?.(this);
        this._size = 0;
        return;
      }
      const listeners = this._listeners;
      const index = listeners.indexOf(listener);
      if (index === -1) {
        console.log("disposed?", this._disposed);
        console.log("size?", this._size);
        console.log("arr?", JSON.stringify(this._listeners));
        throw new Error("Attempted to dispose unknown listener");
      }
      this._size--;
      listeners[index] = void 0;
      const adjustDeliveryQueue = this._deliveryQueue.current === this;
      if (this._size * compactionThreshold <= listeners.length) {
        let n = 0;
        for (let i = 0; i < listeners.length; i++) {
          if (listeners[i]) {
            listeners[n++] = listeners[i];
          } else if (adjustDeliveryQueue && n < this._deliveryQueue.end) {
            this._deliveryQueue.end--;
            if (n < this._deliveryQueue.i) {
              this._deliveryQueue.i--;
            }
          }
        }
        listeners.length = n;
      }
    }
    _deliver(listener, value) {
      if (!listener) {
        return;
      }
      const errorHandler2 = this._options?.onListenerError || onUnexpectedError;
      if (!errorHandler2) {
        listener.value(value);
        return;
      }
      try {
        listener.value(value);
      } catch (e) {
        errorHandler2(e);
      }
    }
    _deliverQueue(dq) {
      const listeners = dq.current._listeners;
      while (dq.i < dq.end) {
        this._deliver(listeners[dq.i++], dq.value);
      }
      dq.reset();
    }
    fire(event) {
      if (this._deliveryQueue?.current) {
        this._deliverQueue(this._deliveryQueue);
        this._perfMon?.stop();
      }
      this._perfMon?.start(this._size);
      if (!this._listeners)
        ;
      else if (this._listeners instanceof UniqueContainer) {
        this._deliver(this._listeners, event);
      } else {
        const dq = this._deliveryQueue;
        dq.enqueue(this, event, this._listeners.length);
        this._deliverQueue(dq);
      }
      this._perfMon?.stop();
    }
    hasListeners() {
      return this._size > 0;
    }
  };
  var EventDeliveryQueuePrivate = class {
    constructor() {
      this.i = -1;
      this.end = 0;
    }
    enqueue(emitter, value, end) {
      this.i = 0;
      this.end = end;
      this.current = emitter;
      this.value = value;
    }
    reset() {
      this.i = this.end;
      this.current = void 0;
      this.value = void 0;
    }
  };
  function addToDisposables(result, disposables) {
    if (disposables instanceof DisposableStore) {
      disposables.add(result);
    } else if (Array.isArray(disposables)) {
      disposables.push(result);
    }
  }
  function disposeAndRemove(result, disposables) {
    if (disposables instanceof DisposableStore) {
      disposables.delete(result);
    } else if (Array.isArray(disposables)) {
      const index = disposables.indexOf(result);
      if (index !== -1) {
        disposables.splice(index, 1);
      }
    }
    result.dispose();
  }

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/cancellation.js
  var shortcutEvent = Object.freeze(function(callback, context) {
    const handle = setTimeout(callback.bind(context), 0);
    return {
      dispose() {
        clearTimeout(handle);
      }
    };
  });
  var CancellationToken;
  (function(CancellationToken2) {
    function isCancellationToken(thing) {
      if (thing === CancellationToken2.None || thing === CancellationToken2.Cancelled) {
        return true;
      }
      if (thing instanceof MutableToken) {
        return true;
      }
      if (!thing || typeof thing !== "object") {
        return false;
      }
      return typeof thing.isCancellationRequested === "boolean" && typeof thing.onCancellationRequested === "function";
    }
    CancellationToken2.isCancellationToken = isCancellationToken;
    CancellationToken2.None = Object.freeze({
      isCancellationRequested: false,
      onCancellationRequested: Event.None
    });
    CancellationToken2.Cancelled = Object.freeze({
      isCancellationRequested: true,
      onCancellationRequested: shortcutEvent
    });
  })(CancellationToken || (CancellationToken = {}));
  var MutableToken = class {
    constructor() {
      this._isCancelled = false;
      this._emitter = null;
    }
    cancel() {
      if (!this._isCancelled) {
        this._isCancelled = true;
        if (this._emitter) {
          this._emitter.fire(void 0);
          this.dispose();
        }
      }
    }
    get isCancellationRequested() {
      return this._isCancelled;
    }
    get onCancellationRequested() {
      if (this._isCancelled) {
        return shortcutEvent;
      }
      if (!this._emitter) {
        this._emitter = new Emitter();
      }
      return this._emitter.event;
    }
    dispose() {
      if (this._emitter) {
        this._emitter.dispose();
        this._emitter = null;
      }
    }
  };

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/cache.js
  function identity(t) {
    return t;
  }
  var LRUCachedFunction = class {
    constructor(arg1, arg2) {
      this.lastCache = void 0;
      this.lastArgKey = void 0;
      if (typeof arg1 === "function") {
        this._fn = arg1;
        this._computeKey = identity;
      } else {
        this._fn = arg2;
        this._computeKey = arg1.getCacheKey;
      }
    }
    get(arg) {
      const key = this._computeKey(arg);
      if (this.lastArgKey !== key) {
        this.lastArgKey = key;
        this.lastCache = this._fn(arg);
      }
      return this.lastCache;
    }
  };

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/lazy.js
  var LazyValueState;
  (function(LazyValueState2) {
    LazyValueState2[LazyValueState2["Uninitialized"] = 0] = "Uninitialized";
    LazyValueState2[LazyValueState2["Running"] = 1] = "Running";
    LazyValueState2[LazyValueState2["Completed"] = 2] = "Completed";
  })(LazyValueState || (LazyValueState = {}));
  var Lazy = class {
    constructor(executor) {
      this.executor = executor;
      this._state = LazyValueState.Uninitialized;
    }
    get hasValue() {
      return this._state === LazyValueState.Completed;
    }
    get value() {
      if (this._state === LazyValueState.Uninitialized) {
        this._state = LazyValueState.Running;
        try {
          this._value = this.executor();
        } catch (err) {
          this._error = err;
        } finally {
          this._state = LazyValueState.Completed;
        }
      } else if (this._state === LazyValueState.Running) {
        throw new Error("Cannot read the value of a lazy that is being initialized");
      }
      if (this._error) {
        throw this._error;
      }
      return this._value;
    }
    get rawValue() {
      return this._value;
    }
  };

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/uint.js
  var Constants;
  (function(Constants3) {
    Constants3[Constants3["MAX_SAFE_SMALL_INTEGER"] = 1073741824] = "MAX_SAFE_SMALL_INTEGER";
    Constants3[Constants3["MIN_SAFE_SMALL_INTEGER"] = -1073741824] = "MIN_SAFE_SMALL_INTEGER";
    Constants3[Constants3["MAX_UINT_8"] = 255] = "MAX_UINT_8";
    Constants3[Constants3["MAX_UINT_16"] = 65535] = "MAX_UINT_16";
    Constants3[Constants3["MAX_UINT_32"] = 4294967295] = "MAX_UINT_32";
    Constants3[Constants3["UNICODE_SUPPLEMENTARY_PLANE_BEGIN"] = 65536] = "UNICODE_SUPPLEMENTARY_PLANE_BEGIN";
  })(Constants || (Constants = {}));
  function toUint32(v) {
    if (v < 0) {
      return 0;
    }
    if (v > Constants.MAX_UINT_32) {
      return Constants.MAX_UINT_32;
    }
    return v | 0;
  }

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/strings.js
  function splitLines(str) {
    return str.split(/\r\n|\r|\n/);
  }
  function compare(a, b) {
    if (a < b) {
      return -1;
    } else if (a > b) {
      return 1;
    } else {
      return 0;
    }
  }
  function compareSubstring(a, b, aStart = 0, aEnd = a.length, bStart = 0, bEnd = b.length) {
    for (; aStart < aEnd && bStart < bEnd; aStart++, bStart++) {
      const codeA = a.charCodeAt(aStart);
      const codeB = b.charCodeAt(bStart);
      if (codeA < codeB) {
        return -1;
      } else if (codeA > codeB) {
        return 1;
      }
    }
    const aLen = aEnd - aStart;
    const bLen = bEnd - bStart;
    if (aLen < bLen) {
      return -1;
    } else if (aLen > bLen) {
      return 1;
    }
    return 0;
  }
  function compareSubstringIgnoreCase(a, b, aStart = 0, aEnd = a.length, bStart = 0, bEnd = b.length) {
    for (; aStart < aEnd && bStart < bEnd; aStart++, bStart++) {
      let codeA = a.charCodeAt(aStart);
      let codeB = b.charCodeAt(bStart);
      if (codeA === codeB) {
        continue;
      }
      if (codeA >= 128 || codeB >= 128) {
        return compareSubstring(a.toLowerCase(), b.toLowerCase(), aStart, aEnd, bStart, bEnd);
      }
      if (isLowerAsciiLetter(codeA)) {
        codeA -= 32;
      }
      if (isLowerAsciiLetter(codeB)) {
        codeB -= 32;
      }
      const diff = codeA - codeB;
      if (diff === 0) {
        continue;
      }
      return diff;
    }
    const aLen = aEnd - aStart;
    const bLen = bEnd - bStart;
    if (aLen < bLen) {
      return -1;
    } else if (aLen > bLen) {
      return 1;
    }
    return 0;
  }
  function isLowerAsciiLetter(code) {
    return code >= CharCode.a && code <= CharCode.z;
  }
  function isUpperAsciiLetter(code) {
    return code >= CharCode.A && code <= CharCode.Z;
  }
  function equalsIgnoreCase(a, b) {
    return a.length === b.length && compareSubstringIgnoreCase(a, b) === 0;
  }
  function startsWithIgnoreCase(str, candidate) {
    const len = candidate.length;
    return len <= str.length && compareSubstringIgnoreCase(str, candidate, 0, len) === 0;
  }
  var CSI_SEQUENCE = /(?:\x1b\[|\x9b)[=?>!]?[\d;:]*["$#'* ]?[a-zA-Z@^`{}|~]/;
  var OSC_SEQUENCE = /(?:\x1b\]|\x9d).*?(?:\x1b\\|\x07|\x9c)/;
  var ESC_SEQUENCE = /\x1b(?:[ #%\(\)\*\+\-\.\/]?[a-zA-Z0-9\|}~@])/;
  var CONTROL_SEQUENCES = new RegExp(
    "(?:" + [CSI_SEQUENCE.source, OSC_SEQUENCE.source, ESC_SEQUENCE.source].join("|") + ")",
    "g"
  );
  var UTF8_BOM_CHARACTER = String.fromCharCode(CharCode.UTF8_BOM);
  var GraphemeBreakType;
  (function(GraphemeBreakType2) {
    GraphemeBreakType2[GraphemeBreakType2["Other"] = 0] = "Other";
    GraphemeBreakType2[GraphemeBreakType2["Prepend"] = 1] = "Prepend";
    GraphemeBreakType2[GraphemeBreakType2["CR"] = 2] = "CR";
    GraphemeBreakType2[GraphemeBreakType2["LF"] = 3] = "LF";
    GraphemeBreakType2[GraphemeBreakType2["Control"] = 4] = "Control";
    GraphemeBreakType2[GraphemeBreakType2["Extend"] = 5] = "Extend";
    GraphemeBreakType2[GraphemeBreakType2["Regional_Indicator"] = 6] = "Regional_Indicator";
    GraphemeBreakType2[GraphemeBreakType2["SpacingMark"] = 7] = "SpacingMark";
    GraphemeBreakType2[GraphemeBreakType2["L"] = 8] = "L";
    GraphemeBreakType2[GraphemeBreakType2["V"] = 9] = "V";
    GraphemeBreakType2[GraphemeBreakType2["T"] = 10] = "T";
    GraphemeBreakType2[GraphemeBreakType2["LV"] = 11] = "LV";
    GraphemeBreakType2[GraphemeBreakType2["LVT"] = 12] = "LVT";
    GraphemeBreakType2[GraphemeBreakType2["ZWJ"] = 13] = "ZWJ";
    GraphemeBreakType2[GraphemeBreakType2["Extended_Pictographic"] = 14] = "Extended_Pictographic";
  })(GraphemeBreakType || (GraphemeBreakType = {}));
  var GraphemeBreakTree = class _GraphemeBreakTree {
    static {
      this._INSTANCE = null;
    }
    static getInstance() {
      if (!_GraphemeBreakTree._INSTANCE) {
        _GraphemeBreakTree._INSTANCE = new _GraphemeBreakTree();
      }
      return _GraphemeBreakTree._INSTANCE;
    }
    constructor() {
      this._data = getGraphemeBreakRawData();
    }
    getGraphemeBreakType(codePoint) {
      if (codePoint < 32) {
        if (codePoint === CharCode.LineFeed) {
          return GraphemeBreakType.LF;
        }
        if (codePoint === CharCode.CarriageReturn) {
          return GraphemeBreakType.CR;
        }
        return GraphemeBreakType.Control;
      }
      if (codePoint < 127) {
        return GraphemeBreakType.Other;
      }
      const data = this._data;
      const nodeCount = data.length / 3;
      let nodeIndex = 1;
      while (nodeIndex <= nodeCount) {
        if (codePoint < data[3 * nodeIndex]) {
          nodeIndex = 2 * nodeIndex;
        } else if (codePoint > data[3 * nodeIndex + 1]) {
          nodeIndex = 2 * nodeIndex + 1;
        } else {
          return data[3 * nodeIndex + 2];
        }
      }
      return GraphemeBreakType.Other;
    }
  };
  function getGraphemeBreakRawData() {
    return JSON.parse(
      "[0,0,0,51229,51255,12,44061,44087,12,127462,127487,6,7083,7085,5,47645,47671,12,54813,54839,12,128678,128678,14,3270,3270,5,9919,9923,14,45853,45879,12,49437,49463,12,53021,53047,12,71216,71218,7,128398,128399,14,129360,129374,14,2519,2519,5,4448,4519,9,9742,9742,14,12336,12336,14,44957,44983,12,46749,46775,12,48541,48567,12,50333,50359,12,52125,52151,12,53917,53943,12,69888,69890,5,73018,73018,5,127990,127990,14,128558,128559,14,128759,128760,14,129653,129655,14,2027,2035,5,2891,2892,7,3761,3761,5,6683,6683,5,8293,8293,4,9825,9826,14,9999,9999,14,43452,43453,5,44509,44535,12,45405,45431,12,46301,46327,12,47197,47223,12,48093,48119,12,48989,49015,12,49885,49911,12,50781,50807,12,51677,51703,12,52573,52599,12,53469,53495,12,54365,54391,12,65279,65279,4,70471,70472,7,72145,72147,7,119173,119179,5,127799,127818,14,128240,128244,14,128512,128512,14,128652,128652,14,128721,128722,14,129292,129292,14,129445,129450,14,129734,129743,14,1476,1477,5,2366,2368,7,2750,2752,7,3076,3076,5,3415,3415,5,4141,4144,5,6109,6109,5,6964,6964,5,7394,7400,5,9197,9198,14,9770,9770,14,9877,9877,14,9968,9969,14,10084,10084,14,43052,43052,5,43713,43713,5,44285,44311,12,44733,44759,12,45181,45207,12,45629,45655,12,46077,46103,12,46525,46551,12,46973,46999,12,47421,47447,12,47869,47895,12,48317,48343,12,48765,48791,12,49213,49239,12,49661,49687,12,50109,50135,12,50557,50583,12,51005,51031,12,51453,51479,12,51901,51927,12,52349,52375,12,52797,52823,12,53245,53271,12,53693,53719,12,54141,54167,12,54589,54615,12,55037,55063,12,69506,69509,5,70191,70193,5,70841,70841,7,71463,71467,5,72330,72342,5,94031,94031,5,123628,123631,5,127763,127765,14,127941,127941,14,128043,128062,14,128302,128317,14,128465,128467,14,128539,128539,14,128640,128640,14,128662,128662,14,128703,128703,14,128745,128745,14,129004,129007,14,129329,129330,14,129402,129402,14,129483,129483,14,129686,129704,14,130048,131069,14,173,173,4,1757,1757,1,2200,2207,5,2434,2435,7,2631,2632,5,2817,2817,5,3008,3008,5,3201,3201,5,3387,3388,5,3542,3542,5,3902,3903,7,4190,4192,5,6002,6003,5,6439,6440,5,6765,6770,7,7019,7027,5,7154,7155,7,8205,8205,13,8505,8505,14,9654,9654,14,9757,9757,14,9792,9792,14,9852,9853,14,9890,9894,14,9937,9937,14,9981,9981,14,10035,10036,14,11035,11036,14,42654,42655,5,43346,43347,7,43587,43587,5,44006,44007,7,44173,44199,12,44397,44423,12,44621,44647,12,44845,44871,12,45069,45095,12,45293,45319,12,45517,45543,12,45741,45767,12,45965,45991,12,46189,46215,12,46413,46439,12,46637,46663,12,46861,46887,12,47085,47111,12,47309,47335,12,47533,47559,12,47757,47783,12,47981,48007,12,48205,48231,12,48429,48455,12,48653,48679,12,48877,48903,12,49101,49127,12,49325,49351,12,49549,49575,12,49773,49799,12,49997,50023,12,50221,50247,12,50445,50471,12,50669,50695,12,50893,50919,12,51117,51143,12,51341,51367,12,51565,51591,12,51789,51815,12,52013,52039,12,52237,52263,12,52461,52487,12,52685,52711,12,52909,52935,12,53133,53159,12,53357,53383,12,53581,53607,12,53805,53831,12,54029,54055,12,54253,54279,12,54477,54503,12,54701,54727,12,54925,54951,12,55149,55175,12,68101,68102,5,69762,69762,7,70067,70069,7,70371,70378,5,70720,70721,7,71087,71087,5,71341,71341,5,71995,71996,5,72249,72249,7,72850,72871,5,73109,73109,5,118576,118598,5,121505,121519,5,127245,127247,14,127568,127569,14,127777,127777,14,127872,127891,14,127956,127967,14,128015,128016,14,128110,128172,14,128259,128259,14,128367,128368,14,128424,128424,14,128488,128488,14,128530,128532,14,128550,128551,14,128566,128566,14,128647,128647,14,128656,128656,14,128667,128673,14,128691,128693,14,128715,128715,14,128728,128732,14,128752,128752,14,128765,128767,14,129096,129103,14,129311,129311,14,129344,129349,14,129394,129394,14,129413,129425,14,129466,129471,14,129511,129535,14,129664,129666,14,129719,129722,14,129760,129767,14,917536,917631,5,13,13,2,1160,1161,5,1564,1564,4,1807,1807,1,2085,2087,5,2307,2307,7,2382,2383,7,2497,2500,5,2563,2563,7,2677,2677,5,2763,2764,7,2879,2879,5,2914,2915,5,3021,3021,5,3142,3144,5,3263,3263,5,3285,3286,5,3398,3400,7,3530,3530,5,3633,3633,5,3864,3865,5,3974,3975,5,4155,4156,7,4229,4230,5,5909,5909,7,6078,6085,7,6277,6278,5,6451,6456,7,6744,6750,5,6846,6846,5,6972,6972,5,7074,7077,5,7146,7148,7,7222,7223,5,7416,7417,5,8234,8238,4,8417,8417,5,9000,9000,14,9203,9203,14,9730,9731,14,9748,9749,14,9762,9763,14,9776,9783,14,9800,9811,14,9831,9831,14,9872,9873,14,9882,9882,14,9900,9903,14,9929,9933,14,9941,9960,14,9974,9974,14,9989,9989,14,10006,10006,14,10062,10062,14,10160,10160,14,11647,11647,5,12953,12953,14,43019,43019,5,43232,43249,5,43443,43443,5,43567,43568,7,43696,43696,5,43765,43765,7,44013,44013,5,44117,44143,12,44229,44255,12,44341,44367,12,44453,44479,12,44565,44591,12,44677,44703,12,44789,44815,12,44901,44927,12,45013,45039,12,45125,45151,12,45237,45263,12,45349,45375,12,45461,45487,12,45573,45599,12,45685,45711,12,45797,45823,12,45909,45935,12,46021,46047,12,46133,46159,12,46245,46271,12,46357,46383,12,46469,46495,12,46581,46607,12,46693,46719,12,46805,46831,12,46917,46943,12,47029,47055,12,47141,47167,12,47253,47279,12,47365,47391,12,47477,47503,12,47589,47615,12,47701,47727,12,47813,47839,12,47925,47951,12,48037,48063,12,48149,48175,12,48261,48287,12,48373,48399,12,48485,48511,12,48597,48623,12,48709,48735,12,48821,48847,12,48933,48959,12,49045,49071,12,49157,49183,12,49269,49295,12,49381,49407,12,49493,49519,12,49605,49631,12,49717,49743,12,49829,49855,12,49941,49967,12,50053,50079,12,50165,50191,12,50277,50303,12,50389,50415,12,50501,50527,12,50613,50639,12,50725,50751,12,50837,50863,12,50949,50975,12,51061,51087,12,51173,51199,12,51285,51311,12,51397,51423,12,51509,51535,12,51621,51647,12,51733,51759,12,51845,51871,12,51957,51983,12,52069,52095,12,52181,52207,12,52293,52319,12,52405,52431,12,52517,52543,12,52629,52655,12,52741,52767,12,52853,52879,12,52965,52991,12,53077,53103,12,53189,53215,12,53301,53327,12,53413,53439,12,53525,53551,12,53637,53663,12,53749,53775,12,53861,53887,12,53973,53999,12,54085,54111,12,54197,54223,12,54309,54335,12,54421,54447,12,54533,54559,12,54645,54671,12,54757,54783,12,54869,54895,12,54981,55007,12,55093,55119,12,55243,55291,10,66045,66045,5,68325,68326,5,69688,69702,5,69817,69818,5,69957,69958,7,70089,70092,5,70198,70199,5,70462,70462,5,70502,70508,5,70750,70750,5,70846,70846,7,71100,71101,5,71230,71230,7,71351,71351,5,71737,71738,5,72000,72000,7,72160,72160,5,72273,72278,5,72752,72758,5,72882,72883,5,73031,73031,5,73461,73462,7,94192,94193,7,119149,119149,7,121403,121452,5,122915,122916,5,126980,126980,14,127358,127359,14,127535,127535,14,127759,127759,14,127771,127771,14,127792,127793,14,127825,127867,14,127897,127899,14,127945,127945,14,127985,127986,14,128000,128007,14,128021,128021,14,128066,128100,14,128184,128235,14,128249,128252,14,128266,128276,14,128335,128335,14,128379,128390,14,128407,128419,14,128444,128444,14,128481,128481,14,128499,128499,14,128526,128526,14,128536,128536,14,128543,128543,14,128556,128556,14,128564,128564,14,128577,128580,14,128643,128645,14,128649,128649,14,128654,128654,14,128660,128660,14,128664,128664,14,128675,128675,14,128686,128689,14,128695,128696,14,128705,128709,14,128717,128719,14,128725,128725,14,128736,128741,14,128747,128748,14,128755,128755,14,128762,128762,14,128981,128991,14,129009,129023,14,129160,129167,14,129296,129304,14,129320,129327,14,129340,129342,14,129356,129356,14,129388,129392,14,129399,129400,14,129404,129407,14,129432,129442,14,129454,129455,14,129473,129474,14,129485,129487,14,129648,129651,14,129659,129660,14,129671,129679,14,129709,129711,14,129728,129730,14,129751,129753,14,129776,129782,14,917505,917505,4,917760,917999,5,10,10,3,127,159,4,768,879,5,1471,1471,5,1536,1541,1,1648,1648,5,1767,1768,5,1840,1866,5,2070,2073,5,2137,2139,5,2274,2274,1,2363,2363,7,2377,2380,7,2402,2403,5,2494,2494,5,2507,2508,7,2558,2558,5,2622,2624,7,2641,2641,5,2691,2691,7,2759,2760,5,2786,2787,5,2876,2876,5,2881,2884,5,2901,2902,5,3006,3006,5,3014,3016,7,3072,3072,5,3134,3136,5,3157,3158,5,3260,3260,5,3266,3266,5,3274,3275,7,3328,3329,5,3391,3392,7,3405,3405,5,3457,3457,5,3536,3537,7,3551,3551,5,3636,3642,5,3764,3772,5,3895,3895,5,3967,3967,7,3993,4028,5,4146,4151,5,4182,4183,7,4226,4226,5,4253,4253,5,4957,4959,5,5940,5940,7,6070,6070,7,6087,6088,7,6158,6158,4,6432,6434,5,6448,6449,7,6679,6680,5,6742,6742,5,6754,6754,5,6783,6783,5,6912,6915,5,6966,6970,5,6978,6978,5,7042,7042,7,7080,7081,5,7143,7143,7,7150,7150,7,7212,7219,5,7380,7392,5,7412,7412,5,8203,8203,4,8232,8232,4,8265,8265,14,8400,8412,5,8421,8432,5,8617,8618,14,9167,9167,14,9200,9200,14,9410,9410,14,9723,9726,14,9733,9733,14,9745,9745,14,9752,9752,14,9760,9760,14,9766,9766,14,9774,9774,14,9786,9786,14,9794,9794,14,9823,9823,14,9828,9828,14,9833,9850,14,9855,9855,14,9875,9875,14,9880,9880,14,9885,9887,14,9896,9897,14,9906,9916,14,9926,9927,14,9935,9935,14,9939,9939,14,9962,9962,14,9972,9972,14,9978,9978,14,9986,9986,14,9997,9997,14,10002,10002,14,10017,10017,14,10055,10055,14,10071,10071,14,10133,10135,14,10548,10549,14,11093,11093,14,12330,12333,5,12441,12442,5,42608,42610,5,43010,43010,5,43045,43046,5,43188,43203,7,43302,43309,5,43392,43394,5,43446,43449,5,43493,43493,5,43571,43572,7,43597,43597,7,43703,43704,5,43756,43757,5,44003,44004,7,44009,44010,7,44033,44059,12,44089,44115,12,44145,44171,12,44201,44227,12,44257,44283,12,44313,44339,12,44369,44395,12,44425,44451,12,44481,44507,12,44537,44563,12,44593,44619,12,44649,44675,12,44705,44731,12,44761,44787,12,44817,44843,12,44873,44899,12,44929,44955,12,44985,45011,12,45041,45067,12,45097,45123,12,45153,45179,12,45209,45235,12,45265,45291,12,45321,45347,12,45377,45403,12,45433,45459,12,45489,45515,12,45545,45571,12,45601,45627,12,45657,45683,12,45713,45739,12,45769,45795,12,45825,45851,12,45881,45907,12,45937,45963,12,45993,46019,12,46049,46075,12,46105,46131,12,46161,46187,12,46217,46243,12,46273,46299,12,46329,46355,12,46385,46411,12,46441,46467,12,46497,46523,12,46553,46579,12,46609,46635,12,46665,46691,12,46721,46747,12,46777,46803,12,46833,46859,12,46889,46915,12,46945,46971,12,47001,47027,12,47057,47083,12,47113,47139,12,47169,47195,12,47225,47251,12,47281,47307,12,47337,47363,12,47393,47419,12,47449,47475,12,47505,47531,12,47561,47587,12,47617,47643,12,47673,47699,12,47729,47755,12,47785,47811,12,47841,47867,12,47897,47923,12,47953,47979,12,48009,48035,12,48065,48091,12,48121,48147,12,48177,48203,12,48233,48259,12,48289,48315,12,48345,48371,12,48401,48427,12,48457,48483,12,48513,48539,12,48569,48595,12,48625,48651,12,48681,48707,12,48737,48763,12,48793,48819,12,48849,48875,12,48905,48931,12,48961,48987,12,49017,49043,12,49073,49099,12,49129,49155,12,49185,49211,12,49241,49267,12,49297,49323,12,49353,49379,12,49409,49435,12,49465,49491,12,49521,49547,12,49577,49603,12,49633,49659,12,49689,49715,12,49745,49771,12,49801,49827,12,49857,49883,12,49913,49939,12,49969,49995,12,50025,50051,12,50081,50107,12,50137,50163,12,50193,50219,12,50249,50275,12,50305,50331,12,50361,50387,12,50417,50443,12,50473,50499,12,50529,50555,12,50585,50611,12,50641,50667,12,50697,50723,12,50753,50779,12,50809,50835,12,50865,50891,12,50921,50947,12,50977,51003,12,51033,51059,12,51089,51115,12,51145,51171,12,51201,51227,12,51257,51283,12,51313,51339,12,51369,51395,12,51425,51451,12,51481,51507,12,51537,51563,12,51593,51619,12,51649,51675,12,51705,51731,12,51761,51787,12,51817,51843,12,51873,51899,12,51929,51955,12,51985,52011,12,52041,52067,12,52097,52123,12,52153,52179,12,52209,52235,12,52265,52291,12,52321,52347,12,52377,52403,12,52433,52459,12,52489,52515,12,52545,52571,12,52601,52627,12,52657,52683,12,52713,52739,12,52769,52795,12,52825,52851,12,52881,52907,12,52937,52963,12,52993,53019,12,53049,53075,12,53105,53131,12,53161,53187,12,53217,53243,12,53273,53299,12,53329,53355,12,53385,53411,12,53441,53467,12,53497,53523,12,53553,53579,12,53609,53635,12,53665,53691,12,53721,53747,12,53777,53803,12,53833,53859,12,53889,53915,12,53945,53971,12,54001,54027,12,54057,54083,12,54113,54139,12,54169,54195,12,54225,54251,12,54281,54307,12,54337,54363,12,54393,54419,12,54449,54475,12,54505,54531,12,54561,54587,12,54617,54643,12,54673,54699,12,54729,54755,12,54785,54811,12,54841,54867,12,54897,54923,12,54953,54979,12,55009,55035,12,55065,55091,12,55121,55147,12,55177,55203,12,65024,65039,5,65520,65528,4,66422,66426,5,68152,68154,5,69291,69292,5,69633,69633,5,69747,69748,5,69811,69814,5,69826,69826,5,69932,69932,7,70016,70017,5,70079,70080,7,70095,70095,5,70196,70196,5,70367,70367,5,70402,70403,7,70464,70464,5,70487,70487,5,70709,70711,7,70725,70725,7,70833,70834,7,70843,70844,7,70849,70849,7,71090,71093,5,71103,71104,5,71227,71228,7,71339,71339,5,71344,71349,5,71458,71461,5,71727,71735,5,71985,71989,7,71998,71998,5,72002,72002,7,72154,72155,5,72193,72202,5,72251,72254,5,72281,72283,5,72344,72345,5,72766,72766,7,72874,72880,5,72885,72886,5,73023,73029,5,73104,73105,5,73111,73111,5,92912,92916,5,94095,94098,5,113824,113827,4,119142,119142,7,119155,119162,4,119362,119364,5,121476,121476,5,122888,122904,5,123184,123190,5,125252,125258,5,127183,127183,14,127340,127343,14,127377,127386,14,127491,127503,14,127548,127551,14,127744,127756,14,127761,127761,14,127769,127769,14,127773,127774,14,127780,127788,14,127796,127797,14,127820,127823,14,127869,127869,14,127894,127895,14,127902,127903,14,127943,127943,14,127947,127950,14,127972,127972,14,127988,127988,14,127992,127994,14,128009,128011,14,128019,128019,14,128023,128041,14,128064,128064,14,128102,128107,14,128174,128181,14,128238,128238,14,128246,128247,14,128254,128254,14,128264,128264,14,128278,128299,14,128329,128330,14,128348,128359,14,128371,128377,14,128392,128393,14,128401,128404,14,128421,128421,14,128433,128434,14,128450,128452,14,128476,128478,14,128483,128483,14,128495,128495,14,128506,128506,14,128519,128520,14,128528,128528,14,128534,128534,14,128538,128538,14,128540,128542,14,128544,128549,14,128552,128555,14,128557,128557,14,128560,128563,14,128565,128565,14,128567,128576,14,128581,128591,14,128641,128642,14,128646,128646,14,128648,128648,14,128650,128651,14,128653,128653,14,128655,128655,14,128657,128659,14,128661,128661,14,128663,128663,14,128665,128666,14,128674,128674,14,128676,128677,14,128679,128685,14,128690,128690,14,128694,128694,14,128697,128702,14,128704,128704,14,128710,128714,14,128716,128716,14,128720,128720,14,128723,128724,14,128726,128727,14,128733,128735,14,128742,128744,14,128746,128746,14,128749,128751,14,128753,128754,14,128756,128758,14,128761,128761,14,128763,128764,14,128884,128895,14,128992,129003,14,129008,129008,14,129036,129039,14,129114,129119,14,129198,129279,14,129293,129295,14,129305,129310,14,129312,129319,14,129328,129328,14,129331,129338,14,129343,129343,14,129351,129355,14,129357,129359,14,129375,129387,14,129393,129393,14,129395,129398,14,129401,129401,14,129403,129403,14,129408,129412,14,129426,129431,14,129443,129444,14,129451,129453,14,129456,129465,14,129472,129472,14,129475,129482,14,129484,129484,14,129488,129510,14,129536,129647,14,129652,129652,14,129656,129658,14,129661,129663,14,129667,129670,14,129680,129685,14,129705,129708,14,129712,129718,14,129723,129727,14,129731,129733,14,129744,129750,14,129754,129759,14,129768,129775,14,129783,129791,14,917504,917504,4,917506,917535,4,917632,917759,4,918000,921599,4,0,9,4,11,12,4,14,31,4,169,169,14,174,174,14,1155,1159,5,1425,1469,5,1473,1474,5,1479,1479,5,1552,1562,5,1611,1631,5,1750,1756,5,1759,1764,5,1770,1773,5,1809,1809,5,1958,1968,5,2045,2045,5,2075,2083,5,2089,2093,5,2192,2193,1,2250,2273,5,2275,2306,5,2362,2362,5,2364,2364,5,2369,2376,5,2381,2381,5,2385,2391,5,2433,2433,5,2492,2492,5,2495,2496,7,2503,2504,7,2509,2509,5,2530,2531,5,2561,2562,5,2620,2620,5,2625,2626,5,2635,2637,5,2672,2673,5,2689,2690,5,2748,2748,5,2753,2757,5,2761,2761,7,2765,2765,5,2810,2815,5,2818,2819,7,2878,2878,5,2880,2880,7,2887,2888,7,2893,2893,5,2903,2903,5,2946,2946,5,3007,3007,7,3009,3010,7,3018,3020,7,3031,3031,5,3073,3075,7,3132,3132,5,3137,3140,7,3146,3149,5,3170,3171,5,3202,3203,7,3262,3262,7,3264,3265,7,3267,3268,7,3271,3272,7,3276,3277,5,3298,3299,5,3330,3331,7,3390,3390,5,3393,3396,5,3402,3404,7,3406,3406,1,3426,3427,5,3458,3459,7,3535,3535,5,3538,3540,5,3544,3550,7,3570,3571,7,3635,3635,7,3655,3662,5,3763,3763,7,3784,3789,5,3893,3893,5,3897,3897,5,3953,3966,5,3968,3972,5,3981,3991,5,4038,4038,5,4145,4145,7,4153,4154,5,4157,4158,5,4184,4185,5,4209,4212,5,4228,4228,7,4237,4237,5,4352,4447,8,4520,4607,10,5906,5908,5,5938,5939,5,5970,5971,5,6068,6069,5,6071,6077,5,6086,6086,5,6089,6099,5,6155,6157,5,6159,6159,5,6313,6313,5,6435,6438,7,6441,6443,7,6450,6450,5,6457,6459,5,6681,6682,7,6741,6741,7,6743,6743,7,6752,6752,5,6757,6764,5,6771,6780,5,6832,6845,5,6847,6862,5,6916,6916,7,6965,6965,5,6971,6971,7,6973,6977,7,6979,6980,7,7040,7041,5,7073,7073,7,7078,7079,7,7082,7082,7,7142,7142,5,7144,7145,5,7149,7149,5,7151,7153,5,7204,7211,7,7220,7221,7,7376,7378,5,7393,7393,7,7405,7405,5,7415,7415,7,7616,7679,5,8204,8204,5,8206,8207,4,8233,8233,4,8252,8252,14,8288,8292,4,8294,8303,4,8413,8416,5,8418,8420,5,8482,8482,14,8596,8601,14,8986,8987,14,9096,9096,14,9193,9196,14,9199,9199,14,9201,9202,14,9208,9210,14,9642,9643,14,9664,9664,14,9728,9729,14,9732,9732,14,9735,9741,14,9743,9744,14,9746,9746,14,9750,9751,14,9753,9756,14,9758,9759,14,9761,9761,14,9764,9765,14,9767,9769,14,9771,9773,14,9775,9775,14,9784,9785,14,9787,9791,14,9793,9793,14,9795,9799,14,9812,9822,14,9824,9824,14,9827,9827,14,9829,9830,14,9832,9832,14,9851,9851,14,9854,9854,14,9856,9861,14,9874,9874,14,9876,9876,14,9878,9879,14,9881,9881,14,9883,9884,14,9888,9889,14,9895,9895,14,9898,9899,14,9904,9905,14,9917,9918,14,9924,9925,14,9928,9928,14,9934,9934,14,9936,9936,14,9938,9938,14,9940,9940,14,9961,9961,14,9963,9967,14,9970,9971,14,9973,9973,14,9975,9977,14,9979,9980,14,9982,9985,14,9987,9988,14,9992,9996,14,9998,9998,14,10000,10001,14,10004,10004,14,10013,10013,14,10024,10024,14,10052,10052,14,10060,10060,14,10067,10069,14,10083,10083,14,10085,10087,14,10145,10145,14,10175,10175,14,11013,11015,14,11088,11088,14,11503,11505,5,11744,11775,5,12334,12335,5,12349,12349,14,12951,12951,14,42607,42607,5,42612,42621,5,42736,42737,5,43014,43014,5,43043,43044,7,43047,43047,7,43136,43137,7,43204,43205,5,43263,43263,5,43335,43345,5,43360,43388,8,43395,43395,7,43444,43445,7,43450,43451,7,43454,43456,7,43561,43566,5,43569,43570,5,43573,43574,5,43596,43596,5,43644,43644,5,43698,43700,5,43710,43711,5,43755,43755,7,43758,43759,7,43766,43766,5,44005,44005,5,44008,44008,5,44012,44012,7,44032,44032,11,44060,44060,11,44088,44088,11,44116,44116,11,44144,44144,11,44172,44172,11,44200,44200,11,44228,44228,11,44256,44256,11,44284,44284,11,44312,44312,11,44340,44340,11,44368,44368,11,44396,44396,11,44424,44424,11,44452,44452,11,44480,44480,11,44508,44508,11,44536,44536,11,44564,44564,11,44592,44592,11,44620,44620,11,44648,44648,11,44676,44676,11,44704,44704,11,44732,44732,11,44760,44760,11,44788,44788,11,44816,44816,11,44844,44844,11,44872,44872,11,44900,44900,11,44928,44928,11,44956,44956,11,44984,44984,11,45012,45012,11,45040,45040,11,45068,45068,11,45096,45096,11,45124,45124,11,45152,45152,11,45180,45180,11,45208,45208,11,45236,45236,11,45264,45264,11,45292,45292,11,45320,45320,11,45348,45348,11,45376,45376,11,45404,45404,11,45432,45432,11,45460,45460,11,45488,45488,11,45516,45516,11,45544,45544,11,45572,45572,11,45600,45600,11,45628,45628,11,45656,45656,11,45684,45684,11,45712,45712,11,45740,45740,11,45768,45768,11,45796,45796,11,45824,45824,11,45852,45852,11,45880,45880,11,45908,45908,11,45936,45936,11,45964,45964,11,45992,45992,11,46020,46020,11,46048,46048,11,46076,46076,11,46104,46104,11,46132,46132,11,46160,46160,11,46188,46188,11,46216,46216,11,46244,46244,11,46272,46272,11,46300,46300,11,46328,46328,11,46356,46356,11,46384,46384,11,46412,46412,11,46440,46440,11,46468,46468,11,46496,46496,11,46524,46524,11,46552,46552,11,46580,46580,11,46608,46608,11,46636,46636,11,46664,46664,11,46692,46692,11,46720,46720,11,46748,46748,11,46776,46776,11,46804,46804,11,46832,46832,11,46860,46860,11,46888,46888,11,46916,46916,11,46944,46944,11,46972,46972,11,47000,47000,11,47028,47028,11,47056,47056,11,47084,47084,11,47112,47112,11,47140,47140,11,47168,47168,11,47196,47196,11,47224,47224,11,47252,47252,11,47280,47280,11,47308,47308,11,47336,47336,11,47364,47364,11,47392,47392,11,47420,47420,11,47448,47448,11,47476,47476,11,47504,47504,11,47532,47532,11,47560,47560,11,47588,47588,11,47616,47616,11,47644,47644,11,47672,47672,11,47700,47700,11,47728,47728,11,47756,47756,11,47784,47784,11,47812,47812,11,47840,47840,11,47868,47868,11,47896,47896,11,47924,47924,11,47952,47952,11,47980,47980,11,48008,48008,11,48036,48036,11,48064,48064,11,48092,48092,11,48120,48120,11,48148,48148,11,48176,48176,11,48204,48204,11,48232,48232,11,48260,48260,11,48288,48288,11,48316,48316,11,48344,48344,11,48372,48372,11,48400,48400,11,48428,48428,11,48456,48456,11,48484,48484,11,48512,48512,11,48540,48540,11,48568,48568,11,48596,48596,11,48624,48624,11,48652,48652,11,48680,48680,11,48708,48708,11,48736,48736,11,48764,48764,11,48792,48792,11,48820,48820,11,48848,48848,11,48876,48876,11,48904,48904,11,48932,48932,11,48960,48960,11,48988,48988,11,49016,49016,11,49044,49044,11,49072,49072,11,49100,49100,11,49128,49128,11,49156,49156,11,49184,49184,11,49212,49212,11,49240,49240,11,49268,49268,11,49296,49296,11,49324,49324,11,49352,49352,11,49380,49380,11,49408,49408,11,49436,49436,11,49464,49464,11,49492,49492,11,49520,49520,11,49548,49548,11,49576,49576,11,49604,49604,11,49632,49632,11,49660,49660,11,49688,49688,11,49716,49716,11,49744,49744,11,49772,49772,11,49800,49800,11,49828,49828,11,49856,49856,11,49884,49884,11,49912,49912,11,49940,49940,11,49968,49968,11,49996,49996,11,50024,50024,11,50052,50052,11,50080,50080,11,50108,50108,11,50136,50136,11,50164,50164,11,50192,50192,11,50220,50220,11,50248,50248,11,50276,50276,11,50304,50304,11,50332,50332,11,50360,50360,11,50388,50388,11,50416,50416,11,50444,50444,11,50472,50472,11,50500,50500,11,50528,50528,11,50556,50556,11,50584,50584,11,50612,50612,11,50640,50640,11,50668,50668,11,50696,50696,11,50724,50724,11,50752,50752,11,50780,50780,11,50808,50808,11,50836,50836,11,50864,50864,11,50892,50892,11,50920,50920,11,50948,50948,11,50976,50976,11,51004,51004,11,51032,51032,11,51060,51060,11,51088,51088,11,51116,51116,11,51144,51144,11,51172,51172,11,51200,51200,11,51228,51228,11,51256,51256,11,51284,51284,11,51312,51312,11,51340,51340,11,51368,51368,11,51396,51396,11,51424,51424,11,51452,51452,11,51480,51480,11,51508,51508,11,51536,51536,11,51564,51564,11,51592,51592,11,51620,51620,11,51648,51648,11,51676,51676,11,51704,51704,11,51732,51732,11,51760,51760,11,51788,51788,11,51816,51816,11,51844,51844,11,51872,51872,11,51900,51900,11,51928,51928,11,51956,51956,11,51984,51984,11,52012,52012,11,52040,52040,11,52068,52068,11,52096,52096,11,52124,52124,11,52152,52152,11,52180,52180,11,52208,52208,11,52236,52236,11,52264,52264,11,52292,52292,11,52320,52320,11,52348,52348,11,52376,52376,11,52404,52404,11,52432,52432,11,52460,52460,11,52488,52488,11,52516,52516,11,52544,52544,11,52572,52572,11,52600,52600,11,52628,52628,11,52656,52656,11,52684,52684,11,52712,52712,11,52740,52740,11,52768,52768,11,52796,52796,11,52824,52824,11,52852,52852,11,52880,52880,11,52908,52908,11,52936,52936,11,52964,52964,11,52992,52992,11,53020,53020,11,53048,53048,11,53076,53076,11,53104,53104,11,53132,53132,11,53160,53160,11,53188,53188,11,53216,53216,11,53244,53244,11,53272,53272,11,53300,53300,11,53328,53328,11,53356,53356,11,53384,53384,11,53412,53412,11,53440,53440,11,53468,53468,11,53496,53496,11,53524,53524,11,53552,53552,11,53580,53580,11,53608,53608,11,53636,53636,11,53664,53664,11,53692,53692,11,53720,53720,11,53748,53748,11,53776,53776,11,53804,53804,11,53832,53832,11,53860,53860,11,53888,53888,11,53916,53916,11,53944,53944,11,53972,53972,11,54000,54000,11,54028,54028,11,54056,54056,11,54084,54084,11,54112,54112,11,54140,54140,11,54168,54168,11,54196,54196,11,54224,54224,11,54252,54252,11,54280,54280,11,54308,54308,11,54336,54336,11,54364,54364,11,54392,54392,11,54420,54420,11,54448,54448,11,54476,54476,11,54504,54504,11,54532,54532,11,54560,54560,11,54588,54588,11,54616,54616,11,54644,54644,11,54672,54672,11,54700,54700,11,54728,54728,11,54756,54756,11,54784,54784,11,54812,54812,11,54840,54840,11,54868,54868,11,54896,54896,11,54924,54924,11,54952,54952,11,54980,54980,11,55008,55008,11,55036,55036,11,55064,55064,11,55092,55092,11,55120,55120,11,55148,55148,11,55176,55176,11,55216,55238,9,64286,64286,5,65056,65071,5,65438,65439,5,65529,65531,4,66272,66272,5,68097,68099,5,68108,68111,5,68159,68159,5,68900,68903,5,69446,69456,5,69632,69632,7,69634,69634,7,69744,69744,5,69759,69761,5,69808,69810,7,69815,69816,7,69821,69821,1,69837,69837,1,69927,69931,5,69933,69940,5,70003,70003,5,70018,70018,7,70070,70078,5,70082,70083,1,70094,70094,7,70188,70190,7,70194,70195,7,70197,70197,7,70206,70206,5,70368,70370,7,70400,70401,5,70459,70460,5,70463,70463,7,70465,70468,7,70475,70477,7,70498,70499,7,70512,70516,5,70712,70719,5,70722,70724,5,70726,70726,5,70832,70832,5,70835,70840,5,70842,70842,5,70845,70845,5,70847,70848,5,70850,70851,5,71088,71089,7,71096,71099,7,71102,71102,7,71132,71133,5,71219,71226,5,71229,71229,5,71231,71232,5,71340,71340,7,71342,71343,7,71350,71350,7,71453,71455,5,71462,71462,7,71724,71726,7,71736,71736,7,71984,71984,5,71991,71992,7,71997,71997,7,71999,71999,1,72001,72001,1,72003,72003,5,72148,72151,5,72156,72159,7,72164,72164,7,72243,72248,5,72250,72250,1,72263,72263,5,72279,72280,7,72324,72329,1,72343,72343,7,72751,72751,7,72760,72765,5,72767,72767,5,72873,72873,7,72881,72881,7,72884,72884,7,73009,73014,5,73020,73021,5,73030,73030,1,73098,73102,7,73107,73108,7,73110,73110,7,73459,73460,5,78896,78904,4,92976,92982,5,94033,94087,7,94180,94180,5,113821,113822,5,118528,118573,5,119141,119141,5,119143,119145,5,119150,119154,5,119163,119170,5,119210,119213,5,121344,121398,5,121461,121461,5,121499,121503,5,122880,122886,5,122907,122913,5,122918,122922,5,123566,123566,5,125136,125142,5,126976,126979,14,126981,127182,14,127184,127231,14,127279,127279,14,127344,127345,14,127374,127374,14,127405,127461,14,127489,127490,14,127514,127514,14,127538,127546,14,127561,127567,14,127570,127743,14,127757,127758,14,127760,127760,14,127762,127762,14,127766,127768,14,127770,127770,14,127772,127772,14,127775,127776,14,127778,127779,14,127789,127791,14,127794,127795,14,127798,127798,14,127819,127819,14,127824,127824,14,127868,127868,14,127870,127871,14,127892,127893,14,127896,127896,14,127900,127901,14,127904,127940,14,127942,127942,14,127944,127944,14,127946,127946,14,127951,127955,14,127968,127971,14,127973,127984,14,127987,127987,14,127989,127989,14,127991,127991,14,127995,127999,5,128008,128008,14,128012,128014,14,128017,128018,14,128020,128020,14,128022,128022,14,128042,128042,14,128063,128063,14,128065,128065,14,128101,128101,14,128108,128109,14,128173,128173,14,128182,128183,14,128236,128237,14,128239,128239,14,128245,128245,14,128248,128248,14,128253,128253,14,128255,128258,14,128260,128263,14,128265,128265,14,128277,128277,14,128300,128301,14,128326,128328,14,128331,128334,14,128336,128347,14,128360,128366,14,128369,128370,14,128378,128378,14,128391,128391,14,128394,128397,14,128400,128400,14,128405,128406,14,128420,128420,14,128422,128423,14,128425,128432,14,128435,128443,14,128445,128449,14,128453,128464,14,128468,128475,14,128479,128480,14,128482,128482,14,128484,128487,14,128489,128494,14,128496,128498,14,128500,128505,14,128507,128511,14,128513,128518,14,128521,128525,14,128527,128527,14,128529,128529,14,128533,128533,14,128535,128535,14,128537,128537,14]"
    );
  }
  var CodePoint;
  (function(CodePoint2) {
    CodePoint2[CodePoint2["zwj"] = 8205] = "zwj";
    CodePoint2[CodePoint2["emojiVariantSelector"] = 65039] = "emojiVariantSelector";
    CodePoint2[CodePoint2["enclosingKeyCap"] = 8419] = "enclosingKeyCap";
    CodePoint2[CodePoint2["space"] = 32] = "space";
  })(CodePoint || (CodePoint = {}));
  var AmbiguousCharacters = class _AmbiguousCharacters {
    static {
      this.ambiguousCharacterData = new Lazy(() => {
        return JSON.parse(
          '{"_common":[8232,32,8233,32,5760,32,8192,32,8193,32,8194,32,8195,32,8196,32,8197,32,8198,32,8200,32,8201,32,8202,32,8287,32,8199,32,8239,32,2042,95,65101,95,65102,95,65103,95,8208,45,8209,45,8210,45,65112,45,1748,45,8259,45,727,45,8722,45,10134,45,11450,45,1549,44,1643,44,184,44,42233,44,894,59,2307,58,2691,58,1417,58,1795,58,1796,58,5868,58,65072,58,6147,58,6153,58,8282,58,1475,58,760,58,42889,58,8758,58,720,58,42237,58,451,33,11601,33,660,63,577,63,2429,63,5038,63,42731,63,119149,46,8228,46,1793,46,1794,46,42510,46,68176,46,1632,46,1776,46,42232,46,1373,96,65287,96,8219,96,1523,96,8242,96,1370,96,8175,96,65344,96,900,96,8189,96,8125,96,8127,96,8190,96,697,96,884,96,712,96,714,96,715,96,756,96,699,96,701,96,700,96,702,96,42892,96,1497,96,2036,96,2037,96,5194,96,5836,96,94033,96,94034,96,65339,91,10088,40,10098,40,12308,40,64830,40,65341,93,10089,41,10099,41,12309,41,64831,41,10100,123,119060,123,10101,125,65342,94,8270,42,1645,42,8727,42,66335,42,5941,47,8257,47,8725,47,8260,47,9585,47,10187,47,10744,47,119354,47,12755,47,12339,47,11462,47,20031,47,12035,47,65340,92,65128,92,8726,92,10189,92,10741,92,10745,92,119311,92,119355,92,12756,92,20022,92,12034,92,42872,38,708,94,710,94,5869,43,10133,43,66203,43,8249,60,10094,60,706,60,119350,60,5176,60,5810,60,5120,61,11840,61,12448,61,42239,61,8250,62,10095,62,707,62,119351,62,5171,62,94015,62,8275,126,732,126,8128,126,8764,126,65372,124,65293,45,118002,50,120784,50,120794,50,120804,50,120814,50,120824,50,130034,50,42842,50,423,50,1000,50,42564,50,5311,50,42735,50,119302,51,118003,51,120785,51,120795,51,120805,51,120815,51,120825,51,130035,51,42923,51,540,51,439,51,42858,51,11468,51,1248,51,94011,51,71882,51,118004,52,120786,52,120796,52,120806,52,120816,52,120826,52,130036,52,5070,52,71855,52,118005,53,120787,53,120797,53,120807,53,120817,53,120827,53,130037,53,444,53,71867,53,118006,54,120788,54,120798,54,120808,54,120818,54,120828,54,130038,54,11474,54,5102,54,71893,54,119314,55,118007,55,120789,55,120799,55,120809,55,120819,55,120829,55,130039,55,66770,55,71878,55,2819,56,2538,56,2666,56,125131,56,118008,56,120790,56,120800,56,120810,56,120820,56,120830,56,130040,56,547,56,546,56,66330,56,2663,57,2920,57,2541,57,3437,57,118009,57,120791,57,120801,57,120811,57,120821,57,120831,57,130041,57,42862,57,11466,57,71884,57,71852,57,71894,57,9082,97,65345,97,119834,97,119886,97,119938,97,119990,97,120042,97,120094,97,120146,97,120198,97,120250,97,120302,97,120354,97,120406,97,120458,97,593,97,945,97,120514,97,120572,97,120630,97,120688,97,120746,97,65313,65,117974,65,119808,65,119860,65,119912,65,119964,65,120016,65,120068,65,120120,65,120172,65,120224,65,120276,65,120328,65,120380,65,120432,65,913,65,120488,65,120546,65,120604,65,120662,65,120720,65,5034,65,5573,65,42222,65,94016,65,66208,65,119835,98,119887,98,119939,98,119991,98,120043,98,120095,98,120147,98,120199,98,120251,98,120303,98,120355,98,120407,98,120459,98,388,98,5071,98,5234,98,5551,98,65314,66,8492,66,117975,66,119809,66,119861,66,119913,66,120017,66,120069,66,120121,66,120173,66,120225,66,120277,66,120329,66,120381,66,120433,66,42932,66,914,66,120489,66,120547,66,120605,66,120663,66,120721,66,5108,66,5623,66,42192,66,66178,66,66209,66,66305,66,65347,99,8573,99,119836,99,119888,99,119940,99,119992,99,120044,99,120096,99,120148,99,120200,99,120252,99,120304,99,120356,99,120408,99,120460,99,7428,99,1010,99,11429,99,43951,99,66621,99,128844,67,71913,67,71922,67,65315,67,8557,67,8450,67,8493,67,117976,67,119810,67,119862,67,119914,67,119966,67,120018,67,120174,67,120226,67,120278,67,120330,67,120382,67,120434,67,1017,67,11428,67,5087,67,42202,67,66210,67,66306,67,66581,67,66844,67,8574,100,8518,100,119837,100,119889,100,119941,100,119993,100,120045,100,120097,100,120149,100,120201,100,120253,100,120305,100,120357,100,120409,100,120461,100,1281,100,5095,100,5231,100,42194,100,8558,68,8517,68,117977,68,119811,68,119863,68,119915,68,119967,68,120019,68,120071,68,120123,68,120175,68,120227,68,120279,68,120331,68,120383,68,120435,68,5024,68,5598,68,5610,68,42195,68,8494,101,65349,101,8495,101,8519,101,119838,101,119890,101,119942,101,120046,101,120098,101,120150,101,120202,101,120254,101,120306,101,120358,101,120410,101,120462,101,43826,101,1213,101,8959,69,65317,69,8496,69,117978,69,119812,69,119864,69,119916,69,120020,69,120072,69,120124,69,120176,69,120228,69,120280,69,120332,69,120384,69,120436,69,917,69,120492,69,120550,69,120608,69,120666,69,120724,69,11577,69,5036,69,42224,69,71846,69,71854,69,66182,69,119839,102,119891,102,119943,102,119995,102,120047,102,120099,102,120151,102,120203,102,120255,102,120307,102,120359,102,120411,102,120463,102,43829,102,42905,102,383,102,7837,102,1412,102,119315,70,8497,70,117979,70,119813,70,119865,70,119917,70,120021,70,120073,70,120125,70,120177,70,120229,70,120281,70,120333,70,120385,70,120437,70,42904,70,988,70,120778,70,5556,70,42205,70,71874,70,71842,70,66183,70,66213,70,66853,70,65351,103,8458,103,119840,103,119892,103,119944,103,120048,103,120100,103,120152,103,120204,103,120256,103,120308,103,120360,103,120412,103,120464,103,609,103,7555,103,397,103,1409,103,117980,71,119814,71,119866,71,119918,71,119970,71,120022,71,120074,71,120126,71,120178,71,120230,71,120282,71,120334,71,120386,71,120438,71,1292,71,5056,71,5107,71,42198,71,65352,104,8462,104,119841,104,119945,104,119997,104,120049,104,120101,104,120153,104,120205,104,120257,104,120309,104,120361,104,120413,104,120465,104,1211,104,1392,104,5058,104,65320,72,8459,72,8460,72,8461,72,117981,72,119815,72,119867,72,119919,72,120023,72,120179,72,120231,72,120283,72,120335,72,120387,72,120439,72,919,72,120494,72,120552,72,120610,72,120668,72,120726,72,11406,72,5051,72,5500,72,42215,72,66255,72,731,105,9075,105,65353,105,8560,105,8505,105,8520,105,119842,105,119894,105,119946,105,119998,105,120050,105,120102,105,120154,105,120206,105,120258,105,120310,105,120362,105,120414,105,120466,105,120484,105,618,105,617,105,953,105,8126,105,890,105,120522,105,120580,105,120638,105,120696,105,120754,105,1110,105,42567,105,1231,105,43893,105,5029,105,71875,105,65354,106,8521,106,119843,106,119895,106,119947,106,119999,106,120051,106,120103,106,120155,106,120207,106,120259,106,120311,106,120363,106,120415,106,120467,106,1011,106,1112,106,65322,74,117983,74,119817,74,119869,74,119921,74,119973,74,120025,74,120077,74,120129,74,120181,74,120233,74,120285,74,120337,74,120389,74,120441,74,42930,74,895,74,1032,74,5035,74,5261,74,42201,74,119844,107,119896,107,119948,107,120000,107,120052,107,120104,107,120156,107,120208,107,120260,107,120312,107,120364,107,120416,107,120468,107,8490,75,65323,75,117984,75,119818,75,119870,75,119922,75,119974,75,120026,75,120078,75,120130,75,120182,75,120234,75,120286,75,120338,75,120390,75,120442,75,922,75,120497,75,120555,75,120613,75,120671,75,120729,75,11412,75,5094,75,5845,75,42199,75,66840,75,1472,108,8739,73,9213,73,65512,73,1633,108,1777,73,66336,108,125127,108,118001,108,120783,73,120793,73,120803,73,120813,73,120823,73,130033,73,65321,73,8544,73,8464,73,8465,73,117982,108,119816,73,119868,73,119920,73,120024,73,120128,73,120180,73,120232,73,120284,73,120336,73,120388,73,120440,73,65356,108,8572,73,8467,108,119845,108,119897,108,119949,108,120001,108,120053,108,120105,73,120157,73,120209,73,120261,73,120313,73,120365,73,120417,73,120469,73,448,73,120496,73,120554,73,120612,73,120670,73,120728,73,11410,73,1030,73,1216,73,1493,108,1503,108,1575,108,126464,108,126592,108,65166,108,65165,108,1994,108,11599,73,5825,73,42226,73,93992,73,66186,124,66313,124,119338,76,8556,76,8466,76,117985,76,119819,76,119871,76,119923,76,120027,76,120079,76,120131,76,120183,76,120235,76,120287,76,120339,76,120391,76,120443,76,11472,76,5086,76,5290,76,42209,76,93974,76,71843,76,71858,76,66587,76,66854,76,65325,77,8559,77,8499,77,117986,77,119820,77,119872,77,119924,77,120028,77,120080,77,120132,77,120184,77,120236,77,120288,77,120340,77,120392,77,120444,77,924,77,120499,77,120557,77,120615,77,120673,77,120731,77,1018,77,11416,77,5047,77,5616,77,5846,77,42207,77,66224,77,66321,77,119847,110,119899,110,119951,110,120003,110,120055,110,120107,110,120159,110,120211,110,120263,110,120315,110,120367,110,120419,110,120471,110,1400,110,1404,110,65326,78,8469,78,117987,78,119821,78,119873,78,119925,78,119977,78,120029,78,120081,78,120185,78,120237,78,120289,78,120341,78,120393,78,120445,78,925,78,120500,78,120558,78,120616,78,120674,78,120732,78,11418,78,42208,78,66835,78,3074,111,3202,111,3330,111,3458,111,2406,111,2662,111,2790,111,3046,111,3174,111,3302,111,3430,111,3664,111,3792,111,4160,111,1637,111,1781,111,65359,111,8500,111,119848,111,119900,111,119952,111,120056,111,120108,111,120160,111,120212,111,120264,111,120316,111,120368,111,120420,111,120472,111,7439,111,7441,111,43837,111,959,111,120528,111,120586,111,120644,111,120702,111,120760,111,963,111,120532,111,120590,111,120648,111,120706,111,120764,111,11423,111,4351,111,1413,111,1505,111,1607,111,126500,111,126564,111,126596,111,65259,111,65260,111,65258,111,65257,111,1726,111,64428,111,64429,111,64427,111,64426,111,1729,111,64424,111,64425,111,64423,111,64422,111,1749,111,3360,111,4125,111,66794,111,71880,111,71895,111,66604,111,1984,79,2534,79,2918,79,12295,79,70864,79,71904,79,118000,79,120782,79,120792,79,120802,79,120812,79,120822,79,130032,79,65327,79,117988,79,119822,79,119874,79,119926,79,119978,79,120030,79,120082,79,120134,79,120186,79,120238,79,120290,79,120342,79,120394,79,120446,79,927,79,120502,79,120560,79,120618,79,120676,79,120734,79,11422,79,1365,79,11604,79,4816,79,2848,79,66754,79,42227,79,71861,79,66194,79,66219,79,66564,79,66838,79,9076,112,65360,112,119849,112,119901,112,119953,112,120005,112,120057,112,120109,112,120161,112,120213,112,120265,112,120317,112,120369,112,120421,112,120473,112,961,112,120530,112,120544,112,120588,112,120602,112,120646,112,120660,112,120704,112,120718,112,120762,112,120776,112,11427,112,65328,80,8473,80,117989,80,119823,80,119875,80,119927,80,119979,80,120031,80,120083,80,120187,80,120239,80,120291,80,120343,80,120395,80,120447,80,929,80,120504,80,120562,80,120620,80,120678,80,120736,80,11426,80,5090,80,5229,80,42193,80,66197,80,119850,113,119902,113,119954,113,120006,113,120058,113,120110,113,120162,113,120214,113,120266,113,120318,113,120370,113,120422,113,120474,113,1307,113,1379,113,1382,113,8474,81,117990,81,119824,81,119876,81,119928,81,119980,81,120032,81,120084,81,120188,81,120240,81,120292,81,120344,81,120396,81,120448,81,11605,81,119851,114,119903,114,119955,114,120007,114,120059,114,120111,114,120163,114,120215,114,120267,114,120319,114,120371,114,120423,114,120475,114,43847,114,43848,114,7462,114,11397,114,43905,114,119318,82,8475,82,8476,82,8477,82,117991,82,119825,82,119877,82,119929,82,120033,82,120189,82,120241,82,120293,82,120345,82,120397,82,120449,82,422,82,5025,82,5074,82,66740,82,5511,82,42211,82,94005,82,65363,115,119852,115,119904,115,119956,115,120008,115,120060,115,120112,115,120164,115,120216,115,120268,115,120320,115,120372,115,120424,115,120476,115,42801,115,445,115,1109,115,43946,115,71873,115,66632,115,65331,83,117992,83,119826,83,119878,83,119930,83,119982,83,120034,83,120086,83,120138,83,120190,83,120242,83,120294,83,120346,83,120398,83,120450,83,1029,83,1359,83,5077,83,5082,83,42210,83,94010,83,66198,83,66592,83,119853,116,119905,116,119957,116,120009,116,120061,116,120113,116,120165,116,120217,116,120269,116,120321,116,120373,116,120425,116,120477,116,8868,84,10201,84,128872,84,65332,84,117993,84,119827,84,119879,84,119931,84,119983,84,120035,84,120087,84,120139,84,120191,84,120243,84,120295,84,120347,84,120399,84,120451,84,932,84,120507,84,120565,84,120623,84,120681,84,120739,84,11430,84,5026,84,42196,84,93962,84,71868,84,66199,84,66225,84,66325,84,119854,117,119906,117,119958,117,120010,117,120062,117,120114,117,120166,117,120218,117,120270,117,120322,117,120374,117,120426,117,120478,117,42911,117,7452,117,43854,117,43858,117,651,117,965,117,120534,117,120592,117,120650,117,120708,117,120766,117,1405,117,66806,117,71896,117,8746,85,8899,85,117994,85,119828,85,119880,85,119932,85,119984,85,120036,85,120088,85,120140,85,120192,85,120244,85,120296,85,120348,85,120400,85,120452,85,1357,85,4608,85,66766,85,5196,85,42228,85,94018,85,71864,85,8744,118,8897,118,65366,118,8564,118,119855,118,119907,118,119959,118,120011,118,120063,118,120115,118,120167,118,120219,118,120271,118,120323,118,120375,118,120427,118,120479,118,7456,118,957,118,120526,118,120584,118,120642,118,120700,118,120758,118,1141,118,1496,118,71430,118,43945,118,71872,118,119309,86,1639,86,1783,86,8548,86,117995,86,119829,86,119881,86,119933,86,119985,86,120037,86,120089,86,120141,86,120193,86,120245,86,120297,86,120349,86,120401,86,120453,86,1140,86,11576,86,5081,86,5167,86,42719,86,42214,86,93960,86,71840,86,66845,86,623,119,119856,119,119908,119,119960,119,120012,119,120064,119,120116,119,120168,119,120220,119,120272,119,120324,119,120376,119,120428,119,120480,119,7457,119,1121,119,1309,119,1377,119,71434,119,71438,119,71439,119,43907,119,71910,87,71919,87,117996,87,119830,87,119882,87,119934,87,119986,87,120038,87,120090,87,120142,87,120194,87,120246,87,120298,87,120350,87,120402,87,120454,87,1308,87,5043,87,5076,87,42218,87,5742,120,10539,120,10540,120,10799,120,65368,120,8569,120,119857,120,119909,120,119961,120,120013,120,120065,120,120117,120,120169,120,120221,120,120273,120,120325,120,120377,120,120429,120,120481,120,5441,120,5501,120,5741,88,9587,88,66338,88,71916,88,65336,88,8553,88,117997,88,119831,88,119883,88,119935,88,119987,88,120039,88,120091,88,120143,88,120195,88,120247,88,120299,88,120351,88,120403,88,120455,88,42931,88,935,88,120510,88,120568,88,120626,88,120684,88,120742,88,11436,88,11613,88,5815,88,42219,88,66192,88,66228,88,66327,88,66855,88,611,121,7564,121,65369,121,119858,121,119910,121,119962,121,120014,121,120066,121,120118,121,120170,121,120222,121,120274,121,120326,121,120378,121,120430,121,120482,121,655,121,7935,121,43866,121,947,121,8509,121,120516,121,120574,121,120632,121,120690,121,120748,121,1199,121,4327,121,71900,121,65337,89,117998,89,119832,89,119884,89,119936,89,119988,89,120040,89,120092,89,120144,89,120196,89,120248,89,120300,89,120352,89,120404,89,120456,89,933,89,978,89,120508,89,120566,89,120624,89,120682,89,120740,89,11432,89,1198,89,5033,89,5053,89,42220,89,94019,89,71844,89,66226,89,119859,122,119911,122,119963,122,120015,122,120067,122,120119,122,120171,122,120223,122,120275,122,120327,122,120379,122,120431,122,120483,122,7458,122,43923,122,71876,122,71909,90,66293,90,65338,90,8484,90,8488,90,117999,90,119833,90,119885,90,119937,90,119989,90,120041,90,120197,90,120249,90,120301,90,120353,90,120405,90,120457,90,918,90,120493,90,120551,90,120609,90,120667,90,120725,90,5059,90,42204,90,71849,90,65282,34,65283,35,65284,36,65285,37,65286,38,65290,42,65291,43,65294,46,65295,47,65296,48,65298,50,65299,51,65300,52,65301,53,65302,54,65303,55,65304,56,65305,57,65308,60,65309,61,65310,62,65312,64,65316,68,65318,70,65319,71,65324,76,65329,81,65330,82,65333,85,65334,86,65335,87,65343,95,65346,98,65348,100,65350,102,65355,107,65357,109,65358,110,65361,113,65362,114,65364,116,65365,117,65367,119,65370,122,65371,123,65373,125,119846,109],"_default":[160,32,8211,45,65374,126,8218,44,65306,58,65281,33,8216,96,8217,96,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65288,40,65289,41,65292,44,65297,49,65307,59,65311,63],"cs":[65374,126,8218,44,65306,58,65281,33,8216,96,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,1093,120,1061,88,1091,121,1059,89,65288,40,65289,41,65292,44,65297,49,65307,59,65311,63],"de":[65374,126,65306,58,65281,33,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,1093,120,1061,88,1091,121,1059,89,65288,40,65289,41,65292,44,65297,49,65307,59,65311,63],"es":[8211,45,65374,126,8218,44,65306,58,65281,33,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65288,40,65289,41,65292,44,65297,49,65307,59,65311,63],"fr":[65374,126,8218,44,65306,58,65281,33,8216,96,8245,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65288,40,65289,41,65292,44,65297,49,65307,59,65311,63],"it":[160,32,8211,45,65374,126,8218,44,65306,58,65281,33,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65288,40,65289,41,65292,44,65297,49,65307,59,65311,63],"ja":[8211,45,8218,44,65281,33,8216,96,8245,96,180,96,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65292,44,65297,49,65307,59],"ko":[8211,45,65374,126,8218,44,65306,58,65281,33,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65288,40,65289,41,65292,44,65297,49,65307,59,65311,63],"pl":[65374,126,65306,58,65281,33,8216,96,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65288,40,65289,41,65292,44,65297,49,65307,59,65311,63],"pt-BR":[65374,126,8218,44,65306,58,65281,33,8216,96,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65288,40,65289,41,65292,44,65297,49,65307,59,65311,63],"qps-ploc":[160,32,8211,45,65374,126,8218,44,65306,58,65281,33,8216,96,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65288,40,65289,41,65292,44,65297,49,65307,59,65311,63],"ru":[65374,126,8218,44,65306,58,65281,33,8216,96,8245,96,180,96,12494,47,305,105,921,73,1009,112,215,120,65288,40,65289,41,65292,44,65297,49,65307,59,65311,63],"tr":[160,32,8211,45,65374,126,8218,44,65306,58,65281,33,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65288,40,65289,41,65292,44,65297,49,65307,59,65311,63],"zh-hans":[160,32,65374,126,8218,44,8245,96,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89,65297,49],"zh-hant":[8211,45,65374,126,8218,44,180,96,12494,47,1047,51,1073,54,1072,97,1040,65,1068,98,1042,66,1089,99,1057,67,1077,101,1045,69,1053,72,305,105,1050,75,921,73,1052,77,1086,111,1054,79,1009,112,1088,112,1056,80,1075,114,1058,84,215,120,1093,120,1061,88,1091,121,1059,89]}'
        );
      });
    }
    static {
      this.cache = new LRUCachedFunction((localesStr) => {
        const locales = localesStr.split(",");
        function arrayToMap(arr) {
          const result = /* @__PURE__ */ new Map();
          for (let i = 0; i < arr.length; i += 2) {
            result.set(arr[i], arr[i + 1]);
          }
          return result;
        }
        function mergeMaps(map1, map2) {
          const result = new Map(map1);
          for (const [key, value] of map2) {
            result.set(key, value);
          }
          return result;
        }
        function intersectMaps(map1, map2) {
          if (!map1) {
            return map2;
          }
          const result = /* @__PURE__ */ new Map();
          for (const [key, value] of map1) {
            if (map2.has(key)) {
              result.set(key, value);
            }
          }
          return result;
        }
        const data = this.ambiguousCharacterData.value;
        let filteredLocales = locales.filter((l) => !l.startsWith("_") && Object.hasOwn(data, l));
        if (filteredLocales.length === 0) {
          filteredLocales = ["_default"];
        }
        let languageSpecificMap = void 0;
        for (const locale of filteredLocales) {
          const map2 = arrayToMap(data[locale]);
          languageSpecificMap = intersectMaps(languageSpecificMap, map2);
        }
        const commonMap = arrayToMap(data["_common"]);
        const map = mergeMaps(commonMap, languageSpecificMap);
        return new _AmbiguousCharacters(map);
      });
    }
    static getInstance(locales) {
      return _AmbiguousCharacters.cache.get(Array.from(locales).join(","));
    }
    static {
      this._locales = new Lazy(() => Object.keys(_AmbiguousCharacters.ambiguousCharacterData.value).filter((k) => !k.startsWith("_")));
    }
    static getLocales() {
      return _AmbiguousCharacters._locales.value;
    }
    constructor(confusableDictionary) {
      this.confusableDictionary = confusableDictionary;
    }
    isAmbiguous(codePoint) {
      return this.confusableDictionary.has(codePoint);
    }
    containsAmbiguousCharacter(str) {
      for (let i = 0; i < str.length; i++) {
        const codePoint = str.codePointAt(i);
        if (typeof codePoint === "number" && this.isAmbiguous(codePoint)) {
          return true;
        }
      }
      return false;
    }
    getPrimaryConfusable(codePoint) {
      return this.confusableDictionary.get(codePoint);
    }
    getConfusableCodePoints() {
      return new Set(this.confusableDictionary.keys());
    }
  };
  var InvisibleCharacters = class _InvisibleCharacters {
    static getRawData() {
      return JSON.parse(
        '{"_common":[11,12,13,127,847,1564,4447,4448,6068,6069,6155,6156,6157,6158,7355,7356,8192,8193,8194,8195,8196,8197,8198,8199,8200,8201,8202,8204,8205,8206,8207,8234,8235,8236,8237,8238,8239,8287,8288,8289,8290,8291,8292,8293,8294,8295,8296,8297,8298,8299,8300,8301,8302,8303,10240,12644,65024,65025,65026,65027,65028,65029,65030,65031,65032,65033,65034,65035,65036,65037,65038,65039,65279,65440,65520,65521,65522,65523,65524,65525,65526,65527,65528,65532,78844,119155,119156,119157,119158,119159,119160,119161,119162,917504,917505,917506,917507,917508,917509,917510,917511,917512,917513,917514,917515,917516,917517,917518,917519,917520,917521,917522,917523,917524,917525,917526,917527,917528,917529,917530,917531,917532,917533,917534,917535,917536,917537,917538,917539,917540,917541,917542,917543,917544,917545,917546,917547,917548,917549,917550,917551,917552,917553,917554,917555,917556,917557,917558,917559,917560,917561,917562,917563,917564,917565,917566,917567,917568,917569,917570,917571,917572,917573,917574,917575,917576,917577,917578,917579,917580,917581,917582,917583,917584,917585,917586,917587,917588,917589,917590,917591,917592,917593,917594,917595,917596,917597,917598,917599,917600,917601,917602,917603,917604,917605,917606,917607,917608,917609,917610,917611,917612,917613,917614,917615,917616,917617,917618,917619,917620,917621,917622,917623,917624,917625,917626,917627,917628,917629,917630,917631,917760,917761,917762,917763,917764,917765,917766,917767,917768,917769,917770,917771,917772,917773,917774,917775,917776,917777,917778,917779,917780,917781,917782,917783,917784,917785,917786,917787,917788,917789,917790,917791,917792,917793,917794,917795,917796,917797,917798,917799,917800,917801,917802,917803,917804,917805,917806,917807,917808,917809,917810,917811,917812,917813,917814,917815,917816,917817,917818,917819,917820,917821,917822,917823,917824,917825,917826,917827,917828,917829,917830,917831,917832,917833,917834,917835,917836,917837,917838,917839,917840,917841,917842,917843,917844,917845,917846,917847,917848,917849,917850,917851,917852,917853,917854,917855,917856,917857,917858,917859,917860,917861,917862,917863,917864,917865,917866,917867,917868,917869,917870,917871,917872,917873,917874,917875,917876,917877,917878,917879,917880,917881,917882,917883,917884,917885,917886,917887,917888,917889,917890,917891,917892,917893,917894,917895,917896,917897,917898,917899,917900,917901,917902,917903,917904,917905,917906,917907,917908,917909,917910,917911,917912,917913,917914,917915,917916,917917,917918,917919,917920,917921,917922,917923,917924,917925,917926,917927,917928,917929,917930,917931,917932,917933,917934,917935,917936,917937,917938,917939,917940,917941,917942,917943,917944,917945,917946,917947,917948,917949,917950,917951,917952,917953,917954,917955,917956,917957,917958,917959,917960,917961,917962,917963,917964,917965,917966,917967,917968,917969,917970,917971,917972,917973,917974,917975,917976,917977,917978,917979,917980,917981,917982,917983,917984,917985,917986,917987,917988,917989,917990,917991,917992,917993,917994,917995,917996,917997,917998,917999],"cs":[173,8203,12288],"de":[173,8203,12288],"es":[8203,12288],"fr":[173,8203,12288],"it":[160,173,12288],"ja":[173],"ko":[173,12288],"pl":[173,8203,12288],"pt-BR":[173,8203,12288],"qps-ploc":[160,173,8203,12288],"ru":[173,12288],"tr":[160,173,8203,12288],"zh-hans":[160,173,8203,12288],"zh-hant":[173,12288]}'
      );
    }
    static {
      this._data = void 0;
    }
    static getData() {
      if (!this._data) {
        this._data = new Set([...Object.values(_InvisibleCharacters.getRawData())].flat());
      }
      return this._data;
    }
    static isInvisibleCharacter(codePoint) {
      return _InvisibleCharacters.getData().has(codePoint);
    }
    static containsInvisibleCharacter(str) {
      for (let i = 0; i < str.length; i++) {
        const codePoint = str.codePointAt(i);
        if (typeof codePoint === "number" && (_InvisibleCharacters.isInvisibleCharacter(codePoint) || codePoint === CodePoint.space)) {
          return true;
        }
      }
      return false;
    }
    static get codePoints() {
      return _InvisibleCharacters.getData();
    }
  };

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/extpath.js
  function isPathSeparator2(code) {
    return code === CharCode.Slash || code === CharCode.Backslash;
  }
  function toSlashes(osPath) {
    return osPath.replace(/[\\/]/g, posix.sep);
  }
  function toPosixPath(osPath) {
    if (osPath.indexOf("/") === -1) {
      osPath = toSlashes(osPath);
    }
    if (/^[a-zA-Z]:(\/|$)/.test(osPath)) {
      osPath = "/" + osPath;
    }
    return osPath;
  }
  function getRoot(path, sep2 = posix.sep) {
    if (!path) {
      return "";
    }
    const len = path.length;
    const firstLetter = path.charCodeAt(0);
    if (isPathSeparator2(firstLetter)) {
      if (isPathSeparator2(path.charCodeAt(1))) {
        if (!isPathSeparator2(path.charCodeAt(2))) {
          let pos2 = 3;
          const start = pos2;
          for (; pos2 < len; pos2++) {
            if (isPathSeparator2(path.charCodeAt(pos2))) {
              break;
            }
          }
          if (start !== pos2 && !isPathSeparator2(path.charCodeAt(pos2 + 1))) {
            pos2 += 1;
            for (; pos2 < len; pos2++) {
              if (isPathSeparator2(path.charCodeAt(pos2))) {
                return path.slice(0, pos2 + 1).replace(/[\\/]/g, sep2);
              }
            }
          }
        }
      }
      return sep2;
    } else if (isWindowsDriveLetter(firstLetter)) {
      if (path.charCodeAt(1) === CharCode.Colon) {
        if (isPathSeparator2(path.charCodeAt(2))) {
          return path.slice(0, 2) + sep2;
        } else {
          return path.slice(0, 2);
        }
      }
    }
    let pos = path.indexOf("://");
    if (pos !== -1) {
      pos += 3;
      for (; pos < len; pos++) {
        if (isPathSeparator2(path.charCodeAt(pos))) {
          return path.slice(0, pos + 1);
        }
      }
    }
    return "";
  }
  function isEqualOrParent(base, parentCandidate, ignoreCase, forcePosixSemantics = false) {
    const separator = forcePosixSemantics ? posix.sep : sep;
    if (base === parentCandidate) {
      return true;
    }
    if (!base || !parentCandidate) {
      return false;
    }
    if (base.indexOf("..") >= 0 || parentCandidate.indexOf("..") >= 0) {
      base = forcePosixSemantics ? posix.normalize(base) : normalize(base);
      parentCandidate = forcePosixSemantics ? posix.normalize(parentCandidate) : normalize(parentCandidate);
    }
    if (parentCandidate.length > base.length) {
      return false;
    }
    if (ignoreCase) {
      const beginsWith = startsWithIgnoreCase(base, parentCandidate);
      if (!beginsWith) {
        return false;
      }
      if (parentCandidate.length === base.length) {
        return true;
      }
      let sepOffset = parentCandidate.length;
      if (parentCandidate.charAt(parentCandidate.length - 1) === separator) {
        sepOffset--;
      }
      return base.charAt(sepOffset) === separator;
    }
    if (parentCandidate.charAt(parentCandidate.length - 1) !== separator) {
      parentCandidate += separator;
    }
    return base.indexOf(parentCandidate) === 0;
  }
  function isWindowsDriveLetter(char0) {
    return char0 >= CharCode.A && char0 <= CharCode.Z || char0 >= CharCode.a && char0 <= CharCode.z;
  }

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/network.js
  var import_meta = {};
  var Schemas;
  (function(Schemas2) {
    Schemas2.inMemory = "inmemory";
    Schemas2.vscode = "vscode";
    Schemas2.internal = "private";
    Schemas2.walkThrough = "walkThrough";
    Schemas2.walkThroughSnippet = "walkThroughSnippet";
    Schemas2.http = "http";
    Schemas2.https = "https";
    Schemas2.file = "file";
    Schemas2.mailto = "mailto";
    Schemas2.untitled = "untitled";
    Schemas2.data = "data";
    Schemas2.command = "command";
    Schemas2.vscodeRemote = "vscode-remote";
    Schemas2.vscodeRemoteResource = "vscode-remote-resource";
    Schemas2.vscodeManagedRemoteResource = "vscode-managed-remote-resource";
    Schemas2.vscodeUserData = "vscode-userdata";
    Schemas2.vscodeCustomEditor = "vscode-custom-editor";
    Schemas2.vscodeNotebookCell = "vscode-notebook-cell";
    Schemas2.vscodeNotebookCellMetadata = "vscode-notebook-cell-metadata";
    Schemas2.vscodeNotebookCellMetadataDiff = "vscode-notebook-cell-metadata-diff";
    Schemas2.vscodeNotebookCellOutput = "vscode-notebook-cell-output";
    Schemas2.vscodeNotebookCellOutputDiff = "vscode-notebook-cell-output-diff";
    Schemas2.vscodeNotebookMetadata = "vscode-notebook-metadata";
    Schemas2.vscodeInteractiveInput = "vscode-interactive-input";
    Schemas2.vscodeSettings = "vscode-settings";
    Schemas2.vscodeWorkspaceTrust = "vscode-workspace-trust";
    Schemas2.vscodeTerminal = "vscode-terminal";
    Schemas2.vscodeImageCarousel = "vscode-image-carousel";
    Schemas2.vscodeChatCodeBlock = "vscode-chat-code-block";
    Schemas2.vscodeChatCodeCompareBlock = "vscode-chat-code-compare-block";
    Schemas2.vscodeChatEditor = "vscode-chat-editor";
    Schemas2.vscodeChatInput = "chatSessionInput";
    Schemas2.vscodeLocalChatSession = "vscode-chat-session";
    Schemas2.webviewPanel = "webview-panel";
    Schemas2.vscodeWebview = "vscode-webview";
    Schemas2.vscodeBrowser = "vscode-browser";
    Schemas2.extension = "extension";
    Schemas2.vscodeFileResource = "vscode-file";
    Schemas2.tmp = "tmp";
    Schemas2.vsls = "vsls";
    Schemas2.vscodeSourceControl = "vscode-scm";
    Schemas2.commentsInput = "comment";
    Schemas2.codeSetting = "code-setting";
    Schemas2.outputChannel = "output";
    Schemas2.accessibleView = "accessible-view";
    Schemas2.chatEditingSnapshotScheme = "chat-editing-snapshot-text-model";
    Schemas2.chatEditingModel = "chat-editing-text-model";
    Schemas2.copilotPr = "copilot-pr";
  })(Schemas || (Schemas = {}));
  var connectionTokenQueryName = "tkn";
  var RemoteAuthoritiesImpl = class {
    constructor() {
      this._hosts = /* @__PURE__ */ Object.create(null);
      this._ports = /* @__PURE__ */ Object.create(null);
      this._connectionTokens = /* @__PURE__ */ Object.create(null);
      this._preferredWebSchema = "http";
      this._delegate = null;
      this._serverRootPath = "/";
    }
    setPreferredWebSchema(schema) {
      this._preferredWebSchema = schema;
    }
    setDelegate(delegate) {
      this._delegate = delegate;
    }
    setServerRootPath(product, serverBasePath) {
      this._serverRootPath = posix.join(serverBasePath ?? "/", getServerProductSegment(product));
    }
    getServerRootPath() {
      return this._serverRootPath;
    }
    get _remoteResourcesPath() {
      return posix.join(this._serverRootPath, Schemas.vscodeRemoteResource);
    }
    set(authority, host, port) {
      this._hosts[authority] = host;
      this._ports[authority] = port;
    }
    setConnectionToken(authority, connectionToken) {
      this._connectionTokens[authority] = connectionToken;
    }
    getPreferredWebSchema() {
      return this._preferredWebSchema;
    }
    rewrite(uri) {
      if (this._delegate) {
        try {
          return this._delegate(uri);
        } catch (err) {
          onUnexpectedExternalError(err);
          return uri;
        }
      }
      const authority = uri.authority;
      let host = this._hosts[authority];
      if (host && host.indexOf(":") !== -1 && host.indexOf("[") === -1) {
        host = `[${host}]`;
      }
      const port = this._ports[authority];
      const connectionToken = this._connectionTokens[authority];
      let query = `path=${encodeURIComponent(uri.path)}`;
      if (typeof connectionToken === "string") {
        query += `&${connectionTokenQueryName}=${encodeURIComponent(connectionToken)}`;
      }
      return URI.from({
        scheme: isWeb ? this._preferredWebSchema : Schemas.vscodeRemoteResource,
        authority: `${host}:${port}`,
        path: this._remoteResourcesPath,
        query
      });
    }
  };
  var RemoteAuthorities = new RemoteAuthoritiesImpl();
  function getServerProductSegment(product) {
    return `${product.quality ?? "oss"}-${product.commit ?? "dev"}`;
  }
  var VSCODE_AUTHORITY = "vscode-app";
  var FileAccessImpl = class _FileAccessImpl {
    constructor() {
      this.staticBrowserUris = new ResourceMap();
      this.appResourcePathUrls = /* @__PURE__ */ new Map();
      this.appResourceUrlMapper = [];
    }
    static {
      this.FALLBACK_AUTHORITY = VSCODE_AUTHORITY;
    }
    registerAppResourcePathUrl(moduleId, url) {
      this.appResourcePathUrls.set(moduleId, url);
    }
    registerAppResourceLoader(loader) {
      this.appResourceUrlMapper.push(loader);
    }
    toUrl(moduleId) {
      let url = this.appResourcePathUrls.get(moduleId);
      if (typeof url === "function") {
        url = url();
      }
      for (const mapper of this.appResourceUrlMapper) {
        const result = mapper(moduleId);
        if (result) {
          return result;
        }
      }
      return new URL(url ?? moduleId, globalThis.location?.href ?? import_meta.url).toString();
    }
    asBrowserUri(resourcePath) {
      const uri = this.toUri(resourcePath);
      return this.uriToBrowserUri(uri);
    }
    uriToBrowserUri(uri) {
      if (uri.scheme === Schemas.vscodeRemote) {
        return RemoteAuthorities.rewrite(uri);
      }
      if (uri.scheme === Schemas.file && (isNative || webWorkerOrigin === `${Schemas.vscodeFileResource}://${_FileAccessImpl.FALLBACK_AUTHORITY}`)) {
        return uri.with({
          scheme: Schemas.vscodeFileResource,
          authority: uri.authority || _FileAccessImpl.FALLBACK_AUTHORITY,
          query: null,
          fragment: null
        });
      }
      return this.staticBrowserUris.get(uri) ?? uri;
    }
    asFileUri(resourcePath) {
      const uri = this.toUri(resourcePath);
      return this.uriToFileUri(uri);
    }
    uriToFileUri(uri) {
      if (uri.scheme === Schemas.vscodeFileResource) {
        return uri.with({
          scheme: Schemas.file,
          authority: uri.authority !== _FileAccessImpl.FALLBACK_AUTHORITY ? uri.authority : null,
          query: null,
          fragment: null
        });
      }
      return uri;
    }
    toUri(uriOrModule) {
      if (URI.isUri(uriOrModule)) {
        return uriOrModule;
      }
      if (globalThis._VSCODE_FILE_ROOT) {
        const rootUriOrPath = globalThis._VSCODE_FILE_ROOT;
        if (/^\w[\w\d+.-]*:\/\//.test(rootUriOrPath)) {
          return URI.joinPath(URI.parse(rootUriOrPath, true), uriOrModule);
        }
        const modulePath = join(rootUriOrPath, uriOrModule);
        return URI.file(modulePath);
      }
      return URI.parse(this.toUrl(uriOrModule));
    }
    registerStaticBrowserUri(uri, browserUri) {
      this.staticBrowserUris.set(uri, browserUri);
      return toDisposable(() => {
        if (this.staticBrowserUris.get(uri) === browserUri) {
          this.staticBrowserUris.delete(uri);
        }
      });
    }
    getRegisteredBrowserUris() {
      return this.staticBrowserUris.keys();
    }
  };
  var FileAccess = new FileAccessImpl();
  var COI;
  (function(COI2) {
    const coiHeaders = /* @__PURE__ */ new Map([["1", {
      "Cross-Origin-Opener-Policy": "same-origin"
    }], ["2", {
      "Cross-Origin-Embedder-Policy": "require-corp"
    }], ["3", {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp"
    }]]);
    COI2.CoopAndCoep = Object.freeze(coiHeaders.get("3"));
    const coiSearchParamName = "vscode-coi";
    function getHeadersFromQuery(url) {
      let params;
      if (typeof url === "string") {
        params = new URL(url).searchParams;
      } else if (url instanceof URL) {
        params = url.searchParams;
      } else if (URI.isUri(url)) {
        params = new URL(url.toString(true)).searchParams;
      }
      const value = params?.get(coiSearchParamName);
      if (!value) {
        return void 0;
      }
      return coiHeaders.get(value);
    }
    COI2.getHeadersFromQuery = getHeadersFromQuery;
    function addSearchParam(urlOrSearch, coop, coep) {
      if (!globalThis.crossOriginIsolated) {
        return;
      }
      const value = coop && coep ? "3" : coep ? "2" : "1";
      if (urlOrSearch instanceof URLSearchParams) {
        urlOrSearch.set(coiSearchParamName, value);
      } else {
        urlOrSearch[coiSearchParamName] = value;
      }
    }
    COI2.addSearchParam = addSearchParam;
  })(COI || (COI = {}));

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/resources.js
  function originalFSPath(uri) {
    return uriToFsPath(uri, true);
  }
  var ExtUri = class {
    constructor(_ignorePathCasing) {
      this._ignorePathCasing = _ignorePathCasing;
    }
    compare(uri1, uri2, ignoreFragment = false) {
      if (uri1 === uri2) {
        return 0;
      }
      return compare(
        this.getComparisonKey(uri1, ignoreFragment),
        this.getComparisonKey(uri2, ignoreFragment)
      );
    }
    isEqual(uri1, uri2, ignoreFragment = false) {
      if (uri1 === uri2) {
        return true;
      }
      if (!uri1 || !uri2) {
        return false;
      }
      return this.getComparisonKey(uri1, ignoreFragment) === this.getComparisonKey(uri2, ignoreFragment);
    }
    getComparisonKey(uri, ignoreFragment = false) {
      return uri.with({
        path: this._ignorePathCasing(uri) ? uri.path.toLowerCase() : void 0,
        fragment: ignoreFragment ? null : void 0
      }).toString();
    }
    ignorePathCasing(uri) {
      return this._ignorePathCasing(uri);
    }
    isEqualOrParent(base, parentCandidate, ignoreFragment = false) {
      if (base.scheme === parentCandidate.scheme) {
        if (base.scheme === Schemas.file) {
          return isEqualOrParent(
            originalFSPath(base),
            originalFSPath(parentCandidate),
            this._ignorePathCasing(base)
          ) && base.query === parentCandidate.query && (ignoreFragment || base.fragment === parentCandidate.fragment);
        }
        if (isEqualAuthority(base.authority, parentCandidate.authority)) {
          return isEqualOrParent(base.path, parentCandidate.path, this._ignorePathCasing(base), true) && base.query === parentCandidate.query && (ignoreFragment || base.fragment === parentCandidate.fragment);
        }
      }
      return false;
    }
    joinPath(resource, ...pathFragment) {
      return URI.joinPath(resource, ...pathFragment);
    }
    basenameOrAuthority(resource) {
      return basename2(resource) || resource.authority;
    }
    basename(resource, suffix) {
      return posix.basename(resource.path, suffix);
    }
    extname(resource) {
      return posix.extname(resource.path);
    }
    dirname(resource) {
      if (resource.path.length === 0) {
        return resource;
      }
      let dirname3;
      if (resource.scheme === Schemas.file) {
        dirname3 = URI.file(dirname(originalFSPath(resource))).path;
      } else {
        dirname3 = posix.dirname(resource.path);
        if (resource.authority && dirname3.length && dirname3.charCodeAt(0) !== CharCode.Slash) {
          console.error(`dirname("${resource.toString})) resulted in a relative path`);
          dirname3 = "/";
        }
      }
      return resource.with({
        path: dirname3
      });
    }
    normalizePath(resource) {
      if (!resource.path.length) {
        return resource;
      }
      let normalizedPath;
      if (resource.scheme === Schemas.file) {
        normalizedPath = URI.file(normalize(originalFSPath(resource))).path;
      } else {
        normalizedPath = posix.normalize(resource.path);
      }
      return resource.with({
        path: normalizedPath
      });
    }
    relativePath(from, to) {
      if (from.scheme !== to.scheme || !isEqualAuthority(from.authority, to.authority)) {
        return void 0;
      }
      if (from.scheme === Schemas.file) {
        const relativePath2 = relative(originalFSPath(from), originalFSPath(to));
        return isWindows ? toSlashes(relativePath2) : relativePath2;
      }
      let fromPath = from.path || "/";
      const toPath = to.path || "/";
      if (this._ignorePathCasing(from)) {
        let i = 0;
        for (const len = Math.min(fromPath.length, toPath.length); i < len; i++) {
          if (fromPath.charCodeAt(i) !== toPath.charCodeAt(i)) {
            if (fromPath.charAt(i).toLowerCase() !== toPath.charAt(i).toLowerCase()) {
              break;
            }
          }
        }
        fromPath = toPath.substr(0, i) + fromPath.substr(i);
      }
      return posix.relative(fromPath, toPath);
    }
    resolvePath(base, path) {
      if (base.scheme === Schemas.file) {
        const newURI = URI.file(resolve(originalFSPath(base), path));
        return base.with({
          authority: newURI.authority,
          path: newURI.path
        });
      }
      path = toPosixPath(path);
      return base.with({
        path: posix.resolve(base.path, path)
      });
    }
    isAbsolutePath(resource) {
      return !!resource.path && resource.path[0] === "/";
    }
    isEqualAuthority(a1, a2) {
      return a1 === a2 || a1 !== void 0 && a2 !== void 0 && equalsIgnoreCase(a1, a2);
    }
    hasTrailingPathSeparator(resource, sep$1 = sep) {
      if (resource.scheme === Schemas.file) {
        const fsp = originalFSPath(resource);
        return fsp.length > getRoot(fsp).length && fsp[fsp.length - 1] === sep$1;
      } else {
        const p = resource.path;
        return p.length > 1 && p.charCodeAt(p.length - 1) === CharCode.Slash && !/^[a-zA-Z]:(\/$|\\$)/.test(resource.fsPath);
      }
    }
    removeTrailingPathSeparator(resource, sep$1 = sep) {
      if (hasTrailingPathSeparator(resource, sep$1)) {
        return resource.with({
          path: resource.path.substr(0, resource.path.length - 1)
        });
      }
      return resource;
    }
    addTrailingPathSeparator(resource, sep$1 = sep) {
      let isRootSep = false;
      if (resource.scheme === Schemas.file) {
        const fsp = originalFSPath(resource);
        isRootSep = fsp !== void 0 && fsp.length === getRoot(fsp).length && fsp[fsp.length - 1] === sep$1;
      } else {
        sep$1 = "/";
        const p = resource.path;
        isRootSep = p.length === 1 && p.charCodeAt(p.length - 1) === CharCode.Slash;
      }
      if (!isRootSep && !hasTrailingPathSeparator(resource, sep$1)) {
        return resource.with({
          path: resource.path + "/"
        });
      }
      return resource;
    }
  };
  var extUri = new ExtUri(() => false);
  var extUriBiasedIgnorePathCase = new ExtUri((uri) => {
    return uri.scheme === Schemas.file ? !isLinux : true;
  });
  var extUriIgnorePathCase = new ExtUri((_) => true);
  var isEqual = extUri.isEqual.bind(extUri);
  var isEqualOrParent2 = extUri.isEqualOrParent.bind(extUri);
  var getComparisonKey = extUri.getComparisonKey.bind(extUri);
  var basenameOrAuthority = extUri.basenameOrAuthority.bind(extUri);
  var basename2 = extUri.basename.bind(extUri);
  var extname2 = extUri.extname.bind(extUri);
  var dirname2 = extUri.dirname.bind(extUri);
  var joinPath = extUri.joinPath.bind(extUri);
  var normalizePath = extUri.normalizePath.bind(extUri);
  var relativePath = extUri.relativePath.bind(extUri);
  var resolvePath = extUri.resolvePath.bind(extUri);
  var isAbsolutePath = extUri.isAbsolutePath.bind(extUri);
  var isEqualAuthority = extUri.isEqualAuthority.bind(extUri);
  var hasTrailingPathSeparator = extUri.hasTrailingPathSeparator.bind(extUri);
  var removeTrailingPathSeparator = extUri.removeTrailingPathSeparator.bind(extUri);
  var addTrailingPathSeparator = extUri.addTrailingPathSeparator.bind(extUri);
  var DataUri;
  (function(DataUri2) {
    DataUri2.META_DATA_LABEL = "label";
    DataUri2.META_DATA_DESCRIPTION = "description";
    DataUri2.META_DATA_SIZE = "size";
    DataUri2.META_DATA_MIME = "mime";
    function parseMetaData(dataUri) {
      const metadata = /* @__PURE__ */ new Map();
      const meta = dataUri.path.substring(dataUri.path.indexOf(";") + 1, dataUri.path.lastIndexOf(";"));
      meta.split(";").forEach((property) => {
        const [key, value] = property.split(":");
        if (key && value) {
          metadata.set(key, value);
        }
      });
      const mime = dataUri.path.substring(0, dataUri.path.indexOf(";"));
      if (mime) {
        metadata.set(DataUri2.META_DATA_MIME, mime);
      }
      return metadata;
    }
    DataUri2.parseMetaData = parseMetaData;
  })(DataUri || (DataUri = {}));

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/symbols.js
  var MicrotaskDelay = Symbol("MicrotaskDelay");

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/async.js
  var MAX_TIMEOUT_DELAY = 2 ** 31 - 1;
  var RunOnceScheduler = class {
    constructor(runner, delay) {
      this.timeoutToken = void 0;
      this.runner = runner;
      this.timeout = delay;
      this.timeoutHandler = this.onTimeout.bind(this);
    }
    dispose() {
      this.cancel();
      this.runner = null;
    }
    cancel() {
      if (this.isScheduled()) {
        clearTimeout(this.timeoutToken);
        this.timeoutToken = void 0;
      }
    }
    schedule(delay = this.timeout) {
      this.cancel();
      this.timeoutToken = setTimeout(this.timeoutHandler, delay);
    }
    get delay() {
      return this.timeout;
    }
    set delay(value) {
      this.timeout = value;
    }
    isScheduled() {
      return this.timeoutToken !== void 0;
    }
    flush() {
      if (this.isScheduled()) {
        this.cancel();
        this.doRun();
      }
    }
    onTimeout() {
      this.timeoutToken = void 0;
      if (this.runner) {
        this.doRun();
      }
    }
    doRun() {
      this.runner?.();
    }
  };
  var runWhenGlobalIdle;
  var _runWhenIdle;
  (function() {
    const safeGlobal = globalThis;
    if (typeof safeGlobal.requestIdleCallback !== "function" || typeof safeGlobal.cancelIdleCallback !== "function") {
      _runWhenIdle = (_targetWindow, runner, timeout) => {
        setTimeout0(() => {
          if (disposed) {
            return;
          }
          const end = Date.now() + 15;
          const deadline = {
            didTimeout: true,
            timeRemaining() {
              return Math.max(0, end - Date.now());
            }
          };
          runner(Object.freeze(deadline));
        });
        let disposed = false;
        return {
          dispose() {
            if (disposed) {
              return;
            }
            disposed = true;
          }
        };
      };
    } else {
      _runWhenIdle = (targetWindow, runner, timeout) => {
        const handle = targetWindow.requestIdleCallback(runner, typeof timeout === "number" ? {
          timeout
        } : void 0);
        let disposed = false;
        return {
          dispose() {
            if (disposed) {
              return;
            }
            disposed = true;
            targetWindow.cancelIdleCallback(handle);
          }
        };
      };
    }
    runWhenGlobalIdle = (runner, timeout) => _runWhenIdle(globalThis, runner, timeout);
  })();
  var DeferredOutcome;
  (function(DeferredOutcome2) {
    DeferredOutcome2[DeferredOutcome2["Resolved"] = 0] = "Resolved";
    DeferredOutcome2[DeferredOutcome2["Rejected"] = 1] = "Rejected";
  })(DeferredOutcome || (DeferredOutcome = {}));
  var DeferredPromise = class _DeferredPromise {
    static fromPromise(promise) {
      const deferred = new _DeferredPromise();
      deferred.settleWith(promise);
      return deferred;
    }
    get isRejected() {
      return this.outcome?.outcome === DeferredOutcome.Rejected;
    }
    get isResolved() {
      return this.outcome?.outcome === DeferredOutcome.Resolved;
    }
    get isSettled() {
      return !!this.outcome;
    }
    get value() {
      return this.outcome?.outcome === DeferredOutcome.Resolved ? this.outcome?.value : void 0;
    }
    constructor() {
      this.p = new Promise((c, e) => {
        this.completeCallback = c;
        this.errorCallback = e;
      });
    }
    complete(value) {
      if (this.isSettled) {
        return Promise.resolve();
      }
      return new Promise((resolve2) => {
        this.completeCallback(value);
        this.outcome = {
          outcome: DeferredOutcome.Resolved,
          value
        };
        resolve2();
      });
    }
    error(err) {
      if (this.isSettled) {
        return Promise.resolve();
      }
      return new Promise((resolve2) => {
        this.errorCallback(err);
        this.outcome = {
          outcome: DeferredOutcome.Rejected,
          value: err
        };
        resolve2();
      });
    }
    settleWith(promise) {
      return promise.then((value) => this.complete(value), (error) => this.error(error));
    }
    cancel() {
      return this.error(new CancellationError());
    }
  };
  var Promises;
  (function(Promises2) {
    async function settled(promises) {
      let firstError = void 0;
      const result = await Promise.all(promises.map((promise) => promise.then((value) => value, (error) => {
        if (!firstError) {
          firstError = error;
        }
        return void 0;
      })));
      if (typeof firstError !== "undefined") {
        throw firstError;
      }
      return result;
    }
    Promises2.settled = settled;
    function withAsyncBody(bodyFn) {
      return new Promise(async (resolve2, reject) => {
        try {
          await bodyFn(resolve2, reject);
        } catch (error) {
          reject(error);
        }
      });
    }
    Promises2.withAsyncBody = withAsyncBody;
  })(Promises || (Promises = {}));
  var AsyncIterableSourceState;
  (function(AsyncIterableSourceState2) {
    AsyncIterableSourceState2[AsyncIterableSourceState2["Initial"] = 0] = "Initial";
    AsyncIterableSourceState2[AsyncIterableSourceState2["DoneOK"] = 1] = "DoneOK";
    AsyncIterableSourceState2[AsyncIterableSourceState2["DoneError"] = 2] = "DoneError";
  })(AsyncIterableSourceState || (AsyncIterableSourceState = {}));
  var AsyncIterableObject = class _AsyncIterableObject {
    static fromArray(items) {
      return new _AsyncIterableObject((writer) => {
        writer.emitMany(items);
      });
    }
    static fromPromise(promise) {
      return new _AsyncIterableObject(async (emitter) => {
        emitter.emitMany(await promise);
      });
    }
    static fromPromisesResolveOrder(promises) {
      return new _AsyncIterableObject(async (emitter) => {
        await Promise.all(promises.map(async (p) => emitter.emitOne(await p)));
      });
    }
    static merge(iterables) {
      return new _AsyncIterableObject(async (emitter) => {
        await Promise.all(iterables.map(async (iterable) => {
          for await (const item of iterable) {
            emitter.emitOne(item);
          }
        }));
      });
    }
    static {
      this.EMPTY = _AsyncIterableObject.fromArray([]);
    }
    constructor(executor, onReturn) {
      this._state = AsyncIterableSourceState.Initial;
      this._results = [];
      this._error = null;
      this._onReturn = onReturn;
      this._onStateChanged = new Emitter();
      queueMicrotask(async () => {
        const writer = {
          emitOne: (item) => this.emitOne(item),
          emitMany: (items) => this.emitMany(items),
          reject: (error) => this.reject(error)
        };
        try {
          await Promise.resolve(executor(writer));
          this.resolve();
        } catch (err) {
          this.reject(err);
        } finally {
          writer.emitOne = () => {
          };
          writer.emitMany = () => {
          };
          writer.reject = () => {
          };
        }
      });
    }
    [Symbol.asyncIterator]() {
      let i = 0;
      return {
        next: async () => {
          do {
            if (this._state === AsyncIterableSourceState.DoneError) {
              throw this._error;
            }
            if (i < this._results.length) {
              return {
                done: false,
                value: this._results[i++]
              };
            }
            if (this._state === AsyncIterableSourceState.DoneOK) {
              return {
                done: true,
                value: void 0
              };
            }
            await Event.toPromise(this._onStateChanged.event);
          } while (true);
        },
        return: async () => {
          this._onReturn?.();
          return {
            done: true,
            value: void 0
          };
        }
      };
    }
    static map(iterable, mapFn) {
      return new _AsyncIterableObject(async (emitter) => {
        for await (const item of iterable) {
          emitter.emitOne(mapFn(item));
        }
      });
    }
    map(mapFn) {
      return _AsyncIterableObject.map(this, mapFn);
    }
    static filter(iterable, filterFn) {
      return new _AsyncIterableObject(async (emitter) => {
        for await (const item of iterable) {
          if (filterFn(item)) {
            emitter.emitOne(item);
          }
        }
      });
    }
    filter(filterFn) {
      return _AsyncIterableObject.filter(this, filterFn);
    }
    static coalesce(iterable) {
      return _AsyncIterableObject.filter(iterable, (item) => !!item);
    }
    coalesce() {
      return _AsyncIterableObject.coalesce(this);
    }
    static async toPromise(iterable) {
      const result = [];
      for await (const item of iterable) {
        result.push(item);
      }
      return result;
    }
    toPromise() {
      return _AsyncIterableObject.toPromise(this);
    }
    emitOne(value) {
      if (this._state !== AsyncIterableSourceState.Initial) {
        return;
      }
      this._results.push(value);
      this._onStateChanged.fire();
    }
    emitMany(values) {
      if (this._state !== AsyncIterableSourceState.Initial) {
        return;
      }
      this._results = this._results.concat(values);
      this._onStateChanged.fire();
    }
    resolve() {
      if (this._state !== AsyncIterableSourceState.Initial) {
        return;
      }
      this._state = AsyncIterableSourceState.DoneOK;
      this._onStateChanged.fire();
    }
    reject(error) {
      if (this._state !== AsyncIterableSourceState.Initial) {
        return;
      }
      this._state = AsyncIterableSourceState.DoneError;
      this._error = error;
      this._onStateChanged.fire();
    }
  };
  var ProducerConsumer = class {
    constructor() {
      this._unsatisfiedConsumers = [];
      this._unconsumedValues = [];
    }
    get hasFinalValue() {
      return !!this._finalValue;
    }
    produce(value) {
      this._ensureNoFinalValue();
      if (this._unsatisfiedConsumers.length > 0) {
        const deferred = this._unsatisfiedConsumers.shift();
        this._resolveOrRejectDeferred(deferred, value);
      } else {
        this._unconsumedValues.push(value);
      }
    }
    produceFinal(value) {
      this._ensureNoFinalValue();
      this._finalValue = value;
      for (const deferred of this._unsatisfiedConsumers) {
        this._resolveOrRejectDeferred(deferred, value);
      }
      this._unsatisfiedConsumers.length = 0;
    }
    _ensureNoFinalValue() {
      if (this._finalValue) {
        throw new BugIndicatingError("ProducerConsumer: cannot produce after final value has been set");
      }
    }
    _resolveOrRejectDeferred(deferred, value) {
      if (value.ok) {
        deferred.complete(value.value);
      } else {
        deferred.error(value.error);
      }
    }
    consume() {
      if (this._unconsumedValues.length > 0 || this._finalValue) {
        const value = this._unconsumedValues.length > 0 ? this._unconsumedValues.shift() : this._finalValue;
        if (value.ok) {
          return Promise.resolve(value.value);
        } else {
          return Promise.reject(value.error);
        }
      } else {
        const deferred = new DeferredPromise();
        this._unsatisfiedConsumers.push(deferred);
        return deferred.p;
      }
    }
  };
  var AsyncIterableProducer = class _AsyncIterableProducer {
    constructor(executor, _onReturn) {
      this._onReturn = _onReturn;
      this._producerConsumer = new ProducerConsumer();
      this._iterator = {
        next: () => this._producerConsumer.consume(),
        return: () => {
          this._onReturn?.();
          return Promise.resolve({
            done: true,
            value: void 0
          });
        },
        throw: async (e) => {
          this._finishError(e);
          return {
            done: true,
            value: void 0
          };
        }
      };
      queueMicrotask(async () => {
        const p = executor({
          emitOne: (value) => this._producerConsumer.produce({
            ok: true,
            value: {
              done: false,
              value
            }
          }),
          emitMany: (values) => {
            for (const value of values) {
              this._producerConsumer.produce({
                ok: true,
                value: {
                  done: false,
                  value
                }
              });
            }
          },
          reject: (error) => this._finishError(error)
        });
        if (!this._producerConsumer.hasFinalValue) {
          try {
            await p;
            this._finishOk();
          } catch (error) {
            this._finishError(error);
          }
        }
      });
    }
    static fromArray(items) {
      return new _AsyncIterableProducer((writer) => {
        writer.emitMany(items);
      });
    }
    static fromPromise(promise) {
      return new _AsyncIterableProducer(async (emitter) => {
        emitter.emitMany(await promise);
      });
    }
    static fromPromisesResolveOrder(promises) {
      return new _AsyncIterableProducer(async (emitter) => {
        await Promise.all(promises.map(async (p) => emitter.emitOne(await p)));
      });
    }
    static merge(iterables) {
      return new _AsyncIterableProducer(async (emitter) => {
        await Promise.all(iterables.map(async (iterable) => {
          for await (const item of iterable) {
            emitter.emitOne(item);
          }
        }));
      });
    }
    static {
      this.EMPTY = _AsyncIterableProducer.fromArray([]);
    }
    static map(iterable, mapFn) {
      return new _AsyncIterableProducer(async (emitter) => {
        for await (const item of iterable) {
          emitter.emitOne(mapFn(item));
        }
      });
    }
    static tee(iterable) {
      let emitter1;
      let emitter2;
      const defer = new DeferredPromise();
      const start = async () => {
        if (!emitter1 || !emitter2) {
          return;
        }
        try {
          for await (const item of iterable) {
            emitter1.emitOne(item);
            emitter2.emitOne(item);
          }
        } catch (err) {
          emitter1.reject(err);
          emitter2.reject(err);
        } finally {
          defer.complete();
        }
      };
      const p1 = new _AsyncIterableProducer(async (emitter) => {
        emitter1 = emitter;
        start();
        return defer.p;
      });
      const p2 = new _AsyncIterableProducer(async (emitter) => {
        emitter2 = emitter;
        start();
        return defer.p;
      });
      return [p1, p2];
    }
    map(mapFn) {
      return _AsyncIterableProducer.map(this, mapFn);
    }
    static coalesce(iterable) {
      return _AsyncIterableProducer.filter(iterable, (item) => !!item);
    }
    coalesce() {
      return _AsyncIterableProducer.coalesce(this);
    }
    static filter(iterable, filterFn) {
      return new _AsyncIterableProducer(async (emitter) => {
        for await (const item of iterable) {
          if (filterFn(item)) {
            emitter.emitOne(item);
          }
        }
      });
    }
    filter(filterFn) {
      return _AsyncIterableProducer.filter(this, filterFn);
    }
    _finishOk() {
      if (!this._producerConsumer.hasFinalValue) {
        this._producerConsumer.produceFinal({
          ok: true,
          value: {
            done: true,
            value: void 0
          }
        });
      }
    }
    _finishError(error) {
      if (!this._producerConsumer.hasFinalValue) {
        this._producerConsumer.produceFinal({
          ok: false,
          error
        });
      }
    }
    [Symbol.asyncIterator]() {
      return this._iterator;
    }
  };
  var AsyncReaderEndOfStream = Symbol("AsyncReaderEndOfStream");

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/equals.js
  function strictEquals(a, b) {
    return a === b;
  }
  function strictEqualsC() {
    return (a, b) => a === b;
  }
  function arrayEquals(a, b, itemEquals) {
    return equals(a, b, itemEquals ?? strictEquals);
  }
  function arrayEqualsC(itemEquals) {
    return (a, b) => equals(a, b, itemEquals ?? strictEquals);
  }
  function structuralEquals(a, b) {
    if (a === b) {
      return true;
    }
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) {
        return false;
      }
      for (let i = 0; i < a.length; i++) {
        if (!structuralEquals(a[i], b[i])) {
          return false;
        }
      }
      return true;
    }
    if (a && typeof a === "object" && b && typeof b === "object") {
      if (Object.getPrototypeOf(a) === Object.prototype && Object.getPrototypeOf(b) === Object.prototype) {
        const aObj = a;
        const bObj = b;
        const keysA = Object.keys(aObj);
        const keysB = Object.keys(bObj);
        const keysBSet = new Set(keysB);
        if (keysA.length !== keysB.length) {
          return false;
        }
        for (const key of keysA) {
          if (!keysBSet.has(key)) {
            return false;
          }
          if (!structuralEquals(aObj[key], bObj[key])) {
            return false;
          }
        }
        return true;
      }
    }
    return false;
  }
  function structuralEqualsC() {
    return (a, b) => structuralEquals(a, b);
  }
  function jsonStringifyEquals(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
  }
  function jsonStringifyEqualsC() {
    return (a, b) => JSON.stringify(a) === JSON.stringify(b);
  }
  function thisEqualsC() {
    return (a, b) => a.equals(b);
  }
  function equalsIfDefined(v1, v2, equals3) {
    if (v1 === void 0 || v1 === null || v2 === void 0 || v2 === null) {
      return v2 === v1;
    }
    return equals3(v1, v2);
  }
  function equalsIfDefinedC(equals3) {
    return (v1, v2) => {
      if (v1 === void 0 || v1 === null || v2 === void 0 || v2 === null) {
        return v2 === v1;
      }
      return equals3(v1, v2);
    };
  }
  var equals2;
  (function(equals3) {
    equals3.strict = strictEquals;
    equals3.strictC = strictEqualsC;
    equals3.array = arrayEquals;
    equals3.arrayC = arrayEqualsC;
    equals3.structural = structuralEquals;
    equals3.structuralC = structuralEqualsC;
    equals3.jsonStringify = jsonStringifyEquals;
    equals3.jsonStringifyC = jsonStringifyEqualsC;
    equals3.thisC = thisEqualsC;
    equals3.ifDefined = equalsIfDefined;
    equals3.ifDefinedC = equalsIfDefinedC;
  })(equals2 || (equals2 = {}));

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/observableInternal/logging/logging.js
  var globalObservableLogger;
  function addLogger(logger) {
    if (!globalObservableLogger) {
      globalObservableLogger = logger;
    } else if (globalObservableLogger instanceof ComposedLogger) {
      globalObservableLogger.loggers.push(logger);
    } else {
      globalObservableLogger = new ComposedLogger([globalObservableLogger, logger]);
    }
  }
  function getLogger() {
    return globalObservableLogger;
  }
  var globalObservableLoggerFn = void 0;
  function setLogObservableFn(fn) {
    globalObservableLoggerFn = fn;
  }
  function logObservable(obs) {
    if (globalObservableLoggerFn) {
      globalObservableLoggerFn(obs);
    }
  }
  var ComposedLogger = class {
    constructor(loggers) {
      this.loggers = loggers;
    }
    handleObservableCreated(observable, location) {
      for (const logger of this.loggers) {
        logger.handleObservableCreated(observable, location);
      }
    }
    handleOnListenerCountChanged(observable, newCount) {
      for (const logger of this.loggers) {
        logger.handleOnListenerCountChanged(observable, newCount);
      }
    }
    handleObservableUpdated(observable, info) {
      for (const logger of this.loggers) {
        logger.handleObservableUpdated(observable, info);
      }
    }
    handleAutorunCreated(autorun2, location) {
      for (const logger of this.loggers) {
        logger.handleAutorunCreated(autorun2, location);
      }
    }
    handleAutorunDisposed(autorun2) {
      for (const logger of this.loggers) {
        logger.handleAutorunDisposed(autorun2);
      }
    }
    handleAutorunDependencyChanged(autorun2, observable, change) {
      for (const logger of this.loggers) {
        logger.handleAutorunDependencyChanged(autorun2, observable, change);
      }
    }
    handleAutorunStarted(autorun2) {
      for (const logger of this.loggers) {
        logger.handleAutorunStarted(autorun2);
      }
    }
    handleAutorunFinished(autorun2) {
      for (const logger of this.loggers) {
        logger.handleAutorunFinished(autorun2);
      }
    }
    handleDerivedDependencyChanged(derived2, observable, change) {
      for (const logger of this.loggers) {
        logger.handleDerivedDependencyChanged(derived2, observable, change);
      }
    }
    handleDerivedCleared(observable) {
      for (const logger of this.loggers) {
        logger.handleDerivedCleared(observable);
      }
    }
    handleBeginTransaction(transaction2) {
      for (const logger of this.loggers) {
        logger.handleBeginTransaction(transaction2);
      }
    }
    handleEndTransaction(transaction2) {
      for (const logger of this.loggers) {
        logger.handleEndTransaction(transaction2);
      }
    }
  };

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/observableInternal/debugLocation.js
  var DebugLocation;
  (function(DebugLocation2) {
    let enabled = false;
    function enable() {
      enabled = true;
    }
    DebugLocation2.enable = enable;
    function ofCaller() {
      if (!enabled) {
        return void 0;
      }
      const Err = Error;
      const l = Err.stackTraceLimit;
      Err.stackTraceLimit = 3;
      const stack = new Error().stack;
      Err.stackTraceLimit = l;
      return DebugLocationImpl.fromStack(stack, 2);
    }
    DebugLocation2.ofCaller = ofCaller;
  })(DebugLocation || (DebugLocation = {}));
  var DebugLocationImpl = class _DebugLocationImpl {
    static fromStack(stack, parentIdx) {
      const lines = stack.split("\n");
      const location = parseLine(lines[parentIdx + 1]);
      if (location) {
        return new _DebugLocationImpl(location.fileName, location.line, location.column, location.id);
      } else {
        return void 0;
      }
    }
    constructor(fileName, line, column, id2) {
      this.fileName = fileName;
      this.line = line;
      this.column = column;
      this.id = id2;
    }
  };
  function parseLine(stackLine) {
    const match = stackLine.match(/\((.*):(\d+):(\d+)\)/);
    if (match) {
      return {
        fileName: match[1],
        line: parseInt(match[2]),
        column: parseInt(match[3]),
        id: stackLine
      };
    }
    const match2 = stackLine.match(/at ([^\(\)]*):(\d+):(\d+)/);
    if (match2) {
      return {
        fileName: match2[1],
        line: parseInt(match2[2]),
        column: parseInt(match2[3]),
        id: stackLine
      };
    }
    return void 0;
  }

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/observableInternal/debugName.js
  var DebugNameData = class {
    constructor(owner, debugNameSource, referenceFn) {
      this.owner = owner;
      this.debugNameSource = debugNameSource;
      this.referenceFn = referenceFn;
    }
    getDebugName(target) {
      return getDebugName(target, this);
    }
  };
  var countPerName = /* @__PURE__ */ new Map();
  var cachedDebugName = /* @__PURE__ */ new WeakMap();
  function getDebugName(target, data) {
    const cached = cachedDebugName.get(target);
    if (cached) {
      return cached;
    }
    const dbgName = computeDebugName(target, data);
    if (dbgName) {
      let count = countPerName.get(dbgName) ?? 0;
      count++;
      countPerName.set(dbgName, count);
      const result = count === 1 ? dbgName : `${dbgName}#${count}`;
      cachedDebugName.set(target, result);
      return result;
    }
    return void 0;
  }
  function computeDebugName(self, data) {
    const cached = cachedDebugName.get(self);
    if (cached) {
      return cached;
    }
    const ownerStr = data.owner ? formatOwner(data.owner) + `.` : "";
    let result;
    const debugNameSource = data.debugNameSource;
    if (debugNameSource !== void 0) {
      if (typeof debugNameSource === "function") {
        result = debugNameSource();
        if (result !== void 0) {
          return ownerStr + result;
        }
      } else {
        return ownerStr + debugNameSource;
      }
    }
    const referenceFn = data.referenceFn;
    if (referenceFn !== void 0) {
      result = getFunctionName(referenceFn);
      if (result !== void 0) {
        return ownerStr + result;
      }
    }
    if (data.owner !== void 0) {
      const key = findKey(data.owner, self);
      if (key !== void 0) {
        return ownerStr + key;
      }
    }
    return void 0;
  }
  function findKey(obj, value) {
    for (const key in obj) {
      if (obj[key] === value) {
        return key;
      }
    }
    return void 0;
  }
  var countPerClassName = /* @__PURE__ */ new Map();
  var ownerId = /* @__PURE__ */ new WeakMap();
  function formatOwner(owner) {
    const id2 = ownerId.get(owner);
    if (id2) {
      return id2;
    }
    const className = getClassName(owner) ?? "Object";
    let count = countPerClassName.get(className) ?? 0;
    count++;
    countPerClassName.set(className, count);
    const result = count === 1 ? className : `${className}#${count}`;
    ownerId.set(owner, result);
    return result;
  }
  function getClassName(obj) {
    const ctor = obj.constructor;
    if (ctor) {
      if (ctor.name === "Object") {
        return void 0;
      }
      return ctor.name;
    }
    return void 0;
  }
  function getFunctionName(fn) {
    const fnSrc = fn.toString();
    const regexp = /\/\*\*\s*@description\s*([^*]*)\*\//;
    const match = regexp.exec(fnSrc);
    const result = match ? match[1] : void 0;
    return result?.trim();
  }

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/observableInternal/observables/baseObservable.js
  var _derived;
  function _setDerivedOpts(derived2) {
    _derived = derived2;
  }
  var _recomputeInitiallyAndOnChange;
  function _setRecomputeInitiallyAndOnChange(recomputeInitiallyAndOnChange2) {
    _recomputeInitiallyAndOnChange = recomputeInitiallyAndOnChange2;
  }
  var _keepObserved;
  function _setKeepObserved(keepObserved2) {
    _keepObserved = keepObserved2;
  }
  var _debugGetObservableGraph;
  function _setDebugGetObservableGraph(debugGetObservableGraph2) {
    _debugGetObservableGraph = debugGetObservableGraph2;
  }
  var ConvenientObservable = class {
    get TChange() {
      return null;
    }
    reportChanges() {
      this.get();
    }
    read(reader) {
      if (reader) {
        return reader.readObservable(this);
      } else {
        return this.get();
      }
    }
    map(fnOrOwner, fnOrUndefined, debugLocation = DebugLocation.ofCaller()) {
      const owner = fnOrUndefined === void 0 ? void 0 : fnOrOwner;
      const fn = fnOrUndefined === void 0 ? fnOrOwner : fnOrUndefined;
      return _derived({
        owner,
        debugName: () => {
          const name = getFunctionName(fn);
          if (name !== void 0) {
            return name;
          }
          const regexp = /^\s*\(?\s*([a-zA-Z_$][a-zA-Z_$0-9]*)\s*\)?\s*=>\s*\1(?:\??)\.([a-zA-Z_$][a-zA-Z_$0-9]*)\s*$/;
          const match = regexp.exec(fn.toString());
          if (match) {
            return `${this.debugName}.${match[2]}`;
          }
          if (!owner) {
            return `${this.debugName} (mapped)`;
          }
          return void 0;
        },
        debugReferenceFn: fn
      }, (reader) => fn(this.read(reader), reader), debugLocation);
    }
    flatten() {
      return _derived({
        owner: void 0,
        debugName: () => `${this.debugName} (flattened)`
      }, (reader) => this.read(reader).read(reader));
    }
    recomputeInitiallyAndOnChange(store, handleValue) {
      store.add(_recomputeInitiallyAndOnChange(this, handleValue));
      return this;
    }
    keepObserved(store) {
      store.add(_keepObserved(this));
      return this;
    }
    get debugValue() {
      return this.get();
    }
    get debug() {
      return new DebugHelper(this);
    }
  };
  var DebugHelper = class {
    constructor(observable) {
      this.observable = observable;
    }
    getDependencyGraph() {
      return _debugGetObservableGraph(this.observable, {
        type: "dependencies"
      });
    }
    getObserverGraph() {
      return _debugGetObservableGraph(this.observable, {
        type: "observers"
      });
    }
  };
  var BaseObservable = class extends ConvenientObservable {
    constructor(debugLocation) {
      super();
      this._observers = /* @__PURE__ */ new Set();
      getLogger()?.handleObservableCreated(this, debugLocation);
    }
    addObserver(observer) {
      const len = this._observers.size;
      this._observers.add(observer);
      if (len === 0) {
        this.onFirstObserverAdded();
      }
      if (len !== this._observers.size) {
        getLogger()?.handleOnListenerCountChanged(this, this._observers.size);
      }
    }
    removeObserver(observer) {
      const deleted = this._observers.delete(observer);
      if (deleted && this._observers.size === 0) {
        this.onLastObserverRemoved();
      }
      if (deleted) {
        getLogger()?.handleOnListenerCountChanged(this, this._observers.size);
      }
    }
    onFirstObserverAdded() {
    }
    onLastObserverRemoved() {
    }
    log() {
      const hadLogger = !!getLogger();
      logObservable(this);
      if (!hadLogger) {
        getLogger()?.handleObservableCreated(this, DebugLocation.ofCaller());
      }
      return this;
    }
    debugGetObservers() {
      return this._observers;
    }
  };

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/observableInternal/reactions/autorunImpl.js
  var AutorunState;
  (function(AutorunState2) {
    AutorunState2[AutorunState2["dependenciesMightHaveChanged"] = 1] = "dependenciesMightHaveChanged";
    AutorunState2[AutorunState2["stale"] = 2] = "stale";
    AutorunState2[AutorunState2["upToDate"] = 3] = "upToDate";
  })(AutorunState || (AutorunState = {}));
  function autorunStateToString(state) {
    switch (state) {
      case AutorunState.dependenciesMightHaveChanged:
        return "dependenciesMightHaveChanged";
      case AutorunState.stale:
        return "stale";
      case AutorunState.upToDate:
        return "upToDate";
      default:
        return "<unknown>";
    }
  }
  var AutorunObserver = class {
    get debugName() {
      return this._debugNameData.getDebugName(this) ?? "(anonymous)";
    }
    constructor(_debugNameData, _runFn, _changeTracker, debugLocation) {
      this._debugNameData = _debugNameData;
      this._runFn = _runFn;
      this._changeTracker = _changeTracker;
      this._state = AutorunState.stale;
      this._updateCount = 0;
      this._disposed = false;
      this._dependencies = /* @__PURE__ */ new Set();
      this._dependenciesToBeRemoved = /* @__PURE__ */ new Set();
      this._isRunning = false;
      this._iteration = 0;
      this._store = void 0;
      this._delayedStore = void 0;
      this._changeSummary = this._changeTracker?.createChangeSummary(void 0);
      getLogger()?.handleAutorunCreated(this, debugLocation);
      this._run();
      trackDisposable(this);
    }
    dispose() {
      if (this._disposed) {
        return;
      }
      this._disposed = true;
      for (const o of this._dependencies) {
        o.removeObserver(this);
      }
      this._dependencies.clear();
      if (this._store !== void 0) {
        this._store.dispose();
      }
      if (this._delayedStore !== void 0) {
        this._delayedStore.dispose();
      }
      getLogger()?.handleAutorunDisposed(this);
      markAsDisposed(this);
    }
    _run() {
      const emptySet = this._dependenciesToBeRemoved;
      this._dependenciesToBeRemoved = this._dependencies;
      this._dependencies = emptySet;
      this._state = AutorunState.upToDate;
      try {
        if (!this._disposed) {
          getLogger()?.handleAutorunStarted(this);
          const changeSummary = this._changeSummary;
          const delayedStore = this._delayedStore;
          if (delayedStore !== void 0) {
            this._delayedStore = void 0;
          }
          try {
            this._isRunning = true;
            if (this._changeTracker) {
              this._changeTracker.beforeUpdate?.(this, changeSummary);
              this._changeSummary = this._changeTracker.createChangeSummary(changeSummary);
            }
            if (this._store !== void 0) {
              this._store.dispose();
              this._store = void 0;
            }
            this._runFn(this, changeSummary);
          } catch (e) {
            onBugIndicatingError(e);
          } finally {
            this._isRunning = false;
            if (delayedStore !== void 0) {
              delayedStore.dispose();
            }
          }
        }
      } finally {
        if (!this._disposed) {
          getLogger()?.handleAutorunFinished(this);
        }
        for (const o of this._dependenciesToBeRemoved) {
          o.removeObserver(this);
        }
        this._dependenciesToBeRemoved.clear();
      }
    }
    toString() {
      return `Autorun<${this.debugName}>`;
    }
    beginUpdate(_observable) {
      if (this._state === AutorunState.upToDate) {
        this._checkIterations();
        this._state = AutorunState.dependenciesMightHaveChanged;
      }
      this._updateCount++;
    }
    endUpdate(_observable) {
      try {
        if (this._updateCount === 1) {
          this._iteration = 1;
          do {
            if (this._checkIterations()) {
              return;
            }
            if (this._state === AutorunState.dependenciesMightHaveChanged) {
              this._state = AutorunState.upToDate;
              for (const d of this._dependencies) {
                d.reportChanges();
                if (this._state === AutorunState.stale) {
                  break;
                }
              }
            }
            this._iteration++;
            if (this._state !== AutorunState.upToDate) {
              this._run();
            }
          } while (this._state !== AutorunState.upToDate);
        }
      } finally {
        this._updateCount--;
      }
      assertFn(() => this._updateCount >= 0);
    }
    handlePossibleChange(observable) {
      if (this._state === AutorunState.upToDate && this._isDependency(observable)) {
        this._checkIterations();
        this._state = AutorunState.dependenciesMightHaveChanged;
      }
    }
    handleChange(observable, change) {
      if (this._isDependency(observable)) {
        getLogger()?.handleAutorunDependencyChanged(this, observable, change);
        try {
          const shouldReact = this._changeTracker ? this._changeTracker.handleChange({
            changedObservable: observable,
            change,
            didChange: (o) => o === observable
          }, this._changeSummary) : true;
          if (shouldReact) {
            this._checkIterations();
            this._state = AutorunState.stale;
          }
        } catch (e) {
          onBugIndicatingError(e);
        }
      }
    }
    _isDependency(observable) {
      return this._dependencies.has(observable) && !this._dependenciesToBeRemoved.has(observable);
    }
    _ensureNoRunning() {
      if (!this._isRunning) {
        throw new BugIndicatingError("The reader object cannot be used outside its compute function!");
      }
    }
    readObservable(observable) {
      this._ensureNoRunning();
      if (this._disposed) {
        return observable.get();
      }
      observable.addObserver(this);
      const value = observable.get();
      this._dependencies.add(observable);
      this._dependenciesToBeRemoved.delete(observable);
      return value;
    }
    get store() {
      this._ensureNoRunning();
      if (this._disposed) {
        throw new BugIndicatingError("Cannot access store after dispose");
      }
      if (this._store === void 0) {
        this._store = new DisposableStore();
      }
      return this._store;
    }
    get delayedStore() {
      this._ensureNoRunning();
      if (this._disposed) {
        throw new BugIndicatingError("Cannot access store after dispose");
      }
      if (this._delayedStore === void 0) {
        this._delayedStore = new DisposableStore();
      }
      return this._delayedStore;
    }
    debugGetState() {
      return {
        isRunning: this._isRunning,
        updateCount: this._updateCount,
        dependencies: this._dependencies,
        state: this._state,
        stateStr: autorunStateToString(this._state)
      };
    }
    debugRerun() {
      if (!this._isRunning) {
        this._run();
      } else {
        this._state = AutorunState.stale;
      }
    }
    _checkIterations() {
      if (this._iteration > 100) {
        onBugIndicatingError(new BugIndicatingError(`Autorun '${this.debugName}' is stuck in an infinite update loop.`));
        return true;
      }
      return false;
    }
  };

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/observableInternal/observables/derivedImpl.js
  var DerivedState;
  (function(DerivedState2) {
    DerivedState2[DerivedState2["initial"] = 0] = "initial";
    DerivedState2[DerivedState2["dependenciesMightHaveChanged"] = 1] = "dependenciesMightHaveChanged";
    DerivedState2[DerivedState2["stale"] = 2] = "stale";
    DerivedState2[DerivedState2["upToDate"] = 3] = "upToDate";
  })(DerivedState || (DerivedState = {}));
  function derivedStateToString(state) {
    switch (state) {
      case DerivedState.initial:
        return "initial";
      case DerivedState.dependenciesMightHaveChanged:
        return "dependenciesMightHaveChanged";
      case DerivedState.stale:
        return "stale";
      case DerivedState.upToDate:
        return "upToDate";
      default:
        return "<unknown>";
    }
  }
  var Derived = class extends BaseObservable {
    get debugName() {
      return this._debugNameData.getDebugName(this) ?? "(anonymous)";
    }
    constructor(_debugNameData, _computeFn, _changeTracker, _handleLastObserverRemoved = void 0, _equalityComparator, debugLocation) {
      super(debugLocation);
      this._debugNameData = _debugNameData;
      this._computeFn = _computeFn;
      this._changeTracker = _changeTracker;
      this._handleLastObserverRemoved = _handleLastObserverRemoved;
      this._equalityComparator = _equalityComparator;
      this._state = DerivedState.initial;
      this._value = void 0;
      this._updateCount = 0;
      this._dependencies = /* @__PURE__ */ new Set();
      this._dependenciesToBeRemoved = /* @__PURE__ */ new Set();
      this._changeSummary = void 0;
      this._isUpdating = false;
      this._isComputing = false;
      this._didReportChange = false;
      this._isInBeforeUpdate = false;
      this._isReaderValid = false;
      this._store = void 0;
      this._delayedStore = void 0;
      this._removedObserverToCallEndUpdateOn = null;
      this._changeSummary = this._changeTracker?.createChangeSummary(void 0);
    }
    onLastObserverRemoved() {
      this._state = DerivedState.initial;
      this._value = void 0;
      getLogger()?.handleDerivedCleared(this);
      for (const d of this._dependencies) {
        d.removeObserver(this);
      }
      this._dependencies.clear();
      if (this._store !== void 0) {
        this._store.dispose();
        this._store = void 0;
      }
      if (this._delayedStore !== void 0) {
        this._delayedStore.dispose();
        this._delayedStore = void 0;
      }
      this._handleLastObserverRemoved?.();
    }
    get() {
      if (this._observers.size === 0) {
        let result;
        try {
          this._isReaderValid = true;
          let changeSummary = void 0;
          if (this._changeTracker) {
            changeSummary = this._changeTracker.createChangeSummary(void 0);
            this._changeTracker.beforeUpdate?.(this, changeSummary);
          }
          result = this._computeFn(this, changeSummary);
        } finally {
          this._isReaderValid = false;
        }
        this.onLastObserverRemoved();
        return result;
      } else {
        do {
          if (this._state === DerivedState.dependenciesMightHaveChanged) {
            for (const d of this._dependencies) {
              d.reportChanges();
              if (this._state === DerivedState.stale) {
                break;
              }
            }
          }
          if (this._state === DerivedState.dependenciesMightHaveChanged) {
            this._state = DerivedState.upToDate;
          }
          if (this._state !== DerivedState.upToDate) {
            this._recompute();
          }
        } while (this._state !== DerivedState.upToDate);
        return this._value;
      }
    }
    _recompute() {
      let didChange = false;
      this._isComputing = true;
      this._didReportChange = false;
      const emptySet = this._dependenciesToBeRemoved;
      this._dependenciesToBeRemoved = this._dependencies;
      this._dependencies = emptySet;
      try {
        const changeSummary = this._changeSummary;
        this._isReaderValid = true;
        if (this._changeTracker) {
          this._isInBeforeUpdate = true;
          this._changeTracker.beforeUpdate?.(this, changeSummary);
          this._isInBeforeUpdate = false;
          this._changeSummary = this._changeTracker?.createChangeSummary(changeSummary);
        }
        const hadValue = this._state !== DerivedState.initial;
        const oldValue = this._value;
        this._state = DerivedState.upToDate;
        const delayedStore = this._delayedStore;
        if (delayedStore !== void 0) {
          this._delayedStore = void 0;
        }
        try {
          if (this._store !== void 0) {
            this._store.dispose();
            this._store = void 0;
          }
          this._value = this._computeFn(this, changeSummary);
        } finally {
          this._isReaderValid = false;
          for (const o of this._dependenciesToBeRemoved) {
            o.removeObserver(this);
          }
          this._dependenciesToBeRemoved.clear();
          if (delayedStore !== void 0) {
            delayedStore.dispose();
          }
        }
        didChange = this._didReportChange || hadValue && !this._equalityComparator(oldValue, this._value);
        getLogger()?.handleObservableUpdated(this, {
          oldValue,
          newValue: this._value,
          change: void 0,
          didChange,
          hadValue
        });
      } catch (e) {
        onBugIndicatingError(e);
      }
      this._isComputing = false;
      if (!this._didReportChange && didChange) {
        for (const r of this._observers) {
          r.handleChange(this, void 0);
        }
      } else {
        this._didReportChange = false;
      }
    }
    toString() {
      return `LazyDerived<${this.debugName}>`;
    }
    beginUpdate(_observable) {
      if (this._isUpdating) {
        throw new BugIndicatingError("Cyclic deriveds are not supported yet!");
      }
      this._updateCount++;
      this._isUpdating = true;
      try {
        const propagateBeginUpdate = this._updateCount === 1;
        if (this._state === DerivedState.upToDate) {
          this._state = DerivedState.dependenciesMightHaveChanged;
          if (!propagateBeginUpdate) {
            for (const r of this._observers) {
              r.handlePossibleChange(this);
            }
          }
        }
        if (propagateBeginUpdate) {
          for (const r of this._observers) {
            r.beginUpdate(this);
          }
        }
      } finally {
        this._isUpdating = false;
      }
    }
    endUpdate(_observable) {
      this._updateCount--;
      if (this._updateCount === 0) {
        const observers = [...this._observers];
        for (const r of observers) {
          r.endUpdate(this);
        }
        if (this._removedObserverToCallEndUpdateOn) {
          const observers2 = [...this._removedObserverToCallEndUpdateOn];
          this._removedObserverToCallEndUpdateOn = null;
          for (const r of observers2) {
            r.endUpdate(this);
          }
        }
      }
      assertFn(() => this._updateCount >= 0);
    }
    handlePossibleChange(observable) {
      if (this._state === DerivedState.upToDate && this._dependencies.has(observable) && !this._dependenciesToBeRemoved.has(observable)) {
        this._state = DerivedState.dependenciesMightHaveChanged;
        for (const r of this._observers) {
          r.handlePossibleChange(this);
        }
      }
    }
    handleChange(observable, change) {
      if (this._dependencies.has(observable) && !this._dependenciesToBeRemoved.has(observable) || this._isInBeforeUpdate) {
        getLogger()?.handleDerivedDependencyChanged(this, observable, change);
        let shouldReact = false;
        try {
          shouldReact = this._changeTracker ? this._changeTracker.handleChange({
            changedObservable: observable,
            change,
            didChange: (o) => o === observable
          }, this._changeSummary) : true;
        } catch (e) {
          onBugIndicatingError(e);
        }
        const wasUpToDate = this._state === DerivedState.upToDate;
        if (shouldReact && (this._state === DerivedState.dependenciesMightHaveChanged || wasUpToDate)) {
          this._state = DerivedState.stale;
          if (wasUpToDate) {
            for (const r of this._observers) {
              r.handlePossibleChange(this);
            }
          }
        }
      }
    }
    _ensureReaderValid() {
      if (!this._isReaderValid) {
        throw new BugIndicatingError("The reader object cannot be used outside its compute function!");
      }
    }
    readObservable(observable) {
      this._ensureReaderValid();
      observable.addObserver(this);
      const value = observable.get();
      this._dependencies.add(observable);
      this._dependenciesToBeRemoved.delete(observable);
      return value;
    }
    reportChange(change) {
      this._ensureReaderValid();
      this._didReportChange = true;
      for (const r of this._observers) {
        r.handleChange(this, change);
      }
    }
    get store() {
      this._ensureReaderValid();
      if (this._store === void 0) {
        this._store = new DisposableStore();
      }
      return this._store;
    }
    get delayedStore() {
      this._ensureReaderValid();
      if (this._delayedStore === void 0) {
        this._delayedStore = new DisposableStore();
      }
      return this._delayedStore;
    }
    addObserver(observer) {
      const shouldCallBeginUpdate = !this._observers.has(observer) && this._updateCount > 0;
      super.addObserver(observer);
      if (shouldCallBeginUpdate) {
        if (!this._removedObserverToCallEndUpdateOn?.delete(observer)) {
          observer.beginUpdate(this);
        }
      }
    }
    removeObserver(observer) {
      if (this._observers.has(observer) && this._updateCount > 0) {
        if (!this._removedObserverToCallEndUpdateOn) {
          this._removedObserverToCallEndUpdateOn = /* @__PURE__ */ new Set();
        }
        this._removedObserverToCallEndUpdateOn.add(observer);
      }
      super.removeObserver(observer);
    }
    debugGetState() {
      return {
        state: this._state,
        stateStr: derivedStateToString(this._state),
        updateCount: this._updateCount,
        isComputing: this._isComputing,
        dependencies: this._dependencies,
        value: this._value
      };
    }
    debugSetValue(newValue) {
      this._value = newValue;
    }
    debugRecompute() {
      this.beginUpdate(this);
      try {
        if (!this._isComputing) {
          this._recompute();
        } else {
          this._state = DerivedState.stale;
        }
      } finally {
        this.endUpdate(this);
      }
    }
    setValue(newValue, tx, change) {
      this._value = newValue;
      const observers = this._observers;
      tx.updateObserver(this, this);
      for (const d of observers) {
        d.handleChange(this, change);
      }
    }
  };

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/observableInternal/observables/derived.js
  function derivedOpts(options, computeFn, debugLocation = DebugLocation.ofCaller()) {
    return new Derived(new DebugNameData(options.owner, options.debugName, options.debugReferenceFn), computeFn, void 0, options.onLastObserverRemoved, options.equalsFn ?? strictEquals, debugLocation);
  }
  _setDerivedOpts(derivedOpts);

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/observableInternal/base.js
  function handleBugIndicatingErrorRecovery(message) {
    const err = new Error("BugIndicatingErrorRecovery: " + message);
    onUnexpectedError(err);
    console.error("recovered from an error that indicates a bug", err);
  }

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/observableInternal/transaction.js
  function transaction(fn, getDebugName2) {
    const tx = new TransactionImpl(fn, getDebugName2);
    try {
      fn(tx);
    } finally {
      tx.finish();
    }
  }
  function subtransaction(tx, fn, getDebugName2) {
    if (!tx) {
      transaction(fn, getDebugName2);
    } else {
      fn(tx);
    }
  }
  var TransactionImpl = class {
    constructor(_fn, _getDebugName) {
      this._fn = _fn;
      this._getDebugName = _getDebugName;
      this._updatingObservers = [];
      getLogger()?.handleBeginTransaction(this);
    }
    getDebugName() {
      if (this._getDebugName) {
        return this._getDebugName();
      }
      return getFunctionName(this._fn);
    }
    updateObserver(observer, observable) {
      if (!this._updatingObservers) {
        handleBugIndicatingErrorRecovery("Transaction already finished!");
        transaction((tx) => {
          tx.updateObserver(observer, observable);
        });
        return;
      }
      this._updatingObservers.push({
        observer,
        observable
      });
      observer.beginUpdate(observable);
    }
    finish() {
      const updatingObservers = this._updatingObservers;
      if (!updatingObservers) {
        handleBugIndicatingErrorRecovery("transaction.finish() has already been called!");
        return;
      }
      for (let i = 0; i < updatingObservers.length; i++) {
        const {
          observer,
          observable
        } = updatingObservers[i];
        observer.endUpdate(observable);
      }
      this._updatingObservers = null;
      getLogger()?.handleEndTransaction(this);
    }
    debugGetUpdatingObservers() {
      return this._updatingObservers;
    }
  };

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/observableInternal/observables/observableValue.js
  function observableValue(nameOrOwner, initialValue, debugLocation = DebugLocation.ofCaller()) {
    let debugNameData;
    if (typeof nameOrOwner === "string") {
      debugNameData = new DebugNameData(void 0, nameOrOwner, void 0);
    } else {
      debugNameData = new DebugNameData(nameOrOwner, void 0, void 0);
    }
    return new ObservableValue(debugNameData, initialValue, strictEquals, debugLocation);
  }
  var ObservableValue = class extends BaseObservable {
    get debugName() {
      return this._debugNameData.getDebugName(this) ?? "ObservableValue";
    }
    constructor(_debugNameData, initialValue, _equalityComparator, debugLocation) {
      super(debugLocation);
      this._debugNameData = _debugNameData;
      this._equalityComparator = _equalityComparator;
      this._value = initialValue;
      getLogger()?.handleObservableUpdated(this, {
        hadValue: false,
        newValue: initialValue,
        change: void 0,
        didChange: true,
        oldValue: void 0
      });
    }
    get() {
      return this._value;
    }
    set(value, tx, change) {
      if (change === void 0 && this._equalityComparator(this._value, value)) {
        return;
      }
      let _tx;
      if (!tx) {
        tx = _tx = new TransactionImpl(() => {
        }, () => `Setting ${this.debugName}`);
      }
      try {
        const oldValue = this._value;
        this._setValue(value);
        getLogger()?.handleObservableUpdated(this, {
          oldValue,
          newValue: value,
          change,
          didChange: true,
          hadValue: true
        });
        for (const observer of this._observers) {
          tx.updateObserver(observer, this);
          observer.handleChange(this, change);
        }
      } finally {
        if (_tx) {
          _tx.finish();
        }
      }
    }
    toString() {
      return `${this.debugName}: ${this._value}`;
    }
    _setValue(newValue) {
      this._value = newValue;
    }
    debugGetState() {
      return {
        value: this._value
      };
    }
    debugSetValue(value) {
      this._value = value;
    }
  };

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/observableInternal/observables/observableFromEvent.js
  function observableFromEvent(...args) {
    let owner;
    let event;
    let getValue;
    let debugLocation;
    if (args.length === 2) {
      [event, getValue] = args;
    } else {
      [owner, event, getValue, debugLocation] = args;
    }
    return new FromEventObservable(new DebugNameData(owner, void 0, getValue), event, getValue, () => FromEventObservable.globalTransaction, strictEquals, debugLocation ?? DebugLocation.ofCaller());
  }
  var FromEventObservable = class extends BaseObservable {
    constructor(_debugNameData, event, _getValue, _getTransaction, _equalityComparator, debugLocation) {
      super(debugLocation);
      this._debugNameData = _debugNameData;
      this.event = event;
      this._getValue = _getValue;
      this._getTransaction = _getTransaction;
      this._equalityComparator = _equalityComparator;
      this._hasValue = false;
      this.handleEvent = (args) => {
        const newValue = this._getValue(args);
        const oldValue = this._value;
        const didChange = !this._hasValue || !this._equalityComparator(oldValue, newValue);
        let didRunTransaction = false;
        if (didChange) {
          this._value = newValue;
          if (this._hasValue) {
            didRunTransaction = true;
            subtransaction(this._getTransaction(), (tx) => {
              getLogger()?.handleObservableUpdated(this, {
                oldValue,
                newValue,
                change: void 0,
                didChange,
                hadValue: this._hasValue
              });
              for (const o of this._observers) {
                tx.updateObserver(o, this);
                o.handleChange(this, void 0);
              }
            }, () => {
              const name = this.getDebugName();
              return "Event fired" + (name ? `: ${name}` : "");
            });
          }
          this._hasValue = true;
        }
        if (!didRunTransaction) {
          getLogger()?.handleObservableUpdated(this, {
            oldValue,
            newValue,
            change: void 0,
            didChange,
            hadValue: this._hasValue
          });
        }
      };
    }
    getDebugName() {
      return this._debugNameData.getDebugName(this);
    }
    get debugName() {
      const name = this.getDebugName();
      return "From Event" + (name ? `: ${name}` : "");
    }
    onFirstObserverAdded() {
      this._subscription = this.event(this.handleEvent);
    }
    onLastObserverRemoved() {
      this._subscription.dispose();
      this._subscription = void 0;
      this._hasValue = false;
      this._value = void 0;
    }
    get() {
      if (this._subscription) {
        if (!this._hasValue) {
          this.handleEvent(void 0);
        }
        return this._value;
      } else {
        const value = this._getValue(void 0);
        return value;
      }
    }
    debugSetValue(value) {
      this._value = value;
    }
    debugGetState() {
      return {
        value: this._value,
        hasValue: this._hasValue
      };
    }
  };
  (function(observableFromEvent2) {
    observableFromEvent2.Observer = FromEventObservable;
    function batchEventsGlobally(tx, fn) {
      let didSet = false;
      if (FromEventObservable.globalTransaction === void 0) {
        FromEventObservable.globalTransaction = tx;
        didSet = true;
      }
      try {
        fn();
      } finally {
        if (didSet) {
          FromEventObservable.globalTransaction = void 0;
        }
      }
    }
    observableFromEvent2.batchEventsGlobally = batchEventsGlobally;
  })(observableFromEvent || (observableFromEvent = {}));

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/observableInternal/utils/utils.js
  function keepObserved(observable) {
    const o = new KeepAliveObserver(false, void 0);
    observable.addObserver(o);
    return toDisposable(() => {
      observable.removeObserver(o);
    });
  }
  _setKeepObserved(keepObserved);
  function recomputeInitiallyAndOnChange(observable, handleValue) {
    const o = new KeepAliveObserver(true, handleValue);
    observable.addObserver(o);
    try {
      o.beginUpdate(observable);
    } finally {
      o.endUpdate(observable);
    }
    return toDisposable(() => {
      observable.removeObserver(o);
    });
  }
  _setRecomputeInitiallyAndOnChange(recomputeInitiallyAndOnChange);
  var KeepAliveObserver = class {
    constructor(_forceRecompute, _handleValue) {
      this._forceRecompute = _forceRecompute;
      this._handleValue = _handleValue;
      this._counter = 0;
    }
    beginUpdate(observable) {
      this._counter++;
    }
    endUpdate(observable) {
      if (this._counter === 1 && this._forceRecompute) {
        if (this._handleValue) {
          this._handleValue(observable.get());
        } else {
          observable.reportChanges();
        }
      }
      this._counter--;
    }
    handlePossibleChange(observable) {
    }
    handleChange(observable, change) {
    }
  };

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/observableInternal/logging/consoleObservableLogger.js
  var consoleObservableLogger;
  function logObservableToConsole(obs) {
    if (!consoleObservableLogger) {
      consoleObservableLogger = new ConsoleObservableLogger();
      addLogger(consoleObservableLogger);
    }
    consoleObservableLogger.addFilteredObj(obs);
  }
  var ConsoleObservableLogger = class {
    constructor() {
      this.indentation = 0;
      this.changedObservablesSets = /* @__PURE__ */ new WeakMap();
    }
    addFilteredObj(obj) {
      if (!this._filteredObjects) {
        this._filteredObjects = /* @__PURE__ */ new Set();
      }
      this._filteredObjects.add(obj);
    }
    _isIncluded(obj) {
      return this._filteredObjects?.has(obj) ?? true;
    }
    textToConsoleArgs(text) {
      return consoleTextToArgs([normalText(repeat("|  ", this.indentation)), text]);
    }
    formatInfo(info) {
      if (!info.hadValue) {
        return [normalText(` `), styled(formatValue(info.newValue, 60), {
          color: "green"
        }), normalText(` (initial)`)];
      }
      return info.didChange ? [normalText(` `), styled(formatValue(info.oldValue, 70), {
        color: "red",
        strikeThrough: true
      }), normalText(` `), styled(formatValue(info.newValue, 60), {
        color: "green"
      })] : [normalText(` (unchanged)`)];
    }
    handleObservableCreated(observable) {
      if (observable instanceof Derived) {
        const derived2 = observable;
        this.changedObservablesSets.set(derived2, /* @__PURE__ */ new Set());
      }
    }
    handleOnListenerCountChanged(observable, newCount) {
    }
    handleObservableUpdated(observable, info) {
      if (!this._isIncluded(observable)) {
        return;
      }
      if (observable instanceof Derived) {
        this._handleDerivedRecomputed(observable, info);
        return;
      }
      console.log(
        ...this.textToConsoleArgs([formatKind("observable value changed"), styled(observable.debugName, {
          color: "BlueViolet"
        }), ...this.formatInfo(info)])
      );
    }
    formatChanges(changes) {
      if (changes.size === 0) {
        return void 0;
      }
      return styled(" (changed deps: " + [...changes].map((o) => o.debugName).join(", ") + ")", {
        color: "gray"
      });
    }
    handleDerivedDependencyChanged(derived2, observable, change) {
      if (!this._isIncluded(derived2)) {
        return;
      }
      this.changedObservablesSets.get(derived2)?.add(observable);
    }
    _handleDerivedRecomputed(derived2, info) {
      if (!this._isIncluded(derived2)) {
        return;
      }
      const changedObservables = this.changedObservablesSets.get(derived2);
      if (!changedObservables) {
        return;
      }
      console.log(
        ...this.textToConsoleArgs([formatKind("derived recomputed"), styled(derived2.debugName, {
          color: "BlueViolet"
        }), ...this.formatInfo(info), this.formatChanges(changedObservables), {
          data: [{
            fn: derived2._debugNameData.referenceFn ?? derived2._computeFn
          }]
        }])
      );
      changedObservables.clear();
    }
    handleDerivedCleared(derived2) {
      if (!this._isIncluded(derived2)) {
        return;
      }
      console.log(
        ...this.textToConsoleArgs([formatKind("derived cleared"), styled(derived2.debugName, {
          color: "BlueViolet"
        })])
      );
    }
    handleFromEventObservableTriggered(observable, info) {
      if (!this._isIncluded(observable)) {
        return;
      }
      console.log(...this.textToConsoleArgs([
        formatKind("observable from event triggered"),
        styled(observable.debugName, {
          color: "BlueViolet"
        }),
        ...this.formatInfo(info),
        {
          data: [{
            fn: observable._getValue
          }]
        }
      ]));
    }
    handleAutorunCreated(autorun2) {
      if (!this._isIncluded(autorun2)) {
        return;
      }
      this.changedObservablesSets.set(autorun2, /* @__PURE__ */ new Set());
    }
    handleAutorunDisposed(autorun2) {
    }
    handleAutorunDependencyChanged(autorun2, observable, change) {
      if (!this._isIncluded(autorun2)) {
        return;
      }
      this.changedObservablesSets.get(autorun2).add(observable);
    }
    handleAutorunStarted(autorun2) {
      const changedObservables = this.changedObservablesSets.get(autorun2);
      if (!changedObservables) {
        return;
      }
      if (this._isIncluded(autorun2)) {
        console.log(
          ...this.textToConsoleArgs([formatKind("autorun"), styled(autorun2.debugName, {
            color: "BlueViolet"
          }), this.formatChanges(changedObservables), {
            data: [{
              fn: autorun2._debugNameData.referenceFn ?? autorun2._runFn
            }]
          }])
        );
      }
      changedObservables.clear();
      this.indentation++;
    }
    handleAutorunFinished(autorun2) {
      this.indentation--;
    }
    handleBeginTransaction(transaction2) {
      let transactionName = transaction2.getDebugName();
      if (transactionName === void 0) {
        transactionName = "";
      }
      if (this._isIncluded(transaction2)) {
        console.log(
          ...this.textToConsoleArgs([formatKind("transaction"), styled(transactionName, {
            color: "BlueViolet"
          }), {
            data: [{
              fn: transaction2._fn
            }]
          }])
        );
      }
      this.indentation++;
    }
    handleEndTransaction() {
      this.indentation--;
    }
  };
  function consoleTextToArgs(text) {
    const styles = new Array();
    const data = [];
    let firstArg = "";
    function process2(t) {
      if ("length" in t) {
        for (const item of t) {
          if (item) {
            process2(item);
          }
        }
      } else if ("text" in t) {
        firstArg += `%c${t.text}`;
        styles.push(t.style);
        if (t.data) {
          data.push(...t.data);
        }
      } else if ("data" in t) {
        data.push(...t.data);
      }
    }
    process2(text);
    const result = [firstArg, ...styles];
    result.push(...data);
    return result;
  }
  function normalText(text) {
    return styled(text, {
      color: "black"
    });
  }
  function formatKind(kind) {
    return styled(padStr(`${kind}: `, 10), {
      color: "black",
      bold: true
    });
  }
  function styled(text, options = {
    color: "black"
  }) {
    function objToCss(styleObj) {
      return Object.entries(styleObj).reduce((styleString, [propName, propValue]) => {
        return `${styleString}${propName}:${propValue};`;
      }, "");
    }
    const style = {
      color: options.color
    };
    if (options.strikeThrough) {
      style["text-decoration"] = "line-through";
    }
    if (options.bold) {
      style["font-weight"] = "bold";
    }
    return {
      text,
      style: objToCss(style)
    };
  }
  function formatValue(value, availableLen) {
    switch (typeof value) {
      case "number":
        return "" + value;
      case "string":
        if (value.length + 2 <= availableLen) {
          return `"${value}"`;
        }
        return `"${value.substr(0, availableLen - 7)}"+...`;
      case "boolean":
        return value ? "true" : "false";
      case "undefined":
        return "undefined";
      case "object":
        if (value === null) {
          return "null";
        }
        if (Array.isArray(value)) {
          return formatArray(value, availableLen);
        }
        return formatObject(value, availableLen);
      case "symbol":
        return value.toString();
      case "function":
        return `[[Function${value.name ? " " + value.name : ""}]]`;
      default:
        return "" + value;
    }
  }
  function formatArray(value, availableLen) {
    let result = "[ ";
    let first = true;
    for (const val of value) {
      if (!first) {
        result += ", ";
      }
      if (result.length - 5 > availableLen) {
        result += "...";
        break;
      }
      first = false;
      result += `${formatValue(val, availableLen - result.length)}`;
    }
    result += " ]";
    return result;
  }
  function formatObject(value, availableLen) {
    if (typeof value.toString === "function" && value.toString !== Object.prototype.toString) {
      const val = value.toString();
      if (val.length <= availableLen) {
        return val;
      }
      return val.substring(0, availableLen - 3) + "...";
    }
    const className = getClassName(value);
    let result = className ? className + "(" : "{ ";
    let first = true;
    for (const [key, val] of Object.entries(value)) {
      if (!first) {
        result += ", ";
      }
      if (result.length - 5 > availableLen) {
        result += "...";
        break;
      }
      first = false;
      result += `${key}: ${formatValue(val, availableLen - result.length)}`;
    }
    result += className ? ")" : " }";
    return result;
  }
  function repeat(str, count) {
    let result = "";
    for (let i = 1; i <= count; i++) {
      result += str;
    }
    return result;
  }
  function padStr(str, length) {
    while (str.length < length) {
      str += " ";
    }
    return str;
  }

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/observableInternal/logging/debugger/rpc.js
  var SimpleTypedRpcConnection = class _SimpleTypedRpcConnection {
    static createHost(channelFactory, getHandler) {
      return new _SimpleTypedRpcConnection(channelFactory, getHandler);
    }
    static createClient(channelFactory, getHandler) {
      return new _SimpleTypedRpcConnection(channelFactory, getHandler);
    }
    constructor(_channelFactory, _getHandler) {
      this._channelFactory = _channelFactory;
      this._getHandler = _getHandler;
      this._channel = this._channelFactory({
        handleNotification: (notificationData) => {
          const m = notificationData;
          const fn = this._getHandler().notifications[m[0]];
          if (!fn) {
            throw new Error(`Unknown notification "${m[0]}"!`);
          }
          fn(...m[1]);
        },
        handleRequest: (requestData) => {
          const m = requestData;
          try {
            const result = this._getHandler().requests[m[0]](...m[1]);
            return {
              type: "result",
              value: result
            };
          } catch (e) {
            return {
              type: "error",
              value: e
            };
          }
        }
      });
      const requests = new Proxy({}, {
        get: (target, key) => {
          return async (...args) => {
            const result = await this._channel.sendRequest([key, args]);
            if (result.type === "error") {
              throw result.value;
            } else {
              return result.value;
            }
          };
        }
      });
      const notifications = new Proxy({}, {
        get: (target, key) => {
          return (...args) => {
            this._channel.sendNotification([key, args]);
          };
        }
      });
      this.api = {
        notifications,
        requests
      };
    }
  };

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/observableInternal/logging/debugger/debuggerRpc.js
  function registerDebugChannel(channelId, createClient) {
    const g = globalThis;
    let queuedNotifications = [];
    let curHost = void 0;
    const {
      channel,
      handler
    } = createChannelFactoryFromDebugChannel({
      sendNotification: (data) => {
        if (curHost) {
          curHost.sendNotification(data);
        } else {
          queuedNotifications.push(data);
        }
      }
    });
    let curClient = void 0;
    (g.$$debugValueEditor_debugChannels ?? (g.$$debugValueEditor_debugChannels = {}))[channelId] = (host) => {
      curClient = createClient();
      curHost = host;
      for (const n of queuedNotifications) {
        host.sendNotification(n);
      }
      queuedNotifications = [];
      return handler;
    };
    return SimpleTypedRpcConnection.createClient(channel, () => {
      if (!curClient) {
        throw new Error("Not supported");
      }
      return curClient;
    });
  }
  function createChannelFactoryFromDebugChannel(host) {
    let h;
    const channel = (handler) => {
      h = handler;
      return {
        sendNotification: (data) => {
          host.sendNotification(data);
        },
        sendRequest: (data) => {
          throw new Error("not supported");
        }
      };
    };
    return {
      channel,
      handler: {
        handleRequest: (data) => {
          if (data.type === "notification") {
            return h?.handleNotification(data.data);
          } else {
            return h?.handleRequest(data.data);
          }
        }
      }
    };
  }

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/observableInternal/logging/debugger/utils.js
  var Throttler = class {
    constructor() {
      this._timeout = void 0;
    }
    throttle(fn, timeoutMs) {
      if (this._timeout === void 0) {
        this._timeout = setTimeout(() => {
          this._timeout = void 0;
          fn();
        }, timeoutMs);
      }
    }
    dispose() {
      if (this._timeout !== void 0) {
        clearTimeout(this._timeout);
      }
    }
  };
  function deepAssign(target, source) {
    for (const key in source) {
      if (!!target[key] && typeof target[key] === "object" && !!source[key] && typeof source[key] === "object") {
        deepAssign(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }
  function deepAssignDeleteNulls(target, source) {
    for (const key in source) {
      if (source[key] === null) {
        delete target[key];
      } else if (!!target[key] && typeof target[key] === "object" && !!source[key] && typeof source[key] === "object") {
        deepAssignDeleteNulls(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/observableInternal/logging/debugger/devToolsLogger.js
  var DevToolsLogger = class _DevToolsLogger {
    static {
      this._instance = void 0;
    }
    static getInstance() {
      if (_DevToolsLogger._instance === void 0) {
        _DevToolsLogger._instance = new _DevToolsLogger();
      }
      return _DevToolsLogger._instance;
    }
    getTransactionState() {
      const affected = [];
      const txs = [...this._activeTransactions];
      if (txs.length === 0) {
        return void 0;
      }
      const observerQueue = txs.flatMap((t) => t.debugGetUpdatingObservers() ?? []).map((o) => o.observer);
      const processedObservers = /* @__PURE__ */ new Set();
      while (observerQueue.length > 0) {
        const observer = observerQueue.shift();
        if (processedObservers.has(observer)) {
          continue;
        }
        processedObservers.add(observer);
        const state = this._getInfo(observer, (d) => {
          if (!processedObservers.has(d)) {
            observerQueue.push(d);
          }
        });
        if (state) {
          affected.push(state);
        }
      }
      return {
        names: txs.map((t) => t.getDebugName() ?? "tx"),
        affected
      };
    }
    _getObservableInfo(observable) {
      const info = this._instanceInfos.get(observable);
      if (!info) {
        onUnexpectedError(new BugIndicatingError("No info found"));
        return void 0;
      }
      return info;
    }
    _getAutorunInfo(autorun2) {
      const info = this._instanceInfos.get(autorun2);
      if (!info) {
        onUnexpectedError(new BugIndicatingError("No info found"));
        return void 0;
      }
      return info;
    }
    _getInfo(observer, queue) {
      if (observer instanceof Derived) {
        const observersToUpdate = [...observer.debugGetObservers()];
        for (const o of observersToUpdate) {
          queue(o);
        }
        const info = this._getObservableInfo(observer);
        if (!info) {
          return;
        }
        const observerState = observer.debugGetState();
        const base = {
          name: observer.debugName,
          instanceId: info.instanceId,
          updateCount: observerState.updateCount
        };
        const changedDependencies = [...info.changedObservables].map((o) => this._instanceInfos.get(o)?.instanceId).filter(isDefined);
        if (observerState.isComputing) {
          return {
            ...base,
            type: "observable/derived",
            state: "updating",
            changedDependencies,
            initialComputation: false
          };
        }
        switch (observerState.state) {
          case DerivedState.initial:
            return {
              ...base,
              type: "observable/derived",
              state: "noValue"
            };
          case DerivedState.upToDate:
            return {
              ...base,
              type: "observable/derived",
              state: "upToDate"
            };
          case DerivedState.stale:
            return {
              ...base,
              type: "observable/derived",
              state: "stale",
              changedDependencies
            };
          case DerivedState.dependenciesMightHaveChanged:
            return {
              ...base,
              type: "observable/derived",
              state: "possiblyStale"
            };
        }
      } else if (observer instanceof AutorunObserver) {
        const info = this._getAutorunInfo(observer);
        if (!info) {
          return void 0;
        }
        const base = {
          name: observer.debugName,
          instanceId: info.instanceId,
          updateCount: info.updateCount
        };
        const changedDependencies = [...info.changedObservables].map((o) => this._instanceInfos.get(o).instanceId);
        if (observer.debugGetState().isRunning) {
          return {
            ...base,
            type: "autorun",
            state: "updating",
            changedDependencies
          };
        }
        switch (observer.debugGetState().state) {
          case AutorunState.upToDate:
            return {
              ...base,
              type: "autorun",
              state: "upToDate"
            };
          case AutorunState.stale:
            return {
              ...base,
              type: "autorun",
              state: "stale",
              changedDependencies
            };
          case AutorunState.dependenciesMightHaveChanged:
            return {
              ...base,
              type: "autorun",
              state: "possiblyStale"
            };
        }
      }
      return void 0;
    }
    _formatObservable(obs) {
      const info = this._getObservableInfo(obs);
      if (!info) {
        return void 0;
      }
      return {
        name: obs.debugName,
        instanceId: info.instanceId
      };
    }
    _formatObserver(obs) {
      if (obs instanceof Derived) {
        return {
          name: obs.toString(),
          instanceId: this._getObservableInfo(obs)?.instanceId
        };
      }
      const autorunInfo = this._getAutorunInfo(obs);
      if (autorunInfo) {
        return {
          name: obs.toString(),
          instanceId: autorunInfo.instanceId
        };
      }
      return void 0;
    }
    constructor() {
      this._declarationId = 0;
      this._instanceId = 0;
      this._declarations = /* @__PURE__ */ new Map();
      this._instanceInfos = /* @__PURE__ */ new WeakMap();
      this._aliveInstances = /* @__PURE__ */ new Map();
      this._activeTransactions = /* @__PURE__ */ new Set();
      this._channel = registerDebugChannel("observableDevTools", () => {
        return {
          notifications: {
            setDeclarationIdFilter: (declarationIds) => {
            },
            logObservableValue: (observableId) => {
              console.log("logObservableValue", observableId);
            },
            flushUpdates: () => {
              this._flushUpdates();
            },
            resetUpdates: () => {
              this._pendingChanges = null;
              this._channel.api.notifications.handleChange(this._fullState, true);
            }
          },
          requests: {
            getDeclarations: () => {
              const result = {};
              for (const decl of this._declarations.values()) {
                result[decl.id] = decl;
              }
              return {
                decls: result
              };
            },
            getSummarizedInstances: () => {
              return null;
            },
            getObservableValueInfo: (instanceId) => {
              const obs = this._aliveInstances.get(instanceId);
              return {
                observers: [...obs.debugGetObservers()].map((d) => this._formatObserver(d)).filter(isDefined)
              };
            },
            getDerivedInfo: (instanceId) => {
              const d = this._aliveInstances.get(instanceId);
              return {
                dependencies: [...d.debugGetState().dependencies].map((d2) => this._formatObservable(d2)).filter(isDefined),
                observers: [...d.debugGetObservers()].map((d2) => this._formatObserver(d2)).filter(isDefined)
              };
            },
            getAutorunInfo: (instanceId) => {
              const obs = this._aliveInstances.get(instanceId);
              return {
                dependencies: [...obs.debugGetState().dependencies].map((d) => this._formatObservable(d)).filter(isDefined)
              };
            },
            getTransactionState: () => {
              return this.getTransactionState();
            },
            setValue: (instanceId, jsonValue) => {
              const obs = this._aliveInstances.get(instanceId);
              if (obs instanceof Derived) {
                obs.debugSetValue(jsonValue);
              } else if (obs instanceof ObservableValue) {
                obs.debugSetValue(jsonValue);
              } else if (obs instanceof FromEventObservable) {
                obs.debugSetValue(jsonValue);
              } else {
                throw new BugIndicatingError("Observable is not supported");
              }
              const observers = [...obs.debugGetObservers()];
              for (const d of observers) {
                d.beginUpdate(obs);
              }
              for (const d of observers) {
                d.handleChange(obs, void 0);
              }
              for (const d of observers) {
                d.endUpdate(obs);
              }
            },
            getValue: (instanceId) => {
              const obs = this._aliveInstances.get(instanceId);
              if (obs instanceof Derived) {
                return formatValue(obs.debugGetState().value, 200);
              } else if (obs instanceof ObservableValue) {
                return formatValue(obs.debugGetState().value, 200);
              }
              return void 0;
            },
            logValue: (instanceId) => {
              const obs = this._aliveInstances.get(instanceId);
              if (obs && "get" in obs) {
                console.log("Logged Value:", obs.get());
              } else {
                throw new BugIndicatingError("Observable is not supported");
              }
            },
            rerun: (instanceId) => {
              const obs = this._aliveInstances.get(instanceId);
              if (obs instanceof Derived) {
                obs.debugRecompute();
              } else if (obs instanceof AutorunObserver) {
                obs.debugRerun();
              } else {
                throw new BugIndicatingError("Observable is not supported");
              }
            }
          }
        };
      });
      this._pendingChanges = null;
      this._changeThrottler = new Throttler();
      this._fullState = {};
      this._flushUpdates = () => {
        if (this._pendingChanges !== null) {
          this._channel.api.notifications.handleChange(this._pendingChanges, false);
          this._pendingChanges = null;
        }
      };
      DebugLocation.enable();
    }
    _handleChange(update) {
      deepAssignDeleteNulls(this._fullState, update);
      if (this._pendingChanges === null) {
        this._pendingChanges = update;
      } else {
        deepAssign(this._pendingChanges, update);
      }
      this._changeThrottler.throttle(this._flushUpdates, 10);
    }
    _getDeclarationId(type, location) {
      if (!location) {
        return -1;
      }
      let decInfo = this._declarations.get(location.id);
      if (decInfo === void 0) {
        decInfo = {
          id: this._declarationId++,
          type,
          url: location.fileName,
          line: location.line,
          column: location.column
        };
        this._declarations.set(location.id, decInfo);
        this._handleChange({
          decls: {
            [decInfo.id]: decInfo
          }
        });
      }
      return decInfo.id;
    }
    handleObservableCreated(observable, location) {
      const declarationId = this._getDeclarationId("observable/value", location);
      const info = {
        declarationId,
        instanceId: this._instanceId++,
        listenerCount: 0,
        lastValue: void 0,
        updateCount: 0,
        changedObservables: /* @__PURE__ */ new Set()
      };
      this._instanceInfos.set(observable, info);
    }
    handleOnListenerCountChanged(observable, newCount) {
      const info = this._getObservableInfo(observable);
      if (!info) {
        return;
      }
      if (info.listenerCount === 0 && newCount > 0) {
        const type = observable instanceof Derived ? "observable/derived" : "observable/value";
        this._aliveInstances.set(info.instanceId, observable);
        this._handleChange({
          instances: {
            [info.instanceId]: {
              instanceId: info.instanceId,
              declarationId: info.declarationId,
              formattedValue: info.lastValue,
              type,
              name: observable.debugName
            }
          }
        });
      } else if (info.listenerCount > 0 && newCount === 0) {
        this._handleChange({
          instances: {
            [info.instanceId]: null
          }
        });
        this._aliveInstances.delete(info.instanceId);
      }
      info.listenerCount = newCount;
    }
    handleObservableUpdated(observable, changeInfo) {
      if (observable instanceof Derived) {
        this._handleDerivedRecomputed(observable, changeInfo);
        return;
      }
      const info = this._getObservableInfo(observable);
      if (info) {
        if (changeInfo.didChange) {
          info.lastValue = formatValue(changeInfo.newValue, 30);
          if (info.listenerCount > 0) {
            this._handleChange({
              instances: {
                [info.instanceId]: {
                  formattedValue: info.lastValue
                }
              }
            });
          }
        }
      }
    }
    handleAutorunCreated(autorun2, location) {
      const declarationId = this._getDeclarationId("autorun", location);
      const info = {
        declarationId,
        instanceId: this._instanceId++,
        updateCount: 0,
        changedObservables: /* @__PURE__ */ new Set()
      };
      this._instanceInfos.set(autorun2, info);
      this._aliveInstances.set(info.instanceId, autorun2);
      if (info) {
        this._handleChange({
          instances: {
            [info.instanceId]: {
              instanceId: info.instanceId,
              declarationId: info.declarationId,
              runCount: 0,
              type: "autorun",
              name: autorun2.debugName
            }
          }
        });
      }
    }
    handleAutorunDisposed(autorun2) {
      const info = this._getAutorunInfo(autorun2);
      if (!info) {
        return;
      }
      this._handleChange({
        instances: {
          [info.instanceId]: null
        }
      });
      this._instanceInfos.delete(autorun2);
      this._aliveInstances.delete(info.instanceId);
    }
    handleAutorunDependencyChanged(autorun2, observable, change) {
      const info = this._getAutorunInfo(autorun2);
      if (!info) {
        return;
      }
      info.changedObservables.add(observable);
    }
    handleAutorunStarted(autorun2) {
    }
    handleAutorunFinished(autorun2) {
      const info = this._getAutorunInfo(autorun2);
      if (!info) {
        return;
      }
      info.changedObservables.clear();
      info.updateCount++;
      this._handleChange({
        instances: {
          [info.instanceId]: {
            runCount: info.updateCount
          }
        }
      });
    }
    handleDerivedDependencyChanged(derived2, observable, change) {
      const info = this._getObservableInfo(derived2);
      if (info) {
        info.changedObservables.add(observable);
      }
    }
    _handleDerivedRecomputed(observable, changeInfo) {
      const info = this._getObservableInfo(observable);
      if (!info) {
        return;
      }
      const formattedValue = formatValue(changeInfo.newValue, 30);
      info.updateCount++;
      info.changedObservables.clear();
      info.lastValue = formattedValue;
      if (info.listenerCount > 0) {
        this._handleChange({
          instances: {
            [info.instanceId]: {
              formattedValue,
              recomputationCount: info.updateCount
            }
          }
        });
      }
    }
    handleDerivedCleared(observable) {
      const info = this._getObservableInfo(observable);
      if (!info) {
        return;
      }
      info.lastValue = void 0;
      info.changedObservables.clear();
      if (info.listenerCount > 0) {
        this._handleChange({
          instances: {
            [info.instanceId]: {
              formattedValue: void 0
            }
          }
        });
      }
    }
    handleBeginTransaction(transaction2) {
      this._activeTransactions.add(transaction2);
    }
    handleEndTransaction(transaction2) {
      this._activeTransactions.delete(transaction2);
    }
  };

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/observableInternal/logging/debugGetDependencyGraph.js
  function debugGetObservableGraph(obs, options) {
    const debugNamePostProcessor = options?.debugNamePostProcessor ?? ((str) => str);
    const info = Info.from(obs, debugNamePostProcessor);
    if (!info) {
      return "";
    }
    const alreadyListed = /* @__PURE__ */ new Set();
    if (options.type === "observers") {
      return formatObservableInfoWithObservers(info, 0, alreadyListed, options).trim();
    } else {
      return formatObservableInfoWithDependencies(info, 0, alreadyListed, options).trim();
    }
  }
  function formatObservableInfoWithDependencies(info, indentLevel, alreadyListed, options) {
    const indent = "		".repeat(indentLevel);
    const lines = [];
    const isAlreadyListed = alreadyListed.has(info.sourceObj);
    if (isAlreadyListed) {
      lines.push(`${indent}* ${info.type} ${info.name} (already listed)`);
      return lines.join("\n");
    }
    alreadyListed.add(info.sourceObj);
    lines.push(`${indent}* ${info.type} ${info.name}:`);
    lines.push(`${indent}  value: ${formatValue(info.value, 50)}`);
    lines.push(`${indent}  state: ${info.state}`);
    if (info.dependencies.length > 0) {
      lines.push(`${indent}  dependencies:`);
      for (const dep of info.dependencies) {
        const info2 = Info.from(dep, options.debugNamePostProcessor ?? ((name) => name)) ?? Info.unknown(dep);
        lines.push(
          formatObservableInfoWithDependencies(info2, indentLevel + 1, alreadyListed, options)
        );
      }
    }
    return lines.join("\n");
  }
  function formatObservableInfoWithObservers(info, indentLevel, alreadyListed, options) {
    const indent = "		".repeat(indentLevel);
    const lines = [];
    const isAlreadyListed = alreadyListed.has(info.sourceObj);
    if (isAlreadyListed) {
      lines.push(`${indent}* ${info.type} ${info.name} (already listed)`);
      return lines.join("\n");
    }
    alreadyListed.add(info.sourceObj);
    lines.push(`${indent}* ${info.type} ${info.name}:`);
    lines.push(`${indent}  value: ${formatValue(info.value, 50)}`);
    lines.push(`${indent}  state: ${info.state}`);
    if (info.observers.length > 0) {
      lines.push(`${indent}  observers:`);
      for (const observer of info.observers) {
        const info2 = Info.from(observer, options.debugNamePostProcessor ?? ((name) => name)) ?? Info.unknown(observer);
        lines.push(
          formatObservableInfoWithObservers(info2, indentLevel + 1, alreadyListed, options)
        );
      }
    }
    return lines.join("\n");
  }
  var Info = class _Info {
    static from(obs, debugNamePostProcessor) {
      if (obs instanceof AutorunObserver) {
        const state = obs.debugGetState();
        return new _Info(
          obs,
          debugNamePostProcessor(obs.debugName),
          "autorun",
          void 0,
          state.stateStr,
          Array.from(state.dependencies),
          []
        );
      } else if (obs instanceof Derived) {
        const state = obs.debugGetState();
        return new _Info(
          obs,
          debugNamePostProcessor(obs.debugName),
          "derived",
          state.value,
          state.stateStr,
          Array.from(state.dependencies),
          Array.from(obs.debugGetObservers())
        );
      } else if (obs instanceof ObservableValue) {
        const state = obs.debugGetState();
        return new _Info(
          obs,
          debugNamePostProcessor(obs.debugName),
          "observableValue",
          state.value,
          "upToDate",
          [],
          Array.from(obs.debugGetObservers())
        );
      } else if (obs instanceof FromEventObservable) {
        const state = obs.debugGetState();
        return new _Info(
          obs,
          debugNamePostProcessor(obs.debugName),
          "fromEvent",
          state.value,
          state.hasValue ? "upToDate" : "initial",
          [],
          Array.from(obs.debugGetObservers())
        );
      }
      return void 0;
    }
    static unknown(obs) {
      return new _Info(obs, "(unknown)", "unknown", void 0, "unknown", [], []);
    }
    constructor(sourceObj, name, type, value, state, dependencies, observers) {
      this.sourceObj = sourceObj;
      this.name = name;
      this.type = type;
      this.value = value;
      this.state = state;
      this.dependencies = dependencies;
      this.observers = observers;
    }
  };

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/observableInternal/index.js
  _setDebugGetObservableGraph(debugGetObservableGraph);
  setLogObservableFn(logObservableToConsole);
  if (env && env["VSCODE_DEV_DEBUG_OBSERVABLES"]) {
    addLogger(DevToolsLogger.getInstance());
  }

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/editor/common/core/ranges/offsetRange.js
  var OffsetRange = class _OffsetRange {
    static fromTo(start, endExclusive) {
      return new _OffsetRange(start, endExclusive);
    }
    static equals(r1, r2) {
      return r1.start === r2.start && r1.endExclusive === r2.endExclusive;
    }
    static addRange(range, sortedRanges) {
      let i = 0;
      while (i < sortedRanges.length && sortedRanges[i].endExclusive < range.start) {
        i++;
      }
      let j = i;
      while (j < sortedRanges.length && sortedRanges[j].start <= range.endExclusive) {
        j++;
      }
      if (i === j) {
        sortedRanges.splice(i, 0, range);
      } else {
        const start = Math.min(range.start, sortedRanges[i].start);
        const end = Math.max(range.endExclusive, sortedRanges[j - 1].endExclusive);
        sortedRanges.splice(i, j - i, new _OffsetRange(start, end));
      }
    }
    static tryCreate(start, endExclusive) {
      if (start > endExclusive) {
        return void 0;
      }
      return new _OffsetRange(start, endExclusive);
    }
    static ofLength(length) {
      return new _OffsetRange(0, length);
    }
    static ofStartAndLength(start, length) {
      return new _OffsetRange(start, start + length);
    }
    static emptyAt(offset) {
      return new _OffsetRange(offset, offset);
    }
    constructor(start, endExclusive) {
      this.start = start;
      this.endExclusive = endExclusive;
      if (start > endExclusive) {
        throw new BugIndicatingError(`Invalid range: ${this.toString()}`);
      }
    }
    get isEmpty() {
      return this.start === this.endExclusive;
    }
    delta(offset) {
      return new _OffsetRange(this.start + offset, this.endExclusive + offset);
    }
    deltaStart(offset) {
      return new _OffsetRange(this.start + offset, this.endExclusive);
    }
    deltaEnd(offset) {
      return new _OffsetRange(this.start, this.endExclusive + offset);
    }
    get length() {
      return this.endExclusive - this.start;
    }
    toString() {
      return `[${this.start}, ${this.endExclusive})`;
    }
    equals(other) {
      return this.start === other.start && this.endExclusive === other.endExclusive;
    }
    containsRange(other) {
      return this.start <= other.start && other.endExclusive <= this.endExclusive;
    }
    contains(offset) {
      return this.start <= offset && offset < this.endExclusive;
    }
    join(other) {
      return new _OffsetRange(
        Math.min(this.start, other.start),
        Math.max(this.endExclusive, other.endExclusive)
      );
    }
    intersect(other) {
      const start = Math.max(this.start, other.start);
      const end = Math.min(this.endExclusive, other.endExclusive);
      if (start <= end) {
        return new _OffsetRange(start, end);
      }
      return void 0;
    }
    intersectionLength(range) {
      const start = Math.max(this.start, range.start);
      const end = Math.min(this.endExclusive, range.endExclusive);
      return Math.max(0, end - start);
    }
    intersects(other) {
      const start = Math.max(this.start, other.start);
      const end = Math.min(this.endExclusive, other.endExclusive);
      return start < end;
    }
    intersectsOrTouches(other) {
      const start = Math.max(this.start, other.start);
      const end = Math.min(this.endExclusive, other.endExclusive);
      return start <= end;
    }
    isBefore(other) {
      return this.endExclusive <= other.start;
    }
    isAfter(other) {
      return this.start >= other.endExclusive;
    }
    slice(arr) {
      return arr.slice(this.start, this.endExclusive);
    }
    substring(str) {
      return str.substring(this.start, this.endExclusive);
    }
    clip(value) {
      if (this.isEmpty) {
        throw new BugIndicatingError(`Invalid clipping range: ${this.toString()}`);
      }
      return Math.max(this.start, Math.min(this.endExclusive - 1, value));
    }
    clipCyclic(value) {
      if (this.isEmpty) {
        throw new BugIndicatingError(`Invalid clipping range: ${this.toString()}`);
      }
      if (value < this.start) {
        return this.endExclusive - (this.start - value) % this.length;
      }
      if (value >= this.endExclusive) {
        return this.start + (value - this.start) % this.length;
      }
      return value;
    }
    map(f) {
      const result = [];
      for (let i = this.start; i < this.endExclusive; i++) {
        result.push(f(i));
      }
      return result;
    }
    forEach(f) {
      for (let i = this.start; i < this.endExclusive; i++) {
        f(i);
      }
    }
    joinRightTouching(range) {
      if (this.endExclusive !== range.start) {
        throw new BugIndicatingError(`Invalid join: ${this.toString()} and ${range.toString()}`);
      }
      return new _OffsetRange(this.start, range.endExclusive);
    }
    withMargin(marginStart, marginEnd) {
      if (marginEnd === void 0) {
        marginEnd = marginStart;
      }
      return new _OffsetRange(this.start - marginStart, this.endExclusive + marginEnd);
    }
  };

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/editor/common/core/position.js
  var Position = class _Position {
    constructor(lineNumber, column) {
      this.lineNumber = lineNumber;
      this.column = column;
    }
    with(newLineNumber = this.lineNumber, newColumn = this.column) {
      if (newLineNumber === this.lineNumber && newColumn === this.column) {
        return this;
      } else {
        return new _Position(newLineNumber, newColumn);
      }
    }
    delta(deltaLineNumber = 0, deltaColumn = 0) {
      return this.with(
        Math.max(1, this.lineNumber + deltaLineNumber),
        Math.max(1, this.column + deltaColumn)
      );
    }
    equals(other) {
      return _Position.equals(this, other);
    }
    static equals(a, b) {
      if (!a && !b) {
        return true;
      }
      return !!a && !!b && a.lineNumber === b.lineNumber && a.column === b.column;
    }
    isBefore(other) {
      return _Position.isBefore(this, other);
    }
    static isBefore(a, b) {
      if (a.lineNumber < b.lineNumber) {
        return true;
      }
      if (b.lineNumber < a.lineNumber) {
        return false;
      }
      return a.column < b.column;
    }
    isBeforeOrEqual(other) {
      return _Position.isBeforeOrEqual(this, other);
    }
    static isBeforeOrEqual(a, b) {
      if (a.lineNumber < b.lineNumber) {
        return true;
      }
      if (b.lineNumber < a.lineNumber) {
        return false;
      }
      return a.column <= b.column;
    }
    static compare(a, b) {
      const aLineNumber = a.lineNumber | 0;
      const bLineNumber = b.lineNumber | 0;
      if (aLineNumber === bLineNumber) {
        const aColumn = a.column | 0;
        const bColumn = b.column | 0;
        return aColumn - bColumn;
      }
      return aLineNumber - bLineNumber;
    }
    clone() {
      return new _Position(this.lineNumber, this.column);
    }
    toString() {
      return "(" + this.lineNumber + "," + this.column + ")";
    }
    static lift(pos) {
      return new _Position(pos.lineNumber, pos.column);
    }
    static isIPosition(obj) {
      return !!obj && typeof obj.lineNumber === "number" && typeof obj.column === "number";
    }
    toJSON() {
      return {
        lineNumber: this.lineNumber,
        column: this.column
      };
    }
  };

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/editor/common/core/range.js
  var Range = class _Range {
    constructor(startLineNumber, startColumn, endLineNumber, endColumn) {
      if (startLineNumber > endLineNumber || startLineNumber === endLineNumber && startColumn > endColumn) {
        this.startLineNumber = endLineNumber;
        this.startColumn = endColumn;
        this.endLineNumber = startLineNumber;
        this.endColumn = startColumn;
      } else {
        this.startLineNumber = startLineNumber;
        this.startColumn = startColumn;
        this.endLineNumber = endLineNumber;
        this.endColumn = endColumn;
      }
    }
    isEmpty() {
      return _Range.isEmpty(this);
    }
    static isEmpty(range) {
      return range.startLineNumber === range.endLineNumber && range.startColumn === range.endColumn;
    }
    containsPosition(position) {
      return _Range.containsPosition(this, position);
    }
    static containsPosition(range, position) {
      if (position.lineNumber < range.startLineNumber || position.lineNumber > range.endLineNumber) {
        return false;
      }
      if (position.lineNumber === range.startLineNumber && position.column < range.startColumn) {
        return false;
      }
      if (position.lineNumber === range.endLineNumber && position.column > range.endColumn) {
        return false;
      }
      return true;
    }
    static strictContainsPosition(range, position) {
      if (position.lineNumber < range.startLineNumber || position.lineNumber > range.endLineNumber) {
        return false;
      }
      if (position.lineNumber === range.startLineNumber && position.column <= range.startColumn) {
        return false;
      }
      if (position.lineNumber === range.endLineNumber && position.column >= range.endColumn) {
        return false;
      }
      return true;
    }
    containsRange(range) {
      return _Range.containsRange(this, range);
    }
    static containsRange(range, otherRange) {
      if (otherRange.startLineNumber < range.startLineNumber || otherRange.endLineNumber < range.startLineNumber) {
        return false;
      }
      if (otherRange.startLineNumber > range.endLineNumber || otherRange.endLineNumber > range.endLineNumber) {
        return false;
      }
      if (otherRange.startLineNumber === range.startLineNumber && otherRange.startColumn < range.startColumn) {
        return false;
      }
      if (otherRange.endLineNumber === range.endLineNumber && otherRange.endColumn > range.endColumn) {
        return false;
      }
      return true;
    }
    strictContainsRange(range) {
      return _Range.strictContainsRange(this, range);
    }
    static strictContainsRange(range, otherRange) {
      if (otherRange.startLineNumber < range.startLineNumber || otherRange.endLineNumber < range.startLineNumber) {
        return false;
      }
      if (otherRange.startLineNumber > range.endLineNumber || otherRange.endLineNumber > range.endLineNumber) {
        return false;
      }
      if (otherRange.startLineNumber === range.startLineNumber && otherRange.startColumn <= range.startColumn) {
        return false;
      }
      if (otherRange.endLineNumber === range.endLineNumber && otherRange.endColumn >= range.endColumn) {
        return false;
      }
      return true;
    }
    plusRange(range) {
      return _Range.plusRange(this, range);
    }
    static plusRange(a, b) {
      let startLineNumber;
      let startColumn;
      let endLineNumber;
      let endColumn;
      if (b.startLineNumber < a.startLineNumber) {
        startLineNumber = b.startLineNumber;
        startColumn = b.startColumn;
      } else if (b.startLineNumber === a.startLineNumber) {
        startLineNumber = b.startLineNumber;
        startColumn = Math.min(b.startColumn, a.startColumn);
      } else {
        startLineNumber = a.startLineNumber;
        startColumn = a.startColumn;
      }
      if (b.endLineNumber > a.endLineNumber) {
        endLineNumber = b.endLineNumber;
        endColumn = b.endColumn;
      } else if (b.endLineNumber === a.endLineNumber) {
        endLineNumber = b.endLineNumber;
        endColumn = Math.max(b.endColumn, a.endColumn);
      } else {
        endLineNumber = a.endLineNumber;
        endColumn = a.endColumn;
      }
      return new _Range(startLineNumber, startColumn, endLineNumber, endColumn);
    }
    intersectRanges(range) {
      return _Range.intersectRanges(this, range);
    }
    static intersectRanges(a, b) {
      let resultStartLineNumber = a.startLineNumber;
      let resultStartColumn = a.startColumn;
      let resultEndLineNumber = a.endLineNumber;
      let resultEndColumn = a.endColumn;
      const otherStartLineNumber = b.startLineNumber;
      const otherStartColumn = b.startColumn;
      const otherEndLineNumber = b.endLineNumber;
      const otherEndColumn = b.endColumn;
      if (resultStartLineNumber < otherStartLineNumber) {
        resultStartLineNumber = otherStartLineNumber;
        resultStartColumn = otherStartColumn;
      } else if (resultStartLineNumber === otherStartLineNumber) {
        resultStartColumn = Math.max(resultStartColumn, otherStartColumn);
      }
      if (resultEndLineNumber > otherEndLineNumber) {
        resultEndLineNumber = otherEndLineNumber;
        resultEndColumn = otherEndColumn;
      } else if (resultEndLineNumber === otherEndLineNumber) {
        resultEndColumn = Math.min(resultEndColumn, otherEndColumn);
      }
      if (resultStartLineNumber > resultEndLineNumber) {
        return null;
      }
      if (resultStartLineNumber === resultEndLineNumber && resultStartColumn > resultEndColumn) {
        return null;
      }
      return new _Range(
        resultStartLineNumber,
        resultStartColumn,
        resultEndLineNumber,
        resultEndColumn
      );
    }
    equalsRange(other) {
      return _Range.equalsRange(this, other);
    }
    static equalsRange(a, b) {
      if (!a && !b) {
        return true;
      }
      return !!a && !!b && a.startLineNumber === b.startLineNumber && a.startColumn === b.startColumn && a.endLineNumber === b.endLineNumber && a.endColumn === b.endColumn;
    }
    getEndPosition() {
      return _Range.getEndPosition(this);
    }
    static getEndPosition(range) {
      return new Position(range.endLineNumber, range.endColumn);
    }
    getStartPosition() {
      return _Range.getStartPosition(this);
    }
    static getStartPosition(range) {
      return new Position(range.startLineNumber, range.startColumn);
    }
    toString() {
      return "[" + this.startLineNumber + "," + this.startColumn + " -> " + this.endLineNumber + "," + this.endColumn + "]";
    }
    setEndPosition(endLineNumber, endColumn) {
      return new _Range(this.startLineNumber, this.startColumn, endLineNumber, endColumn);
    }
    setStartPosition(startLineNumber, startColumn) {
      return new _Range(startLineNumber, startColumn, this.endLineNumber, this.endColumn);
    }
    collapseToStart() {
      return _Range.collapseToStart(this);
    }
    static collapseToStart(range) {
      return new _Range(
        range.startLineNumber,
        range.startColumn,
        range.startLineNumber,
        range.startColumn
      );
    }
    collapseToEnd() {
      return _Range.collapseToEnd(this);
    }
    static collapseToEnd(range) {
      return new _Range(range.endLineNumber, range.endColumn, range.endLineNumber, range.endColumn);
    }
    delta(lineCount) {
      return new _Range(
        this.startLineNumber + lineCount,
        this.startColumn,
        this.endLineNumber + lineCount,
        this.endColumn
      );
    }
    isSingleLine() {
      return this.startLineNumber === this.endLineNumber;
    }
    static fromPositions(start, end = start) {
      return new _Range(start.lineNumber, start.column, end.lineNumber, end.column);
    }
    static lift(range) {
      if (!range) {
        return null;
      }
      return new _Range(
        range.startLineNumber,
        range.startColumn,
        range.endLineNumber,
        range.endColumn
      );
    }
    static isIRange(obj) {
      return !!obj && typeof obj.startLineNumber === "number" && typeof obj.startColumn === "number" && typeof obj.endLineNumber === "number" && typeof obj.endColumn === "number";
    }
    static areIntersectingOrTouching(a, b) {
      if (a.endLineNumber < b.startLineNumber || a.endLineNumber === b.startLineNumber && a.endColumn < b.startColumn) {
        return false;
      }
      if (b.endLineNumber < a.startLineNumber || b.endLineNumber === a.startLineNumber && b.endColumn < a.startColumn) {
        return false;
      }
      return true;
    }
    static areIntersecting(a, b) {
      if (a.endLineNumber < b.startLineNumber || a.endLineNumber === b.startLineNumber && a.endColumn <= b.startColumn) {
        return false;
      }
      if (b.endLineNumber < a.startLineNumber || b.endLineNumber === a.startLineNumber && b.endColumn <= a.startColumn) {
        return false;
      }
      return true;
    }
    static areOnlyIntersecting(a, b) {
      if (a.endLineNumber < b.startLineNumber - 1 || a.endLineNumber === b.startLineNumber && a.endColumn < b.startColumn - 1) {
        return false;
      }
      if (b.endLineNumber < a.startLineNumber - 1 || b.endLineNumber === a.startLineNumber && b.endColumn < a.startColumn - 1) {
        return false;
      }
      return true;
    }
    static compareRangesUsingStarts(a, b) {
      if (a && b) {
        const aStartLineNumber = a.startLineNumber | 0;
        const bStartLineNumber = b.startLineNumber | 0;
        if (aStartLineNumber === bStartLineNumber) {
          const aStartColumn = a.startColumn | 0;
          const bStartColumn = b.startColumn | 0;
          if (aStartColumn === bStartColumn) {
            const aEndLineNumber = a.endLineNumber | 0;
            const bEndLineNumber = b.endLineNumber | 0;
            if (aEndLineNumber === bEndLineNumber) {
              const aEndColumn = a.endColumn | 0;
              const bEndColumn = b.endColumn | 0;
              return aEndColumn - bEndColumn;
            }
            return aEndLineNumber - bEndLineNumber;
          }
          return aStartColumn - bStartColumn;
        }
        return aStartLineNumber - bStartLineNumber;
      }
      const aExists = a ? 1 : 0;
      const bExists = b ? 1 : 0;
      return aExists - bExists;
    }
    static compareRangesUsingEnds(a, b) {
      if (a.endLineNumber === b.endLineNumber) {
        if (a.endColumn === b.endColumn) {
          if (a.startLineNumber === b.startLineNumber) {
            return a.startColumn - b.startColumn;
          }
          return a.startLineNumber - b.startLineNumber;
        }
        return a.endColumn - b.endColumn;
      }
      return a.endLineNumber - b.endLineNumber;
    }
    static spansMultipleLines(range) {
      return range.endLineNumber > range.startLineNumber;
    }
    toJSON() {
      return this;
    }
  };

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/editor/common/core/ranges/lineRange.js
  var LineRange = class _LineRange {
    static ofLength(startLineNumber, length) {
      return new _LineRange(startLineNumber, startLineNumber + length);
    }
    static fromRange(range) {
      return new _LineRange(range.startLineNumber, range.endLineNumber);
    }
    static fromRangeInclusive(range) {
      return new _LineRange(range.startLineNumber, range.endLineNumber + 1);
    }
    static {
      this.compareByStart = compareBy((l) => l.startLineNumber, numberComparator);
    }
    static subtract(a, b) {
      if (!b) {
        return [a];
      }
      if (a.startLineNumber < b.startLineNumber && b.endLineNumberExclusive < a.endLineNumberExclusive) {
        return [new _LineRange(a.startLineNumber, b.startLineNumber), new _LineRange(b.endLineNumberExclusive, a.endLineNumberExclusive)];
      } else if (b.startLineNumber <= a.startLineNumber && a.endLineNumberExclusive <= b.endLineNumberExclusive) {
        return [];
      } else if (b.endLineNumberExclusive < a.endLineNumberExclusive) {
        return [new _LineRange(
          Math.max(b.endLineNumberExclusive, a.startLineNumber),
          a.endLineNumberExclusive
        )];
      } else {
        return [new _LineRange(a.startLineNumber, Math.min(b.startLineNumber, a.endLineNumberExclusive))];
      }
    }
    static joinMany(lineRanges) {
      if (lineRanges.length === 0) {
        return [];
      }
      let result = new LineRangeSet(lineRanges[0].slice());
      for (let i = 1; i < lineRanges.length; i++) {
        result = result.getUnion(new LineRangeSet(lineRanges[i].slice()));
      }
      return result.ranges;
    }
    static join(lineRanges) {
      if (lineRanges.length === 0) {
        throw new BugIndicatingError("lineRanges cannot be empty");
      }
      let startLineNumber = lineRanges[0].startLineNumber;
      let endLineNumberExclusive = lineRanges[0].endLineNumberExclusive;
      for (let i = 1; i < lineRanges.length; i++) {
        startLineNumber = Math.min(startLineNumber, lineRanges[i].startLineNumber);
        endLineNumberExclusive = Math.max(endLineNumberExclusive, lineRanges[i].endLineNumberExclusive);
      }
      return new _LineRange(startLineNumber, endLineNumberExclusive);
    }
    static deserialize(lineRange) {
      return new _LineRange(lineRange[0], lineRange[1]);
    }
    constructor(startLineNumber, endLineNumberExclusive) {
      if (startLineNumber > endLineNumberExclusive) {
        throw new BugIndicatingError(
          `startLineNumber ${startLineNumber} cannot be after endLineNumberExclusive ${endLineNumberExclusive}`
        );
      }
      this.startLineNumber = startLineNumber;
      this.endLineNumberExclusive = endLineNumberExclusive;
    }
    contains(lineNumber) {
      return this.startLineNumber <= lineNumber && lineNumber < this.endLineNumberExclusive;
    }
    containsRange(range) {
      return this.startLineNumber <= range.startLineNumber && range.endLineNumberExclusive <= this.endLineNumberExclusive;
    }
    get isEmpty() {
      return this.startLineNumber === this.endLineNumberExclusive;
    }
    delta(offset) {
      return new _LineRange(this.startLineNumber + offset, this.endLineNumberExclusive + offset);
    }
    deltaLength(offset) {
      return new _LineRange(this.startLineNumber, this.endLineNumberExclusive + offset);
    }
    get length() {
      return this.endLineNumberExclusive - this.startLineNumber;
    }
    join(other) {
      return new _LineRange(
        Math.min(this.startLineNumber, other.startLineNumber),
        Math.max(this.endLineNumberExclusive, other.endLineNumberExclusive)
      );
    }
    toString() {
      return `[${this.startLineNumber},${this.endLineNumberExclusive})`;
    }
    intersect(other) {
      const startLineNumber = Math.max(this.startLineNumber, other.startLineNumber);
      const endLineNumberExclusive = Math.min(this.endLineNumberExclusive, other.endLineNumberExclusive);
      if (startLineNumber <= endLineNumberExclusive) {
        return new _LineRange(startLineNumber, endLineNumberExclusive);
      }
      return void 0;
    }
    intersectsStrict(other) {
      return this.startLineNumber < other.endLineNumberExclusive && other.startLineNumber < this.endLineNumberExclusive;
    }
    intersectsOrTouches(other) {
      return this.startLineNumber <= other.endLineNumberExclusive && other.startLineNumber <= this.endLineNumberExclusive;
    }
    equals(b) {
      return this.startLineNumber === b.startLineNumber && this.endLineNumberExclusive === b.endLineNumberExclusive;
    }
    toInclusiveRange() {
      if (this.isEmpty) {
        return null;
      }
      return new Range(
        this.startLineNumber,
        1,
        this.endLineNumberExclusive - 1,
        Number.MAX_SAFE_INTEGER
      );
    }
    toExclusiveRange() {
      return new Range(this.startLineNumber, 1, this.endLineNumberExclusive, 1);
    }
    mapToLineArray(f) {
      const result = [];
      for (let lineNumber = this.startLineNumber; lineNumber < this.endLineNumberExclusive; lineNumber++) {
        result.push(f(lineNumber));
      }
      return result;
    }
    forEach(f) {
      for (let lineNumber = this.startLineNumber; lineNumber < this.endLineNumberExclusive; lineNumber++) {
        f(lineNumber);
      }
    }
    serialize() {
      return [this.startLineNumber, this.endLineNumberExclusive];
    }
    toOffsetRange() {
      return new OffsetRange(this.startLineNumber - 1, this.endLineNumberExclusive - 1);
    }
    distanceToRange(other) {
      if (this.endLineNumberExclusive <= other.startLineNumber) {
        return other.startLineNumber - this.endLineNumberExclusive;
      }
      if (other.endLineNumberExclusive <= this.startLineNumber) {
        return this.startLineNumber - other.endLineNumberExclusive;
      }
      return 0;
    }
    distanceToLine(lineNumber) {
      if (this.contains(lineNumber)) {
        return 0;
      }
      if (lineNumber < this.startLineNumber) {
        return this.startLineNumber - lineNumber;
      }
      return lineNumber - this.endLineNumberExclusive;
    }
    addMargin(marginTop, marginBottom) {
      return new _LineRange(
        this.startLineNumber - marginTop,
        this.endLineNumberExclusive + marginBottom
      );
    }
  };
  var LineRangeSet = class _LineRangeSet {
    constructor(_normalizedRanges = []) {
      this._normalizedRanges = _normalizedRanges;
    }
    get ranges() {
      return this._normalizedRanges;
    }
    addRange(range) {
      if (range.length === 0) {
        return;
      }
      const joinRangeStartIdx = findFirstIdxMonotonousOrArrLen(
        this._normalizedRanges,
        (r) => r.endLineNumberExclusive >= range.startLineNumber
      );
      const joinRangeEndIdxExclusive = findLastIdxMonotonous(
        this._normalizedRanges,
        (r) => r.startLineNumber <= range.endLineNumberExclusive
      ) + 1;
      if (joinRangeStartIdx === joinRangeEndIdxExclusive) {
        this._normalizedRanges.splice(joinRangeStartIdx, 0, range);
      } else if (joinRangeStartIdx === joinRangeEndIdxExclusive - 1) {
        const joinRange = this._normalizedRanges[joinRangeStartIdx];
        this._normalizedRanges[joinRangeStartIdx] = joinRange.join(range);
      } else {
        const joinRange = this._normalizedRanges[joinRangeStartIdx].join(this._normalizedRanges[joinRangeEndIdxExclusive - 1]).join(range);
        this._normalizedRanges.splice(joinRangeStartIdx, joinRangeEndIdxExclusive - joinRangeStartIdx, joinRange);
      }
    }
    contains(lineNumber) {
      const rangeThatStartsBeforeEnd = findLastMonotonous(this._normalizedRanges, (r) => r.startLineNumber <= lineNumber);
      return !!rangeThatStartsBeforeEnd && rangeThatStartsBeforeEnd.endLineNumberExclusive > lineNumber;
    }
    intersects(range) {
      const rangeThatStartsBeforeEnd = findLastMonotonous(
        this._normalizedRanges,
        (r) => r.startLineNumber < range.endLineNumberExclusive
      );
      return !!rangeThatStartsBeforeEnd && rangeThatStartsBeforeEnd.endLineNumberExclusive > range.startLineNumber;
    }
    getUnion(other) {
      if (this._normalizedRanges.length === 0) {
        return other;
      }
      if (other._normalizedRanges.length === 0) {
        return this;
      }
      const result = [];
      let i1 = 0;
      let i2 = 0;
      let current = null;
      while (i1 < this._normalizedRanges.length || i2 < other._normalizedRanges.length) {
        let next = null;
        if (i1 < this._normalizedRanges.length && i2 < other._normalizedRanges.length) {
          const lineRange1 = this._normalizedRanges[i1];
          const lineRange2 = other._normalizedRanges[i2];
          if (lineRange1.startLineNumber < lineRange2.startLineNumber) {
            next = lineRange1;
            i1++;
          } else {
            next = lineRange2;
            i2++;
          }
        } else if (i1 < this._normalizedRanges.length) {
          next = this._normalizedRanges[i1];
          i1++;
        } else {
          next = other._normalizedRanges[i2];
          i2++;
        }
        if (current === null) {
          current = next;
        } else {
          if (current.endLineNumberExclusive >= next.startLineNumber) {
            current = new LineRange(
              current.startLineNumber,
              Math.max(current.endLineNumberExclusive, next.endLineNumberExclusive)
            );
          } else {
            result.push(current);
            current = next;
          }
        }
      }
      if (current !== null) {
        result.push(current);
      }
      return new _LineRangeSet(result);
    }
    subtractFrom(range) {
      const joinRangeStartIdx = findFirstIdxMonotonousOrArrLen(
        this._normalizedRanges,
        (r) => r.endLineNumberExclusive >= range.startLineNumber
      );
      const joinRangeEndIdxExclusive = findLastIdxMonotonous(
        this._normalizedRanges,
        (r) => r.startLineNumber <= range.endLineNumberExclusive
      ) + 1;
      if (joinRangeStartIdx === joinRangeEndIdxExclusive) {
        return new _LineRangeSet([range]);
      }
      const result = [];
      let startLineNumber = range.startLineNumber;
      for (let i = joinRangeStartIdx; i < joinRangeEndIdxExclusive; i++) {
        const r = this._normalizedRanges[i];
        if (r.startLineNumber > startLineNumber) {
          result.push(new LineRange(startLineNumber, r.startLineNumber));
        }
        startLineNumber = r.endLineNumberExclusive;
      }
      if (startLineNumber < range.endLineNumberExclusive) {
        result.push(new LineRange(startLineNumber, range.endLineNumberExclusive));
      }
      return new _LineRangeSet(result);
    }
    toString() {
      return this._normalizedRanges.map((r) => r.toString()).join(", ");
    }
    getIntersection(other) {
      const result = [];
      let i1 = 0;
      let i2 = 0;
      while (i1 < this._normalizedRanges.length && i2 < other._normalizedRanges.length) {
        const r1 = this._normalizedRanges[i1];
        const r2 = other._normalizedRanges[i2];
        const i = r1.intersect(r2);
        if (i && !i.isEmpty) {
          result.push(i);
        }
        if (r1.endLineNumberExclusive < r2.endLineNumberExclusive) {
          i1++;
        } else {
          i2++;
        }
      }
      return new _LineRangeSet(result);
    }
    getWithDelta(value) {
      return new _LineRangeSet(this._normalizedRanges.map((r) => r.delta(value)));
    }
  };

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/editor/common/model/prefixSumComputer.js
  var PrefixSumComputer = class {
    constructor(values) {
      this.values = values;
      this.prefixSum = new Uint32Array(values.length);
      this.prefixSumValidIndex = new Int32Array(1);
      this.prefixSumValidIndex[0] = -1;
    }
    getCount() {
      return this.values.length;
    }
    insertValues(insertIndex, insertValues) {
      insertIndex = toUint32(insertIndex);
      const oldValues = this.values;
      const oldPrefixSum = this.prefixSum;
      const insertValuesLen = insertValues.length;
      if (insertValuesLen === 0) {
        return false;
      }
      this.values = new Uint32Array(oldValues.length + insertValuesLen);
      this.values.set(oldValues.subarray(0, insertIndex), 0);
      this.values.set(oldValues.subarray(insertIndex), insertIndex + insertValuesLen);
      this.values.set(insertValues, insertIndex);
      if (insertIndex - 1 < this.prefixSumValidIndex[0]) {
        this.prefixSumValidIndex[0] = insertIndex - 1;
      }
      this.prefixSum = new Uint32Array(this.values.length);
      if (this.prefixSumValidIndex[0] >= 0) {
        this.prefixSum.set(oldPrefixSum.subarray(0, this.prefixSumValidIndex[0] + 1));
      }
      return true;
    }
    setValue(index, value) {
      index = toUint32(index);
      value = toUint32(value);
      if (this.values[index] === value) {
        return false;
      }
      this.values[index] = value;
      if (index - 1 < this.prefixSumValidIndex[0]) {
        this.prefixSumValidIndex[0] = index - 1;
      }
      return true;
    }
    removeValues(startIndex, count) {
      startIndex = toUint32(startIndex);
      count = toUint32(count);
      const oldValues = this.values;
      const oldPrefixSum = this.prefixSum;
      if (startIndex >= oldValues.length) {
        return false;
      }
      const maxCount = oldValues.length - startIndex;
      if (count >= maxCount) {
        count = maxCount;
      }
      if (count === 0) {
        return false;
      }
      this.values = new Uint32Array(oldValues.length - count);
      this.values.set(oldValues.subarray(0, startIndex), 0);
      this.values.set(oldValues.subarray(startIndex + count), startIndex);
      this.prefixSum = new Uint32Array(this.values.length);
      if (startIndex - 1 < this.prefixSumValidIndex[0]) {
        this.prefixSumValidIndex[0] = startIndex - 1;
      }
      if (this.prefixSumValidIndex[0] >= 0) {
        this.prefixSum.set(oldPrefixSum.subarray(0, this.prefixSumValidIndex[0] + 1));
      }
      return true;
    }
    getTotalSum() {
      if (this.values.length === 0) {
        return 0;
      }
      return this._getPrefixSum(this.values.length - 1);
    }
    getPrefixSum(index) {
      if (index < 0) {
        return 0;
      }
      index = toUint32(index);
      return this._getPrefixSum(index);
    }
    _getPrefixSum(index) {
      if (index <= this.prefixSumValidIndex[0]) {
        return this.prefixSum[index];
      }
      let startIndex = this.prefixSumValidIndex[0] + 1;
      if (startIndex === 0) {
        this.prefixSum[0] = this.values[0];
        startIndex++;
      }
      if (index >= this.values.length) {
        index = this.values.length - 1;
      }
      for (let i = startIndex; i <= index; i++) {
        this.prefixSum[i] = this.prefixSum[i - 1] + this.values[i];
      }
      this.prefixSumValidIndex[0] = Math.max(this.prefixSumValidIndex[0], index);
      return this.prefixSum[index];
    }
    getIndexOf(sum) {
      sum = Math.floor(sum);
      this.getTotalSum();
      let low = 0;
      let high = this.values.length - 1;
      let mid = 0;
      let midStop = 0;
      let midStart = 0;
      while (low <= high) {
        mid = low + (high - low) / 2 | 0;
        midStop = this.prefixSum[mid];
        midStart = midStop - this.values[mid];
        if (sum < midStart) {
          high = mid - 1;
        } else if (sum >= midStop) {
          low = mid + 1;
        } else {
          break;
        }
      }
      return new PrefixSumIndexOfResult(mid, sum - midStart);
    }
  };
  var PrefixSumIndexOfResult = class {
    constructor(index, remainder) {
      this.index = index;
      this.remainder = remainder;
      this._prefixSumIndexOfResultBrand = void 0;
      this.index = index;
      this.remainder = remainder;
    }
  };

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/editor/common/model/mirrorTextModel.js
  var MirrorTextModel = class {
    constructor(uri, lines, eol, versionId) {
      this._uri = uri;
      this._lines = lines;
      this._eol = eol;
      this._versionId = versionId;
      this._lineStarts = null;
      this._cachedTextValue = null;
    }
    dispose() {
      this._lines.length = 0;
    }
    get version() {
      return this._versionId;
    }
    getText() {
      if (this._cachedTextValue === null) {
        this._cachedTextValue = this._lines.join(this._eol);
      }
      return this._cachedTextValue;
    }
    onEvents(e) {
      if (e.eol && e.eol !== this._eol) {
        this._eol = e.eol;
        this._lineStarts = null;
      }
      const changes = e.changes;
      for (const change of changes) {
        this._acceptDeleteRange(change.range);
        this._acceptInsertText(new Position(change.range.startLineNumber, change.range.startColumn), change.text);
      }
      this._versionId = e.versionId;
      this._cachedTextValue = null;
    }
    _ensureLineStarts() {
      if (!this._lineStarts) {
        const eolLength = this._eol.length;
        const linesLength = this._lines.length;
        const lineStartValues = new Uint32Array(linesLength);
        for (let i = 0; i < linesLength; i++) {
          lineStartValues[i] = this._lines[i].length + eolLength;
        }
        this._lineStarts = new PrefixSumComputer(lineStartValues);
      }
    }
    _setLineText(lineIndex, newValue) {
      this._lines[lineIndex] = newValue;
      if (this._lineStarts) {
        this._lineStarts.setValue(lineIndex, this._lines[lineIndex].length + this._eol.length);
      }
    }
    _acceptDeleteRange(range) {
      if (range.startLineNumber === range.endLineNumber) {
        if (range.startColumn === range.endColumn) {
          return;
        }
        this._setLineText(
          range.startLineNumber - 1,
          this._lines[range.startLineNumber - 1].substring(0, range.startColumn - 1) + this._lines[range.startLineNumber - 1].substring(range.endColumn - 1)
        );
        return;
      }
      this._setLineText(
        range.startLineNumber - 1,
        this._lines[range.startLineNumber - 1].substring(0, range.startColumn - 1) + this._lines[range.endLineNumber - 1].substring(range.endColumn - 1)
      );
      this._lines.splice(range.startLineNumber, range.endLineNumber - range.startLineNumber);
      if (this._lineStarts) {
        this._lineStarts.removeValues(range.startLineNumber, range.endLineNumber - range.startLineNumber);
      }
    }
    _acceptInsertText(position, insertText) {
      if (insertText.length === 0) {
        return;
      }
      const insertLines = splitLines(insertText);
      if (insertLines.length === 1) {
        this._setLineText(
          position.lineNumber - 1,
          this._lines[position.lineNumber - 1].substring(0, position.column - 1) + insertLines[0] + this._lines[position.lineNumber - 1].substring(position.column - 1)
        );
        return;
      }
      insertLines[insertLines.length - 1] += this._lines[position.lineNumber - 1].substring(position.column - 1);
      this._setLineText(
        position.lineNumber - 1,
        this._lines[position.lineNumber - 1].substring(0, position.column - 1) + insertLines[0]
      );
      const newLengths = new Uint32Array(insertLines.length - 1);
      for (let i = 1; i < insertLines.length; i++) {
        this._lines.splice(position.lineNumber + i - 1, 0, insertLines[i]);
        newLengths[i - 1] = insertLines[i].length + this._eol.length;
      }
      if (this._lineStarts) {
        this._lineStarts.insertValues(position.lineNumber, newLengths);
      }
    }
  };

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/editor/common/core/misc/eolCounter.js
  var StringEOL;
  (function(StringEOL2) {
    StringEOL2[StringEOL2["Unknown"] = 0] = "Unknown";
    StringEOL2[StringEOL2["Invalid"] = 3] = "Invalid";
    StringEOL2[StringEOL2["LF"] = 1] = "LF";
    StringEOL2[StringEOL2["CRLF"] = 2] = "CRLF";
  })(StringEOL || (StringEOL = {}));
  function countEOL(text) {
    let eolCount = 0;
    let firstLineLength = 0;
    let lastLineStart = 0;
    let eol = StringEOL.Unknown;
    for (let i = 0, len = text.length; i < len; i++) {
      const chr = text.charCodeAt(i);
      if (chr === CharCode.CarriageReturn) {
        if (eolCount === 0) {
          firstLineLength = i;
        }
        eolCount++;
        if (i + 1 < len && text.charCodeAt(i + 1) === CharCode.LineFeed) {
          eol |= StringEOL.CRLF;
          i++;
        } else {
          eol |= StringEOL.Invalid;
        }
        lastLineStart = i + 1;
      } else if (chr === CharCode.LineFeed) {
        eol |= StringEOL.LF;
        if (eolCount === 0) {
          firstLineLength = i;
        }
        eolCount++;
        lastLineStart = i + 1;
      }
    }
    if (eolCount === 0) {
      firstLineLength = text.length;
    }
    return [eolCount, firstLineLength, text.length - lastLineStart, eol];
  }

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/editor/common/encodedTokenAttributes.js
  var LanguageId;
  (function(LanguageId2) {
    LanguageId2[LanguageId2["Null"] = 0] = "Null";
    LanguageId2[LanguageId2["PlainText"] = 1] = "PlainText";
  })(LanguageId || (LanguageId = {}));
  var FontStyle;
  (function(FontStyle2) {
    FontStyle2[FontStyle2["NotSet"] = -1] = "NotSet";
    FontStyle2[FontStyle2["None"] = 0] = "None";
    FontStyle2[FontStyle2["Italic"] = 1] = "Italic";
    FontStyle2[FontStyle2["Bold"] = 2] = "Bold";
    FontStyle2[FontStyle2["Underline"] = 4] = "Underline";
    FontStyle2[FontStyle2["Strikethrough"] = 8] = "Strikethrough";
  })(FontStyle || (FontStyle = {}));
  var ColorId;
  (function(ColorId2) {
    ColorId2[ColorId2["None"] = 0] = "None";
    ColorId2[ColorId2["DefaultForeground"] = 1] = "DefaultForeground";
    ColorId2[ColorId2["DefaultBackground"] = 2] = "DefaultBackground";
  })(ColorId || (ColorId = {}));
  var StandardTokenType;
  (function(StandardTokenType2) {
    StandardTokenType2[StandardTokenType2["Other"] = 0] = "Other";
    StandardTokenType2[StandardTokenType2["Comment"] = 1] = "Comment";
    StandardTokenType2[StandardTokenType2["String"] = 2] = "String";
    StandardTokenType2[StandardTokenType2["RegEx"] = 3] = "RegEx";
  })(StandardTokenType || (StandardTokenType = {}));
  var MetadataConsts;
  (function(MetadataConsts2) {
    MetadataConsts2[MetadataConsts2["LANGUAGEID_MASK"] = 255] = "LANGUAGEID_MASK";
    MetadataConsts2[MetadataConsts2["TOKEN_TYPE_MASK"] = 768] = "TOKEN_TYPE_MASK";
    MetadataConsts2[MetadataConsts2["BALANCED_BRACKETS_MASK"] = 1024] = "BALANCED_BRACKETS_MASK";
    MetadataConsts2[MetadataConsts2["FONT_STYLE_MASK"] = 30720] = "FONT_STYLE_MASK";
    MetadataConsts2[MetadataConsts2["FOREGROUND_MASK"] = 16744448] = "FOREGROUND_MASK";
    MetadataConsts2[MetadataConsts2["BACKGROUND_MASK"] = 4278190080] = "BACKGROUND_MASK";
    MetadataConsts2[MetadataConsts2["ITALIC_MASK"] = 2048] = "ITALIC_MASK";
    MetadataConsts2[MetadataConsts2["BOLD_MASK"] = 4096] = "BOLD_MASK";
    MetadataConsts2[MetadataConsts2["UNDERLINE_MASK"] = 8192] = "UNDERLINE_MASK";
    MetadataConsts2[MetadataConsts2["STRIKETHROUGH_MASK"] = 16384] = "STRIKETHROUGH_MASK";
    MetadataConsts2[MetadataConsts2["SEMANTIC_USE_ITALIC"] = 1] = "SEMANTIC_USE_ITALIC";
    MetadataConsts2[MetadataConsts2["SEMANTIC_USE_BOLD"] = 2] = "SEMANTIC_USE_BOLD";
    MetadataConsts2[MetadataConsts2["SEMANTIC_USE_UNDERLINE"] = 4] = "SEMANTIC_USE_UNDERLINE";
    MetadataConsts2[MetadataConsts2["SEMANTIC_USE_STRIKETHROUGH"] = 8] = "SEMANTIC_USE_STRIKETHROUGH";
    MetadataConsts2[MetadataConsts2["SEMANTIC_USE_FOREGROUND"] = 16] = "SEMANTIC_USE_FOREGROUND";
    MetadataConsts2[MetadataConsts2["SEMANTIC_USE_BACKGROUND"] = 32] = "SEMANTIC_USE_BACKGROUND";
    MetadataConsts2[MetadataConsts2["LANGUAGEID_OFFSET"] = 0] = "LANGUAGEID_OFFSET";
    MetadataConsts2[MetadataConsts2["TOKEN_TYPE_OFFSET"] = 8] = "TOKEN_TYPE_OFFSET";
    MetadataConsts2[MetadataConsts2["BALANCED_BRACKETS_OFFSET"] = 10] = "BALANCED_BRACKETS_OFFSET";
    MetadataConsts2[MetadataConsts2["FONT_STYLE_OFFSET"] = 11] = "FONT_STYLE_OFFSET";
    MetadataConsts2[MetadataConsts2["FOREGROUND_OFFSET"] = 15] = "FOREGROUND_OFFSET";
    MetadataConsts2[MetadataConsts2["BACKGROUND_OFFSET"] = 24] = "BACKGROUND_OFFSET";
  })(MetadataConsts || (MetadataConsts = {}));
  var TokenMetadata = class {
    static getLanguageId(metadata) {
      return (metadata & MetadataConsts.LANGUAGEID_MASK) >>> MetadataConsts.LANGUAGEID_OFFSET;
    }
    static getTokenType(metadata) {
      return (metadata & MetadataConsts.TOKEN_TYPE_MASK) >>> MetadataConsts.TOKEN_TYPE_OFFSET;
    }
    static containsBalancedBrackets(metadata) {
      return (metadata & MetadataConsts.BALANCED_BRACKETS_MASK) !== 0;
    }
    static getFontStyle(metadata) {
      return (metadata & MetadataConsts.FONT_STYLE_MASK) >>> MetadataConsts.FONT_STYLE_OFFSET;
    }
    static getForeground(metadata) {
      return (metadata & MetadataConsts.FOREGROUND_MASK) >>> MetadataConsts.FOREGROUND_OFFSET;
    }
    static getBackground(metadata) {
      return (metadata & MetadataConsts.BACKGROUND_MASK) >>> MetadataConsts.BACKGROUND_OFFSET;
    }
    static getClassNameFromMetadata(metadata) {
      const foreground = this.getForeground(metadata);
      let className = "mtk" + foreground;
      const fontStyle = this.getFontStyle(metadata);
      if (fontStyle & FontStyle.Italic) {
        className += " mtki";
      }
      if (fontStyle & FontStyle.Bold) {
        className += " mtkb";
      }
      if (fontStyle & FontStyle.Underline) {
        className += " mtku";
      }
      if (fontStyle & FontStyle.Strikethrough) {
        className += " mtks";
      }
      return className;
    }
    static getInlineStyleFromMetadata(metadata, colorMap) {
      const foreground = this.getForeground(metadata);
      const fontStyle = this.getFontStyle(metadata);
      let result = `color: ${colorMap[foreground]};`;
      if (fontStyle & FontStyle.Italic) {
        result += "font-style: italic;";
      }
      if (fontStyle & FontStyle.Bold) {
        result += "font-weight: bold;";
      }
      let textDecoration = "";
      if (fontStyle & FontStyle.Underline) {
        textDecoration += " underline";
      }
      if (fontStyle & FontStyle.Strikethrough) {
        textDecoration += " line-through";
      }
      if (textDecoration) {
        result += `text-decoration:${textDecoration};`;
      }
      return result;
    }
    static getPresentationFromMetadata(metadata) {
      const foreground = this.getForeground(metadata);
      const fontStyle = this.getFontStyle(metadata);
      return {
        foreground,
        italic: Boolean(fontStyle & FontStyle.Italic),
        bold: Boolean(fontStyle & FontStyle.Bold),
        underline: Boolean(fontStyle & FontStyle.Underline),
        strikethrough: Boolean(fontStyle & FontStyle.Strikethrough)
      };
    }
  };

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/codiconsUtil.js
  var _codiconFontCharacters = /* @__PURE__ */ Object.create(null);
  function register(id2, fontCharacter) {
    if (isString(fontCharacter)) {
      const val = _codiconFontCharacters[fontCharacter];
      if (val === void 0) {
        throw new Error(`${id2} references an unknown codicon: ${fontCharacter}`);
      }
      fontCharacter = val;
    }
    _codiconFontCharacters[id2] = fontCharacter;
    return {
      id: id2
    };
  }

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/codiconsLibrary.js
  var codiconsLibrary = {
    add: register("add", 6e4),
    plus: register("plus", 6e4),
    gistNew: register("gist-new", 6e4),
    repoCreate: register("repo-create", 6e4),
    lightbulb: register("lightbulb", 60001),
    lightBulb: register("light-bulb", 60001),
    repo: register("repo", 60002),
    repoDelete: register("repo-delete", 60002),
    gistFork: register("gist-fork", 60003),
    repoForked: register("repo-forked", 60003),
    gitPullRequest: register("git-pull-request", 60004),
    gitPullRequestAbandoned: register("git-pull-request-abandoned", 60004),
    recordKeys: register("record-keys", 60005),
    keyboard: register("keyboard", 60005),
    tag: register("tag", 60006),
    gitPullRequestLabel: register("git-pull-request-label", 60006),
    tagAdd: register("tag-add", 60006),
    tagRemove: register("tag-remove", 60006),
    person: register("person", 60007),
    personFollow: register("person-follow", 60007),
    personOutline: register("person-outline", 60007),
    personFilled: register("person-filled", 60007),
    sourceControl: register("source-control", 60008),
    mirror: register("mirror", 60009),
    mirrorPublic: register("mirror-public", 60009),
    star: register("star", 60010),
    starAdd: register("star-add", 60010),
    starDelete: register("star-delete", 60010),
    starEmpty: register("star-empty", 60010),
    comment: register("comment", 60011),
    commentAdd: register("comment-add", 60011),
    alert: register("alert", 60012),
    warning: register("warning", 60012),
    search: register("search", 60013),
    searchSave: register("search-save", 60013),
    logOut: register("log-out", 60014),
    signOut: register("sign-out", 60014),
    logIn: register("log-in", 60015),
    signIn: register("sign-in", 60015),
    eye: register("eye", 60016),
    eyeUnwatch: register("eye-unwatch", 60016),
    eyeWatch: register("eye-watch", 60016),
    circleFilled: register("circle-filled", 60017),
    primitiveDot: register("primitive-dot", 60017),
    closeDirty: register("close-dirty", 60017),
    debugBreakpoint: register("debug-breakpoint", 60017),
    debugBreakpointDisabled: register("debug-breakpoint-disabled", 60017),
    debugHint: register("debug-hint", 60017),
    terminalDecorationSuccess: register("terminal-decoration-success", 60017),
    primitiveSquare: register("primitive-square", 60018),
    edit: register("edit", 60019),
    pencil: register("pencil", 60019),
    info: register("info", 60020),
    issueOpened: register("issue-opened", 60020),
    gistPrivate: register("gist-private", 60021),
    gitForkPrivate: register("git-fork-private", 60021),
    lock: register("lock", 60021),
    mirrorPrivate: register("mirror-private", 60021),
    close: register("close", 60022),
    removeClose: register("remove-close", 60022),
    x: register("x", 60022),
    repoSync: register("repo-sync", 60023),
    sync: register("sync", 60023),
    clone: register("clone", 60024),
    desktopDownload: register("desktop-download", 60024),
    beaker: register("beaker", 60025),
    microscope: register("microscope", 60025),
    vm: register("vm", 60026),
    deviceDesktop: register("device-desktop", 60026),
    file: register("file", 60027),
    more: register("more", 60028),
    ellipsis: register("ellipsis", 60028),
    kebabHorizontal: register("kebab-horizontal", 60028),
    mailReply: register("mail-reply", 60029),
    reply: register("reply", 60029),
    organization: register("organization", 60030),
    organizationFilled: register("organization-filled", 60030),
    organizationOutline: register("organization-outline", 60030),
    newFile: register("new-file", 60031),
    fileAdd: register("file-add", 60031),
    newFolder: register("new-folder", 60032),
    fileDirectoryCreate: register("file-directory-create", 60032),
    trash: register("trash", 60033),
    trashcan: register("trashcan", 60033),
    history: register("history", 60034),
    clock: register("clock", 60034),
    folder: register("folder", 60035),
    fileDirectory: register("file-directory", 60035),
    symbolFolder: register("symbol-folder", 60035),
    logoGithub: register("logo-github", 60036),
    markGithub: register("mark-github", 60036),
    github: register("github", 60036),
    terminal: register("terminal", 60037),
    console: register("console", 60037),
    repl: register("repl", 60037),
    zap: register("zap", 60038),
    symbolEvent: register("symbol-event", 60038),
    error: register("error", 60039),
    stop: register("stop", 60039),
    variable: register("variable", 60040),
    symbolVariable: register("symbol-variable", 60040),
    array: register("array", 60042),
    symbolArray: register("symbol-array", 60042),
    symbolModule: register("symbol-module", 60043),
    symbolPackage: register("symbol-package", 60043),
    symbolNamespace: register("symbol-namespace", 60043),
    symbolObject: register("symbol-object", 60043),
    symbolMethod: register("symbol-method", 60044),
    symbolFunction: register("symbol-function", 60044),
    symbolConstructor: register("symbol-constructor", 60044),
    symbolBoolean: register("symbol-boolean", 60047),
    symbolNull: register("symbol-null", 60047),
    symbolNumeric: register("symbol-numeric", 60048),
    symbolNumber: register("symbol-number", 60048),
    symbolStructure: register("symbol-structure", 60049),
    symbolStruct: register("symbol-struct", 60049),
    symbolParameter: register("symbol-parameter", 60050),
    symbolTypeParameter: register("symbol-type-parameter", 60050),
    symbolKey: register("symbol-key", 60051),
    symbolText: register("symbol-text", 60051),
    symbolReference: register("symbol-reference", 60052),
    goToFile: register("go-to-file", 60052),
    symbolEnum: register("symbol-enum", 60053),
    symbolValue: register("symbol-value", 60053),
    symbolRuler: register("symbol-ruler", 60054),
    symbolUnit: register("symbol-unit", 60054),
    activateBreakpoints: register("activate-breakpoints", 60055),
    archive: register("archive", 60056),
    arrowBoth: register("arrow-both", 60057),
    arrowDown: register("arrow-down", 60058),
    arrowLeft: register("arrow-left", 60059),
    arrowRight: register("arrow-right", 60060),
    arrowSmallDown: register("arrow-small-down", 60061),
    arrowSmallLeft: register("arrow-small-left", 60062),
    arrowSmallRight: register("arrow-small-right", 60063),
    arrowSmallUp: register("arrow-small-up", 60064),
    arrowUp: register("arrow-up", 60065),
    bell: register("bell", 60066),
    bold: register("bold", 60067),
    book: register("book", 60068),
    bookmark: register("bookmark", 60069),
    debugBreakpointConditionalUnverified: register("debug-breakpoint-conditional-unverified", 60070),
    debugBreakpointConditional: register("debug-breakpoint-conditional", 60071),
    debugBreakpointConditionalDisabled: register("debug-breakpoint-conditional-disabled", 60071),
    debugBreakpointDataUnverified: register("debug-breakpoint-data-unverified", 60072),
    debugBreakpointData: register("debug-breakpoint-data", 60073),
    debugBreakpointDataDisabled: register("debug-breakpoint-data-disabled", 60073),
    debugBreakpointLogUnverified: register("debug-breakpoint-log-unverified", 60074),
    debugBreakpointLog: register("debug-breakpoint-log", 60075),
    debugBreakpointLogDisabled: register("debug-breakpoint-log-disabled", 60075),
    briefcase: register("briefcase", 60076),
    broadcast: register("broadcast", 60077),
    browser: register("browser", 60078),
    bug: register("bug", 60079),
    calendar: register("calendar", 60080),
    caseSensitive: register("case-sensitive", 60081),
    check: register("check", 60082),
    checklist: register("checklist", 60083),
    chevronDown: register("chevron-down", 60084),
    chevronLeft: register("chevron-left", 60085),
    chevronRight: register("chevron-right", 60086),
    chevronUp: register("chevron-up", 60087),
    chromeClose: register("chrome-close", 60088),
    chromeMaximize: register("chrome-maximize", 60089),
    chromeMinimize: register("chrome-minimize", 60090),
    chromeRestore: register("chrome-restore", 60091),
    circleOutline: register("circle-outline", 60092),
    circle: register("circle", 60092),
    debugBreakpointUnverified: register("debug-breakpoint-unverified", 60092),
    terminalDecorationIncomplete: register("terminal-decoration-incomplete", 60092),
    circleSlash: register("circle-slash", 60093),
    circuitBoard: register("circuit-board", 60094),
    clearAll: register("clear-all", 60095),
    clippy: register("clippy", 60096),
    closeAll: register("close-all", 60097),
    cloudDownload: register("cloud-download", 60098),
    cloudUpload: register("cloud-upload", 60099),
    code: register("code", 60100),
    collapseAll: register("collapse-all", 60101),
    colorMode: register("color-mode", 60102),
    commentDiscussion: register("comment-discussion", 60103),
    creditCard: register("credit-card", 60105),
    dash: register("dash", 60108),
    dashboard: register("dashboard", 60109),
    database: register("database", 60110),
    debugContinue: register("debug-continue", 60111),
    debugDisconnect: register("debug-disconnect", 60112),
    debugPause: register("debug-pause", 60113),
    debugRestart: register("debug-restart", 60114),
    debugStart: register("debug-start", 60115),
    debugStepInto: register("debug-step-into", 60116),
    debugStepOut: register("debug-step-out", 60117),
    debugStepOver: register("debug-step-over", 60118),
    debugStop: register("debug-stop", 60119),
    debug: register("debug", 60120),
    deviceCameraVideo: register("device-camera-video", 60121),
    deviceCamera: register("device-camera", 60122),
    deviceMobile: register("device-mobile", 60123),
    diffAdded: register("diff-added", 60124),
    diffIgnored: register("diff-ignored", 60125),
    diffModified: register("diff-modified", 60126),
    diffRemoved: register("diff-removed", 60127),
    diffRenamed: register("diff-renamed", 60128),
    diff: register("diff", 60129),
    diffSidebyside: register("diff-sidebyside", 60129),
    discard: register("discard", 60130),
    editorLayout: register("editor-layout", 60131),
    emptyWindow: register("empty-window", 60132),
    exclude: register("exclude", 60133),
    extensions: register("extensions", 60134),
    eyeClosed: register("eye-closed", 60135),
    fileBinary: register("file-binary", 60136),
    fileCode: register("file-code", 60137),
    fileMedia: register("file-media", 60138),
    filePdf: register("file-pdf", 60139),
    fileSubmodule: register("file-submodule", 60140),
    fileSymlinkDirectory: register("file-symlink-directory", 60141),
    fileSymlinkFile: register("file-symlink-file", 60142),
    fileZip: register("file-zip", 60143),
    files: register("files", 60144),
    filter: register("filter", 60145),
    flame: register("flame", 60146),
    foldDown: register("fold-down", 60147),
    foldUp: register("fold-up", 60148),
    fold: register("fold", 60149),
    folderActive: register("folder-active", 60150),
    folderOpened: register("folder-opened", 60151),
    gear: register("gear", 60152),
    gift: register("gift", 60153),
    gistSecret: register("gist-secret", 60154),
    gist: register("gist", 60155),
    gitCommit: register("git-commit", 60156),
    gitCompare: register("git-compare", 60157),
    compareChanges: register("compare-changes", 60157),
    gitMerge: register("git-merge", 60158),
    githubAction: register("github-action", 60159),
    githubAlt: register("github-alt", 60160),
    globe: register("globe", 60161),
    grabber: register("grabber", 60162),
    graph: register("graph", 60163),
    gripper: register("gripper", 60164),
    heart: register("heart", 60165),
    home: register("home", 60166),
    horizontalRule: register("horizontal-rule", 60167),
    hubot: register("hubot", 60168),
    inbox: register("inbox", 60169),
    issueReopened: register("issue-reopened", 60171),
    issues: register("issues", 60172),
    italic: register("italic", 60173),
    jersey: register("jersey", 60174),
    json: register("json", 60175),
    bracket: register("bracket", 60175),
    kebabVertical: register("kebab-vertical", 60176),
    key: register("key", 60177),
    law: register("law", 60178),
    lightbulbAutofix: register("lightbulb-autofix", 60179),
    linkExternal: register("link-external", 60180),
    link: register("link", 60181),
    listOrdered: register("list-ordered", 60182),
    listUnordered: register("list-unordered", 60183),
    liveShare: register("live-share", 60184),
    loading: register("loading", 60185),
    location: register("location", 60186),
    mailRead: register("mail-read", 60187),
    mail: register("mail", 60188),
    markdown: register("markdown", 60189),
    megaphone: register("megaphone", 60190),
    mention: register("mention", 60191),
    milestone: register("milestone", 60192),
    gitPullRequestMilestone: register("git-pull-request-milestone", 60192),
    mortarBoard: register("mortar-board", 60193),
    move: register("move", 60194),
    multipleWindows: register("multiple-windows", 60195),
    mute: register("mute", 60196),
    noNewline: register("no-newline", 60197),
    note: register("note", 60198),
    octoface: register("octoface", 60199),
    openPreview: register("open-preview", 60200),
    package: register("package", 60201),
    paintcan: register("paintcan", 60202),
    pin: register("pin", 60203),
    play: register("play", 60204),
    run: register("run", 60204),
    plug: register("plug", 60205),
    preserveCase: register("preserve-case", 60206),
    preview: register("preview", 60207),
    project: register("project", 60208),
    pulse: register("pulse", 60209),
    question: register("question", 60210),
    quote: register("quote", 60211),
    radioTower: register("radio-tower", 60212),
    reactions: register("reactions", 60213),
    references: register("references", 60214),
    refresh: register("refresh", 60215),
    regex: register("regex", 60216),
    remoteExplorer: register("remote-explorer", 60217),
    remote: register("remote", 60218),
    remove: register("remove", 60219),
    replaceAll: register("replace-all", 60220),
    replace: register("replace", 60221),
    repoClone: register("repo-clone", 60222),
    repoForcePush: register("repo-force-push", 60223),
    repoPull: register("repo-pull", 60224),
    repoPush: register("repo-push", 60225),
    report: register("report", 60226),
    requestChanges: register("request-changes", 60227),
    rocket: register("rocket", 60228),
    rootFolderOpened: register("root-folder-opened", 60229),
    rootFolder: register("root-folder", 60230),
    rss: register("rss", 60231),
    ruby: register("ruby", 60232),
    saveAll: register("save-all", 60233),
    saveAs: register("save-as", 60234),
    save: register("save", 60235),
    screenFull: register("screen-full", 60236),
    screenNormal: register("screen-normal", 60237),
    searchStop: register("search-stop", 60238),
    server: register("server", 60240),
    settingsGear: register("settings-gear", 60241),
    settings: register("settings", 60242),
    shield: register("shield", 60243),
    smiley: register("smiley", 60244),
    sortPrecedence: register("sort-precedence", 60245),
    splitHorizontal: register("split-horizontal", 60246),
    splitVertical: register("split-vertical", 60247),
    squirrel: register("squirrel", 60248),
    starFull: register("star-full", 60249),
    starHalf: register("star-half", 60250),
    symbolClass: register("symbol-class", 60251),
    symbolColor: register("symbol-color", 60252),
    symbolConstant: register("symbol-constant", 60253),
    symbolEnumMember: register("symbol-enum-member", 60254),
    symbolField: register("symbol-field", 60255),
    symbolFile: register("symbol-file", 60256),
    symbolInterface: register("symbol-interface", 60257),
    symbolKeyword: register("symbol-keyword", 60258),
    symbolMisc: register("symbol-misc", 60259),
    symbolOperator: register("symbol-operator", 60260),
    symbolProperty: register("symbol-property", 60261),
    wrench: register("wrench", 60261),
    wrenchSubaction: register("wrench-subaction", 60261),
    symbolSnippet: register("symbol-snippet", 60262),
    tasklist: register("tasklist", 60263),
    telescope: register("telescope", 60264),
    textSize: register("text-size", 60265),
    threeBars: register("three-bars", 60266),
    thumbsdown: register("thumbsdown", 60267),
    thumbsup: register("thumbsup", 60268),
    tools: register("tools", 60269),
    triangleDown: register("triangle-down", 60270),
    triangleLeft: register("triangle-left", 60271),
    triangleRight: register("triangle-right", 60272),
    triangleUp: register("triangle-up", 60273),
    twitter: register("twitter", 60274),
    unfold: register("unfold", 60275),
    unlock: register("unlock", 60276),
    unmute: register("unmute", 60277),
    unverified: register("unverified", 60278),
    verified: register("verified", 60279),
    versions: register("versions", 60280),
    vmActive: register("vm-active", 60281),
    vmOutline: register("vm-outline", 60282),
    vmRunning: register("vm-running", 60283),
    watch: register("watch", 60284),
    whitespace: register("whitespace", 60285),
    wholeWord: register("whole-word", 60286),
    window: register("window", 60287),
    wordWrap: register("word-wrap", 60288),
    zoomIn: register("zoom-in", 60289),
    zoomOut: register("zoom-out", 60290),
    listFilter: register("list-filter", 60291),
    listFlat: register("list-flat", 60292),
    listSelection: register("list-selection", 60293),
    selection: register("selection", 60293),
    listTree: register("list-tree", 60294),
    debugBreakpointFunctionUnverified: register("debug-breakpoint-function-unverified", 60295),
    debugBreakpointFunction: register("debug-breakpoint-function", 60296),
    debugBreakpointFunctionDisabled: register("debug-breakpoint-function-disabled", 60296),
    debugStackframeActive: register("debug-stackframe-active", 60297),
    circleSmallFilled: register("circle-small-filled", 60298),
    debugStackframeDot: register("debug-stackframe-dot", 60298),
    terminalDecorationMark: register("terminal-decoration-mark", 60298),
    debugStackframe: register("debug-stackframe", 60299),
    debugStackframeFocused: register("debug-stackframe-focused", 60299),
    debugBreakpointUnsupported: register("debug-breakpoint-unsupported", 60300),
    symbolString: register("symbol-string", 60301),
    debugReverseContinue: register("debug-reverse-continue", 60302),
    debugStepBack: register("debug-step-back", 60303),
    debugRestartFrame: register("debug-restart-frame", 60304),
    debugAlt: register("debug-alt", 60305),
    callIncoming: register("call-incoming", 60306),
    callOutgoing: register("call-outgoing", 60307),
    menu: register("menu", 60308),
    expandAll: register("expand-all", 60309),
    feedback: register("feedback", 60310),
    gitPullRequestReviewer: register("git-pull-request-reviewer", 60310),
    groupByRefType: register("group-by-ref-type", 60311),
    ungroupByRefType: register("ungroup-by-ref-type", 60312),
    account: register("account", 60313),
    gitPullRequestAssignee: register("git-pull-request-assignee", 60313),
    bellDot: register("bell-dot", 60314),
    debugConsole: register("debug-console", 60315),
    library: register("library", 60316),
    output: register("output", 60317),
    runAll: register("run-all", 60318),
    syncIgnored: register("sync-ignored", 60319),
    pinned: register("pinned", 60320),
    githubInverted: register("github-inverted", 60321),
    serverProcess: register("server-process", 60322),
    serverEnvironment: register("server-environment", 60323),
    pass: register("pass", 60324),
    issueClosed: register("issue-closed", 60324),
    stopCircle: register("stop-circle", 60325),
    playCircle: register("play-circle", 60326),
    record: register("record", 60327),
    debugAltSmall: register("debug-alt-small", 60328),
    vmConnect: register("vm-connect", 60329),
    cloud: register("cloud", 60330),
    merge: register("merge", 60331),
    export: register("export", 60332),
    graphLeft: register("graph-left", 60333),
    magnet: register("magnet", 60334),
    notebook: register("notebook", 60335),
    redo: register("redo", 60336),
    checkAll: register("check-all", 60337),
    pinnedDirty: register("pinned-dirty", 60338),
    passFilled: register("pass-filled", 60339),
    circleLargeFilled: register("circle-large-filled", 60340),
    circleLarge: register("circle-large", 60341),
    circleLargeOutline: register("circle-large-outline", 60341),
    combine: register("combine", 60342),
    gather: register("gather", 60342),
    table: register("table", 60343),
    variableGroup: register("variable-group", 60344),
    typeHierarchy: register("type-hierarchy", 60345),
    typeHierarchySub: register("type-hierarchy-sub", 60346),
    typeHierarchySuper: register("type-hierarchy-super", 60347),
    gitPullRequestCreate: register("git-pull-request-create", 60348),
    runAbove: register("run-above", 60349),
    runBelow: register("run-below", 60350),
    notebookTemplate: register("notebook-template", 60351),
    debugRerun: register("debug-rerun", 60352),
    workspaceTrusted: register("workspace-trusted", 60353),
    workspaceUntrusted: register("workspace-untrusted", 60354),
    workspaceUnknown: register("workspace-unknown", 60355),
    terminalCmd: register("terminal-cmd", 60356),
    terminalDebian: register("terminal-debian", 60357),
    terminalLinux: register("terminal-linux", 60358),
    terminalPowershell: register("terminal-powershell", 60359),
    terminalTmux: register("terminal-tmux", 60360),
    terminalUbuntu: register("terminal-ubuntu", 60361),
    terminalBash: register("terminal-bash", 60362),
    arrowSwap: register("arrow-swap", 60363),
    copy: register("copy", 60364),
    personAdd: register("person-add", 60365),
    filterFilled: register("filter-filled", 60366),
    wand: register("wand", 60367),
    debugLineByLine: register("debug-line-by-line", 60368),
    inspect: register("inspect", 60369),
    layers: register("layers", 60370),
    layersDot: register("layers-dot", 60371),
    layersActive: register("layers-active", 60372),
    compass: register("compass", 60373),
    compassDot: register("compass-dot", 60374),
    compassActive: register("compass-active", 60375),
    azure: register("azure", 60376),
    issueDraft: register("issue-draft", 60377),
    gitPullRequestClosed: register("git-pull-request-closed", 60378),
    gitPullRequestDraft: register("git-pull-request-draft", 60379),
    debugAll: register("debug-all", 60380),
    debugCoverage: register("debug-coverage", 60381),
    runErrors: register("run-errors", 60382),
    folderLibrary: register("folder-library", 60383),
    debugContinueSmall: register("debug-continue-small", 60384),
    beakerStop: register("beaker-stop", 60385),
    graphLine: register("graph-line", 60386),
    graphScatter: register("graph-scatter", 60387),
    pieChart: register("pie-chart", 60388),
    bracketDot: register("bracket-dot", 60389),
    bracketError: register("bracket-error", 60390),
    lockSmall: register("lock-small", 60391),
    azureDevops: register("azure-devops", 60392),
    verifiedFilled: register("verified-filled", 60393),
    newline: register("newline", 60394),
    layout: register("layout", 60395),
    layoutActivitybarLeft: register("layout-activitybar-left", 60396),
    layoutActivitybarRight: register("layout-activitybar-right", 60397),
    layoutPanelLeft: register("layout-panel-left", 60398),
    layoutPanelCenter: register("layout-panel-center", 60399),
    layoutPanelJustify: register("layout-panel-justify", 60400),
    layoutPanelRight: register("layout-panel-right", 60401),
    layoutPanel: register("layout-panel", 60402),
    layoutSidebarLeft: register("layout-sidebar-left", 60403),
    layoutSidebarRight: register("layout-sidebar-right", 60404),
    layoutStatusbar: register("layout-statusbar", 60405),
    layoutMenubar: register("layout-menubar", 60406),
    layoutCentered: register("layout-centered", 60407),
    target: register("target", 60408),
    indent: register("indent", 60409),
    recordSmall: register("record-small", 60410),
    errorSmall: register("error-small", 60411),
    terminalDecorationError: register("terminal-decoration-error", 60411),
    arrowCircleDown: register("arrow-circle-down", 60412),
    arrowCircleLeft: register("arrow-circle-left", 60413),
    arrowCircleRight: register("arrow-circle-right", 60414),
    arrowCircleUp: register("arrow-circle-up", 60415),
    layoutSidebarRightOff: register("layout-sidebar-right-off", 60416),
    layoutPanelOff: register("layout-panel-off", 60417),
    layoutSidebarLeftOff: register("layout-sidebar-left-off", 60418),
    blank: register("blank", 60419),
    heartFilled: register("heart-filled", 60420),
    map: register("map", 60421),
    mapHorizontal: register("map-horizontal", 60421),
    foldHorizontal: register("fold-horizontal", 60421),
    mapFilled: register("map-filled", 60422),
    mapHorizontalFilled: register("map-horizontal-filled", 60422),
    foldHorizontalFilled: register("fold-horizontal-filled", 60422),
    circleSmall: register("circle-small", 60423),
    bellSlash: register("bell-slash", 60424),
    bellSlashDot: register("bell-slash-dot", 60425),
    commentUnresolved: register("comment-unresolved", 60426),
    gitPullRequestGoToChanges: register("git-pull-request-go-to-changes", 60427),
    gitPullRequestNewChanges: register("git-pull-request-new-changes", 60428),
    searchFuzzy: register("search-fuzzy", 60429),
    commentDraft: register("comment-draft", 60430),
    send: register("send", 60431),
    sparkle: register("sparkle", 60432),
    insert: register("insert", 60433),
    mic: register("mic", 60434),
    thumbsdownFilled: register("thumbsdown-filled", 60435),
    thumbsupFilled: register("thumbsup-filled", 60436),
    coffee: register("coffee", 60437),
    snake: register("snake", 60438),
    game: register("game", 60439),
    vr: register("vr", 60440),
    chip: register("chip", 60441),
    piano: register("piano", 60442),
    music: register("music", 60443),
    micFilled: register("mic-filled", 60444),
    repoFetch: register("repo-fetch", 60445),
    copilot: register("copilot", 60446),
    lightbulbSparkle: register("lightbulb-sparkle", 60447),
    robot: register("robot", 60448),
    sparkleFilled: register("sparkle-filled", 60449),
    diffSingle: register("diff-single", 60450),
    diffMultiple: register("diff-multiple", 60451),
    surroundWith: register("surround-with", 60452),
    share: register("share", 60453),
    gitStash: register("git-stash", 60454),
    gitStashApply: register("git-stash-apply", 60455),
    gitStashPop: register("git-stash-pop", 60456),
    vscode: register("vscode", 60457),
    vscodeInsiders: register("vscode-insiders", 60458),
    codeOss: register("code-oss", 60459),
    runCoverage: register("run-coverage", 60460),
    runAllCoverage: register("run-all-coverage", 60461),
    coverage: register("coverage", 60462),
    githubProject: register("github-project", 60463),
    mapVertical: register("map-vertical", 60464),
    foldVertical: register("fold-vertical", 60464),
    mapVerticalFilled: register("map-vertical-filled", 60465),
    foldVerticalFilled: register("fold-vertical-filled", 60465),
    goToSearch: register("go-to-search", 60466),
    percentage: register("percentage", 60467),
    sortPercentage: register("sort-percentage", 60467),
    attach: register("attach", 60468),
    goToEditingSession: register("go-to-editing-session", 60469),
    editSession: register("edit-session", 60470),
    codeReview: register("code-review", 60471),
    copilotWarning: register("copilot-warning", 60472),
    python: register("python", 60473),
    copilotLarge: register("copilot-large", 60474),
    copilotWarningLarge: register("copilot-warning-large", 60475),
    keyboardTab: register("keyboard-tab", 60476),
    copilotBlocked: register("copilot-blocked", 60477),
    copilotNotConnected: register("copilot-not-connected", 60478),
    flag: register("flag", 60479),
    lightbulbEmpty: register("lightbulb-empty", 60480),
    symbolMethodArrow: register("symbol-method-arrow", 60481),
    copilotUnavailable: register("copilot-unavailable", 60482),
    repoPinned: register("repo-pinned", 60483),
    keyboardTabAbove: register("keyboard-tab-above", 60484),
    keyboardTabBelow: register("keyboard-tab-below", 60485),
    gitPullRequestDone: register("git-pull-request-done", 60486),
    mcp: register("mcp", 60487),
    extensionsLarge: register("extensions-large", 60488),
    layoutPanelDock: register("layout-panel-dock", 60489),
    layoutSidebarLeftDock: register("layout-sidebar-left-dock", 60490),
    layoutSidebarRightDock: register("layout-sidebar-right-dock", 60491),
    copilotInProgress: register("copilot-in-progress", 60492),
    copilotError: register("copilot-error", 60493),
    copilotSuccess: register("copilot-success", 60494),
    chatSparkle: register("chat-sparkle", 60495),
    searchSparkle: register("search-sparkle", 60496),
    editSparkle: register("edit-sparkle", 60497),
    copilotSnooze: register("copilot-snooze", 60498),
    sendToRemoteAgent: register("send-to-remote-agent", 60499),
    commentDiscussionSparkle: register("comment-discussion-sparkle", 60500),
    chatSparkleWarning: register("chat-sparkle-warning", 60501),
    chatSparkleError: register("chat-sparkle-error", 60502),
    collection: register("collection", 60503),
    newCollection: register("new-collection", 60504),
    thinking: register("thinking", 60505),
    build: register("build", 60506),
    commentDiscussionQuote: register("comment-discussion-quote", 60507),
    cursor: register("cursor", 60508),
    eraser: register("eraser", 60509),
    fileText: register("file-text", 60510),
    quotes: register("quotes", 60512),
    rename: register("rename", 60513),
    runWithDeps: register("run-with-deps", 60514),
    debugConnected: register("debug-connected", 60515),
    strikethrough: register("strikethrough", 60516),
    openInProduct: register("open-in-product", 60517),
    indexZero: register("index-zero", 60518),
    agent: register("agent", 60519),
    editCode: register("edit-code", 60520),
    repoSelected: register("repo-selected", 60521),
    skip: register("skip", 60522),
    mergeInto: register("merge-into", 60523),
    gitBranchChanges: register("git-branch-changes", 60524),
    gitBranchStagedChanges: register("git-branch-staged-changes", 60525),
    gitBranchConflicts: register("git-branch-conflicts", 60526),
    gitBranch: register("git-branch", 60527),
    gitBranchCreate: register("git-branch-create", 60527),
    gitBranchDelete: register("git-branch-delete", 60527),
    searchLarge: register("search-large", 60528),
    terminalGitBash: register("terminal-git-bash", 60529),
    windowActive: register("window-active", 60530),
    forward: register("forward", 60531),
    download: register("download", 60532),
    clockface: register("clockface", 60533),
    unarchive: register("unarchive", 60534),
    sessionInProgress: register("session-in-progress", 60535),
    collectionSmall: register("collection-small", 60536),
    vmSmall: register("vm-small", 60537),
    cloudSmall: register("cloud-small", 60538),
    addSmall: register("add-small", 60539),
    removeSmall: register("remove-small", 60540),
    worktreeSmall: register("worktree-small", 60541),
    worktree: register("worktree", 60542),
    screenCut: register("screen-cut", 60543),
    ask: register("ask", 60544),
    openai: register("openai", 60545),
    claude: register("claude", 60546),
    openInWindow: register("open-in-window", 60547),
    newSession: register("new-session", 60548),
    terminalSecure: register("terminal-secure", 60549),
    chatImport: register("chat-import", 60550),
    chatExport: register("chat-export", 60551),
    shareWindow: register("share-window", 60552),
    circleSlashCompact: register("circle-slash-compact", 60553),
    copilotCompact: register("copilot-compact", 60554),
    folderOpenedCompact: register("folder-opened-compact", 60555),
    folderCompact: register("folder-compact", 60556),
    gearCompact: register("gear-compact", 60557),
    gitBranchCompact: register("git-branch-compact", 60558),
    libraryCompact: register("library-compact", 60559),
    recordKeysCompact: register("record-keys-compact", 60560),
    remoteCompact: register("remote-compact", 60561),
    repoForkedCompact: register("repo-forked-compact", 60562),
    repoCompact: register("repo-compact", 60563),
    shieldCompact: register("shield-compact", 60564),
    sparkleCompact: register("sparkle-compact", 60565),
    symbolColorCompact: register("symbol-color-compact", 60566),
    windowCompact: register("window-compact", 60567),
    errorCompact: register("error-compact", 60568),
    warningCompact: register("warning-compact", 60569),
    passCompact: register("pass-compact", 60570),
    important: register("important", 60571),
    importantCompact: register("important-compact", 60572),
    rocketCompact: register("rocket-compact", 60573),
    unpin: register("unpin", 60574),
    addCompact: register("add-compact", 60575),
    attachCompact: register("attach-compact", 60576),
    beakerCompact: register("beaker-compact", 60577),
    checkCompact: register("check-compact", 60578),
    checklistCompact: register("checklist-compact", 60579),
    chevronDownCompact: register("chevron-down-compact", 60580),
    chevronLeftCompact: register("chevron-left-compact", 60581),
    chevronRightCompact: register("chevron-right-compact", 60582),
    chevronUpCompact: register("chevron-up-compact", 60583),
    circleFilledCompact: register("circle-filled-compact", 60584),
    circleSmallFilledCompact: register("circle-small-filled-compact", 60585),
    closeCompact: register("close-compact", 60586),
    collapseAllCompact: register("collapse-all-compact", 60587),
    commentCompact: register("comment-compact", 60588),
    commentUnresolvedCompact: register("comment-unresolved-compact", 60589),
    debugConnectedCompact: register("debug-connected-compact", 60590),
    debugDisconnectCompact: register("debug-disconnect-compact", 60591),
    editCompact: register("edit-compact", 60592),
    fileMediaCompact: register("file-media-compact", 60593),
    gitFetch: register("git-fetch", 60594),
    lightbulbCompact: register("lightbulb-compact", 60595),
    loadingCompact: register("loading-compact", 60596),
    passFilledCompact: register("pass-filled-compact", 60597),
    projectCompact: register("project-compact", 60598),
    refreshCompact: register("refresh-compact", 60599),
    searchCompact: register("search-compact", 60600),
    sessionInProgressCompact: register("session-in-progress-compact", 60601),
    syncCompact: register("sync-compact", 60602),
    terminalCompact: register("terminal-compact", 60603),
    vmPending: register("vm-pending", 60604),
    worktreeCompact: register("worktree-compact", 60605),
    developerTools: register("developer-tools", 60606),
    cloudCompact: register("cloud-compact", 60607),
    agentCompact: register("agent-compact", 60608),
    askCompact: register("ask-compact", 60609),
    settingsCompact: register("settings-compact", 60610),
    vmCompact: register("vm-compact", 60611),
    runCompact: register("run-compact", 60612),
    gitPullRequestComment: register("git-pull-request-comment", 60613),
    gitPullRequestError: register("git-pull-request-error", 60614),
    rightPanelHide: register("right-panel-hide", 60615),
    rightPanelShow: register("right-panel-show", 60616),
    vscodeInsidersOutline: register("vscode-insiders-outline", 60617),
    vscodeOutline: register("vscode-outline", 60618),
    voiceMode: register("voice-mode", 60619),
    voiceModeCompact: register("voice-mode-compact", 60620)
  };

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/codicons.js
  var codiconsDerived = {
    dialogError: register("dialog-error", "error"),
    dialogWarning: register("dialog-warning", "warning"),
    dialogInfo: register("dialog-info", "info"),
    dialogClose: register("dialog-close", "close"),
    treeItemExpanded: register("tree-item-expanded", "chevron-down"),
    treeFilterOnTypeOn: register("tree-filter-on-type-on", "list-filter"),
    treeFilterOnTypeOff: register("tree-filter-on-type-off", "list-selection"),
    treeFilterClear: register("tree-filter-clear", "close"),
    treeItemLoading: register("tree-item-loading", "loading"),
    menuSelection: register("menu-selection", "check"),
    menuSubmenu: register("menu-submenu", "chevron-right"),
    menuBarMore: register("menubar-more", "more"),
    scrollbarButtonLeft: register("scrollbar-button-left", "triangle-left"),
    scrollbarButtonRight: register("scrollbar-button-right", "triangle-right"),
    scrollbarButtonUp: register("scrollbar-button-up", "triangle-up"),
    scrollbarButtonDown: register("scrollbar-button-down", "triangle-down"),
    toolBarMore: register("toolbar-more", "more"),
    quickInputBack: register("quick-input-back", "arrow-left"),
    dropDownButton: register("drop-down-button", 60084),
    symbolCustomColor: register("symbol-customcolor", 60252),
    exportIcon: register("export", 60332),
    workspaceUnspecified: register("workspace-unspecified", 60355),
    newLine: register("newline", 60394),
    thumbsDownFilled: register("thumbsdown-filled", 60435),
    thumbsUpFilled: register("thumbsup-filled", 60436),
    gitFetch: register("git-fetch", 60445),
    lightbulbSparkleAutofix: register("lightbulb-sparkle-autofix", 60447),
    debugBreakpointPending: register("debug-breakpoint-pending", 60377),
    chatImport: register("chat-import", 60550),
    chatExport: register("chat-export", 60551)
  };
  var Codicon = {
    ...codiconsLibrary,
    ...codiconsDerived
  };

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/editor/common/tokenizationRegistry.js
  var TokenizationRegistry = class {
    constructor() {
      this._tokenizationSupports = /* @__PURE__ */ new Map();
      this._factories = /* @__PURE__ */ new Map();
      this._onDidChange = new Emitter();
      this.onDidChange = this._onDidChange.event;
      this._colorMap = null;
    }
    handleChange(languageIds) {
      this._onDidChange.fire({
        changedLanguages: languageIds,
        changedColorMap: false
      });
    }
    register(languageId, support) {
      this._tokenizationSupports.set(languageId, support);
      this.handleChange([languageId]);
      return toDisposable(() => {
        if (this._tokenizationSupports.get(languageId) !== support) {
          return;
        }
        this._tokenizationSupports.delete(languageId);
        this.handleChange([languageId]);
      });
    }
    get(languageId) {
      return this._tokenizationSupports.get(languageId) || null;
    }
    registerFactory(languageId, factory) {
      this._factories.get(languageId)?.dispose();
      const myData = new TokenizationSupportFactoryData(this, languageId, factory);
      this._factories.set(languageId, myData);
      return toDisposable(() => {
        const v = this._factories.get(languageId);
        if (!v || v !== myData) {
          return;
        }
        this._factories.delete(languageId);
        v.dispose();
      });
    }
    async getOrCreate(languageId) {
      const tokenizationSupport = this.get(languageId);
      if (tokenizationSupport) {
        return tokenizationSupport;
      }
      const factory = this._factories.get(languageId);
      if (!factory || factory.isResolved) {
        return null;
      }
      await factory.resolve();
      return this.get(languageId);
    }
    isResolved(languageId) {
      const tokenizationSupport = this.get(languageId);
      if (tokenizationSupport) {
        return true;
      }
      const factory = this._factories.get(languageId);
      if (!factory || factory.isResolved) {
        return true;
      }
      return false;
    }
    setColorMap(colorMap) {
      this._colorMap = colorMap;
      this._onDidChange.fire({
        changedLanguages: Array.from(this._tokenizationSupports.keys()),
        changedColorMap: true
      });
    }
    getColorMap() {
      return this._colorMap;
    }
    getDefaultBackground() {
      if (this._colorMap && this._colorMap.length > ColorId.DefaultBackground) {
        return this._colorMap[ColorId.DefaultBackground];
      }
      return null;
    }
  };
  var TokenizationSupportFactoryData = class extends Disposable {
    get isResolved() {
      return this._isResolved;
    }
    constructor(_registry, _languageId, _factory) {
      super();
      this._registry = _registry;
      this._languageId = _languageId;
      this._factory = _factory;
      this._isDisposed = false;
      this._resolvePromise = null;
      this._isResolved = false;
    }
    dispose() {
      this._isDisposed = true;
      super.dispose();
    }
    async resolve() {
      if (!this._resolvePromise) {
        this._resolvePromise = this._create();
      }
      return this._resolvePromise;
    }
    async _create() {
      const value = await this._factory.tokenizationSupport;
      this._isResolved = true;
      if (value && !this._isDisposed) {
        this._register(this._registry.register(this._languageId, value));
      }
    }
  };

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/editor/common/languages.js
  var EncodedTokenizationResult = class {
    constructor(tokens, fontInfo, endState) {
      this.tokens = tokens;
      this.fontInfo = fontInfo;
      this.endState = endState;
      this._encodedTokenizationResultBrand = void 0;
    }
  };
  var HoverVerbosityAction;
  (function(HoverVerbosityAction2) {
    HoverVerbosityAction2[HoverVerbosityAction2["Increase"] = 0] = "Increase";
    HoverVerbosityAction2[HoverVerbosityAction2["Decrease"] = 1] = "Decrease";
  })(HoverVerbosityAction || (HoverVerbosityAction = {}));
  var CompletionItemKind;
  (function(CompletionItemKind2) {
    CompletionItemKind2[CompletionItemKind2["Method"] = 0] = "Method";
    CompletionItemKind2[CompletionItemKind2["Function"] = 1] = "Function";
    CompletionItemKind2[CompletionItemKind2["Constructor"] = 2] = "Constructor";
    CompletionItemKind2[CompletionItemKind2["Field"] = 3] = "Field";
    CompletionItemKind2[CompletionItemKind2["Variable"] = 4] = "Variable";
    CompletionItemKind2[CompletionItemKind2["Class"] = 5] = "Class";
    CompletionItemKind2[CompletionItemKind2["Struct"] = 6] = "Struct";
    CompletionItemKind2[CompletionItemKind2["Interface"] = 7] = "Interface";
    CompletionItemKind2[CompletionItemKind2["Module"] = 8] = "Module";
    CompletionItemKind2[CompletionItemKind2["Property"] = 9] = "Property";
    CompletionItemKind2[CompletionItemKind2["Event"] = 10] = "Event";
    CompletionItemKind2[CompletionItemKind2["Operator"] = 11] = "Operator";
    CompletionItemKind2[CompletionItemKind2["Unit"] = 12] = "Unit";
    CompletionItemKind2[CompletionItemKind2["Value"] = 13] = "Value";
    CompletionItemKind2[CompletionItemKind2["Constant"] = 14] = "Constant";
    CompletionItemKind2[CompletionItemKind2["Enum"] = 15] = "Enum";
    CompletionItemKind2[CompletionItemKind2["EnumMember"] = 16] = "EnumMember";
    CompletionItemKind2[CompletionItemKind2["Keyword"] = 17] = "Keyword";
    CompletionItemKind2[CompletionItemKind2["Text"] = 18] = "Text";
    CompletionItemKind2[CompletionItemKind2["Color"] = 19] = "Color";
    CompletionItemKind2[CompletionItemKind2["File"] = 20] = "File";
    CompletionItemKind2[CompletionItemKind2["Reference"] = 21] = "Reference";
    CompletionItemKind2[CompletionItemKind2["Customcolor"] = 22] = "Customcolor";
    CompletionItemKind2[CompletionItemKind2["Folder"] = 23] = "Folder";
    CompletionItemKind2[CompletionItemKind2["TypeParameter"] = 24] = "TypeParameter";
    CompletionItemKind2[CompletionItemKind2["User"] = 25] = "User";
    CompletionItemKind2[CompletionItemKind2["Issue"] = 26] = "Issue";
    CompletionItemKind2[CompletionItemKind2["Tool"] = 27] = "Tool";
    CompletionItemKind2[CompletionItemKind2["Snippet"] = 28] = "Snippet";
  })(CompletionItemKind || (CompletionItemKind = {}));
  var CompletionItemKinds;
  (function(CompletionItemKinds2) {
    const byKind = /* @__PURE__ */ new Map();
    byKind.set(CompletionItemKind.Method, Codicon.symbolMethod);
    byKind.set(CompletionItemKind.Function, Codicon.symbolFunction);
    byKind.set(CompletionItemKind.Constructor, Codicon.symbolConstructor);
    byKind.set(CompletionItemKind.Field, Codicon.symbolField);
    byKind.set(CompletionItemKind.Variable, Codicon.symbolVariable);
    byKind.set(CompletionItemKind.Class, Codicon.symbolClass);
    byKind.set(CompletionItemKind.Struct, Codicon.symbolStruct);
    byKind.set(CompletionItemKind.Interface, Codicon.symbolInterface);
    byKind.set(CompletionItemKind.Module, Codicon.symbolModule);
    byKind.set(CompletionItemKind.Property, Codicon.symbolProperty);
    byKind.set(CompletionItemKind.Event, Codicon.symbolEvent);
    byKind.set(CompletionItemKind.Operator, Codicon.symbolOperator);
    byKind.set(CompletionItemKind.Unit, Codicon.symbolUnit);
    byKind.set(CompletionItemKind.Value, Codicon.symbolValue);
    byKind.set(CompletionItemKind.Enum, Codicon.symbolEnum);
    byKind.set(CompletionItemKind.Constant, Codicon.symbolConstant);
    byKind.set(CompletionItemKind.EnumMember, Codicon.symbolEnumMember);
    byKind.set(CompletionItemKind.Keyword, Codicon.symbolKeyword);
    byKind.set(CompletionItemKind.Snippet, Codicon.symbolSnippet);
    byKind.set(CompletionItemKind.Text, Codicon.symbolText);
    byKind.set(CompletionItemKind.Color, Codicon.symbolColor);
    byKind.set(CompletionItemKind.File, Codicon.symbolFile);
    byKind.set(CompletionItemKind.Reference, Codicon.symbolReference);
    byKind.set(CompletionItemKind.Customcolor, Codicon.symbolCustomColor);
    byKind.set(CompletionItemKind.Folder, Codicon.symbolFolder);
    byKind.set(CompletionItemKind.TypeParameter, Codicon.symbolTypeParameter);
    byKind.set(CompletionItemKind.User, Codicon.account);
    byKind.set(CompletionItemKind.Issue, Codicon.issues);
    byKind.set(CompletionItemKind.Tool, Codicon.tools);
    function toIcon(kind) {
      let codicon = byKind.get(kind);
      if (!codicon) {
        console.info("No codicon found for CompletionItemKind " + kind);
        codicon = Codicon.symbolProperty;
      }
      return codicon;
    }
    CompletionItemKinds2.toIcon = toIcon;
    function toLabel(kind) {
      switch (kind) {
        case CompletionItemKind.Method:
          return localize(837, "Method");
        case CompletionItemKind.Function:
          return localize(838, "Function");
        case CompletionItemKind.Constructor:
          return localize(839, "Constructor");
        case CompletionItemKind.Field:
          return localize(840, "Field");
        case CompletionItemKind.Variable:
          return localize(841, "Variable");
        case CompletionItemKind.Class:
          return localize(842, "Class");
        case CompletionItemKind.Struct:
          return localize(843, "Struct");
        case CompletionItemKind.Interface:
          return localize(844, "Interface");
        case CompletionItemKind.Module:
          return localize(845, "Module");
        case CompletionItemKind.Property:
          return localize(846, "Property");
        case CompletionItemKind.Event:
          return localize(847, "Event");
        case CompletionItemKind.Operator:
          return localize(848, "Operator");
        case CompletionItemKind.Unit:
          return localize(849, "Unit");
        case CompletionItemKind.Value:
          return localize(850, "Value");
        case CompletionItemKind.Constant:
          return localize(851, "Constant");
        case CompletionItemKind.Enum:
          return localize(852, "Enum");
        case CompletionItemKind.EnumMember:
          return localize(853, "Enum Member");
        case CompletionItemKind.Keyword:
          return localize(854, "Keyword");
        case CompletionItemKind.Text:
          return localize(855, "Text");
        case CompletionItemKind.Color:
          return localize(856, "Color");
        case CompletionItemKind.File:
          return localize(857, "File");
        case CompletionItemKind.Reference:
          return localize(858, "Reference");
        case CompletionItemKind.Customcolor:
          return localize(859, "Custom Color");
        case CompletionItemKind.Folder:
          return localize(860, "Folder");
        case CompletionItemKind.TypeParameter:
          return localize(861, "Type Parameter");
        case CompletionItemKind.User:
          return localize(862, "User");
        case CompletionItemKind.Issue:
          return localize(863, "Issue");
        case CompletionItemKind.Tool:
          return localize(864, "Tool");
        case CompletionItemKind.Snippet:
          return localize(865, "Snippet");
        default:
          return "";
      }
    }
    CompletionItemKinds2.toLabel = toLabel;
    const data = /* @__PURE__ */ new Map();
    data.set("method", CompletionItemKind.Method);
    data.set("function", CompletionItemKind.Function);
    data.set("constructor", CompletionItemKind.Constructor);
    data.set("field", CompletionItemKind.Field);
    data.set("variable", CompletionItemKind.Variable);
    data.set("class", CompletionItemKind.Class);
    data.set("struct", CompletionItemKind.Struct);
    data.set("interface", CompletionItemKind.Interface);
    data.set("module", CompletionItemKind.Module);
    data.set("property", CompletionItemKind.Property);
    data.set("event", CompletionItemKind.Event);
    data.set("operator", CompletionItemKind.Operator);
    data.set("unit", CompletionItemKind.Unit);
    data.set("value", CompletionItemKind.Value);
    data.set("constant", CompletionItemKind.Constant);
    data.set("enum", CompletionItemKind.Enum);
    data.set("enum-member", CompletionItemKind.EnumMember);
    data.set("enumMember", CompletionItemKind.EnumMember);
    data.set("keyword", CompletionItemKind.Keyword);
    data.set("snippet", CompletionItemKind.Snippet);
    data.set("text", CompletionItemKind.Text);
    data.set("color", CompletionItemKind.Color);
    data.set("file", CompletionItemKind.File);
    data.set("reference", CompletionItemKind.Reference);
    data.set("customcolor", CompletionItemKind.Customcolor);
    data.set("folder", CompletionItemKind.Folder);
    data.set("type-parameter", CompletionItemKind.TypeParameter);
    data.set("typeParameter", CompletionItemKind.TypeParameter);
    data.set("account", CompletionItemKind.User);
    data.set("issue", CompletionItemKind.Issue);
    data.set("tool", CompletionItemKind.Tool);
    function fromString(value, strict) {
      let res = data.get(value);
      if (typeof res === "undefined" && !strict) {
        res = CompletionItemKind.Property;
      }
      return res;
    }
    CompletionItemKinds2.fromString = fromString;
  })(CompletionItemKinds || (CompletionItemKinds = {}));
  var CompletionItemTag;
  (function(CompletionItemTag2) {
    CompletionItemTag2[CompletionItemTag2["Deprecated"] = 1] = "Deprecated";
  })(CompletionItemTag || (CompletionItemTag = {}));
  var CompletionItemInsertTextRule;
  (function(CompletionItemInsertTextRule2) {
    CompletionItemInsertTextRule2[CompletionItemInsertTextRule2["None"] = 0] = "None";
    CompletionItemInsertTextRule2[CompletionItemInsertTextRule2["KeepWhitespace"] = 1] = "KeepWhitespace";
    CompletionItemInsertTextRule2[CompletionItemInsertTextRule2["InsertAsSnippet"] = 4] = "InsertAsSnippet";
  })(CompletionItemInsertTextRule || (CompletionItemInsertTextRule = {}));
  var PartialAcceptTriggerKind;
  (function(PartialAcceptTriggerKind2) {
    PartialAcceptTriggerKind2[PartialAcceptTriggerKind2["Word"] = 0] = "Word";
    PartialAcceptTriggerKind2[PartialAcceptTriggerKind2["Line"] = 1] = "Line";
    PartialAcceptTriggerKind2[PartialAcceptTriggerKind2["Suggest"] = 2] = "Suggest";
  })(PartialAcceptTriggerKind || (PartialAcceptTriggerKind = {}));
  var CompletionTriggerKind;
  (function(CompletionTriggerKind2) {
    CompletionTriggerKind2[CompletionTriggerKind2["Invoke"] = 0] = "Invoke";
    CompletionTriggerKind2[CompletionTriggerKind2["TriggerCharacter"] = 1] = "TriggerCharacter";
    CompletionTriggerKind2[CompletionTriggerKind2["TriggerForIncompleteCompletions"] = 2] = "TriggerForIncompleteCompletions";
  })(CompletionTriggerKind || (CompletionTriggerKind = {}));
  var InlineCompletionTriggerKind;
  (function(InlineCompletionTriggerKind2) {
    InlineCompletionTriggerKind2[InlineCompletionTriggerKind2["Automatic"] = 0] = "Automatic";
    InlineCompletionTriggerKind2[InlineCompletionTriggerKind2["Explicit"] = 1] = "Explicit";
  })(InlineCompletionTriggerKind || (InlineCompletionTriggerKind = {}));
  var InlineCompletionHintStyle;
  (function(InlineCompletionHintStyle2) {
    InlineCompletionHintStyle2[InlineCompletionHintStyle2["Code"] = 1] = "Code";
    InlineCompletionHintStyle2[InlineCompletionHintStyle2["Label"] = 2] = "Label";
  })(InlineCompletionHintStyle || (InlineCompletionHintStyle = {}));
  var InlineCompletionEndOfLifeReasonKind;
  (function(InlineCompletionEndOfLifeReasonKind2) {
    InlineCompletionEndOfLifeReasonKind2[InlineCompletionEndOfLifeReasonKind2["Accepted"] = 0] = "Accepted";
    InlineCompletionEndOfLifeReasonKind2[InlineCompletionEndOfLifeReasonKind2["Rejected"] = 1] = "Rejected";
    InlineCompletionEndOfLifeReasonKind2[InlineCompletionEndOfLifeReasonKind2["Ignored"] = 2] = "Ignored";
  })(
    InlineCompletionEndOfLifeReasonKind || (InlineCompletionEndOfLifeReasonKind = {})
  );
  var CodeActionTriggerType;
  (function(CodeActionTriggerType2) {
    CodeActionTriggerType2[CodeActionTriggerType2["Invoke"] = 1] = "Invoke";
    CodeActionTriggerType2[CodeActionTriggerType2["Auto"] = 2] = "Auto";
  })(CodeActionTriggerType || (CodeActionTriggerType = {}));
  var DocumentPasteTriggerKind;
  (function(DocumentPasteTriggerKind2) {
    DocumentPasteTriggerKind2[DocumentPasteTriggerKind2["Automatic"] = 0] = "Automatic";
    DocumentPasteTriggerKind2[DocumentPasteTriggerKind2["PasteAs"] = 1] = "PasteAs";
  })(DocumentPasteTriggerKind || (DocumentPasteTriggerKind = {}));
  var SignatureHelpTriggerKind;
  (function(SignatureHelpTriggerKind2) {
    SignatureHelpTriggerKind2[SignatureHelpTriggerKind2["Invoke"] = 1] = "Invoke";
    SignatureHelpTriggerKind2[SignatureHelpTriggerKind2["TriggerCharacter"] = 2] = "TriggerCharacter";
    SignatureHelpTriggerKind2[SignatureHelpTriggerKind2["ContentChange"] = 3] = "ContentChange";
  })(SignatureHelpTriggerKind || (SignatureHelpTriggerKind = {}));
  var DocumentHighlightKind;
  (function(DocumentHighlightKind2) {
    DocumentHighlightKind2[DocumentHighlightKind2["Text"] = 0] = "Text";
    DocumentHighlightKind2[DocumentHighlightKind2["Read"] = 1] = "Read";
    DocumentHighlightKind2[DocumentHighlightKind2["Write"] = 2] = "Write";
  })(DocumentHighlightKind || (DocumentHighlightKind = {}));
  var SymbolKind;
  (function(SymbolKind2) {
    SymbolKind2[SymbolKind2["File"] = 0] = "File";
    SymbolKind2[SymbolKind2["Module"] = 1] = "Module";
    SymbolKind2[SymbolKind2["Namespace"] = 2] = "Namespace";
    SymbolKind2[SymbolKind2["Package"] = 3] = "Package";
    SymbolKind2[SymbolKind2["Class"] = 4] = "Class";
    SymbolKind2[SymbolKind2["Method"] = 5] = "Method";
    SymbolKind2[SymbolKind2["Property"] = 6] = "Property";
    SymbolKind2[SymbolKind2["Field"] = 7] = "Field";
    SymbolKind2[SymbolKind2["Constructor"] = 8] = "Constructor";
    SymbolKind2[SymbolKind2["Enum"] = 9] = "Enum";
    SymbolKind2[SymbolKind2["Interface"] = 10] = "Interface";
    SymbolKind2[SymbolKind2["Function"] = 11] = "Function";
    SymbolKind2[SymbolKind2["Variable"] = 12] = "Variable";
    SymbolKind2[SymbolKind2["Constant"] = 13] = "Constant";
    SymbolKind2[SymbolKind2["String"] = 14] = "String";
    SymbolKind2[SymbolKind2["Number"] = 15] = "Number";
    SymbolKind2[SymbolKind2["Boolean"] = 16] = "Boolean";
    SymbolKind2[SymbolKind2["Array"] = 17] = "Array";
    SymbolKind2[SymbolKind2["Object"] = 18] = "Object";
    SymbolKind2[SymbolKind2["Key"] = 19] = "Key";
    SymbolKind2[SymbolKind2["Null"] = 20] = "Null";
    SymbolKind2[SymbolKind2["EnumMember"] = 21] = "EnumMember";
    SymbolKind2[SymbolKind2["Struct"] = 22] = "Struct";
    SymbolKind2[SymbolKind2["Event"] = 23] = "Event";
    SymbolKind2[SymbolKind2["Operator"] = 24] = "Operator";
    SymbolKind2[SymbolKind2["TypeParameter"] = 25] = "TypeParameter";
  })(SymbolKind || (SymbolKind = {}));
  var symbolKindNames = {
    [SymbolKind.Array]: localize(866, "array"),
    [SymbolKind.Boolean]: localize(867, "boolean"),
    [SymbolKind.Class]: localize(868, "class"),
    [SymbolKind.Constant]: localize(869, "constant"),
    [SymbolKind.Constructor]: localize(870, "constructor"),
    [SymbolKind.Enum]: localize(871, "enumeration"),
    [SymbolKind.EnumMember]: localize(872, "enumeration member"),
    [SymbolKind.Event]: localize(873, "event"),
    [SymbolKind.Field]: localize(874, "field"),
    [SymbolKind.File]: localize(875, "file"),
    [SymbolKind.Function]: localize(876, "function"),
    [SymbolKind.Interface]: localize(877, "interface"),
    [SymbolKind.Key]: localize(878, "key"),
    [SymbolKind.Method]: localize(879, "method"),
    [SymbolKind.Module]: localize(880, "module"),
    [SymbolKind.Namespace]: localize(881, "namespace"),
    [SymbolKind.Null]: localize(882, "null"),
    [SymbolKind.Number]: localize(883, "number"),
    [SymbolKind.Object]: localize(884, "object"),
    [SymbolKind.Operator]: localize(885, "operator"),
    [SymbolKind.Package]: localize(886, "package"),
    [SymbolKind.Property]: localize(887, "property"),
    [SymbolKind.String]: localize(888, "string"),
    [SymbolKind.Struct]: localize(889, "struct"),
    [SymbolKind.TypeParameter]: localize(890, "type parameter"),
    [SymbolKind.Variable]: localize(891, "variable")
  };
  var SymbolTag;
  (function(SymbolTag2) {
    SymbolTag2[SymbolTag2["Deprecated"] = 1] = "Deprecated";
  })(SymbolTag || (SymbolTag = {}));
  var SymbolKinds;
  (function(SymbolKinds2) {
    const byKind = /* @__PURE__ */ new Map();
    byKind.set(SymbolKind.File, Codicon.symbolFile);
    byKind.set(SymbolKind.Module, Codicon.symbolModule);
    byKind.set(SymbolKind.Namespace, Codicon.symbolNamespace);
    byKind.set(SymbolKind.Package, Codicon.symbolPackage);
    byKind.set(SymbolKind.Class, Codicon.symbolClass);
    byKind.set(SymbolKind.Method, Codicon.symbolMethod);
    byKind.set(SymbolKind.Property, Codicon.symbolProperty);
    byKind.set(SymbolKind.Field, Codicon.symbolField);
    byKind.set(SymbolKind.Constructor, Codicon.symbolConstructor);
    byKind.set(SymbolKind.Enum, Codicon.symbolEnum);
    byKind.set(SymbolKind.Interface, Codicon.symbolInterface);
    byKind.set(SymbolKind.Function, Codicon.symbolFunction);
    byKind.set(SymbolKind.Variable, Codicon.symbolVariable);
    byKind.set(SymbolKind.Constant, Codicon.symbolConstant);
    byKind.set(SymbolKind.String, Codicon.symbolString);
    byKind.set(SymbolKind.Number, Codicon.symbolNumber);
    byKind.set(SymbolKind.Boolean, Codicon.symbolBoolean);
    byKind.set(SymbolKind.Array, Codicon.symbolArray);
    byKind.set(SymbolKind.Object, Codicon.symbolObject);
    byKind.set(SymbolKind.Key, Codicon.symbolKey);
    byKind.set(SymbolKind.Null, Codicon.symbolNull);
    byKind.set(SymbolKind.EnumMember, Codicon.symbolEnumMember);
    byKind.set(SymbolKind.Struct, Codicon.symbolStruct);
    byKind.set(SymbolKind.Event, Codicon.symbolEvent);
    byKind.set(SymbolKind.Operator, Codicon.symbolOperator);
    byKind.set(SymbolKind.TypeParameter, Codicon.symbolTypeParameter);
    function toIcon(kind) {
      let icon = byKind.get(kind);
      if (!icon) {
        console.info("No codicon found for SymbolKind " + kind);
        icon = Codicon.symbolProperty;
      }
      return icon;
    }
    SymbolKinds2.toIcon = toIcon;
    const byCompletionKind = /* @__PURE__ */ new Map();
    byCompletionKind.set(SymbolKind.File, CompletionItemKind.File);
    byCompletionKind.set(SymbolKind.Module, CompletionItemKind.Module);
    byCompletionKind.set(SymbolKind.Namespace, CompletionItemKind.Module);
    byCompletionKind.set(SymbolKind.Package, CompletionItemKind.Module);
    byCompletionKind.set(SymbolKind.Class, CompletionItemKind.Class);
    byCompletionKind.set(SymbolKind.Method, CompletionItemKind.Method);
    byCompletionKind.set(SymbolKind.Property, CompletionItemKind.Property);
    byCompletionKind.set(SymbolKind.Field, CompletionItemKind.Field);
    byCompletionKind.set(SymbolKind.Constructor, CompletionItemKind.Constructor);
    byCompletionKind.set(SymbolKind.Enum, CompletionItemKind.Enum);
    byCompletionKind.set(SymbolKind.Interface, CompletionItemKind.Interface);
    byCompletionKind.set(SymbolKind.Function, CompletionItemKind.Function);
    byCompletionKind.set(SymbolKind.Variable, CompletionItemKind.Variable);
    byCompletionKind.set(SymbolKind.Constant, CompletionItemKind.Constant);
    byCompletionKind.set(SymbolKind.String, CompletionItemKind.Text);
    byCompletionKind.set(SymbolKind.Number, CompletionItemKind.Value);
    byCompletionKind.set(SymbolKind.Boolean, CompletionItemKind.Value);
    byCompletionKind.set(SymbolKind.Array, CompletionItemKind.Value);
    byCompletionKind.set(SymbolKind.Object, CompletionItemKind.Value);
    byCompletionKind.set(SymbolKind.Key, CompletionItemKind.Keyword);
    byCompletionKind.set(SymbolKind.Null, CompletionItemKind.Value);
    byCompletionKind.set(SymbolKind.EnumMember, CompletionItemKind.EnumMember);
    byCompletionKind.set(SymbolKind.Struct, CompletionItemKind.Struct);
    byCompletionKind.set(SymbolKind.Event, CompletionItemKind.Event);
    byCompletionKind.set(SymbolKind.Operator, CompletionItemKind.Operator);
    byCompletionKind.set(SymbolKind.TypeParameter, CompletionItemKind.TypeParameter);
    function toCompletionKind(kind) {
      let completionKind = byCompletionKind.get(kind);
      if (completionKind === void 0) {
        console.info("No completion kind found for SymbolKind " + kind);
        completionKind = CompletionItemKind.File;
      }
      return completionKind;
    }
    SymbolKinds2.toCompletionKind = toCompletionKind;
  })(SymbolKinds || (SymbolKinds = {}));
  var FoldingRangeKind = class _FoldingRangeKind {
    static {
      this.Comment = new _FoldingRangeKind("comment");
    }
    static {
      this.Imports = new _FoldingRangeKind("imports");
    }
    static {
      this.Region = new _FoldingRangeKind("region");
    }
    static fromValue(value) {
      switch (value) {
        case "comment":
          return _FoldingRangeKind.Comment;
        case "imports":
          return _FoldingRangeKind.Imports;
        case "region":
          return _FoldingRangeKind.Region;
      }
      return new _FoldingRangeKind(value);
    }
    constructor(value) {
      this.value = value;
    }
  };
  var NewSymbolNameTag;
  (function(NewSymbolNameTag2) {
    NewSymbolNameTag2[NewSymbolNameTag2["AIGenerated"] = 1] = "AIGenerated";
  })(NewSymbolNameTag || (NewSymbolNameTag = {}));
  var NewSymbolNameTriggerKind;
  (function(NewSymbolNameTriggerKind2) {
    NewSymbolNameTriggerKind2[NewSymbolNameTriggerKind2["Invoke"] = 0] = "Invoke";
    NewSymbolNameTriggerKind2[NewSymbolNameTriggerKind2["Automatic"] = 1] = "Automatic";
  })(NewSymbolNameTriggerKind || (NewSymbolNameTriggerKind = {}));
  var Command;
  (function(Command2) {
    function is(obj) {
      if (!obj || typeof obj !== "object") {
        return false;
      }
      return typeof obj.id === "string" && typeof obj.title === "string";
    }
    Command2.is = is;
  })(Command || (Command = {}));
  var CommentThreadCollapsibleState;
  (function(CommentThreadCollapsibleState2) {
    CommentThreadCollapsibleState2[CommentThreadCollapsibleState2["Collapsed"] = 0] = "Collapsed";
    CommentThreadCollapsibleState2[CommentThreadCollapsibleState2["Expanded"] = 1] = "Expanded";
  })(CommentThreadCollapsibleState || (CommentThreadCollapsibleState = {}));
  var CommentThreadState;
  (function(CommentThreadState2) {
    CommentThreadState2[CommentThreadState2["Unresolved"] = 0] = "Unresolved";
    CommentThreadState2[CommentThreadState2["Resolved"] = 1] = "Resolved";
  })(CommentThreadState || (CommentThreadState = {}));
  var CommentThreadApplicability;
  (function(CommentThreadApplicability2) {
    CommentThreadApplicability2[CommentThreadApplicability2["Current"] = 0] = "Current";
    CommentThreadApplicability2[CommentThreadApplicability2["Outdated"] = 1] = "Outdated";
  })(CommentThreadApplicability || (CommentThreadApplicability = {}));
  var CommentMode;
  (function(CommentMode2) {
    CommentMode2[CommentMode2["Editing"] = 0] = "Editing";
    CommentMode2[CommentMode2["Preview"] = 1] = "Preview";
  })(CommentMode || (CommentMode = {}));
  var CommentState;
  (function(CommentState2) {
    CommentState2[CommentState2["Published"] = 0] = "Published";
    CommentState2[CommentState2["Draft"] = 1] = "Draft";
  })(CommentState || (CommentState = {}));
  var InlayHintKind;
  (function(InlayHintKind2) {
    InlayHintKind2[InlayHintKind2["Type"] = 1] = "Type";
    InlayHintKind2[InlayHintKind2["Parameter"] = 2] = "Parameter";
  })(InlayHintKind || (InlayHintKind = {}));
  var TokenizationRegistry2 = new TokenizationRegistry();
  var ExternalUriOpenerPriority;
  (function(ExternalUriOpenerPriority2) {
    ExternalUriOpenerPriority2[ExternalUriOpenerPriority2["None"] = 0] = "None";
    ExternalUriOpenerPriority2[ExternalUriOpenerPriority2["Option"] = 1] = "Option";
    ExternalUriOpenerPriority2[ExternalUriOpenerPriority2["Default"] = 2] = "Default";
    ExternalUriOpenerPriority2[ExternalUriOpenerPriority2["Preferred"] = 3] = "Preferred";
  })(ExternalUriOpenerPriority || (ExternalUriOpenerPriority = {}));

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/editor/common/languages/nullTokenize.js
  var NullState = new class {
    clone() {
      return this;
    }
    equals(other) {
      return this === other;
    }
  }();
  function nullTokenizeEncoded(languageId, state) {
    const tokens = new Uint32Array(2);
    tokens[0] = 0;
    tokens[1] = (languageId << MetadataConsts.LANGUAGEID_OFFSET | StandardTokenType.Other << MetadataConsts.TOKEN_TYPE_OFFSET | FontStyle.None << MetadataConsts.FONT_STYLE_OFFSET | ColorId.DefaultForeground << MetadataConsts.FOREGROUND_OFFSET | ColorId.DefaultBackground << MetadataConsts.BACKGROUND_OFFSET) >>> 0;
    return new EncodedTokenizationResult(tokens, [], state === null ? NullState : state);
  }

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/editor/common/model/fixedArray.js
  var FixedArray = class {
    constructor(_default) {
      this._default = _default;
      this._store = [];
    }
    get(index) {
      if (index < this._store.length) {
        return this._store[index];
      }
      return this._default;
    }
    set(index, value) {
      while (index >= this._store.length) {
        this._store[this._store.length] = this._default;
      }
      this._store[index] = value;
    }
    replace(index, oldLength, newLength) {
      if (index >= this._store.length) {
        return;
      }
      if (oldLength === 0) {
        this.insert(index, newLength);
        return;
      } else if (newLength === 0) {
        this.delete(index, oldLength);
        return;
      }
      const before = this._store.slice(0, index);
      const after = this._store.slice(index + oldLength);
      const insertArr = arrayFill(newLength, this._default);
      this._store = before.concat(insertArr, after);
    }
    delete(deleteIndex, deleteCount) {
      if (deleteCount === 0 || deleteIndex >= this._store.length) {
        return;
      }
      this._store.splice(deleteIndex, deleteCount);
    }
    insert(insertIndex, insertCount) {
      if (insertCount === 0 || insertIndex >= this._store.length) {
        return;
      }
      const arr = [];
      for (let i = 0; i < insertCount; i++) {
        arr[i] = this._default;
      }
      this._store = arrayInsert(this._store, insertIndex, arr);
    }
  };
  function arrayFill(length, value) {
    const arr = [];
    for (let i = 0; i < length; i++) {
      arr[i] = value;
    }
    return arr;
  }

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/buffer.js
  var indexOfTable = new Lazy(() => new Uint8Array(256));
  function readUInt32BE(source, offset) {
    return source[offset] * 2 ** 24 + source[offset + 1] * 2 ** 16 + source[offset + 2] * 2 ** 8 + source[offset + 3];
  }
  function writeUInt32BE(destination, value, offset) {
    destination[offset + 3] = value;
    value = value >>> 8;
    destination[offset + 2] = value;
    value = value >>> 8;
    destination[offset + 1] = value;
    value = value >>> 8;
    destination[offset] = value;
  }

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/editor/common/tokens/lineTokens.js
  var LineTokens = class _LineTokens {
    static createEmpty(lineContent, decoder) {
      const defaultMetadata = _LineTokens.defaultTokenMetadata;
      const tokens = new Uint32Array(2);
      tokens[0] = lineContent.length;
      tokens[1] = defaultMetadata;
      return new _LineTokens(tokens, lineContent, decoder);
    }
    static createFromTextAndMetadata(data, decoder) {
      let offset = 0;
      let fullText = "";
      const tokens = new Array();
      for (const {
        text,
        metadata
      } of data) {
        tokens.push(offset + text.length, metadata);
        offset += text.length;
        fullText += text;
      }
      return new _LineTokens(new Uint32Array(tokens), fullText, decoder);
    }
    static convertToEndOffset(tokens, lineTextLength) {
      const tokenCount = tokens.length >>> 1;
      const lastTokenIndex = tokenCount - 1;
      for (let tokenIndex = 0; tokenIndex < lastTokenIndex; tokenIndex++) {
        tokens[tokenIndex << 1] = tokens[tokenIndex + 1 << 1];
      }
      tokens[lastTokenIndex << 1] = lineTextLength;
    }
    static findIndexInTokensArray(tokens, desiredIndex) {
      if (tokens.length <= 2) {
        return 0;
      }
      let low = 0;
      let high = (tokens.length >>> 1) - 1;
      while (low < high) {
        const mid = low + Math.floor((high - low) / 2);
        const endOffset = tokens[mid << 1];
        if (endOffset === desiredIndex) {
          return mid + 1;
        } else if (endOffset < desiredIndex) {
          low = mid + 1;
        } else if (endOffset > desiredIndex) {
          high = mid;
        }
      }
      return low;
    }
    static {
      this.defaultTokenMetadata = (FontStyle.None << MetadataConsts.FONT_STYLE_OFFSET | ColorId.DefaultForeground << MetadataConsts.FOREGROUND_OFFSET | ColorId.DefaultBackground << MetadataConsts.BACKGROUND_OFFSET) >>> 0;
    }
    constructor(tokens, text, decoder) {
      this._lineTokensBrand = void 0;
      const tokensLength = tokens.length > 1 ? tokens[tokens.length - 2] : 0;
      if (tokensLength !== text.length) {
        onUnexpectedError(new Error("Token length and text length do not match!"));
      }
      this._tokens = tokens;
      this._tokensCount = this._tokens.length >>> 1;
      this._text = text;
      this.languageIdCodec = decoder;
    }
    getTextLength() {
      return this._text.length;
    }
    equals(other) {
      if (other instanceof _LineTokens) {
        return this.slicedEquals(other, 0, this._tokensCount);
      }
      return false;
    }
    slicedEquals(other, sliceFromTokenIndex, sliceTokenCount) {
      if (this._text !== other._text) {
        return false;
      }
      if (this._tokensCount !== other._tokensCount) {
        return false;
      }
      const from = sliceFromTokenIndex << 1;
      const to = from + (sliceTokenCount << 1);
      for (let i = from; i < to; i++) {
        if (this._tokens[i] !== other._tokens[i]) {
          return false;
        }
      }
      return true;
    }
    getLineContent() {
      return this._text;
    }
    getCount() {
      return this._tokensCount;
    }
    getStartOffset(tokenIndex) {
      if (tokenIndex > 0) {
        return this._tokens[tokenIndex - 1 << 1];
      }
      return 0;
    }
    getMetadata(tokenIndex) {
      const metadata = this._tokens[(tokenIndex << 1) + 1];
      return metadata;
    }
    getLanguageId(tokenIndex) {
      const metadata = this._tokens[(tokenIndex << 1) + 1];
      const languageId = TokenMetadata.getLanguageId(metadata);
      return this.languageIdCodec.decodeLanguageId(languageId);
    }
    getStandardTokenType(tokenIndex) {
      const metadata = this._tokens[(tokenIndex << 1) + 1];
      return TokenMetadata.getTokenType(metadata);
    }
    getForeground(tokenIndex) {
      const metadata = this._tokens[(tokenIndex << 1) + 1];
      return TokenMetadata.getForeground(metadata);
    }
    getClassName(tokenIndex) {
      const metadata = this._tokens[(tokenIndex << 1) + 1];
      return TokenMetadata.getClassNameFromMetadata(metadata);
    }
    getInlineStyle(tokenIndex, colorMap) {
      const metadata = this._tokens[(tokenIndex << 1) + 1];
      return TokenMetadata.getInlineStyleFromMetadata(metadata, colorMap);
    }
    getPresentation(tokenIndex) {
      const metadata = this._tokens[(tokenIndex << 1) + 1];
      return TokenMetadata.getPresentationFromMetadata(metadata);
    }
    getEndOffset(tokenIndex) {
      return this._tokens[tokenIndex << 1];
    }
    findTokenIndexAtOffset(offset) {
      return _LineTokens.findIndexInTokensArray(this._tokens, offset);
    }
    inflate() {
      return this;
    }
    sliceAndInflate(startOffset, endOffset, deltaOffset) {
      return new SliceLineTokens(this, startOffset, endOffset, deltaOffset);
    }
    sliceZeroCopy(range) {
      return this.sliceAndInflate(range.start, range.endExclusive, 0);
    }
    withInserted(insertTokens) {
      if (insertTokens.length === 0) {
        return this;
      }
      let nextOriginalTokenIdx = 0;
      let nextInsertTokenIdx = 0;
      let text = "";
      const newTokens = new Array();
      let originalEndOffset = 0;
      while (true) {
        const nextOriginalTokenEndOffset = nextOriginalTokenIdx < this._tokensCount ? this._tokens[nextOriginalTokenIdx << 1] : -1;
        const nextInsertToken = nextInsertTokenIdx < insertTokens.length ? insertTokens[nextInsertTokenIdx] : null;
        if (nextOriginalTokenEndOffset !== -1 && (nextInsertToken === null || nextOriginalTokenEndOffset <= nextInsertToken.offset)) {
          text += this._text.substring(originalEndOffset, nextOriginalTokenEndOffset);
          const metadata = this._tokens[(nextOriginalTokenIdx << 1) + 1];
          newTokens.push(text.length, metadata);
          nextOriginalTokenIdx++;
          originalEndOffset = nextOriginalTokenEndOffset;
        } else if (nextInsertToken) {
          if (nextInsertToken.offset > originalEndOffset) {
            text += this._text.substring(originalEndOffset, nextInsertToken.offset);
            const metadata = this._tokens[(nextOriginalTokenIdx << 1) + 1];
            newTokens.push(text.length, metadata);
            originalEndOffset = nextInsertToken.offset;
          }
          text += nextInsertToken.text;
          newTokens.push(text.length, nextInsertToken.tokenMetadata);
          nextInsertTokenIdx++;
        } else {
          break;
        }
      }
      return new _LineTokens(new Uint32Array(newTokens), text, this.languageIdCodec);
    }
    getTokensInRange(range) {
      const builder = new TokenArrayBuilder();
      const startTokenIndex = this.findTokenIndexAtOffset(range.start);
      const endTokenIndex = this.findTokenIndexAtOffset(range.endExclusive);
      for (let tokenIndex = startTokenIndex; tokenIndex <= endTokenIndex; tokenIndex++) {
        const tokenRange = new OffsetRange(this.getStartOffset(tokenIndex), this.getEndOffset(tokenIndex));
        const length = tokenRange.intersectionLength(range);
        if (length > 0) {
          builder.add(length, this.getMetadata(tokenIndex));
        }
      }
      return builder.build();
    }
    getTokenText(tokenIndex) {
      const startOffset = this.getStartOffset(tokenIndex);
      const endOffset = this.getEndOffset(tokenIndex);
      const text = this._text.substring(startOffset, endOffset);
      return text;
    }
    forEach(callback) {
      const tokenCount = this.getCount();
      for (let tokenIndex = 0; tokenIndex < tokenCount; tokenIndex++) {
        callback(tokenIndex);
      }
    }
    toString() {
      let result = "";
      this.forEach((i) => {
        result += `[${this.getTokenText(i)}]{${this.getClassName(i)}}`;
      });
      return result;
    }
  };
  var SliceLineTokens = class _SliceLineTokens {
    constructor(source, startOffset, endOffset, deltaOffset) {
      this._source = source;
      this._startOffset = startOffset;
      this._endOffset = endOffset;
      this._deltaOffset = deltaOffset;
      this._firstTokenIndex = source.findTokenIndexAtOffset(startOffset);
      this.languageIdCodec = source.languageIdCodec;
      this._tokensCount = 0;
      for (let i = this._firstTokenIndex, len = source.getCount(); i < len; i++) {
        const tokenStartOffset = source.getStartOffset(i);
        if (tokenStartOffset >= endOffset) {
          break;
        }
        this._tokensCount++;
      }
    }
    getMetadata(tokenIndex) {
      return this._source.getMetadata(this._firstTokenIndex + tokenIndex);
    }
    getLanguageId(tokenIndex) {
      return this._source.getLanguageId(this._firstTokenIndex + tokenIndex);
    }
    getLineContent() {
      return this._source.getLineContent().substring(this._startOffset, this._endOffset);
    }
    equals(other) {
      if (other instanceof _SliceLineTokens) {
        return this._startOffset === other._startOffset && this._endOffset === other._endOffset && this._deltaOffset === other._deltaOffset && this._source.slicedEquals(other._source, this._firstTokenIndex, this._tokensCount);
      }
      return false;
    }
    getCount() {
      return this._tokensCount;
    }
    getStandardTokenType(tokenIndex) {
      return this._source.getStandardTokenType(this._firstTokenIndex + tokenIndex);
    }
    getForeground(tokenIndex) {
      return this._source.getForeground(this._firstTokenIndex + tokenIndex);
    }
    getEndOffset(tokenIndex) {
      const tokenEndOffset = this._source.getEndOffset(this._firstTokenIndex + tokenIndex);
      return Math.min(this._endOffset, tokenEndOffset) - this._startOffset + this._deltaOffset;
    }
    getClassName(tokenIndex) {
      return this._source.getClassName(this._firstTokenIndex + tokenIndex);
    }
    getInlineStyle(tokenIndex, colorMap) {
      return this._source.getInlineStyle(this._firstTokenIndex + tokenIndex, colorMap);
    }
    getPresentation(tokenIndex) {
      return this._source.getPresentation(this._firstTokenIndex + tokenIndex);
    }
    findTokenIndexAtOffset(offset) {
      return this._source.findTokenIndexAtOffset(offset + this._startOffset - this._deltaOffset) - this._firstTokenIndex;
    }
    getTokenText(tokenIndex) {
      const adjustedTokenIndex = this._firstTokenIndex + tokenIndex;
      const tokenStartOffset = this._source.getStartOffset(adjustedTokenIndex);
      const tokenEndOffset = this._source.getEndOffset(adjustedTokenIndex);
      let text = this._source.getTokenText(adjustedTokenIndex);
      if (tokenStartOffset < this._startOffset) {
        text = text.substring(this._startOffset - tokenStartOffset);
      }
      if (tokenEndOffset > this._endOffset) {
        text = text.substring(0, text.length - (tokenEndOffset - this._endOffset));
      }
      return text;
    }
    forEach(callback) {
      for (let tokenIndex = 0; tokenIndex < this.getCount(); tokenIndex++) {
        callback(tokenIndex);
      }
    }
  };
  var TokenArray = class _TokenArray {
    static fromLineTokens(lineTokens) {
      const tokenInfo = [];
      for (let i = 0; i < lineTokens.getCount(); i++) {
        tokenInfo.push(new TokenInfo(
          lineTokens.getEndOffset(i) - lineTokens.getStartOffset(i),
          lineTokens.getMetadata(i)
        ));
      }
      return _TokenArray.create(tokenInfo);
    }
    static create(tokenInfo) {
      return new _TokenArray(tokenInfo);
    }
    constructor(_tokenInfo) {
      this._tokenInfo = _tokenInfo;
    }
    toLineTokens(lineContent, decoder) {
      return LineTokens.createFromTextAndMetadata(this.map((r, t) => ({
        text: r.substring(lineContent),
        metadata: t.metadata
      })), decoder);
    }
    forEach(cb) {
      let lengthSum = 0;
      for (const tokenInfo of this._tokenInfo) {
        const range = new OffsetRange(lengthSum, lengthSum + tokenInfo.length);
        cb(range, tokenInfo);
        lengthSum += tokenInfo.length;
      }
    }
    map(cb) {
      const result = [];
      let lengthSum = 0;
      for (const tokenInfo of this._tokenInfo) {
        const range = new OffsetRange(lengthSum, lengthSum + tokenInfo.length);
        result.push(cb(range, tokenInfo));
        lengthSum += tokenInfo.length;
      }
      return result;
    }
    slice(range) {
      const result = [];
      let lengthSum = 0;
      for (const tokenInfo of this._tokenInfo) {
        const tokenStart = lengthSum;
        const tokenEndEx = tokenStart + tokenInfo.length;
        if (tokenEndEx > range.start) {
          if (tokenStart >= range.endExclusive) {
            break;
          }
          const deltaBefore = Math.max(0, range.start - tokenStart);
          const deltaAfter = Math.max(0, tokenEndEx - range.endExclusive);
          result.push(new TokenInfo(tokenInfo.length - deltaBefore - deltaAfter, tokenInfo.metadata));
        }
        lengthSum += tokenInfo.length;
      }
      return _TokenArray.create(result);
    }
    append(other) {
      const result = this._tokenInfo.concat(other._tokenInfo);
      return _TokenArray.create(result);
    }
  };
  var TokenInfo = class {
    constructor(length, metadata) {
      this.length = length;
      this.metadata = metadata;
    }
  };
  var TokenArrayBuilder = class {
    constructor() {
      this._tokens = [];
    }
    add(length, metadata) {
      this._tokens.push(new TokenInfo(length, metadata));
    }
    build() {
      return TokenArray.create(this._tokens);
    }
  };

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/editor/common/tokens/contiguousTokensEditing.js
  var EMPTY_LINE_TOKENS = new Uint32Array(0).buffer;
  var ContiguousTokensEditing = class _ContiguousTokensEditing {
    static deleteBeginning(lineTokens, toChIndex) {
      if (lineTokens === null || lineTokens === EMPTY_LINE_TOKENS) {
        return lineTokens;
      }
      return _ContiguousTokensEditing.delete(lineTokens, 0, toChIndex);
    }
    static deleteEnding(lineTokens, fromChIndex) {
      if (lineTokens === null || lineTokens === EMPTY_LINE_TOKENS) {
        return lineTokens;
      }
      const tokens = toUint32Array(lineTokens);
      const lineTextLength = tokens[tokens.length - 2];
      return _ContiguousTokensEditing.delete(lineTokens, fromChIndex, lineTextLength);
    }
    static delete(lineTokens, fromChIndex, toChIndex) {
      if (lineTokens === null || lineTokens === EMPTY_LINE_TOKENS || fromChIndex === toChIndex) {
        return lineTokens;
      }
      const tokens = toUint32Array(lineTokens);
      const tokensCount = tokens.length >>> 1;
      if (fromChIndex === 0 && tokens[tokens.length - 2] === toChIndex) {
        return EMPTY_LINE_TOKENS;
      }
      const fromTokenIndex = LineTokens.findIndexInTokensArray(tokens, fromChIndex);
      const fromTokenStartOffset = fromTokenIndex > 0 ? tokens[fromTokenIndex - 1 << 1] : 0;
      const fromTokenEndOffset = tokens[fromTokenIndex << 1];
      if (toChIndex < fromTokenEndOffset) {
        const delta2 = toChIndex - fromChIndex;
        for (let i = fromTokenIndex; i < tokensCount; i++) {
          tokens[i << 1] -= delta2;
        }
        return lineTokens;
      }
      let dest;
      let lastEnd;
      if (fromTokenStartOffset !== fromChIndex) {
        tokens[fromTokenIndex << 1] = fromChIndex;
        dest = fromTokenIndex + 1 << 1;
        lastEnd = fromChIndex;
      } else {
        dest = fromTokenIndex << 1;
        lastEnd = fromTokenStartOffset;
      }
      const delta = toChIndex - fromChIndex;
      for (let tokenIndex = fromTokenIndex + 1; tokenIndex < tokensCount; tokenIndex++) {
        const tokenEndOffset = tokens[tokenIndex << 1] - delta;
        if (tokenEndOffset > lastEnd) {
          tokens[dest++] = tokenEndOffset;
          tokens[dest++] = tokens[(tokenIndex << 1) + 1];
          lastEnd = tokenEndOffset;
        }
      }
      if (dest === tokens.length) {
        return lineTokens;
      }
      const tmp = new Uint32Array(dest);
      tmp.set(tokens.subarray(0, dest), 0);
      return tmp.buffer;
    }
    static append(lineTokens, _otherTokens) {
      if (_otherTokens === EMPTY_LINE_TOKENS) {
        return lineTokens;
      }
      if (lineTokens === EMPTY_LINE_TOKENS) {
        return _otherTokens;
      }
      if (lineTokens === null) {
        return lineTokens;
      }
      if (_otherTokens === null) {
        return null;
      }
      const myTokens = toUint32Array(lineTokens);
      const otherTokens = toUint32Array(_otherTokens);
      const otherTokensCount = otherTokens.length >>> 1;
      const result = new Uint32Array(myTokens.length + otherTokens.length);
      result.set(myTokens, 0);
      let dest = myTokens.length;
      const delta = myTokens[myTokens.length - 2];
      for (let i = 0; i < otherTokensCount; i++) {
        result[dest++] = otherTokens[i << 1] + delta;
        result[dest++] = otherTokens[(i << 1) + 1];
      }
      return result.buffer;
    }
    static insert(lineTokens, chIndex, textLength) {
      if (lineTokens === null || lineTokens === EMPTY_LINE_TOKENS) {
        return lineTokens;
      }
      const tokens = toUint32Array(lineTokens);
      const tokensCount = tokens.length >>> 1;
      let fromTokenIndex = LineTokens.findIndexInTokensArray(tokens, chIndex);
      if (fromTokenIndex > 0) {
        const fromTokenStartOffset = tokens[fromTokenIndex - 1 << 1];
        if (fromTokenStartOffset === chIndex) {
          fromTokenIndex--;
        }
      }
      for (let tokenIndex = fromTokenIndex; tokenIndex < tokensCount; tokenIndex++) {
        tokens[tokenIndex << 1] += textLength;
      }
      return lineTokens;
    }
  };
  function toUint32Array(arr) {
    if (arr instanceof Uint32Array) {
      return arr;
    } else {
      return new Uint32Array(arr);
    }
  }

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/editor/common/tokens/contiguousMultilineTokens.js
  var ContiguousMultilineTokens = class _ContiguousMultilineTokens {
    static deserialize(buff, offset, result) {
      const view32 = new Uint32Array(buff.buffer);
      const startLineNumber = readUInt32BE(buff, offset);
      offset += 4;
      const count = readUInt32BE(buff, offset);
      offset += 4;
      const tokens = [];
      for (let i = 0; i < count; i++) {
        const byteCount = readUInt32BE(buff, offset);
        offset += 4;
        tokens.push(view32.subarray(offset / 4, offset / 4 + byteCount / 4));
        offset += byteCount;
      }
      result.push(new _ContiguousMultilineTokens(startLineNumber, tokens));
      return offset;
    }
    get startLineNumber() {
      return this._startLineNumber;
    }
    get endLineNumber() {
      return this._startLineNumber + this._tokens.length - 1;
    }
    constructor(startLineNumber, tokens) {
      this._startLineNumber = startLineNumber;
      this._tokens = tokens;
    }
    getLineRange() {
      return new LineRange(this._startLineNumber, this._startLineNumber + this._tokens.length);
    }
    getLineTokens(lineNumber) {
      return this._tokens[lineNumber - this._startLineNumber];
    }
    appendLineTokens(lineTokens) {
      this._tokens.push(lineTokens);
    }
    serializeSize() {
      let result = 0;
      result += 4;
      result += 4;
      for (let i = 0; i < this._tokens.length; i++) {
        const lineTokens = this._tokens[i];
        if (!(lineTokens instanceof Uint32Array)) {
          throw new Error(`Not supported!`);
        }
        result += 4;
        result += lineTokens.byteLength;
      }
      return result;
    }
    serialize(destination, offset) {
      writeUInt32BE(destination, this._startLineNumber, offset);
      offset += 4;
      writeUInt32BE(destination, this._tokens.length, offset);
      offset += 4;
      for (let i = 0; i < this._tokens.length; i++) {
        const lineTokens = this._tokens[i];
        if (!(lineTokens instanceof Uint32Array)) {
          throw new Error(`Not supported!`);
        }
        writeUInt32BE(destination, lineTokens.byteLength, offset);
        offset += 4;
        destination.set(new Uint8Array(lineTokens.buffer), offset);
        offset += lineTokens.byteLength;
      }
      return offset;
    }
    applyEdit(range, text) {
      const [eolCount, firstLineLength] = countEOL(text);
      this._acceptDeleteRange(range);
      this._acceptInsertText(new Position(range.startLineNumber, range.startColumn), eolCount, firstLineLength);
    }
    _acceptDeleteRange(range) {
      if (range.startLineNumber === range.endLineNumber && range.startColumn === range.endColumn) {
        return;
      }
      const firstLineIndex = range.startLineNumber - this._startLineNumber;
      const lastLineIndex = range.endLineNumber - this._startLineNumber;
      if (lastLineIndex < 0) {
        const deletedLinesCount = lastLineIndex - firstLineIndex;
        this._startLineNumber -= deletedLinesCount;
        return;
      }
      if (firstLineIndex >= this._tokens.length) {
        return;
      }
      if (firstLineIndex < 0 && lastLineIndex >= this._tokens.length) {
        this._startLineNumber = 0;
        this._tokens = [];
        return;
      }
      if (firstLineIndex === lastLineIndex) {
        this._tokens[firstLineIndex] = ContiguousTokensEditing.delete(this._tokens[firstLineIndex], range.startColumn - 1, range.endColumn - 1);
        return;
      }
      if (firstLineIndex >= 0) {
        this._tokens[firstLineIndex] = ContiguousTokensEditing.deleteEnding(this._tokens[firstLineIndex], range.startColumn - 1);
        if (lastLineIndex < this._tokens.length) {
          const lastLineTokens = ContiguousTokensEditing.deleteBeginning(this._tokens[lastLineIndex], range.endColumn - 1);
          this._tokens[firstLineIndex] = ContiguousTokensEditing.append(this._tokens[firstLineIndex], lastLineTokens);
          this._tokens.splice(firstLineIndex + 1, lastLineIndex - firstLineIndex);
        } else {
          this._tokens[firstLineIndex] = ContiguousTokensEditing.append(this._tokens[firstLineIndex], null);
          this._tokens = this._tokens.slice(0, firstLineIndex + 1);
        }
      } else {
        const deletedBefore = -firstLineIndex;
        this._startLineNumber -= deletedBefore;
        this._tokens[lastLineIndex] = ContiguousTokensEditing.deleteBeginning(this._tokens[lastLineIndex], range.endColumn - 1);
        this._tokens = this._tokens.slice(lastLineIndex);
      }
    }
    _acceptInsertText(position, eolCount, firstLineLength) {
      if (eolCount === 0 && firstLineLength === 0) {
        return;
      }
      const lineIndex = position.lineNumber - this._startLineNumber;
      if (lineIndex < 0) {
        this._startLineNumber += eolCount;
        return;
      }
      if (lineIndex >= this._tokens.length) {
        return;
      }
      if (eolCount === 0) {
        this._tokens[lineIndex] = ContiguousTokensEditing.insert(this._tokens[lineIndex], position.column - 1, firstLineLength);
        return;
      }
      this._tokens[lineIndex] = ContiguousTokensEditing.deleteEnding(this._tokens[lineIndex], position.column - 1);
      this._tokens[lineIndex] = ContiguousTokensEditing.insert(this._tokens[lineIndex], position.column - 1, firstLineLength);
      this._insertLines(position.lineNumber, eolCount);
    }
    _insertLines(insertIndex, insertCount) {
      if (insertCount === 0) {
        return;
      }
      const lineTokens = [];
      for (let i = 0; i < insertCount; i++) {
        lineTokens[i] = null;
      }
      this._tokens = arrayInsert(this._tokens, insertIndex, lineTokens);
    }
  };

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/editor/common/tokens/contiguousMultilineTokensBuilder.js
  var ContiguousMultilineTokensBuilder = class {
    static deserialize(buff) {
      let offset = 0;
      const count = readUInt32BE(buff, offset);
      offset += 4;
      const result = [];
      for (let i = 0; i < count; i++) {
        offset = ContiguousMultilineTokens.deserialize(buff, offset, result);
      }
      return result;
    }
    constructor() {
      this._tokens = [];
    }
    add(lineNumber, lineTokens) {
      if (this._tokens.length > 0) {
        const last = this._tokens[this._tokens.length - 1];
        if (last.endLineNumber + 1 === lineNumber) {
          last.appendLineTokens(lineTokens);
          return;
        }
      }
      this._tokens.push(new ContiguousMultilineTokens(lineNumber, [lineTokens]));
    }
    finalize() {
      return this._tokens;
    }
    serialize() {
      const size = this._serializeSize();
      const result = new Uint8Array(size);
      this._serialize(result);
      return result;
    }
    _serializeSize() {
      let result = 0;
      result += 4;
      for (let i = 0; i < this._tokens.length; i++) {
        result += this._tokens[i].serializeSize();
      }
      return result;
    }
    _serialize(destination) {
      let offset = 0;
      writeUInt32BE(destination, this._tokens.length, offset);
      offset += 4;
      for (let i = 0; i < this._tokens.length; i++) {
        offset = this._tokens[i].serialize(destination, offset);
      }
    }
  };

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/editor/common/model/textModelTokens.js
  var Constants2;
  (function(Constants3) {
    Constants3[Constants3["CHEAP_TOKENIZATION_LENGTH_LIMIT"] = 2048] = "CHEAP_TOKENIZATION_LENGTH_LIMIT";
  })(Constants2 || (Constants2 = {}));
  var TokenizerWithStateStore = class {
    constructor(lineCount, tokenizationSupport) {
      this.tokenizationSupport = tokenizationSupport;
      this.initialState = this.tokenizationSupport.getInitialState();
      this.store = new TrackingTokenizationStateStore(lineCount);
    }
    getStartState(lineNumber) {
      return this.store.getStartState(lineNumber, this.initialState);
    }
    getFirstInvalidLine() {
      return this.store.getFirstInvalidLine(this.initialState);
    }
  };
  var TrackingTokenizationStateStore = class {
    constructor(lineCount) {
      this.lineCount = lineCount;
      this._tokenizationStateStore = new TokenizationStateStore();
      this._invalidEndStatesLineNumbers = new RangePriorityQueueImpl();
      this._invalidEndStatesLineNumbers.addRange(new OffsetRange(1, lineCount + 1));
    }
    getEndState(lineNumber) {
      return this._tokenizationStateStore.getEndState(lineNumber);
    }
    setEndState(lineNumber, state) {
      if (!state) {
        throw new BugIndicatingError("Cannot set null/undefined state");
      }
      this._invalidEndStatesLineNumbers.delete(lineNumber);
      const r = this._tokenizationStateStore.setEndState(lineNumber, state);
      if (r && lineNumber < this.lineCount) {
        this._invalidEndStatesLineNumbers.addRange(new OffsetRange(lineNumber + 1, lineNumber + 2));
      }
      return r;
    }
    acceptChange(range, newLineCount) {
      this.lineCount += newLineCount - range.length;
      this._tokenizationStateStore.acceptChange(range, newLineCount);
      this._invalidEndStatesLineNumbers.addRangeAndResize(new OffsetRange(range.startLineNumber, range.endLineNumberExclusive), newLineCount);
    }
    acceptChanges(changes) {
      for (const c of changes) {
        const [eolCount] = countEOL(c.text);
        this.acceptChange(new LineRange(c.range.startLineNumber, c.range.endLineNumber + 1), eolCount + 1);
      }
    }
    invalidateEndStateRange(range) {
      this._invalidEndStatesLineNumbers.addRange(new OffsetRange(range.startLineNumber, range.endLineNumberExclusive));
    }
    getFirstInvalidEndStateLineNumber() {
      return this._invalidEndStatesLineNumbers.min;
    }
    getFirstInvalidEndStateLineNumberOrMax() {
      return this.getFirstInvalidEndStateLineNumber() || Number.MAX_SAFE_INTEGER;
    }
    allStatesValid() {
      return this._invalidEndStatesLineNumbers.min === null;
    }
    getStartState(lineNumber, initialState) {
      if (lineNumber === 1) {
        return initialState;
      }
      return this.getEndState(lineNumber - 1);
    }
    getFirstInvalidLine(initialState) {
      const lineNumber = this.getFirstInvalidEndStateLineNumber();
      if (lineNumber === null) {
        return null;
      }
      const startState = this.getStartState(lineNumber, initialState);
      if (!startState) {
        throw new BugIndicatingError("Start state must be defined");
      }
      return {
        lineNumber,
        startState
      };
    }
  };
  var TokenizationStateStore = class {
    constructor() {
      this._lineEndStates = new FixedArray(null);
    }
    getEndState(lineNumber) {
      return this._lineEndStates.get(lineNumber);
    }
    setEndState(lineNumber, state) {
      const oldState = this._lineEndStates.get(lineNumber);
      if (oldState && oldState.equals(state)) {
        return false;
      }
      this._lineEndStates.set(lineNumber, state);
      return true;
    }
    acceptChange(range, newLineCount) {
      let length = range.length;
      if (newLineCount > 0 && length > 0) {
        length--;
        newLineCount--;
      }
      this._lineEndStates.replace(range.startLineNumber, length, newLineCount);
    }
    acceptChanges(changes) {
      for (const c of changes) {
        const [eolCount] = countEOL(c.text);
        this.acceptChange(new LineRange(c.range.startLineNumber, c.range.endLineNumber + 1), eolCount + 1);
      }
    }
  };
  var RangePriorityQueueImpl = class {
    constructor() {
      this._ranges = [];
    }
    getRanges() {
      return this._ranges;
    }
    get min() {
      if (this._ranges.length === 0) {
        return null;
      }
      return this._ranges[0].start;
    }
    removeMin() {
      if (this._ranges.length === 0) {
        return null;
      }
      const range = this._ranges[0];
      if (range.start + 1 === range.endExclusive) {
        this._ranges.shift();
      } else {
        this._ranges[0] = new OffsetRange(range.start + 1, range.endExclusive);
      }
      return range.start;
    }
    delete(value) {
      const idx = this._ranges.findIndex((r) => r.contains(value));
      if (idx !== -1) {
        const range = this._ranges[idx];
        if (range.start === value) {
          if (range.endExclusive === value + 1) {
            this._ranges.splice(idx, 1);
          } else {
            this._ranges[idx] = new OffsetRange(value + 1, range.endExclusive);
          }
        } else {
          if (range.endExclusive === value + 1) {
            this._ranges[idx] = new OffsetRange(range.start, value);
          } else {
            this._ranges.splice(idx, 1, new OffsetRange(range.start, value), new OffsetRange(value + 1, range.endExclusive));
          }
        }
      }
    }
    addRange(range) {
      OffsetRange.addRange(range, this._ranges);
    }
    addRangeAndResize(range, newLength) {
      let idxFirstMightBeIntersecting = 0;
      while (!(idxFirstMightBeIntersecting >= this._ranges.length || range.start <= this._ranges[idxFirstMightBeIntersecting].endExclusive)) {
        idxFirstMightBeIntersecting++;
      }
      let idxFirstIsAfter = idxFirstMightBeIntersecting;
      while (!(idxFirstIsAfter >= this._ranges.length || range.endExclusive < this._ranges[idxFirstIsAfter].start)) {
        idxFirstIsAfter++;
      }
      const delta = newLength - range.length;
      for (let i = idxFirstIsAfter; i < this._ranges.length; i++) {
        this._ranges[i] = this._ranges[i].delta(delta);
      }
      if (idxFirstMightBeIntersecting === idxFirstIsAfter) {
        const newRange = new OffsetRange(range.start, range.start + newLength);
        if (!newRange.isEmpty) {
          this._ranges.splice(idxFirstMightBeIntersecting, 0, newRange);
        }
      } else {
        const start = Math.min(range.start, this._ranges[idxFirstMightBeIntersecting].start);
        const endEx = Math.max(range.endExclusive, this._ranges[idxFirstIsAfter - 1].endExclusive);
        const newRange = new OffsetRange(start, endEx + delta);
        if (!newRange.isEmpty) {
          this._ranges.splice(
            idxFirstMightBeIntersecting,
            idxFirstIsAfter - idxFirstMightBeIntersecting,
            newRange
          );
        } else {
          this._ranges.splice(idxFirstMightBeIntersecting, idxFirstIsAfter - idxFirstMightBeIntersecting);
        }
      }
    }
    toString() {
      return this._ranges.map((r) => r.toString()).join(" + ");
    }
  };

  // node_modules/@codingame/monaco-vscode-textmate-service-override/vscode/src/vs/workbench/services/textMate/browser/tokenizationSupport/textMateTokenizationSupport.js
  var TextMateTokenizationSupport = class extends Disposable {
    get onDidEncounterLanguage() {
      return this._onDidEncounterLanguage.event;
    }
    constructor(_grammar, _initialState, _containsEmbeddedLanguages, _createBackgroundTokenizer, _backgroundTokenizerShouldOnlyVerifyTokens, _reportTokenizationTime, _reportSlowTokenization) {
      super();
      this._grammar = _grammar;
      this._initialState = _initialState;
      this._containsEmbeddedLanguages = _containsEmbeddedLanguages;
      this._createBackgroundTokenizer = _createBackgroundTokenizer;
      this._backgroundTokenizerShouldOnlyVerifyTokens = _backgroundTokenizerShouldOnlyVerifyTokens;
      this._reportTokenizationTime = _reportTokenizationTime;
      this._reportSlowTokenization = _reportSlowTokenization;
      this._seenLanguages = [];
      this._onDidEncounterLanguage = this._register(new Emitter());
    }
    get backgroundTokenizerShouldOnlyVerifyTokens() {
      return this._backgroundTokenizerShouldOnlyVerifyTokens();
    }
    getInitialState() {
      return this._initialState;
    }
    tokenize(line, hasEOL, state) {
      throw new Error("Not supported!");
    }
    createBackgroundTokenizer(textModel, store) {
      if (this._createBackgroundTokenizer) {
        return this._createBackgroundTokenizer(textModel, store);
      }
      return void 0;
    }
    tokenizeEncoded(line, hasEOL, state) {
      const isRandomSample = Math.random() * 1e4 < 1;
      const shouldMeasure = this._reportSlowTokenization || isRandomSample;
      const sw = shouldMeasure ? new StopWatch(true) : void 0;
      const textMateResult = this._grammar.tokenizeLine2(line, state, 500);
      if (shouldMeasure) {
        const timeMS = sw.elapsed();
        if (isRandomSample || timeMS > 32) {
          this._reportTokenizationTime(timeMS, line.length, isRandomSample);
        }
      }
      if (textMateResult.stoppedEarly) {
        console.warn(`Time limit reached when tokenizing line: ${line.substring(0, 100)}`);
        return new EncodedTokenizationResult(textMateResult.tokens, textMateResult.fonts, state);
      }
      if (this._containsEmbeddedLanguages) {
        const seenLanguages = this._seenLanguages;
        const tokens = textMateResult.tokens;
        for (let i = 0, len = tokens.length >>> 1; i < len; i++) {
          const metadata = tokens[(i << 1) + 1];
          const languageId = TokenMetadata.getLanguageId(metadata);
          if (!seenLanguages[languageId]) {
            seenLanguages[languageId] = true;
            this._onDidEncounterLanguage.fire(languageId);
          }
        }
      }
      let endState;
      if (state.equals(textMateResult.ruleStack)) {
        endState = state;
      } else {
        endState = textMateResult.ruleStack;
      }
      return new EncodedTokenizationResult(textMateResult.tokens, textMateResult.fonts, endState);
    }
  };

  // node_modules/@codingame/monaco-vscode-textmate-service-override/vscode/src/vs/workbench/services/textMate/browser/tokenizationSupport/tokenizationSupportWithLineLimit.js
  var TokenizationSupportWithLineLimit = class extends Disposable {
    get backgroundTokenizerShouldOnlyVerifyTokens() {
      return this._actual.backgroundTokenizerShouldOnlyVerifyTokens;
    }
    constructor(_encodedLanguageId, _actual, disposable, _maxTokenizationLineLength) {
      super();
      this._encodedLanguageId = _encodedLanguageId;
      this._actual = _actual;
      this._maxTokenizationLineLength = _maxTokenizationLineLength;
      this._register(keepObserved(this._maxTokenizationLineLength));
      this._register(disposable);
    }
    getInitialState() {
      return this._actual.getInitialState();
    }
    tokenize(line, hasEOL, state) {
      throw new Error("Not supported!");
    }
    tokenizeEncoded(line, hasEOL, state) {
      if (line.length >= this._maxTokenizationLineLength.get()) {
        return nullTokenizeEncoded(this._encodedLanguageId, state);
      }
      return this._actual.tokenizeEncoded(line, hasEOL, state);
    }
    createBackgroundTokenizer(textModel, store) {
      if (this._actual.createBackgroundTokenizer) {
        return this._actual.createBackgroundTokenizer(textModel, store);
      } else {
        return void 0;
      }
    }
  };

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/editor/common/textModelEvents.js
  function serializeFontTokenOptions() {
    return (annotation) => {
      return {
        fontFamily: annotation.fontFamily ?? "",
        fontSizeMultiplier: annotation.fontSizeMultiplier ?? 0,
        lineHeightMultiplier: annotation.lineHeightMultiplier ?? 0
      };
    };
  }
  var RawContentChangedType;
  (function(RawContentChangedType2) {
    RawContentChangedType2[RawContentChangedType2["Flush"] = 1] = "Flush";
    RawContentChangedType2[RawContentChangedType2["LineChanged"] = 2] = "LineChanged";
    RawContentChangedType2[RawContentChangedType2["LinesDeleted"] = 3] = "LinesDeleted";
    RawContentChangedType2[RawContentChangedType2["LinesInserted"] = 4] = "LinesInserted";
    RawContentChangedType2[RawContentChangedType2["EOLChanged"] = 5] = "EOLChanged";
  })(RawContentChangedType || (RawContentChangedType = {}));

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/editor/common/model/tokens/annotations.js
  var AnnotatedString = class _AnnotatedString {
    constructor(annotations = []) {
      this._annotations = [];
      this._annotations = annotations;
    }
    setAnnotations(annotations) {
      for (const annotation of annotations.annotations) {
        const startIndex = this._getStartIndexOfIntersectingAnnotation(annotation.range.start);
        const endIndexExclusive = this._getEndIndexOfIntersectingAnnotation(annotation.range.endExclusive);
        if (annotation.annotation !== void 0) {
          this._annotations.splice(startIndex, endIndexExclusive - startIndex, {
            range: annotation.range,
            annotation: annotation.annotation
          });
        } else {
          this._annotations.splice(startIndex, endIndexExclusive - startIndex);
        }
      }
    }
    getAnnotationsIntersecting(range) {
      const startIndex = this._getStartIndexOfIntersectingAnnotation(range.start);
      const endIndexExclusive = this._getEndIndexOfIntersectingAnnotation(range.endExclusive);
      return this._annotations.slice(startIndex, endIndexExclusive);
    }
    _getStartIndexOfIntersectingAnnotation(offset) {
      const startIndexWhereToReplace = binarySearch2(this._annotations.length, (index) => {
        return this._annotations[index].range.start - offset;
      });
      let startIndex;
      if (startIndexWhereToReplace >= 0) {
        startIndex = startIndexWhereToReplace;
        const nextCandidate = this._annotations[startIndex]?.range;
        if (nextCandidate && nextCandidate.endExclusive === offset) {
          startIndex--;
        }
      } else {
        const candidate = this._annotations[-(startIndexWhereToReplace + 2)]?.range;
        if (candidate && offset >= candidate.start && offset < candidate.endExclusive) {
          startIndex = -(startIndexWhereToReplace + 2);
        } else {
          startIndex = -(startIndexWhereToReplace + 1);
        }
      }
      return startIndex;
    }
    _getEndIndexOfIntersectingAnnotation(offset) {
      const endIndexWhereToReplace = binarySearch2(this._annotations.length, (index) => {
        return this._annotations[index].range.endExclusive - offset;
      });
      let endIndexExclusive;
      if (endIndexWhereToReplace >= 0) {
        endIndexExclusive = endIndexWhereToReplace + 1;
        const nextCandidate = this._annotations[endIndexExclusive]?.range;
        if (nextCandidate && nextCandidate.start === offset) {
          endIndexExclusive++;
        }
      } else {
        const candidate = this._annotations[-(endIndexWhereToReplace + 1)]?.range;
        if (candidate && offset >= candidate.start && offset <= candidate.endExclusive) {
          endIndexExclusive = -endIndexWhereToReplace;
        } else {
          endIndexExclusive = -(endIndexWhereToReplace + 1);
        }
      }
      return endIndexExclusive;
    }
    getAllAnnotations() {
      return this._annotations.slice();
    }
    applyEdit(edit) {
      const annotations = this._annotations.slice();
      const finalAnnotations = [];
      const deletedAnnotations = [];
      let offset = 0;
      for (const e of edit.replacements) {
        while (true) {
          const annotation = annotations[0];
          if (!annotation) {
            break;
          }
          const range = annotation.range;
          if (range.endExclusive >= e.replaceRange.start) {
            break;
          }
          annotations.shift();
          const newAnnotation = {
            range: range.delta(offset),
            annotation: annotation.annotation
          };
          if (!newAnnotation.range.isEmpty) {
            finalAnnotations.push(newAnnotation);
          } else {
            deletedAnnotations.push(newAnnotation);
          }
        }
        const intersecting = [];
        while (true) {
          const annotation = annotations[0];
          if (!annotation) {
            break;
          }
          const range = annotation.range;
          if (!range.intersectsOrTouches(e.replaceRange)) {
            break;
          }
          annotations.shift();
          intersecting.push(annotation);
        }
        for (let i = intersecting.length - 1; i >= 0; i--) {
          const annotation = intersecting[i];
          let r = annotation.range;
          const shouldExtend = i === 0 && e.replaceRange.endExclusive > r.start && e.replaceRange.start < r.endExclusive;
          const overlap = r.intersect(e.replaceRange).length;
          r = r.deltaEnd(-overlap + (shouldExtend ? e.newText.length : 0));
          const rangeAheadOfReplaceRange = r.start - e.replaceRange.start;
          if (rangeAheadOfReplaceRange > 0) {
            r = r.delta(-rangeAheadOfReplaceRange);
          }
          if (!shouldExtend && rangeAheadOfReplaceRange >= 0) {
            r = r.delta(e.newText.length);
          }
          r = r.delta(-(e.newText.length - e.replaceRange.length));
          annotations.unshift({
            annotation: annotation.annotation,
            range: r
          });
        }
        offset += e.newText.length - e.replaceRange.length;
      }
      while (true) {
        const annotation = annotations[0];
        if (!annotation) {
          break;
        }
        annotations.shift();
        const newAnnotation = {
          annotation: annotation.annotation,
          range: annotation.range.delta(offset)
        };
        if (!newAnnotation.range.isEmpty) {
          finalAnnotations.push(newAnnotation);
        } else {
          deletedAnnotations.push(newAnnotation);
        }
      }
      this._annotations = finalAnnotations;
      return deletedAnnotations;
    }
    clone() {
      return new _AnnotatedString(this._annotations.slice());
    }
  };
  var AnnotationsUpdate = class _AnnotationsUpdate {
    static create(annotations) {
      return new _AnnotationsUpdate(annotations);
    }
    constructor(annotations) {
      this._annotations = annotations;
    }
    get annotations() {
      return this._annotations;
    }
    rebase(edit) {
      const annotatedString = new AnnotatedString(this._annotations);
      annotatedString.applyEdit(edit);
      this._annotations = annotatedString.getAllAnnotations();
    }
    serialize(serializingFunc) {
      return this._annotations.map((annotation) => {
        const range = {
          start: annotation.range.start,
          endExclusive: annotation.range.endExclusive
        };
        if (!annotation.annotation) {
          return {
            range,
            annotation: void 0
          };
        }
        return {
          range,
          annotation: serializingFunc(annotation.annotation)
        };
      });
    }
    static deserialize(serializedAnnotations, deserializingFunc) {
      const annotations = serializedAnnotations.map((serializedAnnotation) => {
        const range = new OffsetRange(serializedAnnotation.range.start, serializedAnnotation.range.endExclusive);
        if (!serializedAnnotation.annotation) {
          return {
            range,
            annotation: void 0
          };
        }
        return {
          range,
          annotation: deserializingFunc(serializedAnnotation.annotation)
        };
      });
      return new _AnnotationsUpdate(annotations);
    }
  };

  // node_modules/@codingame/monaco-vscode-textmate-service-override/vscode/src/vs/workbench/services/textMate/browser/backgroundTokenization/worker/textMateWorkerTokenizer.js
  var TextMateWorkerTokenizer = class extends MirrorTextModel {
    constructor(uri, lines, eol, versionId, _host, _languageId, _encodedLanguageId, maxTokenizationLineLength) {
      super(uri, lines, eol, versionId);
      this._host = _host;
      this._languageId = _languageId;
      this._encodedLanguageId = _encodedLanguageId;
      this._tokenizerWithStateStore = null;
      this._isDisposed = false;
      this._maxTokenizationLineLength = observableValue(this, -1);
      this._tokenizeDebouncer = new RunOnceScheduler(() => this._tokenize(), 10);
      this._maxTokenizationLineLength.set(maxTokenizationLineLength, void 0);
      this._resetTokenization();
    }
    dispose() {
      this._isDisposed = true;
      this._tokenizeDebouncer.dispose();
      super.dispose();
    }
    onLanguageId(languageId, encodedLanguageId) {
      this._languageId = languageId;
      this._encodedLanguageId = encodedLanguageId;
      this._resetTokenization();
    }
    onEvents(e) {
      super.onEvents(e);
      this._tokenizerWithStateStore?.store.acceptChanges(e.changes);
      this._tokenizeDebouncer.schedule();
    }
    acceptMaxTokenizationLineLength(maxTokenizationLineLength) {
      this._maxTokenizationLineLength.set(maxTokenizationLineLength, void 0);
    }
    retokenize(startLineNumber, endLineNumberExclusive) {
      if (this._tokenizerWithStateStore) {
        this._tokenizerWithStateStore.store.invalidateEndStateRange(new LineRange(startLineNumber, endLineNumberExclusive));
        this._tokenizeDebouncer.schedule();
      }
    }
    async _resetTokenization() {
      this._tokenizerWithStateStore = null;
      const languageId = this._languageId;
      const encodedLanguageId = this._encodedLanguageId;
      const r = await this._host.getOrCreateGrammar(languageId, encodedLanguageId);
      if (this._isDisposed || languageId !== this._languageId || encodedLanguageId !== this._encodedLanguageId || !r) {
        return;
      }
      if (r.grammar) {
        const tokenizationSupport = new TokenizationSupportWithLineLimit(this._encodedLanguageId, new TextMateTokenizationSupport(
          r.grammar,
          r.initialState,
          false,
          void 0,
          () => false,
          (timeMs, lineLength, isRandomSample) => {
            this._host.reportTokenizationTime(timeMs, languageId, r.sourceExtensionId, lineLength, isRandomSample);
          },
          false
        ), Disposable.None, this._maxTokenizationLineLength);
        this._tokenizerWithStateStore = new TokenizerWithStateStore(this._lines.length, tokenizationSupport);
      } else {
        this._tokenizerWithStateStore = null;
      }
      this._tokenize();
    }
    async _tokenize() {
      if (this._isDisposed || !this._tokenizerWithStateStore) {
        return;
      }
      if (!this._diffStateStacksRefEqFn) {
        const {
          diffStateStacksRefEq
        } = await Promise.resolve().then(() => (init_main2(), main_exports)).then(function(n) {
          return n.main;
        });
        this._diffStateStacksRefEqFn = diffStateStacksRefEq;
      }
      const startTime = (/* @__PURE__ */ new Date()).getTime();
      while (true) {
        let tokenizedLines = 0;
        const tokenBuilder = new ContiguousMultilineTokensBuilder();
        const stateDeltaBuilder = new StateDeltaBuilder();
        const fontTokensUpdate = [];
        while (true) {
          const lineToTokenize = this._tokenizerWithStateStore.getFirstInvalidLine();
          if (lineToTokenize === null || tokenizedLines > 200) {
            break;
          }
          tokenizedLines++;
          const text = this._lines[lineToTokenize.lineNumber - 1];
          const r = this._tokenizerWithStateStore.tokenizationSupport.tokenizeEncoded(text, true, lineToTokenize.startState);
          if (this._tokenizerWithStateStore.store.setEndState(lineToTokenize.lineNumber, r.endState)) {
            const delta = this._diffStateStacksRefEqFn(lineToTokenize.startState, r.endState);
            stateDeltaBuilder.setState(lineToTokenize.lineNumber, delta);
          } else {
            stateDeltaBuilder.setState(lineToTokenize.lineNumber, null);
          }
          LineTokens.convertToEndOffset(r.tokens, text.length);
          tokenBuilder.add(lineToTokenize.lineNumber, r.tokens);
          fontTokensUpdate.push(...this._getFontTokensUpdate(lineToTokenize.lineNumber, r));
          const deltaMs2 = (/* @__PURE__ */ new Date()).getTime() - startTime;
          if (deltaMs2 > 20) {
            break;
          }
        }
        if (tokenizedLines === 0) {
          break;
        }
        const fontUpdate = AnnotationsUpdate.create(fontTokensUpdate);
        const serializedFontUpdate = fontUpdate.serialize(serializeFontTokenOptions());
        const stateDeltas = stateDeltaBuilder.getStateDeltas();
        this._host.setTokensAndStates(
          this._versionId,
          tokenBuilder.serialize(),
          serializedFontUpdate,
          stateDeltas
        );
        const deltaMs = (/* @__PURE__ */ new Date()).getTime() - startTime;
        if (deltaMs > 20) {
          setTimeout0(() => this._tokenize());
          return;
        }
      }
    }
    _getFontTokensUpdate(lineNumber, r) {
      const fontTokens = [];
      const offsetAtLineStart = this._getOffsetAtLineStart(lineNumber);
      const offsetAtNextLineStart = this._getOffsetAtLineStart(lineNumber + 1);
      const offsetAtLineEnd = offsetAtNextLineStart > 0 ? offsetAtNextLineStart - 1 : 0;
      fontTokens.push({
        range: new OffsetRange(offsetAtLineStart, offsetAtLineEnd),
        annotation: void 0
      });
      if (r.fontInfo.length) {
        for (const fontInfo of r.fontInfo) {
          const offsetAtLineStart2 = this._getOffsetAtLineStart(lineNumber);
          fontTokens.push({
            range: new OffsetRange(
              offsetAtLineStart2 + fontInfo.startIndex,
              offsetAtLineStart2 + fontInfo.endIndex
            ),
            annotation: {
              fontFamily: fontInfo.fontFamily ?? void 0,
              fontSizeMultiplier: fontInfo.fontSizeMultiplier ?? void 0,
              lineHeightMultiplier: fontInfo.lineHeightMultiplier ?? void 0
            }
          });
        }
      }
      return fontTokens;
    }
    _getOffsetAtLineStart(lineNumber) {
      this._ensureLineStarts();
      return lineNumber - 1 > 0 ? this._lineStarts.getPrefixSum(lineNumber - 2) : 0;
    }
  };
  var StateDeltaBuilder = class {
    constructor() {
      this._lastStartLineNumber = -1;
      this._stateDeltas = [];
    }
    setState(lineNumber, stackDiff) {
      if (lineNumber === this._lastStartLineNumber + 1) {
        this._stateDeltas[this._stateDeltas.length - 1].stateDeltas.push(stackDiff);
      } else {
        this._stateDeltas.push({
          startLineNumber: lineNumber,
          stateDeltas: [stackDiff]
        });
      }
      this._lastStartLineNumber = lineNumber;
    }
    getStateDeltas() {
      return this._stateDeltas;
    }
  };

  // node_modules/@codingame/monaco-vscode-textmate-service-override/vscode/src/vs/workbench/services/textMate/browser/backgroundTokenization/worker/textMateWorkerHost.js
  var TextMateWorkerHost = class _TextMateWorkerHost {
    static {
      this.CHANNEL_NAME = "textMateWorkerHost";
    }
    static getChannel(workerServer) {
      return workerServer.getChannel(_TextMateWorkerHost.CHANNEL_NAME);
    }
    static setChannel(workerClient, obj) {
      workerClient.setChannel(_TextMateWorkerHost.CHANNEL_NAME, obj);
    }
  };

  // node_modules/@codingame/monaco-vscode-textmate-service-override/vscode/src/vs/workbench/services/textMate/browser/backgroundTokenization/worker/textMateTokenizationWorker.worker.js
  function create(workerServer) {
    return new TextMateTokenizationWorker(workerServer);
  }
  var TextMateTokenizationWorker = class {
    constructor(workerServer) {
      this._requestHandlerBrand = void 0;
      this._models = /* @__PURE__ */ new Map();
      this._grammarCache = [];
      this._grammarFactory = Promise.resolve(null);
      this._host = TextMateWorkerHost.getChannel(workerServer);
    }
    async $init(_createData) {
      const grammarDefinitions = _createData.grammarDefinitions.map((def) => {
        return {
          location: URI.revive(def.location),
          language: def.language,
          scopeName: def.scopeName,
          embeddedLanguages: def.embeddedLanguages,
          tokenTypes: def.tokenTypes,
          injectTo: def.injectTo,
          balancedBracketSelectors: def.balancedBracketSelectors,
          unbalancedBracketSelectors: def.unbalancedBracketSelectors,
          sourceExtensionId: def.sourceExtensionId
        };
      });
      this._grammarFactory = this._loadTMGrammarFactory(grammarDefinitions, _createData.onigurumaWASMUri);
    }
    async _loadTMGrammarFactory(grammarDefinitions, onigurumaWASMUri) {
      const vscodeTextmate = await Promise.resolve().then(() => (init_main2(), main_exports)).then(function(n) {
        return n.main;
      });
      const vscodeOniguruma = await Promise.resolve().then(() => (init_main22(), main2_exports)).then(function(n) {
        return n.main;
      });
      const response = await fetch(onigurumaWASMUri);
      const bytes = await response.arrayBuffer();
      await vscodeOniguruma.loadWASM(bytes);
      const onigLib = Promise.resolve({
        createOnigScanner: (sources) => vscodeOniguruma.createOnigScanner(sources),
        createOnigString: (str) => vscodeOniguruma.createOnigString(str)
      });
      return new TMGrammarFactory({
        logTrace: (msg) => {
        },
        logError: (msg, err) => console.error(msg, err),
        readFile: (resource) => this._host.$readFile(resource)
      }, grammarDefinitions, vscodeTextmate, onigLib);
    }
    $acceptNewModel(data) {
      const uri = URI.revive(data.uri);
      const that = this;
      this._models.set(data.controllerId, new TextMateWorkerTokenizer(uri, data.lines, data.EOL, data.versionId, {
        async getOrCreateGrammar(languageId, encodedLanguageId) {
          const grammarFactory = await that._grammarFactory;
          if (!grammarFactory) {
            return Promise.resolve(null);
          }
          if (!that._grammarCache[encodedLanguageId]) {
            that._grammarCache[encodedLanguageId] = grammarFactory.createGrammar(languageId, encodedLanguageId);
          }
          return that._grammarCache[encodedLanguageId];
        },
        setTokensAndStates(versionId, tokens, fontTokens, stateDeltas) {
          that._host.$setTokensAndStates(data.controllerId, versionId, tokens, fontTokens, stateDeltas);
        },
        reportTokenizationTime(timeMs, languageId, sourceExtensionId, lineLength, isRandomSample) {
          that._host.$reportTokenizationTime(timeMs, languageId, sourceExtensionId, lineLength, isRandomSample);
        }
      }, data.languageId, data.encodedLanguageId, data.maxTokenizationLineLength));
    }
    $acceptModelChanged(controllerId, e) {
      this._models.get(controllerId).onEvents(e);
    }
    $retokenize(controllerId, startLineNumber, endLineNumberExclusive) {
      this._models.get(controllerId).retokenize(startLineNumber, endLineNumberExclusive);
    }
    $acceptModelLanguageChanged(controllerId, newLanguageId, newEncodedLanguageId) {
      this._models.get(controllerId).onLanguageId(newLanguageId, newEncodedLanguageId);
    }
    $acceptRemovedModel(controllerId) {
      const model = this._models.get(controllerId);
      if (model) {
        model.dispose();
        this._models.delete(controllerId);
      }
    }
    async $acceptTheme(theme, colorMap) {
      const grammarFactory = await this._grammarFactory;
      grammarFactory?.setTheme(theme, colorMap);
    }
    $acceptMaxTokenizationLineLength(controllerId, value) {
      this._models.get(controllerId).acceptMaxTokenizationLineLength(value);
    }
  };

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/worker/webWorker.js
  var DEFAULT_CHANNEL = "default";
  var INITIALIZE = "$initialize";
  var MessageType;
  (function(MessageType2) {
    MessageType2[MessageType2["Request"] = 0] = "Request";
    MessageType2[MessageType2["Reply"] = 1] = "Reply";
    MessageType2[MessageType2["SubscribeEvent"] = 2] = "SubscribeEvent";
    MessageType2[MessageType2["Event"] = 3] = "Event";
    MessageType2[MessageType2["UnsubscribeEvent"] = 4] = "UnsubscribeEvent";
  })(MessageType || (MessageType = {}));
  var RequestMessage = class {
    constructor(vsWorker, req, channel, method, args) {
      this.vsWorker = vsWorker;
      this.req = req;
      this.channel = channel;
      this.method = method;
      this.args = args;
      this.type = MessageType.Request;
    }
  };
  var ReplyMessage = class {
    constructor(vsWorker, seq, res, err) {
      this.vsWorker = vsWorker;
      this.seq = seq;
      this.res = res;
      this.err = err;
      this.type = MessageType.Reply;
    }
  };
  var SubscribeEventMessage = class {
    constructor(vsWorker, req, channel, eventName, arg) {
      this.vsWorker = vsWorker;
      this.req = req;
      this.channel = channel;
      this.eventName = eventName;
      this.arg = arg;
      this.type = MessageType.SubscribeEvent;
    }
  };
  var EventMessage = class {
    constructor(vsWorker, req, event) {
      this.vsWorker = vsWorker;
      this.req = req;
      this.event = event;
      this.type = MessageType.Event;
    }
  };
  var UnsubscribeEventMessage = class {
    constructor(vsWorker, req) {
      this.vsWorker = vsWorker;
      this.req = req;
      this.type = MessageType.UnsubscribeEvent;
    }
  };
  var WebWorkerProtocol = class {
    constructor(handler) {
      this._workerId = -1;
      this._handler = handler;
      this._lastSentReq = 0;
      this._pendingReplies = /* @__PURE__ */ Object.create(null);
      this._pendingEmitters = /* @__PURE__ */ new Map();
      this._pendingEvents = /* @__PURE__ */ new Map();
    }
    setWorkerId(workerId) {
      this._workerId = workerId;
    }
    async sendMessage(channel, method, args) {
      const req = String(++this._lastSentReq);
      return new Promise((resolve2, reject) => {
        this._pendingReplies[req] = {
          resolve: resolve2,
          reject
        };
        this._send(new RequestMessage(this._workerId, req, channel, method, args));
      });
    }
    listen(channel, eventName, arg) {
      let req = null;
      const emitter = new Emitter({
        onWillAddFirstListener: () => {
          req = String(++this._lastSentReq);
          this._pendingEmitters.set(req, emitter);
          this._send(new SubscribeEventMessage(this._workerId, req, channel, eventName, arg));
        },
        onDidRemoveLastListener: () => {
          this._pendingEmitters.delete(req);
          this._send(new UnsubscribeEventMessage(this._workerId, req));
          req = null;
        }
      });
      return emitter.event;
    }
    handleMessage(message) {
      if (!message || !message.vsWorker) {
        return;
      }
      if (this._workerId !== -1 && message.vsWorker !== this._workerId) {
        return;
      }
      this._handleMessage(message);
    }
    createProxyToRemoteChannel(channel, sendMessageBarrier) {
      const handler = {
        get: (target, name) => {
          if (typeof name === "string" && !target[name]) {
            if (propertyIsDynamicEvent(name)) {
              target[name] = (arg) => {
                return this.listen(channel, name, arg);
              };
            } else if (propertyIsEvent(name)) {
              target[name] = this.listen(channel, name, void 0);
            } else if (name.charCodeAt(0) === CharCode.DollarSign) {
              target[name] = async (...myArgs) => {
                await sendMessageBarrier?.();
                return this.sendMessage(channel, name, myArgs);
              };
            }
          }
          return target[name];
        }
      };
      return new Proxy(/* @__PURE__ */ Object.create(null), handler);
    }
    _handleMessage(msg) {
      switch (msg.type) {
        case MessageType.Reply:
          return this._handleReplyMessage(msg);
        case MessageType.Request:
          return this._handleRequestMessage(msg);
        case MessageType.SubscribeEvent:
          return this._handleSubscribeEventMessage(msg);
        case MessageType.Event:
          return this._handleEventMessage(msg);
        case MessageType.UnsubscribeEvent:
          return this._handleUnsubscribeEventMessage(msg);
      }
    }
    _handleReplyMessage(replyMessage) {
      if (!this._pendingReplies[replyMessage.seq]) {
        console.warn("Got reply to unknown seq");
        return;
      }
      const reply = this._pendingReplies[replyMessage.seq];
      delete this._pendingReplies[replyMessage.seq];
      if (replyMessage.err) {
        let err = replyMessage.err;
        if (replyMessage.err.$isError) {
          const newErr = new Error();
          newErr.name = replyMessage.err.name;
          newErr.message = replyMessage.err.message;
          newErr.stack = replyMessage.err.stack;
          err = newErr;
        }
        reply.reject(err);
        return;
      }
      reply.resolve(replyMessage.res);
    }
    _handleRequestMessage(requestMessage) {
      const req = requestMessage.req;
      const result = this._handler.handleMessage(requestMessage.channel, requestMessage.method, requestMessage.args);
      result.then((r) => {
        this._send(new ReplyMessage(this._workerId, req, r, void 0));
      }, (e) => {
        if (e.detail instanceof Error) {
          e.detail = transformErrorForSerialization(e.detail);
        }
        this._send(new ReplyMessage(this._workerId, req, void 0, transformErrorForSerialization(e)));
      });
    }
    _handleSubscribeEventMessage(msg) {
      const req = msg.req;
      const disposable = this._handler.handleEvent(msg.channel, msg.eventName, msg.arg)((event) => {
        this._send(new EventMessage(this._workerId, req, event));
      });
      this._pendingEvents.set(req, disposable);
    }
    _handleEventMessage(msg) {
      const emitter = this._pendingEmitters.get(msg.req);
      if (emitter === void 0) {
        console.warn("Got event for unknown req");
        return;
      }
      emitter.fire(msg.event);
    }
    _handleUnsubscribeEventMessage(msg) {
      const event = this._pendingEvents.get(msg.req);
      if (event === void 0) {
        console.warn("Got unsubscribe for unknown req");
        return;
      }
      event.dispose();
      this._pendingEvents.delete(msg.req);
    }
    _send(msg) {
      const transfer = [];
      if (msg.type === MessageType.Request) {
        for (let i = 0; i < msg.args.length; i++) {
          const arg = msg.args[i];
          if (arg instanceof ArrayBuffer) {
            transfer.push(arg);
          }
        }
      } else if (msg.type === MessageType.Reply) {
        if (msg.res instanceof ArrayBuffer) {
          transfer.push(msg.res);
        }
      }
      this._handler.sendMessage(msg, transfer);
    }
  };
  function propertyIsEvent(name) {
    return name[0] === "o" && name[1] === "n" && isUpperAsciiLetter(name.charCodeAt(2));
  }
  function propertyIsDynamicEvent(name) {
    return /^onDynamic/.test(name) && isUpperAsciiLetter(name.charCodeAt(9));
  }
  var WebWorkerServer = class {
    constructor(postMessage, requestHandlerFactory) {
      this._localChannels = /* @__PURE__ */ new Map();
      this._remoteChannels = /* @__PURE__ */ new Map();
      this._protocol = new WebWorkerProtocol({
        sendMessage: (msg, transfer) => {
          postMessage(msg, transfer);
        },
        handleMessage: (channel, method, args) => this._handleMessage(channel, method, args),
        handleEvent: (channel, eventName, arg) => this._handleEvent(channel, eventName, arg)
      });
      this.requestHandler = requestHandlerFactory(this);
    }
    onmessage(msg) {
      this._protocol.handleMessage(msg);
    }
    _handleMessage(channel, method, args) {
      if (channel === DEFAULT_CHANNEL && method === INITIALIZE) {
        return this.initialize(args[0]);
      }
      const requestHandler = channel === DEFAULT_CHANNEL ? this.requestHandler : this._localChannels.get(channel);
      if (!requestHandler) {
        return Promise.reject(new Error(`Missing channel ${channel} on worker thread`));
      }
      const fn = requestHandler[method];
      if (typeof fn !== "function") {
        return Promise.reject(new Error(`Missing method ${method} on worker thread channel ${channel}`));
      }
      try {
        return Promise.resolve(fn.apply(requestHandler, args));
      } catch (e) {
        return Promise.reject(e);
      }
    }
    _handleEvent(channel, eventName, arg) {
      const requestHandler = channel === DEFAULT_CHANNEL ? this.requestHandler : this._localChannels.get(channel);
      if (!requestHandler) {
        throw new Error(`Missing channel ${channel} on worker thread`);
      }
      if (propertyIsDynamicEvent(eventName)) {
        const fn = requestHandler[eventName];
        if (typeof fn !== "function") {
          throw new Error(`Missing dynamic event ${eventName} on request handler.`);
        }
        const event = fn.call(requestHandler, arg);
        if (typeof event !== "function") {
          throw new Error(`Missing dynamic event ${eventName} on request handler.`);
        }
        return event;
      }
      if (propertyIsEvent(eventName)) {
        const event = requestHandler[eventName];
        if (typeof event !== "function") {
          throw new Error(`Missing event ${eventName} on request handler.`);
        }
        return event;
      }
      throw new Error(`Malformed event name ${eventName}`);
    }
    setChannel(channel, handler) {
      this._localChannels.set(channel, handler);
    }
    getChannel(channel) {
      let inst = this._remoteChannels.get(channel);
      if (inst === void 0) {
        inst = this._protocol.createProxyToRemoteChannel(channel);
        this._remoteChannels.set(channel, inst);
      }
      return inst;
    }
    async initialize(workerId) {
      this._protocol.setWorkerId(workerId);
    }
  };

  // node_modules/@codingame/monaco-vscode-api/vscode/src/vs/base/common/worker/webWorkerBootstrap.js
  var initialized2 = false;
  function initialize(factory) {
    if (initialized2) {
      throw new Error("WebWorker already initialized!");
    }
    initialized2 = true;
    const webWorkerServer = new WebWorkerServer((msg) => globalThis.postMessage(msg), (workerServer) => factory(workerServer));
    globalThis.onmessage = (e) => {
      webWorkerServer.onmessage(e.data);
    };
    return webWorkerServer;
  }
  function bootstrapWebWorker(factory) {
    globalThis.onmessage = (_e) => {
      if (!initialized2) {
        initialize(factory);
      }
    };
  }

  // node_modules/@codingame/monaco-vscode-textmate-service-override/vscode/src/vs/workbench/services/textMate/browser/backgroundTokenization/worker/textMateTokenizationWorker.workerMain.js
  bootstrapWebWorker(create);
})();
