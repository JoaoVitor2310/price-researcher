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



      let gamesToSearch = [];
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


            // for(let game of gamesToSearch){
            //       let searchString = game.replace(/ /g, "%20");
            //       await page.goto(`https://www.gamivo.com/pt/search/${searchString}`);
            // }

            let searchString = gamesToSearch.replace(/ /g, "%20"); // Substitui os espaços em branco por "%20", que é como fica na URL
            await page.goto(`https://www.gamivo.com/pt/search/${searchString}`);

            // await page.waitForSelector('#searchInputDesktop');
            // await page.click('#searchInputDesktop');

            // await page.type('#searchInputDesktop', gamesToSearch[0]);

            // await page.evaluate(() => {
            //       document.querySelector("#search-input > button > i").click();
            // });

            // await browser.close();
      })();

      // console.log(fileContent);


      fs.unlinkSync(filePath);

      res.json('A'); // DEBUG
      return;



      // Modifique o conteúdo do arquivo
      const modifiedContent = gamesToSearch.toString();
      // const modifiedContent = 'FEITO';

      // Escreva o conteúdo modificado no arquivo
      fs.writeFileSync(filePath, modifiedContent);

      // Retorna o arquivo modificado
      res.download(filePath, 'arquivo_modificado.txt', () => {
            // Exclui o arquivo após o download
            fs.unlinkSync(filePath);
      });
})

const port = process.env.PORT || 5000;

app.listen(port, () => {
      console.log(`Listening to port ${port}.`);
})