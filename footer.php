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

?>

        <nav class="navbar navbar-default navbar-fixed-bottom" id="sw-footer">
            <div class="container">
                Copyright &copy; <?= date('Y') ?> <a href="https://github.com/mkloubert" target="_blank">Marcel Joachim Kloubert</a>
            </div>
        </nav>

        <?php

// module's CSS file
$cssFile = @realpath(SW_DIR_CSS . 'modules/' . $app['module'] . '.css');
if (@is_file($cssFile)) {
    ?>

<link rel="stylesheet" href="./css/modules/<?= htmlspecialchars($app['module']) ?>.css">

    <?php
}

// module's JavaScript file
$jsFile = @realpath(SW_DIR_JAVASCRIPT . 'modules/' . $app['module'] . '.js');
if (@is_file($jsFile)) {
    ?>

<script src="./js/modules/<?= htmlspecialchars($app['module']) ?>.js"></script>

    <?php
}

        ?>

        <script type="text/javascript">
            jQuery(function() {
                SimpleWhiteboard.App.current = $SWB;

                $SWB.run();
            });            
        </script>
    </body>
</html>