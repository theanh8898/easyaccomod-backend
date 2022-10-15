const {getConnection} = require('../index');

module.exports = async function() {
  const connection = await getConnection();
  try {
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('CREATE TABLE IF NOT EXISTS `invoices` (' +
      ' `id` INT UNSIGNED NOT NULL AUTO_INCREMENT ,' +
      ' `room_id` INT UNSIGNED NOT NULL ,' +
      ' `period` INT UNSIGNED NOT NULL ,' +
      ' `amount` DOUBLE UNSIGNED NOT NULL ,' +
      ' `status` TINYINT(1) UNSIGNED NOT NULL DEFAULT \'0\',' +
      ' `created_at` DATETIME NOT NULL ,' +
      ' PRIMARY KEY (`id`) , ' +
      ' CONSTRAINT `fk_invoices_room_id` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE ' +
      ') ENGINE = InnoDB');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
  } catch (error) {
    console.error(error);
  }
};
