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
        let elementoClicado = false, gameName;

        await page.goto(`https://www.kinguin.net/listing?active=1&hideUnavailable=0&phrase=${searchString}&size=50&sort=bestseller.total,DESC`);

        const games = await page.$$eval('h3[title]', h3s => h3s.map(h3 => h3.textContent)); // Separa o nome dos jogos

        for (const game of games) { // For para entrar na página do jogo
            if (game.includes('Steam CD Key')) {

                gameName = game.substring(0, game.indexOf('Steam CD Key')).trim(); // Extrai a parte da string até "Steam CD Key"

                gameName = gameName.replace(/[:\-]/g, '').toLowerCase(); // Remove ":" e "-" e coloca tudo em diminutivo para reconhecer melhor os jogos
                gameString = gameString.replace(/[:\-]/g, '').toLowerCase();

                if (gameName == gameString) {
                    await page.waitForSelector(`h3[title="${game}"]`, { timeout: timeOut });
                    await page.click(`h3[title="${game}"]`); // As vezes aqui é o suficiente

                    const selector = `h3[title="${game}"]`; // As vezes precisa clicar por aqui
                    await page.evaluate((selector) => {
                        const element = document.querySelector(selector);
                        if (element) {
                            element.click();
                        } else {
                            console.log('Não encontrado');
                        }
                    }, selector);

                    elementoClicado = true;
                    break;

                }
            }
        }

        if (!elementoClicado) {
            return "F";
            // throw new Error('Jogo não encontrado.');
        }

        await rejectCookies(page); // Esse é necessário

        await page.waitForSelector('div.sc-h0oox2-4'); // Aguarda o seletor da div do menu de moedas
        await page.waitForSelector('button.sc-o4ugwn-5'); // Aguarda o seletor da div do menu de moedas

        await page.evaluate(() => { // Função para abrir o menu de seleção de moeda
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



        await page.waitForSelector('em.sc-o4ugwn-12');
        await page.$eval('em.sc-o4ugwn-12', emElement => emElement.click()); // Clica em EUR

        let values;

        await page.waitForSelector('div.offer-item-wrapper span[content]', { timeout: timeOut }).catch(() => { });
        const elementoPresente = await page.$('div.offer-item-wrapper span[content]');
        if (elementoPresente) {
            // Se o elemento estiver presente, espera até que o seletor esteja presente com o timeout especificado
            await page.waitForSelector('div.offer-item-wrapper span[content]', { timeout: timeOut });
            values = await page.$$eval('div.offer-item-wrapper span[content]', spans => spans.map(span => span.getAttribute('content')));
            values.splice(0, 2);
        } else { // Só tem um vendedor, o preço vai aparecer só lá em cima na página
            console.log('Só tem um vendedor');
            await page.waitForSelector('span.sc-1kj1cv9-5.iDdryn.main-offer__price', { timeout: timeOut });

            const textoSegundoSpan = await page.evaluate(() => {
                const secondSpan = document.querySelector('span.sc-1kj1cv9-5.iDdryn.main-offer__price > span:nth-child(2)');
                if (secondSpan) {
                    return secondSpan.textContent.trim();
                } else {
                    return null;
                }
            });

            values = textoSegundoSpan.replace('€', '').replace('.', ','); // Remove o símbolo de euro
        }

        // return 'A'; // Debug


        let prices;
        if (Array.isArray(values)) { // Mais de um vendedor
            prices = values.filter(value => value !== "EUR");
            const menorPreco = prices[0];
            const segundoMenorPreco = prices[1];
            let finalPrice = 0;
    
            if (segundoMenorPreco > 1.0) { // Lógica para os samfiteiros
                const diferenca = segundoMenorPreco - menorPreco;
                const dezPorCentoSegundoMenorPreco = 0.1 * segundoMenorPreco;
    
                if (diferenca >= dezPorCentoSegundoMenorPreco) {
                    console.log('SAMFITEIRO!');
                    finalPrice = segundoMenorPreco - 0.01;
                } else {
                    finalPrice = menorPreco - 0.01;
                    // return finalPrice.toFixed(2).replace('.', ',');
                }
                return finalPrice.toFixed(2).replace('.', ',');
            } else { 
                finalPrice = menorPreco - 0.01;
                return finalPrice.toFixed(2).replace('.', ',');
            }
        } else { // Um vendedor
            return values;
        }
        

        // Suponha que values seja o seu array

        console.log(prices);


        // await page.waitForSelector('div.offer-item-wrapper span[content]', { timeout: timeOut });
        // const values = await page.$$eval('div.offer-item-wrapper span[content]', spans => spans.map(span => span.getAttribute('content')));
        // values.splice(0, 2);
        // console.log(values);

        // // Suponha que values seja o seu array
        // const prices = values.filter(value => value !== "EUR");

        // console.log(prices);

        // const menorPreco = prices[0];
        // const segundoMenorPreco = prices[1];
        // let finalPrice = 0;

        // if (segundoMenorPreco > 1.0) { // Lógica para os samfiteiros
        //     const diferenca = segundoMenorPreco - menorPreco;
        //     const dezPorCentoSegundoMenorPreco = 0.1 * segundoMenorPreco;

        //     if (diferenca >= dezPorCentoSegundoMenorPreco) {
        //         console.log('SAMFITEIRO!');
        //         finalPrice = segundoMenorPreco - 0.01;
        //         return finalPrice.toFixed(2);
        //     } else {
        //         finalPrice = menorPreco - 0.01;
        //         return finalPrice.toFixed(2);
        //     }
        // } else {
        //     finalPrice = menorPreco - 0.01;
        //     return finalPrice.toFixed(2);
        // }
    } catch (error) {
        console.log(error);
        return 'F';
    } finally {
        await browser.close();
    }

}


const rejectCookies = async (page) => {
    // Aguarda até que o seletor esteja presente, mas não gera erro se não estiver
    await page.waitForSelector('#onetrust-reject-all-handler', { timeout: 0 }).catch(() => { });

    // Verifica se o botão de aceitar cookies está presente
    const rejectButton = await page.$('#onetrust-reject-all-handler');

    // Se o botão de aceitar cookies estiver presente, clique nele
    if (rejectButton) {
        await rejectButton.click();
        // console.log('Cookies negados.');
    }
}



export default searchKinguin;