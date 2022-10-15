require('./config');
const fs = require('fs');
const path = require('path');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'src', 'database', 'migrations');

(async function migrate() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.log('Migration dir not exists');
    process.exit(1);
  }

  const files = fs.readdirSync(MIGRATIONS_DIR);

  if (files.length) {
    for (let filename of files) {
      const ex = require(path.join(MIGRATIONS_DIR, filename));
      if (typeof ex === 'function') {
        await ex();
      }
    }
  }

  process.exit(0);
})().catch(function (error) {
  console.error(error);
  process.exit(1);
});
