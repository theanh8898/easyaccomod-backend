const {getConnection} = require('../index');

module.exports = async function() {
  const connection = await getConnection();
  try {
    const [rows] = await connection.query(`SHOW COLUMNS FROM \`rooms\` LIKE 'price'`);
    if (!rows.length) {
      await connection.query(`ALTER TABLE \`rooms\` ADD \`area\` INT UNSIGNED NULL AFTER \`description\`, ADD \`price\` DOUBLE NULL AFTER \`area\`, ADD \`payment_period\` TINYINT(1) NULL AFTER \`price\``);
    }
  } catch (error) {
    console.error(error);
  }
};
