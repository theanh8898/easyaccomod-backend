const {getConnection} = require('../index');

module.exports = async function() {
  const connection = await getConnection();
  try {
    const [rows] = await connection.query(`SHOW COLUMNS FROM \`images\` LIKE 'object_type'`);
    if (!rows.length) {
      await connection.query(`ALTER TABLE \`images\` ADD \`object_type\` TINYINT(2) UNSIGNED NOT NULL AFTER \`id\`, ADD \`object_id\` INT(10) UNSIGNED NOT NULL AFTER \`object_type\`, ADD \`used_type\` VARCHAR(20) NOT NULL AFTER \`object_id\``);
    }
  } catch (error) {
    console.error(error);
  }
};
