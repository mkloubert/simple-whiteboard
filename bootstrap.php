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

define('SW_BOOTSTRAP', 1);

define('SW_DIR_ROOT', __DIR__ . '/');
define('SW_DIR_CSS', SW_DIR_ROOT . 'css/');
define('SW_DIR_FILES', SW_DIR_ROOT . 'files/');
define('SW_DIR_JAVASCRIPT', SW_DIR_ROOT . 'js/');
define('SW_DIR_MODULES', SW_DIR_ROOT . 'modules/');
define('SW_DIR_UPLOADS', SW_DIR_ROOT . 'uploads/');

define('SW_SESSION_USERNAME', 'sw_username');

$SW_CONFIG = require(__DIR__ . '/config.inc.php');

require_once __DIR__ . '/funcs.php';

if ('' === session_id()) {
    session_set_cookie_params( 31557600 );  // one year
    session_start();
}
