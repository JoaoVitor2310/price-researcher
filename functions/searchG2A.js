import puppeteer from 'puppeteer';

const searchGamivo = async (gameString, gameType = "Steam Key", region = "GLOBAL") => {
    let precoG2A, lineToWrite;
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

        for (const link of resultados) {
            const text = await page.evaluate(element => element.textContent, link);
            if (text.includes(gameString) && text.includes(gameType) && text.includes(region)) {
                gameUrl += await page.evaluate(element => element.getAttribute('href'), link);
                console.log("Href do link: " + gameUrl);
                break;
            }
        }

        await browser.close();


        const newPuppeteer = async () => { // Segundo puppeteer é ncessário pq a G2A identifica bots e bloqueia o site.
            const browser = await puppeteer.launch({
                userDataDir: null, // Define o diretório de dados do usuário como null para abrir uma janela anônima
                headless: false // Define se o navegador será exibido (false) ou não (true)
            });
            const page = await browser.newPage();

            await page.setViewport({
                width: 1920,
                height: 1080
            });

            await page.goto(gameUrl);
            // await new Promise(resolve => setTimeout(resolve, 3000000)); // Debug, espera 300 segundos para depois fechar o navegador

            const prices = await page.$$(`div[data-locator="ppa-offers-list__price"] span[data-locator="zth-price"]`); // Funciona

            let pricesArray = [];
            for (const link of prices) { // Loop para percorrer os elementos
                const price = await page.evaluate(element => element.textContent, link);
                pricesArray.push(price);
                // console.log(text);

                // if (text.includes(gameString) && text.includes(gameType) && text.includes(region)) {
                // console.log("")
                // break;
                // }
            }
            precoG2A = pricesArray[0].replace('€', '');

            console.log("precoG2A: " + precoG2A);
            // precoG2A = prices[0].replace('€', '');

            // if (popularity < 30 && precoG2A > 2.00) {
            //     lineToWrite = `N\t`;
            // } else {
            //     lineToWrite = `${precoG2A}\t`;
            // }


        }

        if (gameUrl !== "https://www.g2a.com") {
            await newPuppeteer(gameUrl); // Chama a função newPuppeteer com a URL do jogo
            return lineToWrite; // Debug
        } else {
            return "F";
        }

        // Itera sobre cada resultado

        try {
            await page.waitForFunction(
                'document.querySelectorAll("span.price__value").length > 0',
                { timeout: 8000 }
            );

            const prices = await page.$$eval('span.price__value', spans => spans.map(span => span.textContent.trim()));

            precoGamivo = prices[0].replace('€', '');
            console.log("precoGamivo: " + precoGamivo);


            // if (popularity < 30 && precoGamivo > 2.00) {
            //     lineToWrite = `N\tKINGUIN`;
            // } else {
            //     lineToWrite = `${precoGamivo}\tKINGUIN`;
            // }

        } catch (error) { // Caso o jogo não foi encontrado por conta de alguma digitação incorreta
            lineToWrite = `F\tKINGUIN`; // Iremos escrever F
        }


        return lineToWrite;
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao consultar site externo.');
    }
};

export default searchGamivo;