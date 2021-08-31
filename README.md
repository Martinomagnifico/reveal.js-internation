# Internation

[![Version](https://img.shields.io/npm/v/reveal.js-internation)](#) [![Downloads](https://img.shields.io/npm/dt/reveal.js-internation)](https://github.com/Martinomagnifico/reveal.js-internation/archive/refs/heads/master.zip)

A plugin for [Reveal.js](https://revealjs.com) 4, that can let the end user choose a language for the presentation. Creating additional languages is made easy by letting you tag elements that should be translated. Running the presentation in 'makejson'-mode will generate a full JSON file of the whole current presentation. You can then start translating this file into other languages.

You should probably actually know these other languages (or someone who does) to be able to do so :-)

[![Screenshot](https://martinomagnifico.github.io/reveal.js-internation/screenshot.png)](https://martinomagnifico.github.io/reveal.js-internation/demo.html)





## Installation

### Regular installation

Copy the internation folder to the plugins folder of the reveal.js folder, like this: `plugin/internation`.

### npm installation

This plugin is published to, and can be installed from, npm.

```console
npm install reveal.js-internation
```
The Verticator plugin folder can then be referenced from `node_modules/reveal.js-internation/plugin/internation`


## Setup

### JavaScript

The Internation plugin has been written for Reveal.js version 4. Internation also works in setups with multiple Reveal instances.

There are two JavaScript files for Internation, a regular one, `internation.js`, and a module one, `internation.esm.js`. You only need one of them:

#### Regular 
If you're not using ES modules, for example, to be able to run your presentation from the filesystem, you can add it like this:

```html
<script type="text/javascript" src="dist/reveal.js"></script>
<script src="plugin/internation/internation.js"></script>
<script>
	Reveal.initialize({
		// ...
		plugins: [ Internation ]
	});
</script>
```
#### As a module 
If you're using ES modules, you can add it like this:

```html
<script type="module">
	// This will need a server
	import Reveal from './dist/reveal.esm.js';
	import Internation from './plugin/internation/internation.esm.js';
	Reveal.initialize({
		// ...
		plugins: [ Internation ]
	});
</script>
```


## Configuration

There are a few options that you can change from the Reveal.js options. The values below are default and do not need to be set if they are not changed.

```javascript
Reveal.initialize({
	// ...
	internation: {
		locale: "en",
		localename: 'English',
		langattribute: "data-i18n",
		switchselector: ".langchooser",
		html: true,
		languages: {},
		debug: false,
		makejson: false
	},
	plugins: [ Internation ]
});
```

* **`locale`**: The shortened version of the language that the presentation is made in. 
* **`localename`**: The human-readable name of the language that the presentation is made in. 
* **`langattribute`**: The name of the language attribute. Use this to 'tag' your texts.
* **`switchselector`**: The selector for switching languages while running the presentation.
* **`html`**: Boolean to allow HTML inside the translation files and tags. Set to 'true' by default.
* **`languages`**: You can put whole dictionary objects here, instead of JSON files, if you *really* want to allow local file access.
* **`debug`**: Boolean to allow debugging. Set to 'false' by default.
* **`makejson`**: Boolean to set 'makejson' mode. Set to 'false' by default. See "Step 3" below.


## Step 1. Define the current language.

Internation has English as the default language. You can change it if you like in the options.


## Step 2. Start tagging your text

Give your slides (the ones in which you want to translate texts) specific ID's. If you have an item (like a menubar) across multiple slides, you need to give it an ID as well.

Add a data-attribute of data-i18n="something" to the text you want to translate. You can skip elements that are common in all languages.

```html
<section id="intro">
    <h1 data-i18n="title">Hello!</h1>
    <p data-i18n="paragraph1">There is a <a href="#">link</a> in the paragraph</p>
</section>
```
Internation reads HTML by default. If some text contains a span or link, it is better to take that whole piece for translation. If you turn the HTML setting off in the options (you can), you would need to make spans of every text that is not a link.


## Step 3. Run your presentation in 'makejson'-mode.

After having added your data-attributes in step 2, you can now turn on the 'makejson'-mode in the Internation options:  

```javascript
Reveal.initialize({
    //
    internation: {
        makejson: true
    },
    plugins: [ Internation ]
});
```

Next, and this is important, **load the page with this URL parameter: ...index.html?makejson**. This will immediately download a JSON file of your current HTML structure. The URL step is a safeguard for if you accidentally publish with makejson:true in the options turned on.

### Example dictionary/JSON

Here's an example of an English language file. This example has a menubar that is visible on all slides: 

```javascript
{
    "slides" : {
        "intro":{
            "title":"Hi there!",
            "paragraph1":"This is a paragraph"
        },
        "animals":{
            "title":"Animals",
            "dog":"Dog",
            "cat":"Cat",
        }
    },
    "menubar" : {
        "title":"Here is the title",
    }
}
```

## Step 4. Start translating

Make a copy of your first generated JSON. Give the file a name that is obvious (so, fr.json for French).
**Now start translating!** When you are finished, put the file somewhere in your Reveal presentation folder.

## Step 5A. Refer to your new language file(s)…

A language in Internation contains both a name and a dictionary. This example shows that a JSON file is used for the dictionary. JSON files will only work if there is a server. It will not work with the file:// protocol.

```javascript
Reveal.initialize({
    //
    internation: {
        languages: {
            fr: {
                name: "Français",
                dictionary: "fr.json"
            }
        }
    },
    plugins: [ Internation ]
});
```

## Step 5B. …or language object

If you *really* want to allow local file access, you can put the whole dictionary object in the specific language object in your options:

```javascript
Reveal.initialize({
    //
    internation: {
        languages: {
            fr: {
                name: "Français",
                dictionary: {
                    "slides" : {
                        "intro":{"title":"Bonjour!"}
                    }
                }
            }
        }
    },
    plugins: [ Internation ]
});
```

## Switching languages

If you want multiple languages, you will probably also want users to choose. Internation listens to 'change' events of either a select or a set of radio buttons inside the presentation. By default, this is any element with the class `langchooser`, but that classname can be changed in the options.

You can put these on a slide (like the first page of the demo with the flags) or outside them in an element that is visible on multiple slides (like the menubar in the examples). 

The demo has a fake select in the menubar that works with radio buttons. You can pick and style your own way of switching.



## Like it?
If you like it, please star this repo! 

And if you want to show off what you made with it, please do :-)


## License
MIT licensed

Copyright (C) 2021 Martijn De Jongh (Martino)
