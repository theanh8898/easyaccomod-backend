const {getConnection} = require('../index');

module.exports = async function () {
  const connection = await getConnection();
  try {
    const [rows] = await connection.query(`SHOW COLUMNS FROM \`attributes\` LIKE 'values'`);
    if (rows.length) {
      await connection.query(`ALTER TABLE \`attributes\` CHANGE \`values\` \`predefined_values\` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL`);
    }
  } catch (error) {
    console.error(error);
  }
};
