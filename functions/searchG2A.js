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

const searchG2A = async (gameString, popularity, gameType = "Steam Key", region = "GLOBAL") => {
    let precoG2A, lineToWrite;

    console.log("popularity: " + popularity);
    try {

        const browser = await puppeteer.launch({
            userDataDir: null, // Define o diretório de dados do usuário como null para abrir uma janela anônima
            headless: false // Define se o navegador será exibido (false) ou não (true)
        });
        const page = await browser.newPage();

        await page.setViewport({
            width: 1920,
            height: 1080
        });


        let gameUrl = "https://www.g2a.com";
        let searchString = gameString.replace(/ /g, "%20").replace(/\//g, "%2F"); // Substitui os espaços em branco por %20, e / por %2F


        console.log("searchString: " + searchString);
        // await page.goto(`https://www.g2a.com/pt/aquatico-pc-steam-key-global-i10000337842001`);
        await page.goto(`https://www.g2a.com/pt/search?query=${searchString}`);


        // Obtém todos os resultados da pesquisa do nome do jogo
        const resultados = await page.$$('a');
        // console.log(resultados);

        for (const link of resultados) {
            const text = await page.evaluate(element => element.textContent, link);
            if (text.includes(gameString) && text.includes(gameType) && text.includes(region)) {
                gameUrl += await page.evaluate(element => element.getAttribute('href'), link);
                console.log("Href do link: " + gameUrl);
                break;
            }
        }

        await browser.close();

        const regex = /i(\d+)/;

        // Extrai o número do produto do URL usando a expressão regular
        const match = gameUrl.match(regex);

        // Verifica se houve correspondência e extrai o número do produto
        const productId = match ? match[1] : null;

        console.log("productId: " + productId);

        const response = await axios.get(`${apiG2aUrl}/g2a/api/products/priceResearcher/${productId}`);


        precoG2A = response.data.menorPreco;
        console.log(precoG2A);

        if (popularity < 30 && precoG2A > 2.00) {
            lineToWrite = `N`;
        } else {
            lineToWrite = `${precoG2A}`;
        }
        // lineToWrite = precoG2A; // DEBUG

        return lineToWrite;
    } catch (error) {
        console.error(error);
        return 'F';
        throw new Error('Erro ao consultar site externo.');
    }
};

export default searchG2A;