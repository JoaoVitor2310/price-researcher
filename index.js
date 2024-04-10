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

      const hora1 = new Date().toLocaleTimeString();

      let gamesToSearch = [], lineToWrite, responseFile = '', priceGamivo, priceG2A, priceKinguin;
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


      // priceKinguin = await searchKinguin(gamesToSearch[0]);
      // console.log("priceKinguin: " + priceKinguin);


      // O for vai começar aqui passando em todos os gamesToSearch
      for (let game of gamesToSearch) {
            console.log("game: " + game);

            // let popularity = await searchSteamDb(game);
            let popularity = 2; // Debug

            if (popularity !== 'F') { // Jogo possui mais de 0 de popularidade
                  // popularity = popularity.replace(',', '.');
                  // popularity = Number(popularity);
                  if (popularity > 0) {
                        // priceGamivo = await searchGamivo(game, popularity);
                        // priceGamivo = await searchGamivo(game); // Debug sem popularidade


                        // priceG2A = await searchG2A(game, popularity);

                        // Pesquisa kinguin
                        priceKinguin = await searchKinguin(game);

                        console.log("priceKinguin: " + priceKinguin);

                  } else {
                        priceGamivo = 'N';
                        priceG2A = 'N';
                        // priceKinguin = 'N';
                  }
            } else { // Jogo tem 0 jogadores nas últimos 24h ou não achou os dados de popularidade
                  priceGamivo = 'N';
                  priceG2A = 'N';
                  // priceKinguin = 'N';
            }

            // Escreve a linha daquele jogo(g2a gamivo kinguin 3 tabs popularidade nessa ordem)

            // const fullLine = `${priceG2A}\t${priceGamivo}\tKinguin\t\t\t${popularity}\n`; // Escreve a linha para o txt
            // const fullLine = `G2A\t${priceGamivo}\tKinguin\t\t\t${popularity}\n`; // Debug só Gamivo
            // const fullLine = `${priceG2A}\tGamivo\tKinguin\t\t\t${popularity}\n`; // Debug só G2A
            const fullLine = `G2A\tGamivo\t${priceKinguin}\t\t\t${popularity}\n`; // Debug só Kinguin
            console.log(fullLine);

            // Termina o for de cada jogo, deve finalizar de montar o arquivo txt que será enviado
            responseFile += fullLine;
      }

      console.log("responseFile:\n" + responseFile);

      res.json('A'); // DEBUG
      return;


      fs.writeFileSync(filePath, responseFile);
      const hora2 = new Date().toLocaleTimeString();
      console.log(`Horário de início: ${hora1}, horário de término: ${hora2}`);

      res.download(filePath, 'arquivo_modificado.txt', (err) => {
            if (err) {
                  console.error('Erro ao fazer o download do arquivo:', err);
            } else {
                  // Exclui o arquivo após o download
                  fs.unlinkSync(filePath);
            }
      });
})

const port = process.env.PORT || 5000;

app.listen(port, () => {
      console.log(`Listening to port ${port}.`);
})