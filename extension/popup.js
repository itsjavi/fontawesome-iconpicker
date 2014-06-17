// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

function _selectText(element) {
    var doc = window.document;  

    if (doc.body.createTextRange) { // ms
        var range = doc.body.createTextRange();
        range.moveToElementText(element);
        range.select();
    } else if (window.getSelection) { // moz, opera, webkit
        var selection = window.getSelection();            
        var range = doc.createRange();
        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);
    }
}
function _getStyleRuleValue(style, selector, sheet) {
    var sheets = typeof sheet !== 'undefined' ? [sheet] : document.styleSheets;
    for (var i = 0, l = sheets.length; i < l; i++) {
        var sheet = sheets[i];
        if( !sheet.cssRules ) { continue; }
        for (var j = 0, k = sheet.cssRules.length; j < k; j++) {
            var rule = sheet.cssRules[j];
            if(rule.selectorText){
                var ruleSplit = rule.selectorText.replace(/ /g, '').split(',');
                if(ruleSplit.length > 1){
                    //console.log(ruleSplit);
                }
            }else{
                ruleSplit = [];
            }
            if (rule.selectorText && ruleSplit.indexOf(selector) !== -1) {
                return rule.style[style];
            }
        }
    }
    return null;
}

$(function() {
    $('.iconpicker').iconpicker({
        showFooter:true,
        templates:{
            buttons:'<div></div>',
            search: '<input type="search" class="form-control iconpicker-search" placeholder="Type to filter" />',
            footer:'<div class="popover-footer"><p class="icn"><i class="fa fa-3x fa-fw"></i></p><p class="txt"></p></div>'
        }
    }).on('iconpickerSelected iconpickerUpdated', function(e) {
        var $footer = e.iconpickerInstance.popover.find('.popover-footer').show();
        var _icnChar = _getStyleRuleValue('content','.fa-'+e.iconpickerValue+'::before', document.styleSheets[1]);
        $footer.find('.icn .fa').html(_icnChar);
        var _txt = $footer.find('.txt').text('fa-'+e.iconpickerValue);
        _selectText(_txt.get(0));
    }).data('iconpicker');
});