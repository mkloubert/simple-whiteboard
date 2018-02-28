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

$code = 0;
$data = null;

$uploadedContent = @base64_decode(\trim(@$_POST['c']));
if (false === $uploadedContent) {
    $code = 1;  // invalid content
}
else {
    $fileDesc = false;

    $type = trim(strtolower(@$_POST['t']));
    switch ($type) {
        case 'image/png':
        case 'image/jpeg':
        case 'image/jpg':
        case 'image/gif':
            $fileDesc = array(
                'ext' => explode('/', $type)[1],
                'pre' => 'img',
            );
            break;
    }

    if (is_array($fileDesc)) {
        $uploadDir = @realpath(SW_DIR_UPLOADS);
        if (!@is_dir($uploadDir)) {
            $code = 3;  // upload dir not found
        }
        else {
            $ts = time();
            $suff = dechex(sw_rand_int());

            $ip = @ip2long(@$_SERVER['REMOTE_ADDR']);
            if (empty($ip)) {
                $ip = '';
            }
            else {
                $ip = '_' . dechex($ip);
            }
            
            $file = $uploadDir . '/' . $fileDesc['pre'] . $ip . '_' . time() . '_' . $suff . '.' . $fileDesc['ext'];

            if (@is_file($file)) {
                $code = 4;  // file alread exists
            }
            else {
                if (false !== @file_put_contents($file, $uploadedContent)) {
                    $data = array(
                        'name' => basename($file),
                        'path' => './uploads/' . urlencode(basename($file)),
                    );
                }
                else {
                    $code = 5;  // could not save file
                }
            }
        }
    }
    else {
        $code = 2;  // invalid/unsupported type
        $data = $type;
    }
}

sw_send_json_result($code, $data);
