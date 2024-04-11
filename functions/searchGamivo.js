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

const apiGamivoUrl = process.env.apiGamivoUrl;
let browser;

const searchGamivo = async (gameString, popularity) => {
    let precoGamivo, lineToWrite, productString;
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

        // console.log("searchString: " + searchString);
        await page.goto(`https://www.gamivo.com/pt/search/${searchString}`);

        await page.waitForSelector('.search-results__tiles', { timeout: timeOut });

        // Obtém todos os resultados da pesquisa do nome do jogo
        const resultados = await page.$$('.product-tile__name');

        // Itera sobre cada resultado

        for (const resultado of resultados) {
            // Obtém o texto do elemento "span" com a classe "ng-star-inserted" dentro do resultado
            let nomeDoJogo = await resultado.$eval('span.ng-star-inserted', element => element.textContent);

            nomeDoJogo = nomeDoJogo.replace(/[:\-]/g, '').toLowerCase(); // Remove ":" e "-" e coloca tudo em diminutivo para reconhecer melhor os jogos
            gameString = gameString.replace(/[:\-]/g, '').toLowerCase();

            // Verifica se o texto do jogo contém a palavra "Steam"
            if (nomeDoJogo.includes(gameString)) {
                const regex = new RegExp(`${gameString}\\s[a-zA-Z0-9/.]+\\sGlobal`, 'i'); // Padrão: nome do jogo - região - Global
                const regex2 = new RegExp(`${gameString}\\sGlobal Steam`, 'i'); // Padrão: Nome do jogo - Global Steam

                if (regex.test(nomeDoJogo) || regex2.test(nomeDoJogo)) {
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

                popularity = 31; // Debug
                if (popularity < 30 && precoGamivo > 2.00) {
                    lineToWrite = `N`;
                } else {
                lineToWrite = precoGamivo;
                }

            } catch (error) {
                return "API Gamivo desligada";
            }

        } else {
            return "F";
        }


        return lineToWrite.replace('.', ',');

    } catch (error) {
        return 'F';
    } finally {
        await browser.close();
    }
};

export default searchGamivo;