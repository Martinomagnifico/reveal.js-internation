
/*****************************************************************
 * @author: Martijn De Jongh (Martino), martijn.de.jongh@gmail.com
 * https://github.com/Martinomagnifico
 *
 * Internation.js for Reveal.js 
 * Version 1.1.0
 * 
 * @license 
 * MIT licensed
 *
 * Thanks to:
 *  - Hakim El Hattab, Reveal.js 
 ******************************************************************/


function _typeof(obj) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  }, _typeof(obj);
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

  var getCookie = function getCookie(name) {
    var value = "; ".concat(document.cookie);
    var parts = value.split("; ".concat(name, "="));
    if (parts.length === 2) return parts.pop().split(';').shift();
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
    var myjson = JSON.stringify(exportObj);
    myjson = myjson.replace(/\\n/g, '').replace(/"\s+|\s+"/g, '"');
    myjson = JSON.stringify(JSON.parse(myjson), null, 4);
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(myjson);
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox

    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  var escapeJSON = function escapeJSON(str) {
    return str.replace(/\\/g, '\\');
  };

  var InterNation = function InterNation(deck, options) {
    var revealEl = deck.getRevealElement();

    var debugLog = function debugLog(text) {
      if (options.debug) console.log(text);
    };

    var attributeLooper = function attributeLooper(langattributes, pickdict, origdict, sectionid) {
      langattributes.forEach(function (element) {
        if (element.getAttribute(options.langattribute)) {
          var msg = element.getAttribute(options.langattribute);

          if (pickdict[sectionid]) {
            if (pickdict[sectionid][msg]) {
              if (options.html) {
                element.innerHTML = pickdict[sectionid][msg];
              } else {
                element.textContent = pickdict[sectionid][msg];
              }
            }
          } else if (origdict[sectionid]) {
            if (origdict[sectionid][msg]) {
              if (options.html) {
                element.innerHTML = origdict[sectionid][msg];
              } else {
                element.textContent = origdict[sectionid][msg];
              }
            }
          }
        }
      });
    };

    var getTextContent = function getTextContent(deck, options) {
      var sections = revealEl.querySelectorAll("section");
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
        newdict.slides = {};
        var idDivs = revealEl.querySelectorAll(":scope > [id]");
        idDivs.forEach(function (idDiv) {
          newdict[idDiv.id] = {};
          var langattributes = idDiv.querySelectorAll("[".concat(options.langattribute, "]"));
          langattributes.forEach(function (element) {
            var key = element.getAttribute(options.langattribute);
            newdict[idDiv.id][key] = options.html ? escapeJSON(element.innerHTML) : element.textContent;
          });
        });
        sections.forEach(function (section) {
          if (section.id && !section.classList.contains("stack")) {
            var sectionid = section.id;
            newdict.slides[sectionid] = {};

            var _langattributes = section.querySelectorAll("[".concat(options.langattribute, "]"));

            _langattributes.forEach(function (element) {
              var key = element.getAttribute(options.langattribute);
              newdict.slides[sectionid][key] = options.html ? escapeJSON(element.innerHTML) : element.textContent;
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
      var pickdict = langs[pickLang].dictionary;
      var origdict = langs[options.locale].dictionary;

      if (langs[pickLang].direction && langs[pickLang].direction == 'rtl') {
        deck.configure({
          rtl: true
        });
      } else {
        deck.configure({
          rtl: false
        });
      } // Set language for elements outside 'slides'


      var idDivs = revealEl.querySelectorAll(":scope > [id]:not(.slides)");
      idDivs.forEach(function (idDiv) {
        var divid = idDiv.id;
        var langattributes = idDiv.querySelectorAll("[".concat(options.langattribute, "]"));
        attributeLooper(langattributes, pickdict, origdict, divid);
      }); // Set language for elements inside 'slides'

      if (pickdict.slides) {
        var sections = revealEl.querySelectorAll("section[id]");
        pickdict = pickdict.slides;
        sections.forEach(function (section) {
          if (!section.classList.contains("stack")) {
            var sectionid = section.id;

            var _langattributes2 = section.querySelectorAll("[".concat(options.langattribute, "]"));

            attributeLooper(_langattributes2, pickdict, origdict, sectionid);
          }
        });
      }
    };

    var switchSetter = function switchSetter(selects, value) {
      selects.forEach(function (thisselect) {
        thisselect.value = value;
        deck.getRevealElement().setAttribute('lang', value);
        var radio = thisselect.querySelector("input[value='".concat(value, "']"));

        if (radio) {
          radio.checked = true;
        }
      });
    };

    var langSwitcher = function langSwitcher() {
      var selects = deck.getRevealElement().querySelectorAll(options.switchselector);

      if (sessionStorage['InternationSettingsStorage'] || getCookie('InternationSettings')) {
        var langPref = sessionStorage['InternationSettingsStorage'] ? sessionStorage['InternationSettingsStorage'] : getCookie('InternationSettings');
        switchSetter(selects, langPref);
        setText(langPref);
      }

      selects.forEach(function (thisselect) {
        thisselect.addEventListener('change', function (event) {
          switchSetter(selects, event.target.value);
          setText(event.target.value);
          sessionStorage['InternationSettingsStorage'] = event.target.value;
          document.cookie = "InternationSettings=".concat(event.target.value, ";max-age=").concat(60 * 60 * 24 * 14);
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
      deck.on('ready', function (event) {
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
      html: true,
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

export { Plugin as default };
