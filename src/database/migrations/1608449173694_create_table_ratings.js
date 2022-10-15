const {getConnection} = require('../index');

module.exports = async function() {
  const connection = await getConnection();
  try {
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('CREATE TABLE IF NOT EXISTS `ratings` (' +
      ' `id` INT UNSIGNED NOT NULL AUTO_INCREMENT ,' +
      ' `user_id` INT UNSIGNED NOT NULL ,' +
      ' `room_id` INT UNSIGNED NOT NULL ,' +
      ' `rate` INT UNSIGNED NOT NULL ,' +
      ' `comment` VARCHAR(255) NOT NULL ,' +
      ' `status` TINYINT(1) UNSIGNED NOT NULL DEFAULT \'0\',' +
      ' `created_at` DATETIME NOT NULL ,' +
      ' PRIMARY KEY (`id`) , ' +
      ' CONSTRAINT `fk_ratings_room_id` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE , ' +
      ' CONSTRAINT `fk_ratings_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE ' +
      ') ENGINE = InnoDB');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
  } catch (error) {
    console.error(error);
  }
};
