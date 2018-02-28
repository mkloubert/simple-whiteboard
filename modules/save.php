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

if ('POST' !== $_SERVER['REQUEST_METHOD']) {
    http_response_code(405);  // no POST
    die();
}

$board_id = 1;  //TODO

$content = (string)@$_POST['c'];
if (strlen($content) > 16777215) {
    $content = substr($content, 0, 16777215);
}
if ('' === $content) {
    $content = null;
}

$notes = trim(@$_POST['n']);
if (strlen($notes) > 255) {
    $notes = substr($notes, 0, 255);
}
if ('' === $notes) {
    $notes = null;
}

$db = sw_db();

$db->begin_transaction();
try {
    $user = strtolower( sw_username() );
    if ('' === $user) {
        $user = null;
    }

    $ip = trim( @$_SERVER['REMOTE_ADDR'] );
    if ('' === $ip) {
        $ip = null;
    }

    $stmt = $db->prepare("INSERT INTO `content` (`board_id`,`content`,`notes`,`user`,`ip`) VALUES (?,?,?,?,?);");

    $stmt->bind_param('issss',
                      $board_id, $content, $notes, $user, $ip);
    $stmt->execute();

    $db->commit();
}
catch (\Exception $ex) {
    $db->rollback();

    throw $ex;
}
finally {
    $stmt->close();
}

sw_send_json_result();
