const fs = require('fs');
const readline = require('readline');
const os = require('os')

const lineReader = readline.createInterface({
  input: fs.createReadStream('./src/assets/Gemfile')
});

const writer = fs.createWriteStream('./dist/Gemfile', {
  flags: 'w+'
})

lineReader.on('line', (line) => {
  if (line.trim().startsWith('gem')) {
    const gem = line.trim().split(',')[0].replace('gem', '');
    console.log(`Atualizando a gem ${gem}`);
  }
  writer.write(line);

  // Break new line
  writer.write(os.EOL);
});

lineReader.on('close', () => {
  console.log('=====================================');
  console.log(' -> O seu Gemfile foi atualizado! <- ');
  console.log('   Você pode visualizar o arquivo    ');
  console.log('   que foi gerado na pasta ./dist    ');
  console.log('=====================================');
  writer.end();
});
