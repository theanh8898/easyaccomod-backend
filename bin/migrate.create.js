require('./config');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'src', 'database', 'migrations');

if (!fs.existsSync(MIGRATIONS_DIR)) {
  fs.mkdirSync(MIGRATIONS_DIR);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.question('Enter file name:\n', function (answer) {
  const now = new Date().getTime();
  const name = answer.toLowerCase()
  .replace(/ /g, '_')
  .replace(/[^\w_]+/g, '');
  const filename = now + '_' + name + '.js';
  const filepath = path.join(MIGRATIONS_DIR, filename);
  fs.writeFileSync(filepath, `const {getConnection} = require('..');\n\nmodule.exports = async function() {\n  const connection = await getConnection();\n  // TODO\n};\n`, 'utf8');
  console.log(`File created: ${filename}`);
  process.exit(0);
});
