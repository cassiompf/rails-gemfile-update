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

const getLastRubyVersion = () => {
  return new Promise((resolve, reject) => {
    axios.get('https://www.ruby-lang.org/en/downloads/releases').then(({ data }) => {
      const { document } = new JSDOM(data).window;

      const scraping = document.querySelector('.release-list > tbody > tr:nth-child(2)');

      const lastRubyVersion = {
        version: scraping.querySelector('td:nth-child(1)').innerHTML.split(' ')[1],
        date: scraping.querySelector('td:nth-child(2)').innerHTML
      };

      resolve(lastRubyVersion);
    }).catch((err) => reject(err));
  })
};

const getLastGemVersion = (gem) => {
  return new Promise((resolve, reject) => {
    axios.get(`https://rubygems.org/gems/${gem}/versions`)
    .then(({ data }) => {
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
  lineReader.pause();
  if (isValidGem(line)) {
    const gem = getGemName(line);
    const { version, date, size } = await getLastGemVersion(gem);

    console.log(`  Atualizando a gem ${gem}:`);
    console.log(`   - Vers??o: ${version};`);
    console.log(`   - Data da atualiza????o: ${date};`);
    console.log(`   - Tamanho da atualiza????o: ${size};`);
    console.log('');
    writer.write(updateGemLine(line, version));
  } else if (line.startsWith('ruby \'')) {
    const { version, date } = await getLastRubyVersion();

    console.log(`  Atualizando o Ruby:`);
    console.log(`   - Vers??o mais recente: ${version};`);
    console.log(`   - Data da atualiza????o: ${date};`);
    console.log('');
    writer.write(`ruby '${version}'`);
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
  console.log('   Voc?? pode visualizar o arquivo    ');
  console.log('   que foi gerado na pasta ./dist    ');
  console.log('=====================================');
  writer.end();
});
