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
const timeOut = process.env.timeOut;
let browser;

const searchKinguin = async (gameString) => {

    try {
        browser = await puppeteer.launch({
            userDataDir: null, // Define o diretório de dados do usuário como null para abrir uma janela anônima
            headless: false // Define se o navegador será exibido (false) ou não (true)
        });
        const page = await browser.newPage();

        await page.setViewport({
            width: 1920,
            height: 1080
        });

        let searchString = gameString.replace(/ /g, "%20").replace(/\//g, "%2F").replace(/\?/g, "%3F"); // Substitui: " " -> "%20", "/" -> "%2F" e "?" -> "%3F"

        await page.goto(`https://www.kinguin.net/listing?active=1&hideUnavailable=0&phrase=${searchString}&size=50&sort=bestseller.total,DESC`);

        await acceptCookies(page);

        await page.evaluate(() => {
            const div = document.querySelector('div.sc-h0oox2-4');
            if (div) {
                div.click();

                // Adicionando ação para clicar no primeiro botão
                const button = document.querySelector('button.sc-o4ugwn-5');
                if (button) {
                    button.click();
                } else {
                    console.log('Botão não encontrado.');
                }
            } else {
                console.log('Elemento div não encontrado.');
            }
        });



        await page.evaluate(() => {
            const iElement = document.querySelector('i.sc-o4ugwn-11.bbabIk');
            if (iElement) {
                iElement.click();
            } else {
                console.log('Elemento <i> não encontrado.');
            }
        });
        
        

    
        


        // await delay(3000);


        const games = await page.$$eval('h3[title]', h3s => h3s.map(h3 => h3.textContent));

        for (const game of games) {
            if (game.includes('Steam CD Key')) {
                // Extrai a parte da string até "Steam CD Key"
                const gameName = game.substring(0, game.indexOf('Steam CD Key')).trim();

                if (gameName == gameString) {
                    await page.click(`h3[title="${game}"]`);

                    const selector = `h3[title="${game}"]`;
                    await page.evaluate((selector) => {
                        const element = document.querySelector(selector);
                        if (element) {
                            element.click();
                        }
                    }, selector);

                    await delay(2000);
                    break;

                }
            }
        }

        await acceptCookies(page);

        // const values = await page.$$eval('span[content]', spans => spans.map(span => span.getAttribute('content')));
        // console.log(values);

        const values = await page.$$eval('div.offer-item-wrapper span[content]', spans => spans.map(span => span.getAttribute('content')));
        values.splice(0, 2);
        console.log(values);



        await delay(5000);


    } catch (error) {
        console.log(error);
        return 'F';
    } finally {
        await browser.close();
    }

}

const delay = (ms) => { // Para debugar
    return new Promise(resolve => setTimeout(resolve, ms));
}

const acceptCookies = async (page) => {
    const acceptButton = await page.$('#onetrust-accept-btn-handler');

    // Se pedir pra aceitar cookies, aceita
    if (acceptButton !== null) {
        await acceptButton.click();
        console.log('Cookie aceito');
    }
}


export default searchKinguin;