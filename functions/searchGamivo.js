const puppeteer = require('puppeteer-extra');
const { DEFAULT_INTERCEPT_RESOLUTION_PRIORITY } = require('puppeteer');

const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');

puppeteer.use(
    AdblockerPlugin({
        // Opcionalmente, habilitar modo cooperativo para vários interceptores de requisição
        interceptResolutionPriority: DEFAULT_INTERCEPT_RESOLUTION_PRIORITY,
    })
);

const axios = require('axios'); // Usar require para axios
const dotenv = require('dotenv'); // Usar require para dotenv

dotenv.config(); // Carregar variáveis de ambiente

const timeOut = process.env.timeOut; // Capturar variável de ambiente
const apiGamivoUrl = process.env.apiGamivoUrl; // Capturar outra variável de ambiente

// Importações locais usando require
const clearString = require('./helpers/clearString');
const clearDLC = require('./helpers/clearDLC');
const worthyByPopularity = require('./helpers/worthyByPopularity');
const clearEdition = require('./helpers/clearEdition');

const searchGamivo = async (gameString, minPopularity, popularity) => {
    let precoGamivo, lineToWrite, productString, browser;
    try {
        browser = await puppeteer.launch({
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        await page.setViewport({
            width: 1920,
            height: 1080
        });

        gameString = clearEdition(gameString);

        let searchString = gameString.replace(/ /g, "%20").replace(/\//g, "%2F").replace(/\?/g, "%3F").replace(/™/g, '').replace(/'/g, "%27"); // Substitui: " " -> "%20", "/" -> "%2F" e "?" -> "%3F" e "™" -> ""

        // console.log("searchString: " + searchString);
        await page.goto(`https://www.gamivo.com/pt/search/${searchString}`);

        // await new Promise(resolve => setTimeout(resolve, 60000000)); 

        await page.waitForSelector('.search-results__tiles', { timeout: timeOut });

        // Obtém todos os resultados da pesquisa do nome do jogo
        const resultados = await page.$$('.product-tile__name');

        gameString = clearString(gameString);
        gameString = clearDLC(gameString);

        // Itera sobre cada resultado
        for (const resultado of resultados) {
            // Obtém o texto do elemento "span" com a classe "ng-star-inserted" dentro do resultado
            let gameName = await resultado.$eval('span.ng-star-inserted', element => element.textContent);

            gameName = clearString(gameName);
            gameName = clearDLC(gameName);

            // Verifica se o texto do jogo contém a palavra "Steam"
            if (gameName.includes(gameString)) {
                const regex = new RegExp(`${gameString}\\s[a-zA-Z0-9/.]+\\sGlobal`, 'i'); // Padrão: nome do jogo - região - "Global"
                // const regex2 = new RegExp(`${gameString}\\sGlobal Steam`, 'i'); // Padrão: Nome do jogo - "Global Steam"
                const regex2 = new RegExp(`${gameString}\\sGlobal Steam$`, 'i');
                const regex3 = new RegExp(`${gameString}\\sROW\\sSteam$`, 'i');


                if (regex.test(gameName) || regex2.test(gameName) || regex3.test(gameName)) {
                    // Clica no resultado

                    const elementoLink = await resultado.$('a');
                    const href = await (await elementoLink.getProperty('href')).jsonValue();

                    const startIndex = href.indexOf('/product/') + '/product/'.length;
                    productString = href.substring(startIndex);

                    break; // Encerra o loop depois de clicar em um resultado
                }
            }
        }


        if (productString) {
            try {
                const response = await axios.get(`${apiGamivoUrl}/api/products/priceResearcher/${productString}`); // Colocar um try aqui p saber qnd o erro for aqui

                const precoGamivo = response.data.menorPreco;

                lineToWrite = worthyByPopularity(precoGamivo, minPopularity, popularity);

            } catch (error) {
                console.log(error);
                return "API Gamivo desligada ou arquivo env faltando";
            }
        } else {
            return "F";
        }


        return lineToWrite.replace('.', ',');

    } catch (error) {
        console.log(error);
        // console.log('Ou o timeout tá mt rápido e não dá tempo de carregar a página');
        return 'F';
    } finally {
        const pages = await browser.pages();
        await Promise.all(pages.map((page) => page.close()));
        const childProcess = browser.process()
        if (childProcess) {
            childProcess.kill()
        }
        await browser.close();
        if (browser && browser.process() != null) browser.process().kill('SIGINT');
    }
};

module.exports = searchGamivo;