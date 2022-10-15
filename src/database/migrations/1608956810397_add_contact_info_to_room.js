const {getConnection} = require('../index');

module.exports = async function() {
  const connection = await getConnection();
  try {
    const [rows] = await connection.query(`SHOW COLUMNS FROM \`rooms\` LIKE 'owner_full_name'`);
    if (!rows.length) {
      await connection.query(`ALTER TABLE \`rooms\` ADD \`owner_full_name\` VARCHAR(255) NULL AFTER \`type\`, ADD \`owner_phone\` VARCHAR(20) NULL AFTER \`owner_full_name\``);
    }
  } catch (error) {
    console.error(error);
  }
};
