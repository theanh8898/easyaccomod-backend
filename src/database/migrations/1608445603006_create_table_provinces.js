const {getConnection} = require('../index');

module.exports = async function() {
  const connection = await getConnection();
  try {
    await connection.query('CREATE TABLE IF NOT EXISTS `provinces` (' +
      ' `id` INT UNSIGNED NOT NULL AUTO_INCREMENT ,' +
      ' `name` VARCHAR(100) NOT NULL ,' +
      ' `code` INT(20) NOT NULL ,' +
      ' PRIMARY KEY (`id`)' +
      ') ENGINE = InnoDB');
  } catch (error) {
    console.error(error);
  }
};
