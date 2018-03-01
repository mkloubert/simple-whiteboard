// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

/// <reference path="../script.ts" />

namespace SimpleWhiteboard.Whiteboard {
    type ContentValue = IContent | false;
    
    interface IFile {
        id: number;
        name: string;
    }

    interface IContent {
        content?: string;
        content_type?: string;
        files?: IFile[];
        id: number | false;
        time?: string;
    }

    interface IUploadResult {
        name: string;
        path: string;
        type: string;
    }

    const BASE64_PREFIX = 'base64,';

    let editor: CodeMirror.Editor;
    let lastSavedEditorContent: string;
    let currentVersion: ContentValue;
    let isLoadCurrentVersion = false;
    let isSavingBoard = false;
    let isUpdatingFileList = false;

    function insertTextFile(file: File) {
        if (!file) {
            return;
        }

        const DOC = editor.getDoc();
        const CURSOR = DOC.getCursor();   

        const TYPE = toStringSafe(file.type).toLowerCase().trim();

        let codeLang: string | false = false;

        const SUB_TYPE = TYPE.substr(5).trim();
        switch (SUB_TYPE) {
            case '':
            case 'plain':
                codeLang = '';
                break;
        }

        if (false === codeLang) {
            for (const EXT in FILE_EXTENSIONS_AND_LANGS) {
                if (endsWith(file.name, '.' + EXT)) {
                    codeLang = FILE_EXTENSIONS_AND_LANGS[ EXT ];
                }
            }
        }

        if (false === codeLang) {
            codeLang = '';
        }

        readBlobAsText(file, (text) => {
            const CODE_BLOCK = "```" + codeLang + "\n" + toStringSafe(text) + "\n```";

            DOC.replaceRange("\n" + CODE_BLOCK + "\n", CURSOR);
        });
    }

    function isEditorDirty() {
        return lastSavedEditorContent !== editor.getValue();
    }

    function loadCurrentVersion(completed?: (err: any, content?: ContentValue) => void) {
        if (isLoadCurrentVersion) {
            return;
        }

        if (isSavingBoard) {
            return;
        }

        isLoadCurrentVersion = true;

        let content: ContentValue = false;
        let err: any;
        jQuery.ajax({
            url: '?m=current&b=' + encodeURIComponent( toStringSafe($SWB.board) ),

            success: (result: JsonResult) => {
                if (!result) {
                    return;
                }                

                switch (result.code) {
                    case 0:
                        content = result.data;
                        break;

                    case 1:
                        content = null;
                        break;                        
                }
            },

            error: (jqXHR: JQueryXHR, textStatus: string, errorThrown: string) => {
                err = errorThrown;
            },

            complete: () => {
                if (err) {
                    console.error('[SIMPLE WHITEBOARD::whiteboard.loadCurrentVersion()] ' + toStringSafe(err));
                }
                else {
                    currentVersion = content;
                }

                isLoadCurrentVersion = false;

                if (completed) {
                    completed(err, content);
                }
            }
        });
    }

    function loadUserName(completed?: (err: any, result?: JsonResult) => void) {
        const USERNAME_FIELD = jQuery('#sw-username');

        let err: any;
        let res: JsonResult;
        jQuery.ajax({
            url: '?m=user&b=' + encodeURIComponent( toStringSafe($SWB.board) ),
            method: 'GET',

            success: (result: JsonResult) => {
                res = result;

                if (result) {
                    switch (result.code) {
                        case 0:
                            {
                                let userName = toStringSafe(result.data).trim();
                                if (userName.length > 255) {
                                    userName = userName.substr(0, 255).trim();
                                }

                                USERNAME_FIELD.val( userName );
                            }                            
                            break;

                        default:
                            console.warn('[SIMPLE WHITEBOARD::whiteboard.loadUserName()] Result code: ' + toStringSafe( result.code ));
                            break;
                    }
                }
            },

            error: (jqXHR: JQueryXHR, textStatus: string, errorThrown: string) => {
                err = errorThrown;

                console.error('[SIMPLE WHITEBOARD::whiteboard.loadUserName()] ' + toStringSafe(errorThrown));
            },

            complete: () => {
                if (completed) {
                    completed(err, res);
                }
            }
        });
    }

