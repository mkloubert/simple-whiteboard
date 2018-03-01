SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

CREATE TABLE `boards` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `boards` (`id`, `name`, `description`) VALUES
(1, 'My board', NULL);

CREATE TABLE `content` (
  `id` bigint(20) NOT NULL,
  `board_id` int(11) NOT NULL,
  `content_type` varchar(255) DEFAULT NULL,
  `content` mediumtext,
  `notes` varchar(255) DEFAULT NULL,
  `user` varchar(255) DEFAULT NULL,
  `ip` varchar(45) DEFAULT NULL,
  `time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `files` (
  `id` bigint(20) NOT NULL,
  `board_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `real_name` varchar(255) NOT NULL,
  `time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_deleted` enum('0','1') NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


ALTER TABLE `boards`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

ALTER TABLE `content`
  ADD PRIMARY KEY (`id`),
  ADD KEY `board_id` (`board_id`),
  ADD KEY `user` (`user`),
  ADD KEY `ip` (`ip`);

ALTER TABLE `files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `board_id` (`board_id`),
  ADD KEY `is_deleted` (`is_deleted`);


ALTER TABLE `boards`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

ALTER TABLE `content`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

ALTER TABLE `files`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;


ALTER TABLE `content`
  ADD CONSTRAINT `content_ibfk_1` FOREIGN KEY (`board_id`) REFERENCES `boards` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `files`
  ADD CONSTRAINT `files_ibfk_1` FOREIGN KEY (`board_id`) REFERENCES `boards` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;
