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

defined('SW_BOOTSTRAP') or die();

$SW_DB = false;

/**
 * Returns the current version of a board.
 * 
 * @param int $board The ID of the board.
 * 
 * @return array|false The data of the current version or (false) if not found.
 */
function sw_current_version($board) {
    $board = (int)trim($board);

    $db = sw_db();

    $stmt = $db->prepare("SELECT `id`,`content`,`content_type`,`time` FROM `content` WHERE `board_id`=? ORDER BY `id` DESC,`time` DESC LIMIT 0,1;");
    try {
        $stmt->bind_param('i', $board);
        $stmt->execute();

        $result = $stmt->get_result();
        try {
            return $result->fetch_assoc();
        }
        finally {
            $result->close();
        }
    }
    finally {
        $stmt->close();
    }
}

/**
 * Returns the current database connection.
 * 
 * @return mysqli The current database connection.
 */
function sw_db() {
    global $SW_DB, $SW_CONFIG;

    if (false === $SW_DB) {
        $dbConf = @$SW_CONFIG['database'];
        if (empty($dbConf)) {
            $dbConf = array();
        }

        $SW_DB = new mysqli(
            @$dbConf['host'],
            @$dbConf['user'], @$dbConf['password'],
            @$dbConf['db'],
            @$dbConf['port'],
            @$dbConf['socket']
        );

        if ($SW_DB->connect_errno) {
            die(sprintf("Could not connect to MySQL database: [%s] '%s'",
                        $SW_DB->connect_errno, $SW_DB->connect_error));
        }

        $SW_DB->set_charset('utf8');
    }

    return $SW_DB;
}

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

/**
 * Deactivates HTML frontend (header and footer).
 */
function sw_no_frontend() {
    global $app;

    $app['showHeader'] = false;
    $app['showFooter'] = false;
}

$swRandSeed = false;
/**
 * Generates a new random integer.
 * 
 * @param int $min (optional) The minimum value.
 * @param int $max (optional) The maximum value.
 * 
 * @return int The random value.
 */
function sw_rand_int($min = null, $max = null): int {
    global $swRandSeed;

    if (false === $swRandSeed) {
        list($usec, $sec) = explode(' ', microtime());
        $swRandSeed = $sec + $usec * 1000000;

        mt_srand($swRandSeed);
    }

    return call_user_func_array(
        "\\mt_rand", func_get_args()
    );
}

/**
 * Sends a value as JSON string to the client.
 * 
 * @param mixed $val The value to send.
 * @param boolean $noFrontend (optional) Deactivate frontend or not.
 */
function sw_send_json($val, $noFrontend = true) {
    global $app;

    if ($noFrontend) {
        sw_no_frontend();
    }

    $app['headers']['Content-type'] = 'application/json; charset=utf8';

    echo json_encode($val);
}

/**
 * Sends a result as JSON array.
 * 
 * @param int $code (optional) The code.
 * @param mixed $data (optional) The data.
 */
function sw_send_json_result($code = 0, $data = null) {
    sw_send_json(array(
        'code' => $code,
        'data' => $data,
    ), true);
}

/**
 * Returns the name of the current user.
 * 
 * @return string The username.
 */
function sw_username() {
    $username = trim(@$_SESSION[ SW_SESSION_USERNAME ]);
    if (strlen($username) > 255) {
        $username = trim(substr($username, 0, 255));
    }

    return $username;
}

