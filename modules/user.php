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

if ('GET' === $_SERVER['REQUEST_METHOD']) {
    sw_send_json_result(0, sw_username());
}
else if ('POST' === $_SERVER['REQUEST_METHOD']) {
    $newUserName = trim( @$_POST['u'] );
    if (strlen($newUserName) > 255) {
        $newUserName = trim(substr($newUserName, 0, 255));
    }

    $_SESSION[ SW_SESSION_USERNAME ] = $newUserName;

    sw_send_json_result(0, sw_username());
}
else {
    http_response_code(405);  // method not allowed
    die();
}
