import { response, Response } from "express";
import { MulterRequest } from "../types/MulterRequest";
import fs from 'fs';
import { searchGamivo } from "../services/searchGamivo.js";
// import searchG2A from "../service/searchG2A";
import { searchSteamDb } from "../services/searchSteamDb.js";
import { worthyByPopularity } from "../helpers/worthyByPopularity.js";
// import { searchKinguin } from "../service/searchKinguin.txt";
import { foundGames } from "../types/foundGames";
import { searchKinguin } from "../services/searchKinguin";
import searchG2A from "../services/searchG2A";

export const uploadFile = async (req: MulterRequest, res: Response) => {
    if (!req.file) {
        return res.status(400).send('Nenhum arquivo enviado.');
    }

    // return res.status(400).json(req.file);

    const horaAtual = new Date();
    const options = { timeZone: 'America/Sao_Paulo', hour12: false };
    const hora1 = horaAtual.toLocaleTimeString('pt-BR', options);

    // const hora1 = new Date().toLocaleTimeString();

    let gamesToSearch = [], responseFile: string = '', fullLine: string = '', priceGamivo, priceG2A, priceKinguin;
    const filePath = req.file.path;
    const fileContent = fs.readFileSync(filePath, 'utf8');

    const lines = fileContent.split('\n');

    const minPopularity = Number(lines[0]); // Primeira posição será a popularidade mínima
    lines.shift(); // Retira a popularidade do array

    // Iterar sobre as linhas e armazenar o conteúdo no array gamesToSearch
    for (const line of lines) {
        // Remover espaços em branco no início e no final de cada linha
        const trimmedLine: string = line.trim();

        // Verificar se a linha não está vazia
        if (trimmedLine !== '') {
            // @ts-ignore
            gamesToSearch.push(trimmedLine);
        }
    }

    let foundGames = await searchSteamDb(gamesToSearch);
    // return res.status(200).json(foundGames);
    // @ts-ignore
    // let foundGames: foundGames[] = [ // Para testar
    //     {
    //         "id": 0,
    //         "name": "cook serve delicious! 3?!",
    //         "popularity": 164
    //     },
    //     {
    //         "id": 1,
    //         "name": "Devil May Cry 4 Special Edition",
    //         "popularity": 164
    //     },
    //     {
    //         "id": 2,
    //         "name": "Kingdom Come: Deliverance Special Edition", // 
    //         "popularity": 20169
    //     },
    // ];

    foundGames = worthyByPopularity(foundGames, minPopularity);
    let gamivoGames = await searchGamivo(foundGames);
    let kinguinGames = await searchKinguin(foundGames);
    let g2aGames = await searchG2A(foundGames);

    // return res.status(200).json(kinguinGames);

    const allGames = [
        ...gamivoGames,
        ...kinguinGames.filter(k => !gamivoGames.some(g => g.id === k.id)),
        ...g2aGames.filter(g => !gamivoGames.some(g => g.id === g.id))
    ];

    const finalGames = allGames.map(game => {
        const gamivoGame = gamivoGames.find(g => g.id === game.id);
        const kinguinGame = kinguinGames.find(k => k.id === game.id);
        const g2aGame = g2aGames.find(g => g.id === game.id);

        return {
            id: game.id,
            name: game.name,
            popularity: game.popularity,
            GamivoPrice: gamivoGame ? gamivoGame.GamivoPrice : null,
            KinguinPrice: kinguinGame ? kinguinGame.KinguinPrice : null,
            G2APrice: g2aGame ? g2aGame.G2APrice : null
        };
    });

    // console.log('finalGames');
    // console.log(finalGames);
    for (const game of finalGames) {
        const gamivoPrice = (game.GamivoPrice === null || game.GamivoPrice === "null") ? "F" : game.GamivoPrice;
        const kinguinPrice = (game.KinguinPrice === null || game.KinguinPrice === "null") ? "F" : game.KinguinPrice;
        const g2aPrice = (game.G2APrice === null || game.G2APrice === "null") ? "F" : game.G2APrice;

        fullLine = `${g2aPrice}\t${gamivoPrice}\t${kinguinPrice}\t\t\t\t${game.popularity}\t${game.name}\n`;
        responseFile += fullLine;
        console.log(fullLine);
    }

    console.log(responseFile);

    fs.writeFileSync(filePath, responseFile);

    return res.download(filePath, 'resultado-price-researcher.txt', (err) => {
        // Verifica se houve algum erro durante o download

        const newHoraAtual = new Date();
        const options = { timeZone: 'America/Sao_Paulo', hour12: false };
        const hora2 = newHoraAtual.toLocaleTimeString('pt-BR', options);

        console.log(`Horário de início: ${hora1}, horário de término: ${hora2}`);
        if (err) {
            console.error('Erro ao fazer o download do arquivo:', err);
            fs.unlinkSync(filePath);
        } else {
            // Se o download for bem-sucedido, exclui o arquivo
            fs.unlinkSync(filePath);
        }
    });

}