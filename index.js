import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import path from 'path';
import multer from 'multer';
import fs from 'fs';
import searchSteamDb from "./functions/searchSteamDb.js";
import searchGamivo from "./functions/searchGamivo.js";
import searchG2A from "./functions/searchG2A.js";
import searchKinguin from "./functions/searchKinguin.js";

// import path from "path";

const app = express();

const pasta = path.join(process.cwd());
app.use(express.static(pasta));
app.use(express.json());

app.get('/', (req, res) => {
      res.send('Desenvolvido por João Vitor Gouveia. Linkedin: https://www.linkedin.com/in/jo%C3%A3o-vitor-matos-gouveia-14b71437/');
})

const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('fileToUpload'), async (req, res) => {
      if (!req.file) {
            return res.status(400).send('Nenhum arquivo enviado.');
      }


      const horaAtual = new Date();
      const options = { timeZone: 'America/Sao_Paulo', hour12: false };
      const hora1 = horaAtual.toLocaleTimeString('pt-BR', options);

      // const hora1 = new Date().toLocaleTimeString();

      let gamesToSearch = [], lineToWrite, responseFile = '', priceGamivo, priceG2A, priceKinguin;
      const filePath = req.file.path;
      const fileContent = fs.readFileSync(filePath, 'utf8');

      const lines = fileContent.split('\n');

      const minPopularity = lines[0]; // Primeira posição será a popularidade mínima
      lines.shift(); // Iremos retirar a popularidade do array

      // Iterar sobre as linhas e armazenar o conteúdo no array gamesToSearch
      for (const line of lines) {
            // Remover espaços em branco no início e no final de cada linha
            const trimmedLine = line.trim();

            // Verificar se a linha não está vazia
            if (trimmedLine !== '') {
                  gamesToSearch.push(trimmedLine);
            }
      }


      // O for vai começar aqui passando em todos os gamesToSearch
      for (let game of gamesToSearch) {
            console.log("game: " + game);
            let popularity = await searchSteamDb(game);
            let priceGamivo, priceG2A, priceKinguin;
            // let popularity = 2,442; // Debug

            if (popularity !== 'F') { // Jogo possui mais de 0 de popularidade
                  popularity = popularity.replace(',', '.');
                  // popularity = parseFloat(popularity);

                  let popularityNumber = parseFloat(popularity);
                  let decimalPlaces = (popularity.split('.')[1] || '').length;
                  popularity = popularityNumber.toFixed(decimalPlaces);

                  if (popularity > 0) {
                        // priceGamivo = await searchGamivo(game, minPopularity, popularity);

                        // priceG2A = await searchG2A(game, minPopularity, popularity);

                        // priceKinguin = await searchKinguin(game, minPopularity, popularity);

                        const promise1 = searchGamivo(game, minPopularity, popularity);
                        const promise2 = searchG2A(game, minPopularity, popularity);
                        const promise3 = searchKinguin(game, minPopularity, popularity);

                        // Executar as três funções simultaneamente
                        [priceGamivo, priceG2A, priceKinguin] = await Promise.all([promise1, promise2, promise3]);
                  } else {
                        priceGamivo = 'N';
                        priceG2A = 'N';
                        priceKinguin = 'N';
                  }
            } else { // Jogo tem 0 jogadores nas últimos 24h ou não achou os dados de popularidade
                  priceGamivo = 'N';
                  priceG2A = 'N';
                  priceKinguin = 'N';
            }
            // Escreve a linha daquele jogo(g2a gamivo kinguin 3 tabs popularidade nessa ordem)

            const fullLine = `${priceG2A}\t${priceGamivo}\t${priceKinguin}\t\t\t${popularity}\n`; // Escreve a linha para o txt
            // const fullLine = `G2A\t${priceGamivo}\tKinguin\t\t\t${popularity}\n`; // Debug só Gamivo
            // const fullLine = `${priceG2A}\tGamivo\tKinguin\t\t\t${popularity}\n`; // Debug só G2A
            // const fullLine = `G2A\tGamivo\t${priceKinguin}\t\t\t${popularity}\n`; // Debug só Kinguin
            console.log(fullLine);

            // Termina o for de cada jogo, deve finalizar de montar o arquivo txt que será enviado
            responseFile += fullLine;
      }

      console.log("responseFile:\n" + responseFile);

      // res.json('A'); // DEBUG
      // return;


      fs.writeFileSync(filePath, responseFile);
      const hora2 = horaAtual.toLocaleTimeString('pt-BR', options);
      console.log(`Horário de início: ${hora1}, horário de término: ${hora2}`);

      res.download(filePath, 'resultado-price-researcher.txt', (err) => {
            // Verifica se houve algum erro durante o download
            if (err) {
                  console.error('Erro ao fazer o download do arquivo:', err);
                  fs.unlinkSync(filePath);
            } else {
                  // Se o download for bem-sucedido, exclui o arquivo
                  fs.unlinkSync(filePath);
            }
      });
})

const port = process.env.PORT || 5000;

app.listen(port, () => {
      console.log(`Listening to port ${port}.`);
})