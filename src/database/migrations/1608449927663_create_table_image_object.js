const {getConnection} = require('../index');

module.exports = async function() {
  const connection = await getConnection();
  try {
    await connection.query('CREATE TABLE IF NOT EXISTS `image_object` (' +
      ' `image_id` INT UNSIGNED NOT NULL ,' +
      ' `object_type` TINYINT(1) UNSIGNED NOT NULL ,' +
      ' `object_id` INT UNSIGNED NOT NULL ,' +
      ' `use_type` TINYINT(1) NOT NULL ,' +
      ' PRIMARY KEY (`image_id`, `object_type`, `object_id`) , ' +
      ' CONSTRAINT `fk_io_image_id` FOREIGN KEY (`image_id`) REFERENCES `images` (`id`) ON DELETE CASCADE ON UPDATE CASCADE ' +
      ') ENGINE = InnoDB');
  } catch (error) {
    console.error(error);
  }
};
