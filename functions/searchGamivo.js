const puppeteer = require('puppeteer');

const searchGamivo = async (gameString, popularity) => {
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
                    await resultado.click();
                    break; // Encerra o loop depois de clicar em um resultado
                }

            }
        }


        try {
            await page.waitForFunction(
                'document.querySelectorAll("span.price__value").length > 0',
                { timeout: 8000 }
            );

            const prices = await page.$$eval('span.price__value', spans => spans.map(span => span.textContent.trim()));

            precoGamivo = prices[0].replace('€', '');
            console.log("precoGamivo: " + precoGamivo);


            if (popularity < 30 && precoGamivo > 2.00) {
                lineToWrite = `N\tKINGUIN`;
            } else {
                lineToWrite = `${precoGamivo}\tKINGUIN`;
            }

        } catch (error) { // Caso o jogo não foi encontrado por conta de alguma digitação incorreta
            lineToWrite = `F\tKINGUIN`; // Iremos escrever F
        }

        await browser.close();
        return lineToWrite;
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao consultar site externo.');
    }
};

module.exports = searchGamivo;