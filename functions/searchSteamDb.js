const puppeteer = require('puppeteer-extra'); // Importar puppeteer-extra
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker'); // Plugin de bloqueio de anúncios

puppeteer.use(
    AdblockerPlugin({
        interceptResolutionPriority: require('puppeteer').DEFAULT_INTERCEPT_RESOLUTION_PRIORITY,
    })
);

const dotenv = require('dotenv');
dotenv.config(); // Carregar variáveis de ambiente

const timeOut = process.env.timeOut; // Variável de ambiente para tempo limite

const clearString = require('./helpers/clearString'); // Assumindo que estes são módulos JS no mesmo diretório
const clearRomamNumber = require('./helpers/clearRomamNumber');
const clearDLC = require('./helpers/clearDLC');
const clearEdition = require('./helpers/clearEdition');

const searchSteamDb = async (gameString) => {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        await page.setViewport({
            width: 1920,
            height: 1080
        });

        await page.goto(`https://steamcharts.com/`);

        await page.waitForSelector('input[placeholder="search games"]');

        // Seletor do elemento de entrada
        const inputElement = await page.waitForSelector('input[placeholder="search games"]', { visible: true });


        let gameStringClean = clearRomamNumber(gameString);
        gameStringClean = clearDLC(gameStringClean);
        gameStringClean = clearEdition(gameStringClean);


        // Digita o nome do jogo no elemento de entrada
        await inputElement.type(gameStringClean);
        await inputElement.press('Enter');

        await page.waitForNavigation();

        const links = await page.$$('a');

        gameString = clearString(gameString);
        gameString = clearDLC(gameString);
        gameString = clearEdition(gameString);
        gameString = gameString.toLowerCase();

        for (const link of links) {
            let gameName = await page.evaluate(el => el.textContent, link);

            gameName = clearString(gameName);
            gameName = clearDLC(gameName);
            gameName = clearEdition(gameName);

            // console.log("gameName: " + gameName); // Debug
            // console.log("gameString: " + gameString);

            if (gameName === gameString) {
                await link.click();
                break; // Finaliza o loop pois encontrou o elemento
            }
        }

        await page.waitForSelector('span.num', { timeout: timeOut });
        const spans = await page.$$('span.num');

        const popularity = await page.evaluate(span => span.textContent.trim(), spans[1]);
        // console.log('Pico em 24h:', popularity);

        // await new Promise(resolve => setTimeout(resolve,  10000)); // Debug, espera 300 segundos para depois fechar o navegador

        return popularity;
    } catch (error) {
        // console.log(error);
        return "F";
    } finally {
        const pages = await browser.pages();
        for (let i = 0; i < pages.length; i++) {
            await pages[i].close();
        }
        const childProcess = browser.process()
        if (childProcess) {
            childProcess.kill(9)
        }
        await browser.close();
        if (browser && browser.process() != null) browser.process().kill('SIGINT');

    }
};

module.exports = searchSteamDb;