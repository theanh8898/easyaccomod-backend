const {getConnection} = require('../index');

module.exports = async function() {
  const connection = await getConnection();
  try {
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('CREATE TABLE IF NOT EXISTS `rooms` (' +
      ' `id` INT UNSIGNED NOT NULL AUTO_INCREMENT ,' +
      ' `title` VARCHAR(255) NOT NULL ,' +
      ' `province_id` INT UNSIGNED NOT NULL ,' +
      ' `district_id` INT UNSIGNED NOT NULL ,' +
      ' `ward_id` INT UNSIGNED NOT NULL ,' +
      ' `address` VARCHAR(255) ,' +
      ' `description` LONGTEXT ,' +
      ' `type` TINYINT(1) NOT NULL DEFAULT \'1\' ,' +
      ' `total_views` INT NOT NULL DEFAULT \'0\',' +
      ' `total_favorites` INT NOT NULL DEFAULT \'0\',' +
      ' `total_ratings` INT NOT NULL DEFAULT \'0\',' +
      ' `status` TINYINT(1) NOT NULL DEFAULT \'0\' ,' +
      ' `approved_status` TINYINT(1) NOT NULL DEFAULT \'0\' ,' +
      ' `created_by` INT UNSIGNED NOT NULL ,' +
      ' `expires_at` DATETIME ,' +
      ' `created_at` DATETIME ,' +
      ' `updated_at` DATETIME ,' +
      ' PRIMARY KEY (`id`) , ' +
      ' CONSTRAINT `fk_room_province_id` FOREIGN KEY (`province_id`) REFERENCES `provinces` (`id`), ' +
      ' CONSTRAINT `fk_room_district_id` FOREIGN KEY (`district_id`) REFERENCES `districts` (`id`), ' +
      ' CONSTRAINT `fk_room_ward_id` FOREIGN KEY (`ward_id`) REFERENCES `wards` (`id`), ' +
      ' CONSTRAINT `fk_room_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE ' +
      ') ENGINE = InnoDB');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
  } catch (error) {
    console.error(error);
  }
};
