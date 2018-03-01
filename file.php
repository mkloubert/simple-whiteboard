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

/*
error_reporting(E_ALL);
ini_set('display_errors', 1);
*/

chdir(__DIR__);

define('SW_INDEX', 1);

require_once './bootstrap.php';

if (!array_key_exists('f', $_GET)) {
    http_response_code(400);  // no ID
    die();
}

$fileId = trim($_GET['f']);
if (!is_numeric($fileId)) {
    http_response_code(400);  // invalid ID
    die();
}

$fileId = (int)$fileId;

$db = sw_db();

$stmt = $db->prepare("SELECT `name`,`real_name` FROM `files` WHERE `id`=?;");
try {
    $stmt->bind_param('i', $fileId);
    $stmt->execute();

    $result = $stmt->get_result();
    try {
        if ($row = $result->fetch_array()) {
            $filePath = @realpath(SW_DIR_FILES . $row[1]);
            if (@is_file($filePath)) {
                header('Content-Type: application/octet-stream');
                header('Content-Disposition: attachment; filename=' . $row[0]);
                header('Content-Transfer-Encoding: binary');
                header('Content-Length: ' . filesize($filePath));

                if (false === readfile($filePath)) {
                    http_response_code(500);  // could not read and/or send the file
                }
            }
            else {
                http_response_code(404);  // not found
            }
        }
    }
    finally {
        $result->close();
    }
}
finally {
    $stmt->close();
}
