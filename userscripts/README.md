## Userscripts section ##
1. **download** userscript manager plugin for your favourite browser.
   * Chrome extension: [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=ru "Tampermonkey");
   * Firefox extension: [Greasemonkey](https://addons.mozilla.org/ru/firefox/addon/greasemonkey/ "Greasemonkey");
   * Opera supports userscript execution from version 8.
2. **copy** content of userscript.user.js to a new file in your userscript manager.
3. **change** @include notations, describes when to run this script.
4. **note** userscript.user.js, line 16:    
   ```// urls must be a set of regexps, duplicating @include notations in ==Userscript== section above```
5. **refresh** your target page (note "Toolbar" in top right corner);
6. **profit!!!** ^__~

This toolbar was created while working with heavy projects by their server side.  
It began as just a css refreshing script which is reducing server load while refreshing only stylesheets (ctrl+alt+r).  
Now it's also highlight js, css files with Prismjs by Lea Verou (ctrl+alt+h).  
And it can also change background color. For example, to see white-on-transparent png images (ctrl+alt+b).  
