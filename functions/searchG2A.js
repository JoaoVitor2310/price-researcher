const puppeteer = require('puppeteer-extra');
const { DEFAULT_INTERCEPT_RESOLUTION_PRIORITY } = require('puppeteer');

const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');

puppeteer.use(
    AdblockerPlugin({
        // Opcionalmente, habilitar modo cooperativo para vários interceptores de requisição
        interceptResolutionPriority: DEFAULT_INTERCEPT_RESOLUTION_PRIORITY,
    })
);

const axios = require('axios'); // Converter importação para require
const dotenv = require('dotenv'); // Converter importação para require

dotenv.config(); // Carregar variáveis de ambiente

// Capturar variáveis de ambiente após o dotenv.config
const apiG2aUrl = process.env.apiG2aUrl;
const timeOut = process.env.timeOut;

// Converter importações locais para require
const clearString = require('./helpers/clearString'); 
const clearDLC = require('./helpers/clearDLC');
const worthyByPopularity = require('./helpers/worthyByPopularity');

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

        let searchString = gameString.replace(/ /g, "%20").replace(/\//g, "%2F").replace(/\?/g, "%3F").replace(/™/g, '').replace(/'/g, "%27"); // Substitui: " " -> "%20", "/" -> "%2F" e "?" -> "%3F" e "™" -> ""

        // console.log("searchString: " + searchString);
        await page.goto(`https://www.g2a.com/pt/search?query=${searchString}`);

        // Obtém todos os resultados da pesquisa do nome do jogo
        const resultados = await page.$$('a');

        for (const link of resultados) {
            let gameName = await page.evaluate(element => element.textContent, link);

            gameName = clearString(gameName);
            gameString = clearString(gameString);

            // const gameStringPattern = new RegExp(`\\b${gameString}\\b`, 'i');
            const gameStringPattern = new RegExp(`^${gameString} \\(PC\\)`, 'i');

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

            lineToWrite = worthyByPopularity(precoG2A, minPopularity, popularity);
            return lineToWrite.replace('.', ',');
        } catch (error) {
            // console.log(error);
            return "API G2A desligada ou arquivo env faltando.";
        }
    } catch (error) {
        // console.log(error);
        // console.log('Ou o timeout tá mt rápido e não dá tempo de carregar a página');
        return 'F';
    } finally {
        await browser.close();
    }
};

module.exports = searchG2A;