/*!
 * Font Awesome Icon Picker
 * https://farbelous.github.io/fontawesome-iconpicker/
 *
 * Originally written by (c) 2016 Javi Aguilar
 * Licensed under the MIT License
 * https://github.com/farbelous/fontawesome-iconpicker/blob/master/LICENSE
 *
 */
var FA_CSS_URL = 'https://use.fontawesome.com/releases/v5.0.8/css/all.css';
var FA_CSS_CLASSES = {};
var FA_CACHING_TIME = 7 * 24 * 3600 * 1000; // Cache for 7 days

function _selectText(element) {
    var doc = window.document, range = null;

    if (doc.body.createTextRange) { // ms
        range = doc.body.createTextRange();
        range.moveToElementText(element);
        range.select();
    } else if (window.getSelection) { // moz, opera, webkit
        var selection = window.getSelection();
        range = doc.createRange();
        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);
    }
}

function _loadCssRules(stylesheet_uri, callback) {
    var readyCallback = function (faClasses) {
        $(function () {
            callback(faClasses);
        });
    };

    chrome.storage.local.get(['faClasses', 'faClassesCacheTime'], function (items) {
        if (
            items.faClasses
            && items.faClassesCacheTime
            && (items.faClassesCacheTime > Date.now() - FA_CACHING_TIME)
        ) {
            callback(items.faClasses);
        } else {
            $.ajax(stylesheet_uri).done(function (data) {
                var style_tag = document.createElement('style');
                style_tag.id = 'fa_stylesheet_inline';
                style_tag.appendChild(document.createTextNode(data));

                $(style_tag).insertBefore('#fa_stylesheet');
                FA_CSS_CLASSES = _parseCssRules(document.styleSheets[1].rules);

                $('#fa_stylesheet_inline').remove();

                // Store parsed classes locally, so they won't need to be fetched every time the plugin is opened
                chrome.storage.local.set({faClasses: FA_CSS_CLASSES, faClassesCacheTime: Date.now()}, function () {
                });
                readyCallback(FA_CSS_CLASSES);
            });
        }
    });
}

function _parseCssRules(cssRules) {
    var parsedRules = {};
    for (var j = 0, k = cssRules.length; j < k; j++) {
        var rule = cssRules[j], cssClasses = [];

        if (
            rule['selectorText']
            && rule['style']
            && rule.style['content']
        ) {
            cssClasses = rule.selectorText.replace(/ /g, '').replace(/\./g, '').split(',');
            cssClasses.forEach(
                function (className) {
                    parsedRules[className] = rule.style.content ? rule.style.content.replace(/"/g, '') : '';
                }
            );
        }
    }
    return parsedRules;
}

$(function () {
    _loadCssRules(FA_CSS_URL, function (cssClasses) {
        $('.iconpicker').html('').iconpicker({
            showFooter: true,
            templates: {
                buttons: '<div></div>',
                search: '<input type="search" class="form-control iconpicker-search" placeholder="Type to filter" />',
                footer: '<div class="popover-footer"><p class="icn"><i class="icn-inner"></i></p><p class="txt"></p></div>'
            }
        }).on('iconpickerSelected iconpickerUpdated', function (e) {
            if (!e.iconpickerValue) {
                return;
            }
            var fontFamily = e.iconpickerValue.match(/fab /) ? 'Font Awesome\\ 5 Brands' : 'Font Awesome\\ 5 Free';
            var $footer = e.iconpickerInstance.popover.find('.popover-footer').show();
            var cssClassParts = e.iconpickerValue.split(' ');
            var cssClass = cssClassParts.pop();
            var glyphChar = cssClasses[cssClass + '::before'] ? cssClasses[cssClass + '::before'] :
                (cssClasses[cssClass + ':before'] ? cssClasses[cssClass + ':before'] : '??');

            $footer.find('.icn-inner')
                .html(glyphChar)
                .attr('style', 'font-family: ' + fontFamily)
                .attr('class', 'icn-inner ' + cssClassParts.join(' '))
            ;
            var _txt = $footer.find('.txt')
                .html(e.iconpickerValue +
                    '<small>&lt;i class="' + e.iconpickerValue + '"&gt;&lt;/i&gt;</small>');
            _selectText(_txt.find('small').get(0));
        });

        $(function () {
            $('.iconpicker .popover-footer').append($('#subfooter'));
        });
    });
});
