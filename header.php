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

?><!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

    <link rel="stylesheet" href="./css/font-awesome.min.css">
    <link rel="stylesheet" href="./css/bootstrap.min.css">
    <link rel="stylesheet" href="./css/style.css">

    <!--[if lt IE 9]>
      <script src="./js/html5shiv.min.js"></script>
      <script src="./js/respond.min.js"></script>
    <![endif]-->

    <script src="./js/lodash.min.js"></script>
    <script src="./js/jquery.min.js"></script>
    <script src="./js/bootstrap.min.js"></script>
    <script src="./js/showdown.min.js"></script>
    <script src="./js/script.js"></script>

    <title>Simple Whiteboard</title>
  </head>

  <body>
    <nav class="navbar navbar-inverse navbar-fixed-top" id="sw-header">
      <div class="container-fluid">
        <div class="navbar-header">
          <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#sw-navbar-top-collapse" aria-expanded="false">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
          <a class="navbar-brand" href="https://github.com/mkloubert/simple-whiteboard" target="_blank">Simple Whiteboard</a>
        </div>

        <div class="collapse navbar-collapse" id="sw-navbar-top-collapse">
          <ul class="nav navbar-nav"></ul>
        </div>
      </div>
    </nav>

    <div class="container-fluid" id="sw-content">
      <div class="row">
        <div class="col col-sm-12">
