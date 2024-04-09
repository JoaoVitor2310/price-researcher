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
            const nomeDoJogo = await resultado.$eval('span.ng-star-inserted', element => element.textContent);

            // Verifica se o texto do jogo contém a palavra "Steam"
            if (nomeDoJogo.toLowerCase().includes(gameString.toLowerCase())) {
                const regex = new RegExp(`${gameString}\\s[a-zA-Z0-9/.]+\\sGlobal`, 'i');
                if (regex.test(nomeDoJogo)) {
                    // Clica no resultado

                    const elementoLink = await resultado.$('a');
                    const href = await (await elementoLink.getProperty('href')).jsonValue();
                    console.log("href: " + href);

                    const startIndex = href.indexOf('/product/') + '/product/'.length;
                    productString = href.substring(startIndex);
                    
                    break; // Encerra o loop depois de clicar em um resultado
                }
            }
        }
        
        
        if(productString){
            console.log("productString: " + productString);
           
            try {
                const response = await axios.get(`${apiGamivoUrl}/api/products/priceResearcher/${productString}`); // Colocar um try aqui p saber qnd o erro for aqui
                
                const precoGamivo = response.data.menorPreco;
        
                // if (popularity < 30 && precoGamivo > 2.00) {
                //     lineToWrite = `N`;
                // } else {
                    lineToWrite = precoGamivo;
                // }
                
            } catch (error) {
                return "API Gamivo desligada";
            }
           
        }else{
            return "F";
        }
        

        return lineToWrite;

    } catch (error) {
        return 'F';
    } finally {
        await browser.close();
    }
};

export default searchGamivo;