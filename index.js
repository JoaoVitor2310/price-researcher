const express = require('express');
const axios = require('axios');
require('dotenv').config();
const path = require("path");
const multer = require('multer');
const fs = require('fs');
const puppeteer = require('puppeteer');

// import path from "path";

const app = express();

const pasta = path.join(process.cwd());
app.use(express.static(pasta));
app.use(express.json());

app.get('/', (req, res) => {
      res.send('Desenvolvido por João Vitor Gouveia e Lucas Corrado.');
})

const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('fileToUpload'), (req, res) => {
      if (!req.file) {
            return res.status(400).send('Nenhum arquivo enviado.');
      }



      let gamesToSearch = [], precoGamivo, lineToWrite;
      const filePath = req.file.path;
      const fileContent = fs.readFileSync(filePath, 'utf8');

      const lines = fileContent.split('\n');

      // Iterar sobre as linhas e armazenar o conteúdo no array gamesToSearch
      for (const line of lines) {
            // Remover espaços em branco no início e no final de cada linha
            const trimmedLine = line.trim();

            // Verificar se a linha não está vazia
            if (trimmedLine !== '') {
                  gamesToSearch.push(trimmedLine);
            }
      }


      (async () => {
            const browser = await puppeteer.launch({
                  userDataDir: null, // Define o diretório de dados do usuário como null para abrir uma janela anônima
                  headless: false // Define se o navegador será exibido (false) ou não (true)
            });
            const page = await browser.newPage();

            await page.setViewport({
                  width: 1920,
                  height: 1080
            });

            let searchString = gamesToSearch[0].replace(/ /g, "%20"); // Substitui os espaços em branco por "%20", que é como fica na URL
            console.log("searchString: " + searchString);
            await page.goto(`https://www.gamivo.com/pt/search/${searchString}`);

            await page.waitForSelector('.search-results__tiles');

            // Obtém todos os resultados da pesquisa do nome do jogo
            const resultados = await page.$$('.product-tile__name');

            // Itera sobre cada resultado
            for (const resultado of resultados) {
                  // Obtém o texto do elemento "span" com a classe "ng-star-inserted" dentro do resultado
                  const nomeDoJogo = await resultado.$eval('span.ng-star-inserted', element => element.textContent);

                  // Verifica se o texto do jogo contém a palavra "Steam"
                  if (nomeDoJogo.includes(gamesToSearch[0])) {

                        const regex = new RegExp(`${gamesToSearch[0]}\\s[a-zA-Z0-9/.]+\\sGlobal`, 'i');
                        if (regex.test(nomeDoJogo)) {
                              // Clica no resultado
                              await resultado.click();
                              break; // Encerra o loop depois de clicar em um resultado
                        }

                  }
            }

            try {
                  await page.waitForSelector('span.price__value');

                  const prices = await page.$$eval('span.price__value', spans => spans.map(span => span.textContent.trim()));

                  precoGamivo = prices[0];
                  console.log(precoGamivo);
            } catch (error) {
                  console.error('Erro ao encontrar os spans com a classe price__value: ', error);
            }

            lineToWrite = `${precoGamivo}\tKINGUIN`;
            fs.writeFileSync(filePath, lineToWrite);

            // await browser.close();

            console.log(lineToWrite);

            res.download(filePath, 'arquivo_modificado.txt', (err) => {
                  if (err) {
                        console.error('Erro ao fazer o download do arquivo:', err);
                  } else {
                        // Exclui o arquivo após o download
                        fs.unlinkSync(filePath);
                  }
            });
      })();


      // res.json('A'); // DEBUG
      // return;

})

const port = process.env.PORT || 5000;

app.listen(port, () => {
      console.log(`Listening to port ${port}.`);
})