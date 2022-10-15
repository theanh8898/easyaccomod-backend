const {getConnection} = require('../index');

module.exports = async function() {
  const connection = await getConnection();
  try {
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('CREATE TABLE IF NOT EXISTS `interactions` (' +
      ' `id` INT UNSIGNED NOT NULL AUTO_INCREMENT ,' +
      ' `type` TINYINT UNSIGNED NOT NULL ,' +
      ' `user_id` INT UNSIGNED NOT NULL ,' +
      ' `room_id` INT UNSIGNED NOT NULL ,' +
      ' `created_at` DATETIME NOT NULL ,' +
      ' PRIMARY KEY (`id`) , ' +
      ' CONSTRAINT `fk_interactions_room_id` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE , ' +
      ' CONSTRAINT `fk_interactions_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE ' +
      ') ENGINE = InnoDB');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
  } catch (error) {
    console.error(error);
  }
};