    function saveBoard() {
        if (isSavingBoard) {
            return;
        }
        isSavingBoard = true;

        const NOTES_FIELD = jQuery('#sw-editor-notes-1');

        let reloadCurrent = false;
        jQuery.ajax({
            url: '?m=save&b=' + encodeURIComponent( toStringSafe($SWB.board) ),
            method: 'POST',

            data: {
                c: toStringSafe( editor.getValue() ),
                n: jQuery.trim( NOTES_FIELD.val() ),
            },

            beforeSend: () => {
                jQuery('#sw-save-btn').addClass('disabled');
            },

            success: (result: JsonResult) => {
                if (!result) {
                    return;
                }

                switch (result.code) {
                    case 0:
                        NOTES_FIELD.val('');
                        reloadCurrent = true;
                        break;

                    case 1:
                        reloadCurrent = true;
                        break;
                }
            },

            error: (jqXHR: JQueryXHR, textStatus: string, errorThrown: string) => {
                addAlert(`Could not save board: '${ toStringSafe(errorThrown) }'`);
            },

            complete: () => {
                jQuery('#sw-save-btn').removeClass('disabled');
                isSavingBoard = false;

                if (reloadCurrent) {
                    loadCurrentVersion((err, content) => {
                        if (!err) {
                            updateViewAndEditor(content, true);
                        }
                    });
                }
            }
        });
    }

    function saveUserName() {
        const USERNAME_FIELD = jQuery('#sw-username');

        let newUserName = jQuery.trim( USERNAME_FIELD.val() );
        if (newUserName.length > 255) {
            newUserName = newUserName.substr(0, 255).trim();
        }

        jQuery.ajax({
            url: '?m=user&b=' + encodeURIComponent( toStringSafe($SWB.board) ),
            method: 'POST',

            data: {
                u: newUserName,
            },

            success: (result: JsonResult) => {
                if (result) {
                    switch (result.code) {
                        case 0:
                            loadUserName();    
                            break;

                        default:
                            console.warn('[SIMPLE WHITEBOARD::whiteboard.saveUserName()] Result code: ' + toStringSafe( result.code ));
                            break;
                    }
                }
            },

            error: (jqXHR: JQueryXHR, textStatus: string, errorThrown: string) => {
                console.error('[SIMPLE WHITEBOARD::whiteboard.saveUserName()] ' + toStringSafe(errorThrown));
            }
        });
    }

    function showBoard() {
        selectTab('sw-board-1');
    }

    function showEditor() {
        selectTab('sw-editor-1');
    }

    function updateEditorDirtyState() {
        const TAB = jQuery('.sw-editor-tab');
        TAB.removeClass('sw-is-dirty');

        const DIRTY_FLAG = TAB.find('.sw-dirty');

        if (isEditorDirty()) {
            TAB.addClass('sw-is-dirty');
            DIRTY_FLAG.show();
        }
        else {
            DIRTY_FLAG.hide();
        }
    }

    function updateView(content: ContentValue) {
        if (false === content) {
            return;
        }

        const MY_ARGS = arguments;

        try {
            const BOARD = jQuery('.sw-board');

            if (content) {
                const MD = toStringSafe(content.content);

                const TEMP = jQuery('<span></span>');
                TEMP.html(
                    createMarkdownParser().makeHtml( MD )
                );
                
                // code blocks
                TEMP.find('pre code').each(function(i, block) {
                    hljs.highlightBlock(block);
                });
                
                // no scripts
                TEMP.find('script').remove();
    
                TEMP.find('img')
                    .addClass('img-responsive');
    
                if (jQuery.trim(BOARD.html()) !== jQuery.trim(TEMP.html())) {
                    BOARD.html(
                        TEMP.html()
                    );
                }
            }
            else {
                BOARD.html('');

                addAlert('No content', {
                    canClose: false,
                    target: BOARD,
                    type: 'info'
                });
            }
        }
        finally {
            currentVersion = content;
        }
    }

    function updateViewAndEditor(content: ContentValue, selectBoard = false) {
        if (content) {
            const CONTENT_TO_SET = toStringSafe(content.content);

            if (editor.getValue() !== CONTENT_TO_SET) {
                editor.setValue(CONTENT_TO_SET);
            }            
            lastSavedEditorContent = CONTENT_TO_SET;

            updateEditorDirtyState();         
        }

        updateView(content);

        if (selectBoard) {
            showBoard();
        }
    }

