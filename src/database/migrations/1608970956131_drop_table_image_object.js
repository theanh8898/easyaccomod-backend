const {getConnection} = require('../index');

module.exports = async function() {
  const connection = await getConnection();
  try {
    await connection.query(`DROP TABLE IF EXISTS \`image_object\``);
  } catch (error) {
    console.error(error);
  }
};
