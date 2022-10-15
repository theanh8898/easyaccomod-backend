const {getConnection} = require('../index');

module.exports = async function() {
  const connection = await getConnection();
  try {
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('CREATE TABLE IF NOT EXISTS `districts` ( ' +
      '`id` INT UNSIGNED NOT NULL AUTO_INCREMENT ,' +
      ' `name` VARCHAR(100) NOT NULL ,' +
      ' `prefix` VARCHAR(20) NOT NULL ,' +
      ' `province_id` INT UNSIGNED NOT NULL ,' +
      ' PRIMARY KEY (`id`) , ' +
      ' CONSTRAINT `fk_district_province_id` FOREIGN KEY (`province_id`) REFERENCES `provinces` (`id`) ' +
      ') ENGINE = InnoDB');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
  } catch (error) {
    console.error(error);
  }
};
