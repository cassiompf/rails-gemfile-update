const fs = require('fs');
const readline = require('readline');

const lineReader = readline.createInterface({
  input: fs.createReadStream('./src/assets/Gemfile')
});

let writer = fs.createWriteStream('./dist/Gemfile', {
  flags: 'w+'
})

lineReader.on('line', (line) => {
  if (line.includes('gem \'') && !line.trim().startsWith('#')) {
    const gem = line.split(',')[0].replace('gem', '').trim();
    console.log(`Atualizando a gem ${gem}`)
  }
  writer.write(line + '\r\n');
});

lineReader.on('close', () => {
  console.log('');
  writer.end();
});
