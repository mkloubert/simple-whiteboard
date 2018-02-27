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

define('SW_DIR_ROOT', __DIR__ . '/');
define('SW_DIR_MODULES', SW_DIR_ROOT . 'modules/');

/**
 * Executes an action buffered.
 * 
 * @param callable $action The action to invoke.
 * @param mixed &$result|false (optional) The variable where the result of the action is written to.
 *                                        If (false) a 404 error will be send to the client.
 * 
 * @return string The buffered output of the action.
 */
function sw_executed_buffered(callable $action, &$result = null) {
    ob_start();
    try {
        $result = call_user_func($action);
    }
    finally {
        $content = ob_get_contents();
        ob_end_clean();
    }

    return $content;
}
