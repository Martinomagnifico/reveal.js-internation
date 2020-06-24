
/*****************************************************************
 * @author: Martijn De Jongh (Martino), martijn.de.jongh@gmail.com
 * https://github.com/Martinomagnifico
 *
 * Internation.js for Reveal.js 
 * Version 1.0.0
 * 
 * @license 
 * MIT licensed
 *
 * Thanks to:
 *  - Hakim El Hattab, Reveal.js 
 ******************************************************************/


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

    var getTextContent = function getTextContent() {
      var sections = deck.getRevealElement().querySelectorAll("section");
      var JSON = false;

      if (langs[options.locale]) {
        if (_typeof(langs[options.locale].dictionary) == "object") {
          debugLog("JSON file is OK and will overrule local textcontent");
          JSON = true;
        } else {
          debugLog("JSON file is linked but path is wrong");
          JSON = false;
        }
      } else {
        langs[options.locale] = {};
        JSON = false;
      }

      if (JSON == false) {
        var newdict = {};
        sections.forEach(function (section) {
          if (section.id) {
            var sectionid = section.id;
            newdict[sectionid] = {};

            var _langattributes = section.querySelectorAll(options.langattribute);

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
        downloadObjectAsJson(langs[options.locale].dictionary, "".concat(options.locale));
      }
    };

    var setText = function setText(pickLang) {
      var sections = deck.getRevealElement().querySelectorAll("section");
      var pickdict = langs[pickLang].dictionary;
      var origdict = langs[options.locale].dictionary;
      sections.forEach(function (section) {
        if (section.id) {
          var sectionid = section.id;

          var _langattributes2 = section.querySelectorAll(options.langattribute);

          _langattributes2.forEach(function (element) {
            if (element.getAttribute('data-i18n')) {
              var msg = element.getAttribute('data-i18n');

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
      var selects = deck.getRevealElement().querySelectorAll('.langchooser');

      if (sessionStorage['InterNutshellSettingsStorage']) {
        var langPref = sessionStorage['InterNutshellSettingsStorage'];
        switchSetter(selects, langPref);
        setText(langPref);
      }

      selects.forEach(function (thisselect) {
        thisselect.addEventListener('change', function (event) {
          switchSetter(selects, event.target.value);
          setText(event.target.value);
          sessionStorage['InterNutshellSettingsStorage'] = event.target.value;
        });
      });
    };

    var langattributes = deck.getRevealElement().querySelectorAll(options.langattribute);
    var langs = options.languages;
    var size = Object.keys(langs).length;
    var counter = 0;

    if (langattributes.length > 0) {
      Object.keys(langs).forEach(function (abbr) {
        readJson(langs[abbr].dictionary).then(function (res) {
          if (res.srcElement.status != "200") {
            debugLog("The language file \"".concat(langs[abbr].name, "\" at \"").concat(langs[abbr].dictionary, "\" was not found"));
          } else {
            langs[abbr].dictionary = JSON.parse(res.srcElement.response);
          }

          counter++;

          if (counter == size) {
            getTextContent();
            langSwitcher();
          }
        });
      });
    } else {
      debugLog("There are no elements that have the data attribute of ".concat(options.langattribute));
    }
  };

  var init = function init(deck) {
    var defaultOptions = {
      locale: "en",
      select: "#chooser",
      langattribute: "[data-i18n]",
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

export default Plugin;
