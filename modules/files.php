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

$board_id = sw_board();

$code = 0;
$data = null;

$filesToRemove = array();
try {
    if ('GET' === $_SERVER['REQUEST_METHOD']) {
        $data = array();

        $db = sw_db();

        $stmt = $db->prepare("SELECT `id`,`name`,`time`,`real_name` FROM `files` WHERE `board_id`=? AND `is_deleted`='0' ORDER BY `id` DESC,`time` DESC");
        try {
            $stmt->bind_param('i', $board_id);
            $stmt->execute();

            $result = $stmt->get_result();
            try {
                while ($row = $result->fetch_array()) {
                    $realFile = @realpath(SW_DIR_FILES . $row[3]);
                    if (!@is_file($realFile)) {
                        continue;
                    }

                    $data[] = array(
                        'id' => (int)$row[0],
                        'name' => $row[1],
                        'size' => @filesize($realFile),
                        'time' => $row[2],
                    );
                }
            }
            finally {
                $result->close();
            }
        }
        finally {
            $stmt->close();
        }
    }
    else if ('POST' === $_SERVER['REQUEST_METHOD']) {
        $uploadedFile = @$_FILES['swFileToUpload'];

        if (empty($uploadedFile)) {
            http_response_code(400);  // no file submitted
            die();
        }
        else {
            $filesDir = @realpath(SW_DIR_FILES);
            if (!@is_dir($filesDir)) {
                $code = 1;
            }
            else {
                $ts = time();
                $suff = dechex(sw_rand_int());

                $ip = @ip2long(@$_SERVER['REMOTE_ADDR']);
                if (empty($ip)) {
                    $ip = '';
                }
                else {
                    $ip = dechex($ip) . '_';
                }

                $destFile = $filesDir . '/' . $ip . $ts . '_' . $suff . '.dat';
                if (@is_file($destFile)) {
                    $code = 2;  // does already exist
                }
                else {
                    if (false === @move_uploaded_file($uploadedFile['tmp_name'], $destFile)) {
                        $code = 3;  // could not move file
                    }
                    else {
                        $removeDestFile = true;

                        $db = sw_db();

                        $db->begin_transaction();
                        try {
                            $stmt = $db->prepare("INSERT INTO `files` (`board_id`,`name`,`real_name`) VALUES (?,?,?);");
                            try {
                                $name = trim($uploadedFile['name']);
                                $real_name = basename($destFile);

                                $stmt->bind_param('iss', $board_id, $name, $real_name);
                                if ($stmt->execute()) {
                                    $removeDestFile = false;
                                }
                            }
                            finally {
                                $stmt->close();
                            }

                            $db->commit();
                        }
                        catch (\Exception $ex) {
                            $db->rollback();

                            throw $ex;                            
                        }
                        finally {
                            if ($removeDestFile) {
                                $filesToRemove[] = $destFile;
                            }
                        }
                    }    
                }
            }
        }
    }
    else if ('DELETE' === $_SERVER['REQUEST_METHOD']) {
        $fileId = trim(@$_GET['f']);
        if (!is_numeric($fileId)) {
            http_response_code(400);  // no (valid) file ID
            die();
        }

        $fileId = (int)$fileId;

        $db = sw_db();

        $stmt = $db->prepare("UPDATE `files` SET `is_deleted`='1' WHERE `id`=?");
        try {
            $stmt->bind_param('i', $fileId);
            if (!$stmt->execute()) {
                $code = 1;
            }
        }
        finally {
            $stmt->close();
        }
    }
    else {
        http_response_code(405);  // method not allowed
        die();
    }
}
finally {
    foreach ($filesToRemove as $ftr) {
        if (@is_file($ftr)) {
            @unlink($ftr);
        }
    }
}

sw_send_json_result($code, $data);
