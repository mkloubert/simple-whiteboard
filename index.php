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

if ('' === session_id()) {
    session_set_cookie_params( 31557600 );  // one year
    session_start();
}

$module = trim(strtolower(@$_REQUEST['m']));
if ('' === $module) {
    $module = 'whiteboard';
}

$moduleDir = @realpath(SW_DIR_MODULES);
if (!@is_dir($moduleDir)) {
    http_response_code(404);  // module directory not found
    die();
}

$moduleFile = @realpath(SW_DIR_MODULES . $module . '.php');
if (!@is_file($moduleFile)) {
    http_response_code(404);  // module file not found
    die();
}

if (0 !== strpos($moduleFile, $moduleDir . DIRECTORY_SEPARATOR)) {
    http_response_code(404);  // not inside module directory
    die();
}

$app = [
    'config' => $SW_CONFIG,
    'headers' => array(),
    'module' => $module,
    'moduleResult' => true,
    'showHeader' => true,
    'showFooter' => true,
];

$content = sw_executed_buffered(function() use (&$app, $moduleFile) {
    return require $moduleFile;    
}, $app['moduleResult']);

if (false === $app['moduleResult']) {
    http_response_code(404);  // module says: not found
    die();
}

$header = sw_executed_buffered(function() use (&$app) {
    require __DIR__ . '/header.php';
});

$footer = sw_executed_buffered(function() use (&$app) {
    require __DIR__ . '/footer.php';
});

if (!empty($app['headers'])) {
    foreach ($app['headers'] as $httpKey => $httpValue) {
        header($httpKey . ': ' . $httpValue, true);
    }
}

if ($app['showHeader']) {
    echo $header;
}

if ('' !== $content) {
    echo $content;
}

if ($app['showFooter']) {
    echo $footer;
}
