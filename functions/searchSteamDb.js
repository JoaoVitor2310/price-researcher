const axios = require('axios');
require('dotenv').config();
const puppeteer = require('puppeteer');

const searchSteamDb = async (gameString) => {
    try {
        console.log('Acessou a função')
        const browser = await puppeteer.launch({
            userDataDir: null,
            headless: false
        });
        const page = await browser.newPage();

        await page.setViewport({
            width: 1920,
            height: 1080
        });

        await page.goto(`https://steamdb.info/`);

        await page.waitForSelector('input.field');

        await page.type('input.field', gameString);

        const arrayGameString = gameString.split(' '); // Aqui recebe Fallout 3 e fica [ 'Fallout', '3' ]
        console.log(arrayGameString);


        // const elements = await page.$$('a.app');

        const elements = await page.evaluate(() => {
            const links = document.querySelectorAll('a.app');
            const desiredLinks = [];
            links.forEach(link => {
                const spans = link.querySelectorAll('.s-hit--highlight');
                if (spans.length === 2) {
                    desiredLinks.push(link);
                }
            });
            return desiredLinks;
        });

        if (elements.length > 0) {
            // Clica no primeiro elemento encontrado
            await elements[0].click();
        } else {
            console.log('Nenhum resultado encontrado com os spans desejados.');
        }
        
        
        
        
        // Itera sobre os elementos para encontrar o desejado
        // for (const element of elements) {
        //     const spans = await element.$$('.s-hit--highlight');
        //     console.log('n de spans: ' + spans);
        //     if (spans.length === 2) {
        //         await element.click();
        //         break;
        //     }
        // }

        // await page.click('//*[contains(text(), "Fallout")][contains(text(), "3")]/..');
        // await page.click('input.field');


        await new Promise(resolve => setTimeout(resolve, 10000)); // Debug, espera 10 segundos para depois fechar o navegador

        await browser.close();
        return 1;
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao consultar site externo.');
    }
};

module.exports = searchSteamDb;