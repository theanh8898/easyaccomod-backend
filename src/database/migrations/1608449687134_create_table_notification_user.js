const {getConnection} = require('../index');

module.exports = async function() {
  const connection = await getConnection();
  try {
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('CREATE TABLE IF NOT EXISTS `notification_user` (' +
      ' `id` INT UNSIGNED NOT NULL AUTO_INCREMENT ,' +
      ' `user_id` INT UNSIGNED NOT NULL ,' +
      ' `notification_id` INT UNSIGNED NOT NULL ,' +
      ' `status` TINYINT(1) UNSIGNED NOT NULL DEFAULT \'0\',' +
      ' PRIMARY KEY (`id`) , ' +
      ' CONSTRAINT `fk_nu_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE , ' +
      ' CONSTRAINT `fk_nu_notification_id` FOREIGN KEY (`notification_id`) REFERENCES `notifications` (`id`) ON DELETE CASCADE ON UPDATE CASCADE ' +
      ') ENGINE = InnoDB');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
  } catch (error) {
    console.error(error);
  }
};
