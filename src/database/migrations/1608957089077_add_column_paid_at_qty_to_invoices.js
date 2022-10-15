const {getConnection} = require('../index');

module.exports = async function() {
  const connection = await getConnection();
  try {
    const [rows] = await connection.query(`SHOW COLUMNS FROM \`invoices\` LIKE 'paid_at'`);
    if (!rows.length) {
      await connection.query(`ALTER TABLE \`invoices\` ADD \`paid_at\` DATETIME NULL AFTER \`created_at\`, ADD \`qty\` INT(10) NULL AFTER \`term\``);
    }
  } catch (error) {
    console.error(error);
  }
};
