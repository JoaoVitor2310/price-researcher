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

const apiGamivoUrl = process.env.apiGamivoUrl;

const searchGamivo = async (gameString, popularity) => {
    let precoGamivo, lineToWrite, productString;
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


        let searchString = gameString.replace(/ /g, "%20").replace(/\//g, "%2F"); // Substitui os espaços em branco por %20, e / por %2F

        // console.log("searchString: " + searchString);
        await page.goto(`https://www.gamivo.com/pt/search/${searchString}`);

        await page.waitForSelector('.search-results__tiles');

        // Obtém todos os resultados da pesquisa do nome do jogo
        const resultados = await page.$$('.product-tile__name');

        // Itera sobre cada resultado

        for (const resultado of resultados) {
            // Obtém o texto do elemento "span" com a classe "ng-star-inserted" dentro do resultado
            const nomeDoJogo = await resultado.$eval('span.ng-star-inserted', element => element.textContent);
            //   console.log(nomeDoJogo)

            // Verifica se o texto do jogo contém a palavra "Steam"
            if (nomeDoJogo.includes(gameString)) {

                const regex = new RegExp(`${gameString}\\s[a-zA-Z0-9/.]+\\sGlobal`, 'i');
                if (regex.test(nomeDoJogo)) {
                    // Clica no resultado
                    // await resultado.click();
                    
                    const elementoLink = await resultado.$('a');
                    const href = await (await elementoLink.getProperty('href')).jsonValue();
                    
                    const startIndex = href.indexOf('/product/') + '/product/'.length;
                    productString = href.substring(startIndex);
                    
                    await browser.close();
                    break; // Encerra o loop depois de clicar em um resultado
                }
            }
        }

        // console.log(productString);

        const response = await axios.get(`${apiGamivoUrl}/api/products/priceResearcher/${productString}`);
        const precoGamivo = response.data.menorPreco;
        
        if (popularity < 30 && precoGamivo > 2.00) {
            lineToWrite = `N`;
        } else {
            lineToWrite = `${precoGamivo}`;
        }
        
        return lineToWrite;

        // try {
        //     await page.waitForFunction(
        //         'document.querySelectorAll("span.price__value").length > 0',
        //         { timeout: 8000 }
        //     );

        //     const prices = await page.$$eval('span.price__value', spans => spans.map(span => span.textContent.trim()));

        //     precoGamivo = prices[0].replace('€', '');
        //     console.log("precoGamivo: " + precoGamivo);



        // } catch (error) { // Caso o jogo não foi encontrado por conta de alguma digitação incorreta ou outros problemas
        //     lineToWrite = `F`; // Iremos escrever F
        // }

    } catch (error) {
        console.error(error);
        return 'F';
        throw new Error('Erro ao consultar site externo.');
    }
};

export default searchGamivo;