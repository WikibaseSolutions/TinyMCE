var Ws_Paste = function (editor) {
    "use strict";

    function _removeUnWantedClasses(html) {
        $(html).find('.rvs-collapse').removeClass('rvs-collapse');
        $(html).find('.rvs-hover-collapse').removeClass('rvs-hover-collapse');
        return html;
    }

    function _removeUnWantedMarkJSSpans(html) {
        $(html).find('span[class^="highlight"][data-markjs]').replaceWith(function () {
            return this.innerHTML;
        });
        return html;
    }

    function _pastePreProcess(e, data) {
        var html = '<div>' + data.text + '</div>';
        var $html = $(html);
        if ( $($html).find('span.mwt-ws-non-editable').length > 0 ) {
            $($html).find('span[data-wiki]').parent().replaceWith(function (i) {
                const newHt = $(this).find('span[data-wiki]').attr('data-wiki');
                return convertBack2Wiki(newHt);
            });
        } else {
            $($html).find('span[data-wiki]').replaceWith(function (i) {
                const newHt = $(this).attr('data-wiki');
                return  convertBack2Wiki(newHt);
            });
        }

        $html = _removeUnWantedClasses($html);
        $html = _removeUnWantedMarkJSSpans($html);
        html = $($html).html();
        var textObject = {text: html};
        $(document).trigger('TinyMCEBeforeWikiToHtml', [textObject]);
        html = textObject.text;
        // console.log(html);
        // $(document).trigger('TinyMCEAfterWikiToHtml', [textObject]);
        // html = textObject.text;
        data.text = html;
        return data;
    }

    function _pasteAfterProcess(e, data) {
        // console.log(data.text);
        var textObject = {text: data.text};
        $(document).trigger('TinyMCEAfterWikiToHtml', [textObject]);
        // console.log(textObject.text);
        data.text = textObject.text;
        return data;
    }

    function _pastePostProcess(e) {
        const $elm = $(e.node);
        var textObject = {text: $elm.html()};
        $(document).trigger('TinyMCEAfterWikiToHtml', [textObject]);
        $(e.node).html(textObject.text);
        return e;
    }

    function convertBack2Wiki(txt) {
        return txt.replaceAll("{{!}}", "|");
    }

    this.init = function (ed, url) {
        $(document).on('TinyMCEBeforePastePreProcess', _pastePreProcess);
        ed.on('PastePostProcess', _pastePostProcess);
    }


    return;
}


tinymce.PluginManager.add('wspaste', Ws_Paste);
