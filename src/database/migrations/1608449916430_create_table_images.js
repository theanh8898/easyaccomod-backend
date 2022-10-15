const {getConnection} = require('../index');

module.exports = async function() {
  const connection = await getConnection();
  try {
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('CREATE TABLE IF NOT EXISTS `images` (' +
      ' `id` INT UNSIGNED NOT NULL AUTO_INCREMENT ,' +
      ' `filename` VARCHAR(255) NOT NULL ,' +
      ' `path` VARCHAR(255) NOT NULL ,' +
      ' `created_by` INT UNSIGNED NOT NULL ,' +
      ' `created_at` DATETIME NOT NULL ,' +
      ' PRIMARY KEY (`id`) , ' +
      ' CONSTRAINT `fk_images_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE ' +
      ') ENGINE = InnoDB');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
  } catch (error) {
    console.error(error);
  }
};
