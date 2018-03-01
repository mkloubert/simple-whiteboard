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

<div class="row sw-whiteboard">
    <div class="col-md-9">
        <ul class="nav nav-tabs">
            <li class="active" title="CTRL + B"><a data-toggle="tab" href="#sw-board-1" class="sw-tab sw-board-tab" id="sw-board-tab-1">
                <i class="fa fa-desktop" aria-hidden="true"></i>
                <span>Board</span>
            </a></li>
            <li title="CTRL + E"><a data-toggle="tab" href="#sw-editor-1" class="sw-tab sw-editor-tab" id="sw-editor-tab-1">
                <span class="sw-dirty">*</span>
                <i class="fa fa-pencil-square-o" aria-hidden="true"></i>
                <span>Editor</span>
            </a></li>
            <li class="visible-xs visible-sm" title="CTRL + F"><a data-toggle="tab" href="#sw-files-2" class="sw-tab sw-files-tab" id="sw-files-tab-1">
                <i class="fa fa-archive" aria-hidden="true"></i>
                <span>Files</span>
            </a></li>
        </ul>

        <div class="tab-content">
            <div id="sw-board-1" class="sw-board tab-pane sw-tab-pane fade in active"></div>

            <div id="sw-files-2" class="sw-files tab-pane sw-tab-pane fade in active visible-xs visible-sm">
                <div class="row">
                    <a class="btn btn-primary btn-block sw-add-file-btn" id="sw-add-file-btn-2">
                        <i class="fa fa-plus-square-o" aria-hidden="true"></i>
                        <span>Add file</span>
                    </a>             
                </div>

                <div class="row">
                    <div class="col-xs-12 sw-file-list" id="sw-file-list-2"></div>
                </div>
            </div>

            <div id="sw-editor-1" class="sw-editor tab-pane sw-tab-pane fade in">
                <input type="text" class="form-control sw-editor-notes" id="sw-editor-notes-1" maxlength="255" placeholder="Optional comment">

                <div class="sw-editor-area"></div>
            </div>
        </div>
    </div>
    
    <div class="col-md-3 hidden-xs hidden-sm">
        <ul class="nav nav-tabs">
            <li class="active"><a data-toggle="tab" href="#sw-files-1" class="sw-files-tab">
            <i class="fa fa-archive" aria-hidden="true"></i>
            <span>Files</span>
            </a></li>
        </ul>

        <div class="tab-content">
            <div id="sw-files-1" class="sw-files tab-pane sw-tab-pane fade in active">
                <div class="row">
                    <a class="btn btn-primary btn-block sw-add-file-btn" id="sw-add-file-btn-1">
                        <i class="fa fa-plus-square-o" aria-hidden="true"></i>
                        <span>Add file</span>
                    </a>             
                </div>

                <div class="row">
                    <div class="col-xs-12 sw-file-list" id="sw-file-list-1"></div>
                </div>
            </div>
        </div>
    </div>
</div>
