
import puppeteer from 'puppeteer-extra';
import { DEFAULT_INTERCEPT_RESOLUTION_PRIORITY } from 'puppeteer';
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config(); // Carregar variáveis de ambiente

// Capturar variáveis de ambiente após o dotenv.config
const apiG2aUrl = process.env.apiG2aUrl;
const timeOut = process.env.timeOut;

// Converter importações locais para require
import { clearString } from '../helpers/clearString.js';
import { clearDLC } from '../helpers/clearDLC.js';
import { worthyByPopularity } from '../helpers/worthyByPopularity.js';
import { clearEdition } from '../helpers/clearEdition.js';
import { foundGames } from '../types/foundGames.js';
import { connect } from 'puppeteer-real-browser';

puppeteer.use(
    StealthPlugin()
);


export const searchG2A = async (gamesToSearch: foundGames[], gameType = "Steam Key", region = "GLOBAL") => {
    let lineToWrite, gameString = '';
    const foundGames: foundGames[] = [];

        const { browser, page } = await connect({
            headless: false,

            args: [],

            customConfig: {},

            turnstile: true,

            connectOption: {},

            disableXvfb: false,
            ignoreAllFlags: false,
        });

        await page.setViewport({
            width: 1920,
            height: 1080
        });

        // await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');



        for (const [index, game] of gamesToSearch.entries()) {
            console.log(`Índice: ${index}, Jogo:`, game.name);

            gameString = game.name;
            let gameStringClean = clearEdition(game.name), gameUrl = '';

            // let searchString = gameString.replace(/ /g, "%20").replace(/\//g, "%2F").replace(/\?/g, "%3F").replace(/™/g, '').replace(/'/g, "%27"); // Substitui: " " -> "%20", "/" -> "%2F" e "?" -> "%3F" e "™" -> ""
            let searchString = encodeURIComponent(game.name).replace(/%E2%84%A2/g, ''); // Remove "™"

            // console.log("searchString: " + searchString);
            await page.goto(`https://www.g2a.com/pt/search?query=${searchString}`);
            await new Promise(resolve => setTimeout(resolve, 1000));

            const resultados = await page.$$('a');

            gameStringClean = clearString(gameStringClean);

            console.log('gameStringClean: ' + gameStringClean);

            for (const link of resultados) {
                let gameName = await page.evaluate(element => element.textContent, link);
                let gameNameClean = clearString(gameName!);

                if (!gameNameClean.includes(gameStringClean)) continue;

                console.log('gameNameClean: ' + gameNameClean);

                // const gameStringPattern = new RegExp(`^${gameString} \\(PC\\)`, 'i');
                const gameStringPattern = new RegExp(`^${gameStringClean}( \\(PC\\)| Steam Key)`, 'i');

                // if (gameName.includes(gameString) && gameName.includes(gameType.toLowerCase()) && gameName.includes(region.toLowerCase())) {
                if (gameStringPattern.test(gameNameClean) && gameNameClean.includes(gameType.toLowerCase()) && gameNameClean.includes(region.toLowerCase())) {
                    console.log('gameNameClean certo: ' + gameNameClean);
                    gameUrl += await page.evaluate(element => element.getAttribute('href'), link);
                    break;
                }

            }

            console.log('gameUrlFinal: ' + gameUrl);

            if (gameUrl === '') continue;

            const regex = /i(\d+)/;

            // Extrai o número do produto do URL usando a expressão regular
            const match = gameUrl.match(regex);

            // Verifica se houve correspondência e extrai o número do produto
            const productId = match ? match[1] : null;
            console.log('productId: ' + productId);

            if (!productId) continue;

            try {
                const response = await axios.get(`${apiG2aUrl}/g2a/api/products/priceResearcher/${productId}`);

                const precoG2A = response.data.menorPreco;
                console.log("precoG2A: " + precoG2A);
                const precoG2AFormatado = parseFloat(precoG2A).toFixed(2).replace('.', ',');
                console.log("precoG2AFormatado: " + precoG2AFormatado);

                foundGames.push({ id: index, name: game.name, popularity: game.popularity, G2APrice: precoG2AFormatado });
            } catch (error) {
                // console.log(error);
                console.log("jogo não encontrado ou arquivo env faltando.");
                // return "F";
            }

        }

    const pages = await browser.pages();
    // @ts-ignore
    if (pages) await Promise.all(pages.map((page) => page.close()));

    const childProcess = browser.process()
    if (childProcess) {
        childProcess.kill()
    }

    await browser.close();

    // @ts-ignore
    if (browser && browser.process()) browser.process().kill('SIGINT');

    return foundGames;
};

export default searchG2A;