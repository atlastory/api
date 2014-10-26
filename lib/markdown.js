var fs = require("fs"),
    Q = require('q'),
    readFile = Q.denodeify(fs.readFile),
    path = require('path'),
    Remarkable = require('remarkable'),
    hljs = require('highlight.js');

/* Converts Markdown file into HTML
 * (see https://github.com/jonschlinkert/remarkable)
 * @param {string} file The MD filepath (ex. 'docs/index')
 */
module.exports = function(file) {
    var file = path.join(__dirname, '..', file + '.md');

    return readFile(file).then(function(mdText) {
        var md = new Remarkable('full', {
            html:        true, // Enable html tags in source
            breaks:      true, // Convert '\n' in paragraphs into <br>
            linkify:     true, // Autoconvert url-like texts to links
            typographer: true, // Enable smartypants and other sweet transforms
            // Highlighter function
            highlight: function (str, lang) {
                if (lang && hljs.getLanguage(lang)) {
                  try {
                    return hljs.highlight(lang, str).value;
                  } catch (__) {}
                }

                try {
                  return hljs.highlightAuto(str).value;
                } catch (__) {}

                return '';
            }
        });

        return md.render('' + mdText);
    });
};
