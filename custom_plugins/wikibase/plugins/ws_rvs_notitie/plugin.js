var WsRvsNotitie = function(editor) {
    "use strict";

    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
    var rvsNode = false;

    var addNote = function(type, isDelete = false) {
        if ( isDelete ) { // needs to be deleted
            $(rvsNode).replaceWith(function (i) {
                var newHt = this.innerHTML;
                return newHt;
            });
        } else { // needs to be added or changed
            if (rvsNode && type !== 'interne tekst') { // needs to be changed
                // check if current focused element is not a note, or the type is anything but interne tekst
                /*if (!$(rvsNode).hasClass('rvs-note') || type !== 'interne tekst') {
                    editor.notificationManager.open({
                        text: 'Je kan geen notitie in een notitie toevoegen!',
                        type: 'error',
                        timeout: 3000
                    });
                    return;
                }*/


                const getTemplate = function (text) {
                    var uId = createUniqueId();
                    var changeElement = '';
                    switch (type) {
                        case 'interne notitie':
                            changeElement = `<div class="rvs-note rvs-only mwt-preserveHtml" id="${uId}">${text}</div>`;
                            break;
                        case 'notitie':
                            changeElement = `<div class="rvs-note mwt-preserveHtml" id="${uId}">${text}</div>`;
                            break;
                        case 'interne tekst':
                            changeElement = `<span class="rvs-only mwt-preserveHtml">${text}</span>`;
                            break;
                        case 'jurisprudentie':
                            changeElement = `<div class="rvs-note jurisprudentie mwt-preserveHtml" id="${uId}">${text}</div>`;
                            break;
                        default:
                            return;
                    }
                    return changeElement;
                }

                $(rvsNode).replaceWith(function (i) {
                    var txt = this.innerHTML;
                    return getTemplate(txt);
                });

                return;
            }
            var sel = editor.selection.getContent() || ' ';
            var template;
            var id = createUniqueId();

            if (sel === '' || sel === ' ') {
                sel = 'TEKST';
            } else {
                if ( type === 'interne tekst' ) {
                    // filter out p tags
                    if ( $(sel).length > 0 ) {
                        var $sel = $(sel);
                        $($sel).each(function(i, el) {
                            if ( $(el).is('p') ) {
                                $(el).replaceWith(function (e) {
                                    return this.innerHTML;
                                });
                            }
                        });
                        console.log({
                            sel: sel,
                            $sel: $sel
                        })
                        sel = $sel.html();
                    }
                }
            }

            var endOfLine = '<p class="mwt-paragraph"></p>';

            switch (type) {
                case 'interne notitie':
                    template = `<div class="rvs-note rvs-only mwt-preserveHtml" id="${id}"><p class="mwt-paragraph">${sel}</p></div>${endOfLine}`;
                    break;
                case 'notitie':
                    template = `<div class="rvs-note mwt-preserveHtml" id="${id}"><p class="mwt-paragraph">${sel}</p></div>${endOfLine}`;
                    break;
                case 'interne tekst':
                    template = `<span class="rvs-only mwt-preserveHtml">${sel}</span>`;
                    break;
                case 'jurisprudentie':
                    template = `<div class="rvs-note jurisprudentie mwt-preserveHtml"><p class="mwt-paragraph">${sel}</p></div>${endOfLine}`;
                    break;
                default:
                    return;
            }


            setContent(editor, template, {format: 'html'});
            if (sel === 'TEKST') {
                var focusNode = editor.selection.getNode();
                var selection = editor.selection.getSel();
                var node;
                if ( type === 'interne tekst' ) {
                    console.log({
                        selection: selection,
                        focusNode: focusNode
                    })
                    node = $(selection.focusNode).find('span.rvs-only')[0];
                } else {
                    node = $(selection.focusNode).find('p.mwt-paragraph')[0];
                }
                editor.selection.select(node, true);
                editor.focus();
            } else {
                var select = editor.selection.getSel();
                rvsNode = $(select.focusNode).find('[class^="rvs"]')[0];
            }
        }
    }

    var setContent = function ( editor, content, args ) {
        editor.focus();
        editor.undoManager.transact( function () {
            editor.selection.setContent( content, args );
//DC not sure we need next line?
            editor.undoManager.add();
        });
        // editor.selection.setCursorLocation();
        editor.nodeChanged();
    };

    /**
     *
     * @returns {string}
     */
    function createUniqueId() {
        var letter = alphabet[Math.floor(Math.random() * (26))];
        var secondLetter = alphabet[Math.floor(Math.random() * (26))];
        return new Date().getTime() + letter + secondLetter + Math.floor(Math.random()* 100);
    }

    function getTypeNoteIsSelected() {
        var $node = $(rvsNode);
        if ( $node.hasClass('rvs-note') && $node.hasClass('rvs-only') ) { // interne notitie
            return 'interne notitie';
        }
        if ( $node.hasClass('rvs-note') && !$node.hasClass('jurisprudentie') ) { // notitie
            return 'notitie';
        }
        if ( $node.hasClass('rvs-note') && $node.hasClass('jurisprudentie')) { // jurisprudentie
            return 'jurisprudentie';
        }
        if ( $node.hasClass('rvs-only') && !$node.hasClass('rvs-note') ) { // interne tekst
            return 'interne tekst';
        }
        return '';
    }

    function createMenuItemObj(type) {
        var obj = {
            type: 'menuitem',
            text: type,
            onAction: function (_) {
                addNote(type);
            }
        };
        if ( type === getTypeNoteIsSelected() ) {
            obj.icon = 'checkmark';
            obj.onAction = function (_) {
                addNote(type, true);
            }
        }
        return obj;
    }


    editor.ui.registry.addMenuButton('wsrvsnotitie', {
        text: 'Notitie',
        fetch: function (callback) {
            var items = [
                createMenuItemObj('notitie'),
                createMenuItemObj('interne notitie'),
                createMenuItemObj('jurisprudentie'),
                createMenuItemObj('interne tekst')
            ];
            callback(items);
        }
    });

    function onNodeChange(e) {
        var $parent = $(e.element).parent();
        if ( $(e.element).hasClass('rvs-note') || $(e.element).hasClass('rvs-only') ) { // direct rvs node
            rvsNode = e.element;
        } else if ($parent.hasClass('rvs-note') || $parent.hasClass('rvs-only')) { // check also for p tag
            rvsNode = $parent[0];
        } else {
            rvsNode = false;
        }
    }

    function onNewBlock(e) {
        if ( $(e.newBlock).find('span[class^="rvs"]').length > 0 ) {
            $(e.newBlock).find('span[class^="rvs"]').replaceWith(function (e) {
                var newHt = this.innerHTML;
                return newHt;
            });
        }
    }

    this.init = function (ed) {
        console.log('init ws_rvs_notitie');
        ed.on('NodeChange', onNodeChange);
        ed.on('NewBlock', onNewBlock);
    };

    return;
}

tinymce.PluginManager.add('wsrvsnotitie', WsRvsNotitie);