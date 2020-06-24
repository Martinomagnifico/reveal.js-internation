const Plugin = () => {

	const readJson = (file, options = {
			method: 'get'
		}) =>
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

	function downloadObjectAsJson(exportObj, exportName){
		var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
		var downloadAnchorNode = document.createElement('a');
		downloadAnchorNode.setAttribute("href",     dataStr);
		downloadAnchorNode.setAttribute("download", exportName + ".json");
		document.body.appendChild(downloadAnchorNode); // required for firefox
		downloadAnchorNode.click();
		downloadAnchorNode.remove();
	}

	const InterNation = function (deck, options) {

		const debugLog = function (text) {
			if (options.debug) console.log(text);
		}

		const getTextContent = function () {

			let sections = deck.getRevealElement().querySelectorAll(`section`);
			let JSON = false;

			if (langs[options.locale]) {
				if (typeof langs[options.locale].dictionary == "object") {
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
				let newdict = {};

				sections.forEach(section => {
					if (section.id) {
						let sectionid = section.id;
	
						newdict[sectionid] = {}
	
						let langattributes = section.querySelectorAll(options.langattribute);
	
						langattributes.forEach(element => {
							let key = element.getAttribute(options.langattribute);
							newdict[sectionid][key] = element.textContent;
						});
					}
				});
				langs[options.locale].name = options.localename;
				langs[options.locale].dictionary = newdict;
			}
			if (options.makejson) {
				downloadObjectAsJson(langs[options.locale].dictionary, `${options.locale}`)
			}
		}


		const setText = function (pickLang) {

			let sections = deck.getRevealElement().querySelectorAll(`section`);

			let pickdict = langs[pickLang].dictionary;
			let origdict = langs[options.locale].dictionary;

			sections.forEach(section => {
				if (section.id) {
					let sectionid = section.id;

					let langattributes = section.querySelectorAll(options.langattribute);

					langattributes.forEach(element => {

						if (element.getAttribute('data-i18n')) {

							let msg = element.getAttribute('data-i18n');

							if (pickdict[sectionid]) {
								if (pickdict[sectionid][msg]) {
									element.textContent = pickdict[sectionid][msg];
								}
							}
							else if (origdict[sectionid]) {
								if (origdict[sectionid][msg]) {
									element.textContent = origdict[sectionid][msg];
								}
							}
						}
					});
				}
			});
		}


		const switchSetter = function (selects, value) {
			selects.forEach(thisselect => {
				thisselect.value = value;

				let radio = thisselect.querySelector(`input[value='${value}']`);
				if (radio) {
					radio.checked = true;
				}
			});
		}

		const langSwitcher = function () {

			let selects = deck.getRevealElement().querySelectorAll('.langchooser');

			if (sessionStorage['InterNutshellSettingsStorage']) {
				let langPref = sessionStorage['InterNutshellSettingsStorage'];
				switchSetter(selects, langPref);
				setText(langPref);
			}

            selects.forEach(thisselect => {

                thisselect.addEventListener('change', function (event) {
                    switchSetter(selects, event.target.value);
                    setText(event.target.value);
                    sessionStorage['InterNutshellSettingsStorage'] = event.target.value;
                });

            });

		}

		let langattributes = deck.getRevealElement().querySelectorAll(options.langattribute);
		let langs = options.languages;

		let size = Object.keys(langs).length;
		let counter = 0;
				
		if (langattributes.length > 0) {

			Object.keys(langs).forEach(function (abbr) {

				readJson(langs[abbr].dictionary).then(res => {
					if (res.srcElement.status != "200") {
						debugLog(`The language file "${langs[abbr].name}" at "${langs[abbr].dictionary}" was not found`);
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
			debugLog(`There are no elements that have the data attribute of ${options.langattribute}`)
		}


	}

	const init = function (deck) {

		let defaultOptions = {
			locale: "en",
			select: "#chooser",
			langattribute: "[data-i18n]",
			debug: false,
			makejson: false
		};

		const defaults = function (options, defaultOptions) {
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