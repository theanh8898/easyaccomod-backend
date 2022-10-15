const {getConnection} = require('../index');

module.exports = async function() {
  const connection = await getConnection();
  try {
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('CREATE TABLE IF NOT EXISTS `reports` (' +
      ' `id` INT UNSIGNED NOT NULL AUTO_INCREMENT ,' +
      ' `room_id` INT UNSIGNED NOT NULL ,' +
      ' `comment` VARCHAR(255) NOT NULL ,' +
      ' `status` TINYINT(1) UNSIGNED NOT NULL ,' +
      ' `created_by` INT UNSIGNED NOT NULL ,' +
      ' `created_at` DATETIME NOT NULL ,' +
      ' PRIMARY KEY (`id`) , ' +
      ' CONSTRAINT `fk_reports_room_id` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE , ' +
      ' CONSTRAINT `fk_reports_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE ' +
      ') ENGINE = InnoDB');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
  } catch (error) {
    console.error(error);
  }
};
