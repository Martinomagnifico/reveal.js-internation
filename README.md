# Internation

[![Version](https://img.shields.io/npm/v/reveal.js-internation)](#) [![Downloads](https://img.shields.io/npm/dt/reveal.js-internation)](https://github.com/Martinomagnifico/reveal.js-internation/archive/refs/heads/master.zip)

A plugin for [Reveal.js](https://revealjs.com) 4, that can let the end user choose a language for the presentation. Creating additional languages is made easy by letting you tag elements that should be translated. Running the presentation in 'makejson'-mode will generate a full JSON file of the whole current presentation. You can then start translating this file into other languages.

You should probably actually know these other languages (or someone who does) to be able to do so :-)

[![Screenshot](screenshot.png)](https://martinomagnifico.github.io/reveal.js-internation/demo.html)


## Step 1. Define the current language.

Internation has English as default language. You can change it if you like in the options:


```
Reveal.initialize({
    //
    internation: {
        locale: "en",
        localename: "English"
    },
    plugins: [ Internation ]
});
```

## Step 2. Start tagging your text

Give your slides (the ones in which you want to translate texts) specific ID's. If you have an item (like a menubar) across multiple slides, you need to give it an ID as well.

Add a data-attribute of data-i18n="something" to the text you want to translate. You can skip elements that are common in all languages.

```
<section id="intro">
    <h1 data-i18n="title">Hello!</h1>
    <p data-i18n="paragraph1">There is a <a href="#">link</a> in the paragraph</p>
</section>
```
Internation reads HTML by default. If some text contains a span or link, it is better to take that whole piece for translation. If you turn the HTML setting off in the options (you can), you would need to make spans of every text that is not a link.


## Step 3. Run your presentation in 'makejson'-mode.

After having added your data-attributes in step 2, you can now turn on the 'makejson'-mode in the Internation options:  

```
Reveal.initialize({
    //
    internation: {
        makejson: true
    },
    plugins: [ Internation ]
});
```
Next, **load the page with this URL parameter: ...index.html?makejson**. This will immediately download a JSON file of your current HTML structure. The URL step is a safeguard for if you accidentally publish with makejson:true in the options turned on.

### Example dictionary/JSON

Here's an example of an English language file. This example has a menubar that is visible on all slides: 

```
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

```
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

```
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


# Switching languages

If you want multiple languages, you will probably also want users to choose. Internation listens to 'change' events of either a select or a set of radio buttons inside the presentation. By default, this is any element with the class `langchooser`, but that classname can be changed in the options.

You can put these on a slide (like the first page of the demo with the flags) or outside them in an element that is visible on multiple slides (like the menubar in the examples). 

The demo has a fake select in the menubar that works with radio buttons. You can pick and style your own way of switching.
