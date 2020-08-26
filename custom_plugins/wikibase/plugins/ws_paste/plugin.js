var Ws_Paste = function (editor) {
    "use strict";

    function _pastePreProcess(e, data) {
        var html = '<div>' + data.text + '</div>';
        var $html = $(html);
        if ( $($html).find('span.mwt-ws-non-editable').length > 0 ) {
            $($html).find('span[data-wiki]').parent().replaceWith(function (i) {
                var newHt = $(this).find('span[data-wiki]').attr('data-wiki');
                return newHt;
            });
        } else {
            $($html).find('span[data-wiki]').replaceWith(function (i) {
                var newHt = $(this).attr('data-wiki');
                return newHt;
            });
        }
        html = $($html).html();
        var textObject = {text: html};
        $(document).trigger('TinyMCEBeforeWikiToHtml', [textObject]);
        html = textObject.text;

        $(document).trigger('TinyMCEAfterWikiToHtml', [textObject]);
        html = textObject.text;
        data.text = html;
        return data;
    }

    this.init = function (ed, url) {
        console.log("init ws_paste");
        $(document).on('TinyMCEBeforePastePreProcess', _pastePreProcess);
    }


    return;
}


tinymce.PluginManager.add('wspaste', Ws_Paste);