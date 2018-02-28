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

/** @var array $app **/

defined('SW_INDEX') or die();

$board = 1;  //TODO

$db = sw_db();

$stmt = $db->prepare("SELECT `id`,`content`,`content_type`,`time` FROM `content` WHERE `board_id`=? ORDER BY `id` DESC,`time` DESC LIMIT 0,1");
try {
    $stmt->bind_param('i', $board);
    $stmt->execute();

    $result = $stmt->get_result();
    try {
        $currentVersion = $result->fetch_assoc();
    }
    finally {
        $result->close();
    }
}
finally {
    $stmt->close();
}

if (empty($currentVersion)) {
    sw_send_json_result(1);
}
else {
    sw_send_json_result(0, array(
        'id' => (int)$currentVersion['id'],
        'content' => $currentVersion['content'],
        'content_type' => $currentVersion['content_type'],
        'time' => DateTime::createFromFormat('Y-m-d H:i:s', $currentVersion['time']),
    ));
}
