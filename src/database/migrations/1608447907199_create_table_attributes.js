const {getConnection} = require('../index');

module.exports = async function() {
  const connection = await getConnection();
  try {
    await connection.query('CREATE TABLE IF NOT EXISTS `attributes` (' +
      ' `id` INT UNSIGNED NOT NULL AUTO_INCREMENT ,' +
      ' `name` VARCHAR(255) NOT NULL ,' +
      ' `value_type` TINYINT(1) NOT NULL DEFAULT \'1\' ,' +
      ' `values` TEXT , ' +
      ' PRIMARY KEY (`id`) ' +
      ') ENGINE = InnoDB');
  } catch (error) {
    console.error(error);
  }
};
