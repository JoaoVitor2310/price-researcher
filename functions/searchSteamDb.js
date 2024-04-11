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

import clearString from './helpers/clearString.js';

const searchSteamDb = async (gameString) => {
    let browser;
    try {
        browser = await puppeteer.launch({
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
            let gameName = await page.evaluate(el => el.textContent, link);
            
            gameName = clearString(gameName);
            gameString = clearString(gameString);

            if (gameName === gameString) {
                await link.click();
                break; // Finaliza o loop pois encontrou o elemento
            }
        }

        await page.waitForSelector('span.num', { timeout: timeOut });
        const spans = await page.$$('span.num');

        const popularity = await page.evaluate(span => span.textContent.trim(), spans[1]);
        console.log('Pico em 24h:', popularity);

        // await new Promise(resolve => setTimeout(resolve,  10000)); // Debug, espera 300 segundos para depois fechar o navegador

        return popularity;
    } catch (error) {
        return "F";
    } finally {
        await browser.close();

    }
};

export default searchSteamDb;