    function uploadAndInsertFile(file: File) {
        const DOC = editor.getDoc();
        const CURSOR = DOC.getCursor();

        const TYPE = toStringSafe(file.type).toLowerCase().trim();

        readBlob(file, (dataUrl) => {
            if (_.isNil(file)) {
                return;
            }

            const BASE64_SEP = dataUrl.toLowerCase().indexOf( BASE64_PREFIX );
            if (BASE64_SEP > -1) {
                const CONTENT = dataUrl.substr(BASE64_SEP + BASE64_PREFIX.length).trim();

                jQuery.ajax({
                    url: '?m=upload&b=' + encodeURIComponent( toStringSafe($SWB.board) ),
                    method: 'POST',

                    data: {
                        c: CONTENT,
                        t: TYPE,
                    },

                    success: (result: JsonResult) => {
                        if (!result) {
                            return;
                        }

                        switch (result.code) {
                            case 0:
                                const UPLOAD_RES: IUploadResult = result.data;
                                if (UPLOAD_RES) {
                                    DOC.replaceRange(` ![${UPLOAD_RES.name}](${UPLOAD_RES.path}) `, CURSOR);
                                }
                                break;

                            case 2:
                                addAlert(`The type '${ toStringSafe(result.data) }' is not supported!`, {
                                    type: 'warning'
                                });
                                break;
                        }
                    }
                });
            }
        });
    }

    // initialize editor
    $SWB.addOnLoaded(() => {
        const AREA = jQuery('#sw-editor-1 .sw-editor-area');
        AREA.html('');

        const NEW_EDITOR = jQuery('<textarea />');
        NEW_EDITOR.addClass('sw-textarea');

        NEW_EDITOR.appendTo( AREA );

        const EDITOR_OPTS: any = {
            dragDrop: true,
            lineNumbers: true,
            lineWrapping: true,
            mode: "text/x-markdown",
            autoRefresh: {
                delay: 500
            },
        };

        editor = CodeMirror.fromTextArea(<HTMLTextAreaElement>AREA.find('textarea')[0],
                                         EDITOR_OPTS);

        editor.on('drop', function(data, e) {
            if (!e || !e.dataTransfer) {
                return;
            }

            const DROPPED_FILES: FileList = e.dataTransfer.files;
            if (DROPPED_FILES && DROPPED_FILES.length > 0) {
                e.preventDefault();
                e.stopPropagation();

                for (let i = 0; i < DROPPED_FILES.length; i++) {
                    const DF = DROPPED_FILES.item( i );
                    
                    let type = toStringSafe( DF.type ).toLowerCase().trim();
                    if ('' === type) {
                        type = 'text/';
                    }

                    if (0 === type.indexOf('text/')) {
                        insertTextFile( DF );
                    }
                    else {
                        uploadAndInsertFile( DF );
                    }
                }

                return false;
            }
        });

        editor.on('change', () => {
            updateEditorDirtyState();

            if (isEditorDirty()) {
                updateView({
                    id: false,
                    content: editor.getValue(),
                });
            }
        });

        lastSavedEditorContent = editor.getValue();
        updateEditorDirtyState();
    });

    // auto focus editor when get visible
    $SWB.addOnLoaded(() => {
        jQuery('a[href="#sw-editor-1"]').on('shown.bs.tab', () => {
            editor.focus();
        });
    });

    // save button
    $SWB.addOnLoaded(() => {
        jQuery('#sw-save-btn').click(() => {
            saveBoard();
        });
    });

    // global shortcuts
    $SWB.addOnLoaded(() => {
        jQuery(window).bind('keydown', function(event) {
            let action: () => void;

            if (event.ctrlKey || event.metaKey) {
                switch (String.fromCharCode(event.which).toLowerCase()) {
                    case 'b':
                        // CTRL + B (board)
                        action = () => showBoard();
                        break;

                    case 'e':
                        // CTRL + E (editor)
                        action = () => showEditor();
                        break;

                    case 's':
                        // CTRL + S (save)
                        action = () => {
                            jQuery('#sw-save-btn').click();
                        };
                        break;
                }
            }

            if (action) {
                event.preventDefault();
                action();
            }
        });
    });

    // load current version
    $SWB.addOnLoaded(() => {
        loadCurrentVersion((err, content) => {
            if (err) {
                addAlert(
                    `Could not load board content: '${ toStringSafe(err) }'`
                );
            }
            else {
                updateViewAndEditor(content, true);
            }

            setInterval(() => {
                loadCurrentVersion((err, content) => {
                    if (isEditorDirty()) {
                        return;
                    }

                    if (!err) {
                        updateViewAndEditor(content);
                    }
                });
            }, 1500);    
        });
    });

    $SWB.addOnLoaded(() => {
        const USERNAME_FIELD = jQuery('#sw-username');

        USERNAME_FIELD.focusout(() => {
            saveUserName();
        });

        loadUserName(() => {
            if ('' === jQuery.trim( USERNAME_FIELD.val() )) {
                USERNAME_FIELD.focus();
            }
        });        
    });
}
