# simple-whiteboard

Simple whiteboard (web) application written in [PHP](https://php.net).

![Demo 1](https://raw.githubusercontent.com/mkloubert/simple-whiteboard/master/_res/demo1.gif)

## Preview

This is still a working preview version in a good beta state.

## Download

Download a release from [here](https://github.com/mkloubert/simple-whiteboard/releases) and unzip it to your webspace folder.

## Install

### Database

Run the [mysql5.dump.sql](https://github.com/mkloubert/simple-whiteboard/blob/master/_res/mysql5.dump.sql) inside the [MySQL](https://www.mysql.com/) database, where the data should be stored.

### Config

Edit the [config.inc.php](https://github.com/mkloubert/simple-whiteboard/blob/master/config.inc.php) and apply your database settings there.

```php
<?php

defined('SW_BOOTSTRAP') or die();

return array(
    'database' => array(
        'host' => 'localhost',

        'user' => 'simple_whiteboard_user',
        'password' => 'simple_whiteboard_pwd',

        'db' => 'simple_whiteboard_db',
    ),
);

```

The following settings are supported:

| Name | Description |
| ---- | --------- |
| `database.db` | The database name. |
| `database.host` | The address of the MySQL host. |
| `database.password` | The database password. |
| `database.port` | The custom TCP port. |
| `database.socket` | The custom UNIX socket. |
| `database.user` | The database user. |

### Folder permissions

Make the following folders writable for the application:

* `/files`
* `/uploads`

### .htaccess

If you use [Apache](https://httpd.apache.org/), you should create a `.htaccess` file like that:

```apache
AuthType Basic
AuthName "My Whiteboard"
AuthBasicProvider file
AuthUserFile "/etc/apache2/.htpasswd"

<RequireAny>
  Require ip 192.168.0.0/255.255.255.0
  Require valid-user
</RequireAny>
```

### Board name

The [MySQL dump](https://github.com/mkloubert/simple-whiteboard/blob/master/_res/mysql5.dump.sql) inserts an initial entry in the `boards` table.

There you can define a custom name in the `name` column.

### Additional boards

You can add additional boards to `boards` table.

To access one of these additional boards, simply use the value from `id` column and access them by using `b` query parameter in URL: `https://example.com/whiteboard/?b=<ID-OF-THE-BOARD>`.

### Shortcuts

| Shortcut | Description |
| ---- | --------- |
| `CTRL + B` | Select `Board` tab. |
| `CTRL + E` | Select `Editor` tab. |
| `CTRL + S` | Save the current content of editor and show it in board tab. |

### Customizations

#### CSS

The [bootstrap.min.css](https://github.com/mkloubert/simple-whiteboard/blob/master/css/bootstrap.min.css) is taken from [Bootswatch](https://bootswatch.com/3/).
You can replace it with any other the user templates and another compatible one, like the default one from [Bootstrap 3](https://getbootstrap.com/docs/3.3/).

If you need additional customizations, you can edit [custom.css](https://github.com/mkloubert/simple-whiteboard/blob/master/css/custom.css) file. 

## Support and contribute

If you like the application, you can support the project by sending a [donation via PayPal](https://paypal.me/MarcelKloubert) to [me](https://github.com/mkloubert).

To contribute, you can [open an issue](https://github.com/mkloubert/simple-whiteboard/issues) and/or fork this repository.

To work with the code:

* clone [this repository](https://github.com/mkloubert/simple-whiteboard)
* create and change to a new branch, like `git checkout -b my_new_feature`
* commit your changes to your new branch and sync it with your forked GitHub repo
* make a [pull request](https://github.com/mkloubert/simple-whiteboard/pulls)
