# Internation

A simple plugin for [Reveal.js](https://revealjs.com) 4, that can let the user choose a language for the presentation.

[![Screenshot](screenshot.png)](https://martinomagnifico.github.io/reveal.js-internation/demo.html)

This Readme is not finished yet :-)

A few points:

* You will need to make JSON files.
* You may generate your first JSON file by setting the makejson option to true. This will immediately download a JSON file generated from the current HTML content (so it would make sense not setting this in production), but you will still need to tag the texts with a data-attribute in advance.
* Sections need ID's for this plugin to work, so you can always move your slides around later on.
* The loading of JSON files will not work from a local filesystem. If you really want translation then, you can put the 'dictionary' object as a whole in the Reveal options for Internation. In the demo I did that for 'Nederlands'.
* Switching languages can be done through either a select or radio buttons. Any switch will update the other(s). The demo has a fake select in the menubar that works with radio buttons. You can pick and style your own way of switching.