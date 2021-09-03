const fs = require('fs');
const os = require('os');
const axios = require('axios');
const LineByLineReader = require('line-by-line');
const { JSDOM } = require("jsdom");

const lineReader = new LineByLineReader('./src/assets/Gemfile');

const writer = fs.createWriteStream('./dist/Gemfile', {
  flags: 'w+'
});

const isValidGem = (line) => line.trim().startsWith('gem');

const getGemName = (line) => line.trim().split(',')[0].replace('gem', '').replace(/\'/g, '').trim();

const getLastVersionGem = async (gem) => {
  return new Promise((resolve, reject) => {
    axios.get(`https://rubygems.org/gems/${gem}/versions`)
    .then((response) => {
        const { data } = response;
        const { document } = new JSDOM(data).window;

        const scraping = document.querySelector('.versions .t-list__items .gem__version-wrap:first-child');
        
        const lastGemVersion = {
          name: gem,
          version: scraping.querySelector('.t-list__item').innerHTML,
          date: scraping.querySelector('.gem__version__date').innerHTML.replace('- ', ''),
          size: scraping.querySelector('.gem__version__date:last-child').innerHTML,
        }

        resolve(lastGemVersion);
      }
    ).catch((err) => reject(err));
  });
};

const updateGemLine = (line, lastGemVersion) => {
  const sizeArray = line.split(',').length;
  const array = line.split(',');
  
  let newLine = `${array[0]}, '${lastGemVersion}'`;

  if (sizeArray > 2) {
    for (let i = 2; i < sizeArray; i++) {
      newLine = newLine.concat(`,${array[i]}`);
    }
  }

  return newLine;
};

lineReader.on('line', async (line) => {
  if (isValidGem(line)) {
    lineReader.pause();

    const gem = getGemName(line);
    const scraping = await getLastVersionGem(gem);

    console.log(`  Atualizando a gem ${gem}:`);
    console.log(`   - Versão: ${scraping.version};`);
    console.log(`   - Data da atualização: ${scraping.date};`);
    console.log(`   - Tamanho da atualização: ${scraping.size};`);
    console.log('');
    writer.write(updateGemLine(line, scraping.version));
  } else {
    writer.write(line);
  }

  // Break new line
  writer.write(os.EOL);

  lineReader.resume();
});

lineReader.on('close', () => {
  console.log('=====================================');
  console.log(' -> O seu Gemfile foi atualizado! <- ');
  console.log('   Você pode visualizar o arquivo    ');
  console.log('   que foi gerado na pasta ./dist    ');
  console.log('=====================================');
  writer.end();
});
