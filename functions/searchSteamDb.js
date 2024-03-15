const axios = require('axios');
require('dotenv').config();
const puppeteer = require('puppeteer');

const searchSteamDb = async (gameString) => {
    try {
        const browser = await puppeteer.launch({
            userDataDir: null,
            headless: false
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

        // Digita 'Fallout 3' no elemento de entrada
        await inputElement.type('Fallout 3');
        await inputElement.press('Enter');

        await new Promise(resolve => setTimeout(resolve, 3000000)); // Debug, espera 10 segundos para depois fechar o navegador
        // await page.goto(`https://steamdb.info/`);

        await page.waitForSelector('input.field');

        await page.type('input.field', gameString);

        let arrayGameString = gameString.split(' '); // Aqui recebe Fallout 3 e fica [ 'Fallout', '3' ]
        console.log(arrayGameString);


        // await page.waitForSelector('.header-search-suggestions a.app'); // Funciona
        // const appLinks = await page.evaluate(() => {
        //     const links = document.querySelectorAll('.header-search-suggestions a.app');
        //     return Array.from(links).map(link => link.href);
        // });
        // console.log(appLinks);

        // let a;
        // for (const link of appLinks) { // Funciona
        //     // await page.goto(link); // Pede captcha

        //     a = await page.evaluate(() => {
        //         return document.querySelectorAll('a.app');
        //     });    
        // }
        // console.log(a);

        await new Promise(resolve => setTimeout(resolve, 3000)); // Debug, espera 10 segundos para depois fechar o navegador

        await page.waitForSelector('.s-hit--highlight'); // Espera o elemento carregar
        const spanElement = await page.$('.s-hit--highlight'); // Localiza o elemento span

        if (spanElement) {
            await spanElement.click(); // Clica no elemento span
            console.log('Clicado com sucesso no elemento span.');
        } else {
            console.log('Elemento span não encontrado.');
        }





        await browser.close();
        return 1;
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao consultar site externo.');
    }
};

module.exports = searchSteamDb;