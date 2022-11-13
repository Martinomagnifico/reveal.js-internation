const Plugin = () => {

	Object.filter = (obj, predicate) => 
	Object.keys(obj)
		.filter( key => predicate(obj[key]) )
		.reduce( (res, key) => (res[key] = obj[key], res), {} );
		

	var getParams = function (url) {
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

	const getCookie = function (name) {
		let value = `; ${document.cookie}`;
		let parts = value.split(`; ${name}=`);
		if (parts.length === 2) return parts.pop().split(';').shift();
	}


	const readJson = (file, options = { method: 'get' }) =>
		new Promise((resolve, reject) => {
			let request = new XMLHttpRequest();
			request.onload = resolve;
			request.onerror = reject;
			request.overrideMimeType("application/json");
			request.open(options.method, file, true);
			request.onreadystatechange = () => {
				if (request.readyState === 4 && request.status === "200") {
					resolve(request.responseText);
				}
			};
			request.send(null);
		});

		

	function downloadObjectAsJson(exportObj, exportName) {
		let myjson = JSON.stringify(exportObj);
		myjson = myjson.replace(/\\n/g, '').replace(/"\s+|\s+"/g,'"');
		myjson = JSON.stringify((JSON.parse(myjson)), null, 4);
		let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(myjson); 
		var downloadAnchorNode = document.createElement('a');
		downloadAnchorNode.setAttribute("href", dataStr);
		downloadAnchorNode.setAttribute("download", exportName + ".json");
		document.body.appendChild(downloadAnchorNode); // required for firefox
		downloadAnchorNode.click();
		downloadAnchorNode.remove();
	}

	var escapeJSON = function(str) {
		return str.replace(/\\/g,'\\');
	};

	const InterNation = function(deck, options) {

		let revealEl = deck.getRevealElement();

		const debugLog = function(text) {
			if (options.debug) console.log(text);
		}

		const attributeLooper = function(langattributes, pickdict, origdict, sectionid) {
	
			langattributes.forEach(element => {
	
				if (element.getAttribute(options.langattribute)) {

					let msg = element.getAttribute(options.langattribute);

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
			
		}

		const getTextContent = function(deck, options) {

			let sections = revealEl.querySelectorAll(`section`);
			let JSON = false;

			if (langs[options.locale]) {
				if (typeof langs[options.locale].dictionary == "object") {
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
				let newdict = {};
				newdict.slides = {};

				let idDivs = revealEl.querySelectorAll(":scope > [id]");

				idDivs.forEach(idDiv => {
					newdict[idDiv.id] = {}
					let langattributes = idDiv.querySelectorAll(`[${options.langattribute}]`);

					langattributes.forEach(element => {
						let key = element.getAttribute(options.langattribute);
						newdict[idDiv.id][key] = options.html ? escapeJSON(element.innerHTML) : element.textContent;
					});
				});

				sections.forEach(section => {
					if (section.id && !section.classList.contains("stack")) {
						let sectionid = section.id;

						newdict.slides[sectionid] = {}

						let langattributes = section.querySelectorAll(`[${options.langattribute}]`);

						langattributes.forEach(element => {
							let key = element.getAttribute(options.langattribute);
							newdict.slides[sectionid][key] = options.html ? escapeJSON(element.innerHTML) : element.textContent;
						});
					}
				});
				langs[options.locale].name = options.localename;
				langs[options.locale].dictionary = newdict;
			}
			if (options.makejson) {
				let params = getParams(window.location.href);
				if (params.makejson) {
					downloadObjectAsJson(langs[options.locale].dictionary, `${options.locale}`)
				}
			}
		}

		const setText = function(pickLang) {

			let pickdict = langs[pickLang].dictionary;
			let origdict = langs[options.locale].dictionary;

			if (langs[pickLang].direction && langs[pickLang].direction == 'rtl') {
				deck.configure({rtl:true})
			} else {
				deck.configure({rtl:false})
			}

			// Set language for elements outside 'slides'
			let idDivs = revealEl.querySelectorAll(":scope > [id]:not(.slides)");
			idDivs.forEach(idDiv => {
				let divid = idDiv.id;
				let langattributes = idDiv.querySelectorAll(`[${options.langattribute}]`);
				attributeLooper(langattributes, pickdict, origdict, divid);
			});

			// Set language for elements inside 'slides'
			if (pickdict.slides) {
				let sections = revealEl.querySelectorAll(`section[id]`);
				pickdict = pickdict.slides;
				sections.forEach(section => {
					if (!section.classList.contains("stack")) {
						let sectionid = section.id;
						let langattributes = section.querySelectorAll(`[${options.langattribute}]`);
						attributeLooper(langattributes, pickdict, origdict, sectionid);
					}
				});
			}
		}

		const switchSetter = function(selects, value) {
			selects.forEach(thisselect => {
				thisselect.value = value;
				deck.getRevealElement().setAttribute('lang', value);
				let radio = thisselect.querySelector(`input[value='${value}']`);
				if (radio) {
					radio.checked = true;
				}
			});
		}

		const langSwitcher = function() {
			let selects = deck.getRevealElement().querySelectorAll(options.switchselector);

			if (sessionStorage['InternationSettingsStorage'] || getCookie('InternationSettings')) {
				let langPref = sessionStorage['InternationSettingsStorage'] ? sessionStorage['InternationSettingsStorage'] : getCookie('InternationSettings');
				switchSetter(selects, langPref);
				setText(langPref);
			}

			selects.forEach(thisselect => {

				thisselect.addEventListener('change', function(event) {
					switchSetter(selects, event.target.value);
					setText(event.target.value);
					sessionStorage['InternationSettingsStorage'] = event.target.value;
					document.cookie = `InternationSettings=${event.target.value};max-age=${60 * 60 * 24 * 14}`;
				});

			});

		}

		let langattributes = deck.getRevealElement().querySelectorAll(`[${options.langattribute}]`);
		let langs = options.languages;

		if (!langattributes) {
			debugLog(`There are no elements that have the data attribute of ${options.langattribute}`)
		}
		if (Object.keys(langs).length === 0 && langs.constructor === Object) {
			debugLog(`There are no languages defined.`);
			deck.on( 'ready', event => {
				getTextContent(deck, options);
			});

		}

		
		if (langattributes.length > 0) {

			let size = Object.keys(langs).length;
			let counter = 0;

			Object.keys(langs).forEach(function(abbr) {

				if (typeof langs[abbr].dictionary == "object") {

					counter++;

					if (counter == size) {
						getTextContent(deck, options);
						langSwitcher();
					}

				} else {

					readJson(langs[abbr].dictionary).then(res => {
						if (res.srcElement.status != "200") {
							debugLog(`The language file "${langs[abbr].name}" at "${langs[abbr].dictionary}" was not found`);
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
			debugLog(`There are no elements that have the data attribute of ${options.langattribute}`)
		}
	}

	const init = function(deck) {

		let defaultOptions = {
			locale: "en",
			localename: 'English',
			langattribute: "data-i18n",
			switchselector: ".langchooser",
			html: true,
			languages: {},
			debug: false,
			makejson: false
		};

		const defaults = function(options, defaultOptions) {
			for (let i in defaultOptions) {
				if (!options.hasOwnProperty(i)) {
					options[i] = defaultOptions[i];
				}
			}
		}

		let options = deck.getConfig().internation || {};
		defaults(options, defaultOptions);

		InterNation(deck, options);
	};

	return {
		id: 'internation',
		init: init
	};
};

export default Plugin;