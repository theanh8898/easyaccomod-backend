const {getConnection} = require('../index');

module.exports = async function() {
  const connection = await getConnection();
  try {
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('CREATE TABLE IF NOT EXISTS `users` (' +
      ' `id` INT UNSIGNED NOT NULL AUTO_INCREMENT ,' +
      ' `role` TINYINT(2) UNSIGNED NOT NULL DEFAULT \'1\' ,' +
      ' `username` VARCHAR(20) NOT NULL ,' +
      ' `password` VARCHAR(255) NOT NULL ,' +
      ' `full_name` VARCHAR(255) ,' +
      ' `id_number` VARCHAR(20) ,' +
      ' `phone` VARCHAR(20) ,' +
      ' `email` VARCHAR(255) NOT NULL ,' +
      ' `province_id` INT UNSIGNED NOT NULL ,' +
      ' `district_id` INT UNSIGNED NOT NULL ,' +
      ' `ward_id` INT UNSIGNED NOT NULL ,' +
      ' `address` VARCHAR(255) ,' +
      ' `status` TINYINT(1) NOT NULL DEFAULT \'1\' ,' +
      ' `created_at` DATETIME ,' +
      ' `updated_at` DATETIME ,' +
      ' PRIMARY KEY (`id`) , ' +
      ' CONSTRAINT `fk_user_province_id` FOREIGN KEY (`province_id`) REFERENCES `provinces` (`id`), ' +
      ' CONSTRAINT `fk_user_district_id` FOREIGN KEY (`district_id`) REFERENCES `districts` (`id`), ' +
      ' CONSTRAINT `fk_user_ward_id` FOREIGN KEY (`ward_id`) REFERENCES `wards` (`id`) ' +
      ') ENGINE = InnoDB');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
  } catch (error) {
    console.error(error);
  }
};
