<?php

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

defined('SW_INDEX') or die();

?>

<link rel="stylesheet" href="./css/codemirror/codemirror.css">

<script src="./js/codemirror/codemirror.js"></script>
<script src="./js/codemirror/addon/display/autorefresh.js"></script>
<script src="./js/codemirror/mode/markdown/markdown.js"></script>

<div class="row sw-whiteboard">
    <div class="col-md-9">
        <ul class="nav nav-tabs">
            <li class="active"><a data-toggle="tab" href="#sw-board-1">Board (CTRL + B)</a></li>
            <li><a data-toggle="tab" href="#sw-editor-1">Editor (CTRL + E)</a></li>
        </ul>

        <div class="tab-content">
            <div id="sw-board-1" class="sw-board tab-pane sw-tab-pane fade in active"></div>

            <div id="sw-editor-1" class="sw-editor tab-pane sw-tab-pane fade in">
                <div class="sw-editor-area"></div>

                <a class="btn btn-large btn-primary sw-save-btn" id="sw-save-btn-1">Save</a>
            </div>
        </div>
    </div>
    
    <div class="col-md-3">
        <ul class="nav nav-tabs">
            <li class="active"><a data-toggle="tab" href="#sw-files-1" class="sw-files-tab">Files</a></li>
        </ul>

        <div class="tab-content">
            <div id="sw-files-1" class="sw-files tab-pane sw-tab-pane fade in active">
                <div class="row">
                    <div class="col-xs-12 sw-file-list" id="sw-file-list-1"></div>
                </div>
            </div>
        </div>
    </div>
</div>
