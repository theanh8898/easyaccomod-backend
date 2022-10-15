const {getConnection} = require('../index');

module.exports = async function() {
  const connection = await getConnection();
  try {
    const [rows] = await connection.query(`SHOW COLUMNS FROM \`invoices\` LIKE 'period'`);
    if (rows.length) {
      await connection.query(`ALTER TABLE \`invoices\` CHANGE \`period\` \`term\` TINYINT(1) UNSIGNED NOT NULL`);
    }
  } catch (error) {
    console.error(error);
  }
};
