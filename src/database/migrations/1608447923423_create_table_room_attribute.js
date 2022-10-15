const {getConnection} = require('../index');

module.exports = async function() {
  const connection = await getConnection();
  try {
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('CREATE TABLE IF NOT EXISTS `room_attribute` (' +
      ' `id` INT UNSIGNED NOT NULL AUTO_INCREMENT ,' +
      ' `room_id` INT UNSIGNED NOT NULL ,' +
      ' `attribute_id` INT UNSIGNED NOT NULL ,' +
      ' `text_value` TEXT ,' +
      ' `int_value` INT ,' +
      ' PRIMARY KEY (`id`) , ' +
      ' CONSTRAINT `fk_ra_room_id` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, ' +
      ' CONSTRAINT `fk_ra_attribute_id` FOREIGN KEY (`attribute_id`) REFERENCES `attributes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE ' +
      ') ENGINE = InnoDB');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
  } catch (error) {
    console.error(error);
  }
};
