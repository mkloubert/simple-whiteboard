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
/// <reference path="../../ts/codemirror.d.ts" />

namespace SimpleWhiteboard.Whiteboard {
    interface IFile {
        name: string;
    }

    const EDITORS: CodeMirror.Editor[] = [];
    let isSavingBoard = false;
    let isUpdatingFileList = false;

    function focusVisibleEditor() {
        forVisibleEditors((cm) => {
            cm.focus();
        });
    }

    function forVisibleEditors(action: (editor: CodeMirror.Editor) => any) {
        jQuery('.sw-whiteboard').each((index, e) => {
            const WB = jQuery(e);
            if (WB.is(':visible')) {
                const CM: CodeMirror.Editor = eval("WB.find('.CodeMirror')[0].CodeMirror");
                if (CM) {
                    action(CM);
                }
            }
        });
    }

    function saveBoard() {
        if (isSavingBoard) {
            return;
        }
        isSavingBoard = true;

        try {
            forVisibleEditors((cm) => {
                const PARSER = createMarkdownParser();

                const MD = cm.getValue();

                jQuery('.sw-board').html(
                    PARSER.makeHtml(MD)
                );
            });

            showBoard();
        }
        finally {
            isSavingBoard = false;
        }
    }

    function setEditorValue(text: string) {
        EDITORS.forEach(e => {
            e.setValue('' + text);
        });
    }

    function showBoard() {
        jQuery('a[href="#sw-board-1"]').tab('show');
        jQuery('a[href="#sw-board-2"]').tab('show');
    }

    function showEditor() {
        jQuery('a[href="#sw-editor-1"]').tab('show');
        jQuery('a[href="#sw-editor-2"]').tab('show');
    }

    function updateBoard() {

    }

    function updateFileList() {
        if (isUpdatingFileList) {
            return;
        }
        isUpdatingFileList = true;

        const FILE_LISTS = jQuery('.sw-files');

        jQuery.ajax({
            url: '?m=files',
            success: (result: IFile[]) => {
                if (result && result.length > 0) {

                }
                else {
                    FILE_LISTS.text('No files found.');
                }
            },
            error: () => {

            },
            complete: () => {
                isUpdatingFileList = false;
            }
        });
    }

    function updateView() {
        updateBoard();
        updateFileList();
    }

    $SWB.addOnLoaded(() => {
        jQuery('.sw-editor .sw-editor-area').each((index, e) => {
            const AREA = jQuery(e);
            AREA.html('');
            
            const NEW_EDITOR = jQuery('<textarea />');
            NEW_EDITOR.addClass('sw-textarea');

            NEW_EDITOR.appendTo( AREA );

            const EDITOR_OPTS: any = {
                lineNumbers: false,
                mode: "text/x-markdown",
                autoRefresh: {
                    delay: 500
                },
            };

            const NEW_CM_EDITOR = CodeMirror.fromTextArea(<HTMLTextAreaElement>AREA.find('textarea')[0],
                                                          EDITOR_OPTS);
            EDITORS.push( NEW_CM_EDITOR );
        });
    });

    $SWB.addOnLoaded(() => {
        jQuery('a[href="#sw-editor-1"], a[href="#sw-editor-2"]').on('shown.bs.tab', () => {
            focusVisibleEditor();
        });
    });

    $SWB.addOnLoaded(() => {
        jQuery(window).bind('keydown', function(event) {
            let action: () => any;

            if (event.ctrlKey || event.metaKey) {
                switch (String.fromCharCode(event.which).toLowerCase()) {
                    case 'b':
                        action = () => showBoard();
                        break;

                    case 'e':
                        action = () => showEditor();
                        break;

                    case 's':
                        action = () => saveBoard();
                        break;
                }
            }

            if (action) {
                event.preventDefault();
                action();
            }
        });
    });

    $SWB.addOnLoaded(() => {
        jQuery('.sw-save-btn').click(() => {
            saveBoard();
        });
    });

    $SWB.addOnLoaded(() => {
        updateView();
    });
}
