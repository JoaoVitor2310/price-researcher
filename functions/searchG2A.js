import puppeteer from 'puppeteer-extra';
import DEFAULT_INTERCEPT_RESOLUTION_PRIORITY from 'puppeteer';

import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';

puppeteer.use(
    AdblockerPlugin({
        // Optionally enable Cooperative Mode for several request interceptors
        interceptResolutionPriority: DEFAULT_INTERCEPT_RESOLUTION_PRIORITY
    })
)

import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const apiG2aUrl = process.env.apiG2aUrl;
const timeOut = process.env.timeOut;

import clearString from './helpers/clearString.js';
import worthyByPopularity from './helpers/worthyByPopularity.js';

const searchG2A = async (gameString, minPopularity, popularity, gameType = "Steam Key", region = "GLOBAL") => {
    let precoG2A, lineToWrite, browser;

    try {

        browser = await puppeteer.launch({
            userDataDir: null, // Define o diretório de dados do usuário como null para abrir uma janela anônima
            headless: false, 
            args: ['--no-sandbox', '--disable-setuid-sandbox'] 
        });
        const page = await browser.newPage();

        await page.setViewport({
            width: 1920,
            height: 1080
        });


        let gameUrl;

        let searchString = gameString.replace(/ /g, "%20").replace(/\//g, "%2F").replace(/\?/g, "%3F").replace(/™/g, ''); // Substitui: " " -> "%20", "/" -> "%2F" e "?" -> "%3F" e "™" -> ""


        // console.log("searchString: " + searchString);
        await page.goto(`https://www.g2a.com/pt/search?query=${searchString}`);


        // Obtém todos os resultados da pesquisa do nome do jogo
        const resultados = await page.$$('a');

        for (const link of resultados) {
            let gameName = await page.evaluate(element => element.textContent, link);

            gameName = clearString(gameName);
            gameString = clearString(gameString);

            const gameStringPattern = new RegExp(`\\b${gameString}\\b`, 'i');

            // if (gameName.includes(gameString) && gameName.includes(gameType.toLowerCase()) && gameName.includes(region.toLowerCase())) {
            if (gameStringPattern.test(gameName) && gameName.includes(gameType.toLowerCase()) && gameName.includes(region.toLowerCase())) {
                gameUrl += await page.evaluate(element => element.getAttribute('href'), link);
                break;
            }
        }


        const regex = /i(\d+)/;

        // Extrai o número do produto do URL usando a expressão regular
        const match = gameUrl.match(regex);

        // Verifica se houve correspondência e extrai o número do produto
        const productId = match ? match[1] : null;


        try {
            const response = await axios.get(`${apiG2aUrl}/g2a/api/products/priceResearcher/${productId}`);

            precoG2A = response.data.menorPreco;

            return worthyByPopularity(precoG2A, minPopularity, popularity);
        } catch (error) {
            console.log(error);
            return "API G2A provavelmente desligada.";
        }
    } catch (error) {
        // console.log(error);
        // console.log('Ou o timeout tá mt rápido e não dá tempo de carregar a página');
        return 'F';
    } finally {
        await browser.close();
    }
};

export default searchG2A;