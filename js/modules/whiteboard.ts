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
        size: number | false;
        time: string;
    }

    interface IContent {
        content?: string;
        content_type?: string;
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
    let isReloadingFileList = false;
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
            url: $SWB.getModuleUrl('current'),

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
            url: $SWB.getModuleUrl('user'),
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

    function reloadFileList(completed?: (err: any, files: IFile[]) => void) {
        if (isReloadingFileList) {
            return;
        }

        isReloadingFileList = true;

        let err: any;
        let files: IFile[];
        jQuery.ajax({
            url: $SWB.getModuleUrl('files'),
            method: 'GET',

            success: (result: JsonResult) => {
                if (!result) {
                    return;
                }

                switch (result.code) {
                    case 0:
                        files = result.data;
                        break;
                }
            },

            error: (jqXHR: JQueryXHR, textStatus: string, errorThrown: string) => {
                err = errorThrown;

                console.error('[SIMPLE WHITEBOARD::whiteboard.reloadFileList()] ' + toStringSafe(errorThrown));
            },

            complete: () => {
                isReloadingFileList = false;

                if (completed) {
                    completed(err, files);
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
            url: $SWB.getModuleUrl('save'),
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
            url: $SWB.getModuleUrl('user'),
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

    function updateFileList(files: IFile[]) {
        const ARGS = arguments;

        if (isUpdatingFileList) {
            setTimeout(() => {
                updateFileList.apply(null, ARGS);
            }, 1000);

            return;
        }

        isUpdatingFileList = true;
        try {
            jQuery('.sw-file-list').each((index, e) => {
                const FILE_LIST = jQuery(e);

                if (files && files.length > 0) {
                    let whiteboardFileList = FILE_LIST.find('.sw-whiteboard-filelist');
                    if (whiteboardFileList.length < 1) {
                        whiteboardFileList = jQuery('<div class="sw-whiteboard-filelist" />');
    
                        FILE_LIST.html('');
                        FILE_LIST.append( whiteboardFileList );
                    }
    
                    const HAS_ITEMS = whiteboardFileList.find('.sw-whiteboard-file').length > 0;
    
                    // remove obsolete items
                    whiteboardFileList.find('.sw-whiteboard-file').each(function () {
                        const FILE_ITEM = jQuery(this);
                        const FILE_ID = parseInt( FILE_ITEM.attr('sw-id') );
    
                        let itemFound = false;
                        for (const F of files) {
                            if (F.id === FILE_ID) {
                                itemFound = true;
                                break;
                            }
                        }
    
                        if (!itemFound) {
                            FILE_ITEM.remove();
                        }
                    });
    
                    // add new items
                    files.forEach(f => {
                        const EXISTING_ITEM = whiteboardFileList.find(`.sw-whiteboard-file[sw-id='${ toStringSafe(f.id) }']`);
                        if (EXISTING_ITEM.length > 0) {
                            return;
                        }

                        const FILE_NAME = toStringSafe( f.name );
    
                        const NEW_ITEM = jQuery('<div class="media sw-whiteboard-file">' + 
                                                '<div class="media-body">' + 
                                                '<h4 class="media-heading"></h4>' + 
                                                '<span></span>' + 
                                                '</div>' + 
                                                '<div class="media-right">' + 
                                                '</div>' + 
                                                '</div>');
    
                        NEW_ITEM.attr('sw-id', f.id);
                        NEW_ITEM.attr('title', 'Click here to download...');
    
                        const ITEM_BODY = NEW_ITEM.find('.media-body');
                        const ITEM_FUNCTIONS = NEW_ITEM.find('.media-right');
                        
                        ITEM_BODY.find('.media-heading')
                                 .text( toStringSafe(f.name) );
    
                        const FILE_INFO = ITEM_BODY.find('span');
                        const ADD_INFO = (label: any, value: any) => {
                            const NEW_INFO = jQuery('<div class="sw-file-info">' + 
                                                    '<span class="sw-label"></span>' + 
                                                    '<span class="sw-value"></span>' + 
                                                    '</div>');
    
                            NEW_INFO.find('.sw-label') 
                                    .text( toStringSafe(label) + ':' );
                            NEW_INFO.find('.sw-value') 
                                    .text( toStringSafe(value) );
    
                            NEW_INFO.appendTo( FILE_INFO );
                        };
    
                        if (false !== f.size) {
                            ADD_INFO('Size', f.size);
                        }
                        if (f.time) {
                            ADD_INFO('Last modified', f.time);
                        }
    
                        ITEM_BODY.click(() => {
                            window.open('./file.php?f=' + encodeURIComponent( toStringSafe(f.id) ), '_blank');
                        });

                        const DELETE_BTN = jQuery('<a class="btn btn-xs btn-danger">' + 
                                                  '<i class="fa fa-trash-o" aria-hidden="true"></i>' + 
                                                  '</a>');
                        DELETE_BTN.attr('title', `Delete '${FILE_NAME}'...`);
                        DELETE_BTN.click(() => {
                            if (confirm(`Are you sure to delete '${FILE_NAME}'?`)) {
                                jQuery.ajax({
                                    url: $SWB.getModuleUrl('files') + '&f=' + encodeURIComponent( toStringSafe(f.id) ),
                                    method: 'DELETE',

                                    success: (result: JsonResult) => {
                                        if (!result) {
                                            return;
                                        }

                                        switch (result.code) {
                                            case 0:
                                                jQuery(`.sw-whiteboard-file[sw-id='${ toStringSafe(f.id) }']`).remove();
                                                break;

                                            default:
                                                console.warn('[SIMPLE WHITEBOARD::whiteboard.updateFileList(' + toStringSafe(f.id) + ')] Result code: ' + toStringSafe( result.code ));
                                                break;
                                        }
                                    },

                                    error: (jqXHR: JQueryXHR, textStatus: string, errorThrown: string) => {
                                        addAlert(
                                            `Could not delete file '${FILE_NAME}': '${ toStringSafe(errorThrown) }'`
                                        );
                                    }
                                });
                            }
                        });
                        DELETE_BTN.appendTo( ITEM_FUNCTIONS );
    
                        if (HAS_ITEMS) {
                            whiteboardFileList.prepend( NEW_ITEM );                        
                        }
                        else {
                            whiteboardFileList.append( NEW_ITEM );
                        }
                    });
                }
                else {
                    FILE_LIST.html('');
                    FILE_LIST.text('No files found');
                }
            });
        }
        finally {
            isUpdatingFileList = false;
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
                    url: $SWB.getModuleUrl('upload'),
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

    // load file list
    $SWB.addOnLoaded(() => {
        reloadFileList((err, files) => {
            if (err) {
                addAlert(
                    `Could not load file list: '${ toStringSafe(err) }'`
                );
            }
            else {
                updateFileList(files);
            }

            setInterval(() => {
                reloadFileList((err, files) => {
                    if (!err) {
                        updateFileList(files);
                    }
                });
            }, 1500);
        });
    });

    // add file button(s)
    $SWB.addOnLoaded(() => {
        jQuery('.sw-add-file-btn').click(function() {
            const BTN = jQuery(this);
            const PARENT = BTN.parent();

            PARENT.find('input[type="file"]')
                  .remove();

            const FILE_FIELD = jQuery('<input type="file" />');
            FILE_FIELD.hide();
            FILE_FIELD.appendTo( PARENT );

            FILE_FIELD.change(() => {
                const FIELD_FIELD_ELEMENT = <HTMLInputElement>FILE_FIELD[0];
                if (FIELD_FIELD_ELEMENT.files && FIELD_FIELD_ELEMENT.files.length > 0 && FIELD_FIELD_ELEMENT.files[0]) {
                    const FORM_DATA = new FormData();
                    FORM_DATA.append('swFileToUpload', FIELD_FIELD_ELEMENT.files[0]);

                    jQuery.ajax({
                        url: $SWB.getModuleUrl('files'),
                        method: 'POST',

                        data: FORM_DATA,
                        processData: false,
                        contentType: false,
                    });
                }
            });

            FILE_FIELD.click();
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
