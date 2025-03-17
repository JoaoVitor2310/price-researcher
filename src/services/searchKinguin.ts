import puppeteer from 'puppeteer-extra';
import { DEFAULT_INTERCEPT_RESOLUTION_PRIORITY } from 'puppeteer';
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

import dotenv from 'dotenv';
import qs from 'qs';

dotenv.config(); // Carregar variáveis de ambiente

const timeOut = Number(process.env.timeOut) || 3000; // Obter tempo limite das variáveis de ambiente

// Importações locais usando import
import axios, { AxiosResponse } from 'axios';
import { foundGames } from '../types/foundGames.js';
import { clearDLC } from '../helpers/clearDLC.js';
import { clearString } from '../helpers/clearString.js';

puppeteer.use(
    StealthPlugin()
);

export const searchKinguin = async (gamesToSearch: foundGames[]): Promise<foundGames[]> => {
    let productSlug = '', gameHref = '', browser, externalId = '', elementoClicado = false;
    const foundGames: foundGames[] = [];

    let response: AxiosResponse;

    browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    await page.setViewport({
        width: 1920,
        height: 1080
    });

    for (const [index, game] of gamesToSearch.entries()) {
        console.log('---------------------');
        console.log('game.name: ' + game.name);
        // let searchString = encodeURIComponent(game.name).replace(/%E2%84%A2/g, ''); // Remove "™"
        let searchString = clearDLC(game.name), currentPage = 0;
        searchString = searchString.replace(/ /g, "%20").replace(/\//g, "%2F").replace(/\?/g, "%3F").replace(/™/g, '').replace(/'/g, "%27"); // Substitui: " " -> "%20", "/" -> "%2F" e "?" -> "%3F", "™" -> "" e "'" -> "%27"
        console.log('searchString(alterar): ' + searchString);
        while (currentPage <= 1) { // Vai tentar na segunda página
            try {
                await page.goto(`https://www.kinguin.net/listing?active=1&hideUnavailable=0&phrase=${searchString}&page=${currentPage}&size=100&sort=bestseller.total,DESC`); // Size 100 é o máximo
                await page.waitForSelector('h3[title] a', { timeout: timeOut }); // Aguarda até o timeout para os links carregarem

                const searchResults: { title: string; href: string }[] = await page.$$eval('h3[title]', h3s => h3s.map(h3 => ({ title: h3.textContent?.trim() || '', href: h3.querySelector('a')?.href || '' })));
                // console.log(searchResults);

                const gameString = clearDLC(game.name);
                let gameStringClean = clearString(gameString);
                console.log("gameStringClean: " + gameStringClean);

                for (const result of searchResults) { // For para entrar na página do jogo
                    if (result.title.includes('Steam CD Key')) {

                        const gameName = result.title.substring(0, result.title.indexOf('Steam CD Key')).trim(); // Extrai a parte da string até "Steam CD Key"

                        let gameNameClean = clearString(gameName);
                        gameNameClean = clearDLC(gameNameClean);

                        console.log("gameNameClean: " + gameNameClean);

                        // const regex = new RegExp(`^${gameStringClean}\\s*pc?$`, 'i');  // 'i' para tornar a regex case-insensitive
                        // const regex = new RegExp(`${gameStringClean}\\s*(pc)?$`, 'i');
                        const regex = new RegExp(`^${gameStringClean}\\s*(pc)?$`, 'i');


                        if (regex.test(gameNameClean)) {
                            console.log('gameName certo: ' + game.name);

                            gameHref = result.href; // Armazena o href do jogo

                            const regex = /\/(\d+)\//;
                            const match = gameHref.match(regex);

                            // Armazena o ID da categoria diretamente, sem usar if
                            externalId = match ? match[1] : '';

                            // console.log('external_id: ' + externalId);
                            elementoClicado = true;

                            foundGames.push({
                                id: index,
                                name: game.name,
                                popularity: game.popularity,
                                KinguinPrice: externalId, // Armazena o ID do jogo aqui de improviso para ser usado posteriormente
                            });
                            break; // Sai do loop 'for'
                        }
                    }
                }

                if (elementoClicado) {
                    break; // Sai do loop 'while'
                }

            } catch (error) {
                console.log(error);
                console.log('Não achou na página: ' + page);
            }
            currentPage++;
        }
    }

    // console.log(foundGames);
    // let foundGamess = [
    // {
    //     id: 0,
    //     name: 'cook serve delicious! 3?!',
    //     popularity: 164,
    //     KinguinPrice: '70212'
    // },
    // {
    //     id: 1,
    //     name: 'Devil May Cry 4 Special Edition',
    //     popularity: 164,
    //     KinguinPrice: '17882'
    // },
    // {
    //     id: 2,
    //     name: 'Kingdom Come: Deliverance Special Edition',
    //     popularity: 20169,
    //     KinguinPrice: '45585'
    // },
    // {
    //     id: 3,
    //     name: 'Kingdom Come: Deliverance',
    //     popularity: 20169,
    //     KinguinPrice: '44762'
    // },
    // {
    //     id: 4,
    //     name: 'Terraformers',
    //     popularity: 141,
    //     KinguinPrice: '115344'
    // },
    // {
    //     id: 5,
    //     name: 'The Elder Scrolls V: Skyrim Special Edition',
    //     popularity: 29965,
    //     KinguinPrice: '31221'
    // },
    // {
    //     id: 6,
    //     name: 'patrician iii',
    //     popularity: 66,
    //     KinguinPrice: '1800'
    // },
    // {
    //     id: 7,
    //     name: "Sid Meier's Civilization IV: Beyond the Sword",
    //     popularity: 2000,
    //     KinguinPrice: '9746'
    // },
    // {
    //     id: 10,
    //     name: 'the long dark',
    //     popularity: 3164,
    //     KinguinPrice: '10166'
    // },
    // {
    //     id: 11,
    //     name: 'Symphony of War: The Nephilim Saga',
    //     popularity: 645,
    //     KinguinPrice: '121032'
    // },
    // { id: 12, name: 'Coromon', popularity: 322, KinguinPrice: '114626' },
    // {
    //     id: 13,
    //     name: "The Excavation of Hob's Barrow",
    //     popularity: 18,
    //     KinguinPrice: '132564'
    // }
    // ];
    console.log('PARTINDO PARA A API');

    // return foundGames;

    let token, productId;

    let queryString = qs.stringify({
        'grant_type': 'client_credentials',
        'client_id': process.env.kinguinClient_id,
        'client_secret': process.env.kinguinClient_secret
    });

    response = await axios.post(
        'https://id.kinguin.net/auth/token',
        queryString,
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        }
    );
    token = response.data.access_token;

    for (const game of foundGames) {
        let menorPreco = Number.MAX_SAFE_INTEGER;
        externalId = String(game.KinguinPrice);
        let response1, response2;
        console.log('tentando o jogo: ' + game.name);
        try {
            response1 = await axios.get(`https://gateway.kinguin.net/kpc/api/v1/products/search/findByTypeAndExternalId?type=kinguin&externalId=${externalId}`);
            console.log(response1.data);
        } catch (error) {
            // console.log(error);
        }
        productId = response1!.data._embedded.products[0].id;

        try {
            response2 = await axios.get(`https://gateway.kinguin.net/sales-manager-api/api/v1/wholesale/product/${productId}/offers`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log(response2.data);

        } catch (error) {
            console.log(error);
        }

        const products = response2!.data;
        for (let product of products) {

            const precoAtual = product.price.amount;

            if (precoAtual < menorPreco) menorPreco = precoAtual;

        }

        if (menorPreco == Number.MAX_SAFE_INTEGER) {
            game.KinguinPrice = 'F';
            continue;
        }

        menorPreco = (menorPreco / 100);
        menorPreco = menorPreco - 0.01;

        // Transforma o número em string com 2 casas decimais
        let precoFormatado: string = menorPreco.toFixed(2);

        // Substitui o ponto por vírgula
        precoFormatado = precoFormatado.replace('.', ',');


        game.KinguinPrice = precoFormatado;
        console.log('preco: ' + game.KinguinPrice);

    }


    const pages = await browser.pages();
    // @ts-ignore
    if (pages) await Promise.all(pages.map((page) => page.close()));
    const childProcess = browser.process()
    if (childProcess) {
        childProcess.kill()
    }
    await browser.close();
    // @ts-ignore
    if (browser && browser.process()) browser.process().kill('SIGINT');

    console.log(foundGames);
    return foundGames;
}


// const rejectCookies = async (page) => {
//     // Aguarda até que o seletor esteja presente, mas não gera erro se não estiver
//     await page.waitForSelector('#onetrust-reject-all-handler', { timeout: 0 }).catch(() => { });

//     // Verifica se o botão de aceitar cookies está presente
//     const rejectButton = await page.$('#onetrust-reject-all-handler');

//     // Se o botão de aceitar cookies estiver presente, clique nele
//     if (rejectButton) {
//         await rejectButton.click();
//         // console.log('Cookies negados.');
//     }
// }