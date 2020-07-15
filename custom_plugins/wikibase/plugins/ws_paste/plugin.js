var Ws_Paste = function (editor) {
    "use strict";

    function _pastePostProcess(e) {
        var html = '<div>' + e.content + '</div>';
        console.log({
            e: e,
            html: html,
            $html: $(html),
            children: $(html).children()
        });
        var $html = $(html);
        if ( $($html).find('span.mwt-ws-non-editable').length > 0 ) {
            $($html).find('span[data-wiki]').parent().replaceWith(function (i) {
                var newHt = $(this).find('span[data-wiki]').attr('data-wiki');
                console.log({
                    el: this,
                    newHt: newHt
                });
                return newHt;
            });
        } else {
            $($html).find('span[data-wiki]').replaceWith(function (i) {
                var newHt = $(this).attr('data-wiki');
                console.log({
                    el: this,
                    newHt: newHt
                });
                return newHt;
            });
        }
        $($html).children().each(function(i, el) {
            console.log({
                el: el,
                $el: $(el)
            });
        });
        html = $($html).html();
        console.log({
            html: html
        });
        var textObject = {text: html};
        $(document).trigger('TinyMCEBeforeWikiToHtml', [textObject]);
        console.log(textObject);
        html = textObject.text;

        $(document).trigger('TinyMCEAfterWikiToHtml', [textObject]);
        html = textObject.text;
        e.content = html;
        return;
    }


    this.init = function (ed, url) {
        console.log("init ws_paste");
        ed.on('pastePreProcess', _pastePostProcess);
    }


    return;
}


tinymce.PluginManager.add('wspaste', Ws_Paste);