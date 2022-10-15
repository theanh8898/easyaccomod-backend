const {getConnection} = require('../index');

module.exports = async function() {
  const connection = await getConnection();
  try {
    await connection.query('CREATE TABLE IF NOT EXISTS `notifications` (' +
      ' `id` INT UNSIGNED NOT NULL AUTO_INCREMENT ,' +
      ' `type` TINYINT(1) UNSIGNED NOT NULL ,' +
      ' `params` TEXT NOT NULL ,' +
      ' `created_at` DATETIME NOT NULL ,' +
      ' PRIMARY KEY (`id`) ' +
      ') ENGINE = InnoDB');
  } catch (error) {
    console.error(error);
  }
};
