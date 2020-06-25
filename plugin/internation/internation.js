
/*****************************************************************
 * @author: Martijn De Jongh (Martino), martijn.de.jongh@gmail.com
 * https://github.com/Martinomagnifico
 *
 * Internation.js for Reveal.js 
 * Version 1.0.3
 * 
 * @license 
 * MIT licensed
 *
 * Thanks to:
 *  - Hakim El Hattab, Reveal.js 
 ******************************************************************/


(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Internation = factory());
}(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  var Plugin = function Plugin() {
    Object.filter = function (obj, predicate) {
      return Object.keys(obj).filter(function (key) {
        return predicate(obj[key]);
      }).reduce(function (res, key) {
        return res[key] = obj[key], res;
      }, {});
    };

    var getParams = function getParams(url) {
      var params = {};
      var parser = document.createElement('a');
      parser.href = url;
      var query = parser.search.substring(1);
      var vars = query.split('&');

      for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        params[pair[0]] = decodeURIComponent(pair[1]);
      }

      return params;
    };

    var readJson = function readJson(file) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
        method: 'get'
      };
      return new Promise(function (resolve, reject) {
        var request = new XMLHttpRequest();
        request.onload = resolve;
        request.onerror = reject;
        request.overrideMimeType("application/json");
        request.open(options.method, file, true);

        request.onreadystatechange = function () {
          if (request.readyState === 4 && request.status === "200") {
            resolve(request.responseText);
          }
        };

        request.send(null);
      });
    };

    function downloadObjectAsJson(exportObj, exportName) {
      var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
      var downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", exportName + ".json");
      document.body.appendChild(downloadAnchorNode); // required for firefox

      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    }

    var InterNation = function InterNation(deck, options) {
      var debugLog = function debugLog(text) {
        if (options.debug) console.log(text);
      };

      var getTextContent = function getTextContent(deck, options) {
        var sections = deck.getRevealElement().querySelectorAll("section");
        var JSON = false;

        if (langs[options.locale]) {
          if (_typeof(langs[options.locale].dictionary) == "object") {
            debugLog("JSON file is OK and will overrule local textcontent.");
            JSON = true;
          } else {
            debugLog("JSON file is linked but the path is wrong, will parse HTML text.");
            JSON = false;
          }
        } else {
          debugLog("No JSON file for local language, will parse HTML text.");
          langs[options.locale] = {};
          JSON = false;
        }

        if (JSON == false) {
          var newdict = {};
          sections.forEach(function (section) {
            if (section.id && !section.classList.contains("stack")) {
              var sectionid = section.id;
              newdict[sectionid] = {};

              var _langattributes = section.querySelectorAll("[".concat(options.langattribute, "]"));

              _langattributes.forEach(function (element) {
                var key = element.getAttribute(options.langattribute);
                newdict[sectionid][key] = element.textContent;
              });
            }
          });
          langs[options.locale].name = options.localename;
          langs[options.locale].dictionary = newdict;
        }

        if (options.makejson) {
          var params = getParams(window.location.href);

          if (params.makejson) {
            downloadObjectAsJson(langs[options.locale].dictionary, "".concat(options.locale));
          }
        }
      };

      var setText = function setText(pickLang) {
        var sections = deck.getRevealElement().querySelectorAll("section");
        var pickdict = langs[pickLang].dictionary;
        var origdict = langs[options.locale].dictionary;
        sections.forEach(function (section) {
          if (section.id && !section.classList.contains("stack")) {
            var sectionid = section.id;

            var _langattributes2 = section.querySelectorAll("[".concat(options.langattribute, "]"));

            _langattributes2.forEach(function (element) {
              if (element.getAttribute(options.langattribute)) {
                var msg = element.getAttribute(options.langattribute);

                if (pickdict[sectionid]) {
                  if (pickdict[sectionid][msg]) {
                    element.textContent = pickdict[sectionid][msg];
                  }
                } else if (origdict[sectionid]) {
                  if (origdict[sectionid][msg]) {
                    element.textContent = origdict[sectionid][msg];
                  }
                }
              }
            });
          }
        });
      };

      var switchSetter = function switchSetter(selects, value) {
        selects.forEach(function (thisselect) {
          thisselect.value = value;
          var radio = thisselect.querySelector("input[value='".concat(value, "']"));

          if (radio) {
            radio.checked = true;
          }
        });
      };

      var langSwitcher = function langSwitcher() {
        var selects = deck.getRevealElement().querySelectorAll(options.switchselector);

        if (sessionStorage['InternationSettingsStorage']) {
          var langPref = sessionStorage['InternationSettingsStorage'];
          switchSetter(selects, langPref);
          setText(langPref);
        }

        selects.forEach(function (thisselect) {
          thisselect.addEventListener('change', function (event) {
            switchSetter(selects, event.target.value);
            setText(event.target.value);
            sessionStorage['InternationSettingsStorage'] = event.target.value;
          });
        });
      };

      var langattributes = deck.getRevealElement().querySelectorAll("[".concat(options.langattribute, "]"));
      var langs = options.languages;

      if (!langattributes) {
        debugLog("There are no elements that have the data attribute of ".concat(options.langattribute));
      }

      if (Object.keys(langs).length === 0 && langs.constructor === Object) {
        debugLog("There are no languages defined.");
        Reveal.on('ready', function (event) {
          getTextContent(deck, options);
        });
      }

      if (langattributes.length > 0) {
        var size = Object.keys(langs).length;
        var counter = 0;
        Object.keys(langs).forEach(function (abbr) {
          if (_typeof(langs[abbr].dictionary) == "object") {
            counter++;

            if (counter == size) {
              getTextContent(deck, options);
              langSwitcher();
            }
          } else {
            readJson(langs[abbr].dictionary).then(function (res) {
              if (res.srcElement.status != "200") {
                debugLog("The language file \"".concat(langs[abbr].name, "\" at \"").concat(langs[abbr].dictionary, "\" was not found"));
              } else {
                langs[abbr].dictionary = JSON.parse(res.srcElement.response);
              }

              if (counter == size) {
                getTextContent(deck, options);
                langSwitcher();
              }
            });
            counter++;
          }
        });
        debugLog("Loaded languages:");
        debugLog(langs);
      } else {
        debugLog("There are no elements that have the data attribute of ".concat(options.langattribute));
      }
    };

    var init = function init(deck) {
      var defaultOptions = {
        locale: "en",
        localename: 'English',
        langattribute: "data-i18n",
        switchselector: ".langchooser",
        languages: {},
        debug: false,
        makejson: false
      };

      var defaults = function defaults(options, defaultOptions) {
        for (var i in defaultOptions) {
          if (!options.hasOwnProperty(i)) {
            options[i] = defaultOptions[i];
          }
        }
      };

      var options = deck.getConfig().internation || {};
      defaults(options, defaultOptions);
      InterNation(deck, options);
    };

    return {
      id: 'internation',
      init: init
    };
  };

  return Plugin;

})));
