const axios = require('axios');
require('dotenv').config();
const puppeteer = require('puppeteer');

const searchSteamDb = async (gameString) => {
    try {
        const browser = await puppeteer.launch({
            userDataDir: null,
            headless: true
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

        // Digita o nome do jogo no elemento de entrada
        await inputElement.type(gameString);
        await inputElement.press('Enter');


        await page.waitForNavigation();

        const links = await page.$$('a');

        for (const link of links) {
            const text = await page.evaluate(el => el.textContent, link);
            if (text === gameString) {
                console.log("Jogo clicado")
                await link.click();
                break; // Finaliza o loop pois encontrou o elemento
            }
        }

        await page.waitForSelector('span.num');
        const spans = await page.$$('span.num');

        const popularity = await page.evaluate(span => span.textContent.trim(), spans[1]);
        console.log('Texto do segundo span:', popularity);

        // await new Promise(resolve => setTimeout(resolve, 3000000)); // Debug, espera 300 segundos para depois fechar o navegador

        // await new Promise(resolve => setTimeout(resolve, 3000)); // Debug, espera 10 segundos para depois fechar o navegador


        await browser.close();
        return popularity;
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao consultar site externo.');
    }
};

module.exports = searchSteamDb;