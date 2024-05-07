# Price Researcher

### Para rodar:
Realizar o clone do repositório  
Abrir o terminal no diretório do projeto  
Rodar o comando "npm install"  
Rodar o comando npm start  


## Em produção

sudo apt-get update
sudo apt-get install -y xvfb // Para ter uma interface gráfica simulada
xvfb-run node index.js
Xvfb :99 -screen 0 1920x1080x24 &
export DISPLAY=:99
node index.js

### Comando para gerar o arquivo executável
pkg index.js --target node16-win-x64 --public



O XVFB, ou "X Virtual Framebuffer", é um servidor X que roda em segundo plano sem uma interface gráfica real. Ele é útil em ambientes de servidor ou headless onde uma GUI não está disponível, mas você ainda precisa de funcionalidades do servidor X, como para testes de navegação com ferramentas como o Puppeteer. O XVFB cria um ambiente virtual para aplicativos que normalmente requerem um ambiente gráfico para funcionar.

Quando Usar o XVFB
O XVFB é útil em várias situações:

Servidores Sem Interface Gráfica: Quando você deseja rodar aplicativos gráficos, mas seu servidor não possui uma interface gráfica instalada.
Ambientes de Teste Automatizado: Ideal para testes automatizados com Puppeteer, Selenium ou outros frameworks que requerem um ambiente gráfico.
Ambientes Seguros: Ao usar o Puppeteer com --no-sandbox, o XVFB pode fornecer um ambiente mais seguro sem a necessidade de desativar o sandboxing.
Instalando o XVFB
Para instalar o XVFB em distribuições baseadas em Debian/Ubuntu, use:

bash
Copy code
sudo apt-get update
sudo apt-get install -y xvfb
Usando o XVFB com Puppeteer
Uma abordagem comum para usar o XVFB com o Puppeteer é iniciar uma sessão XVFB antes de executar seu script Puppeteer. Aqui estão duas maneiras de fazer isso:

1. Executar um Script Puppeteer com XVFB
Você pode iniciar o XVFB e, em seguida, executar seu script Puppeteer na mesma linha para garantir que ele funcione em um ambiente gráfico virtual:

bash
Copy code
xvfb-run node seu_script.js
O comando xvfb-run inicia uma sessão XVFB e executa o comando especificado. Este é um método simples para garantir que seu script Puppeteer tenha um ambiente gráfico para funcionar.

2. Iniciar o XVFB em Segundo Plano
Se você deseja manter uma sessão XVFB em execução contínua, pode iniciá-la em segundo plano com um tamanho de tela específico:

bash
Copy code
Xvfb :99 -screen 0 1280x1024x24 &
:99: Define o número do display para a sessão XVFB.
-screen 0 1280x1024x24: Define o tamanho da tela (1280x1024) e a profundidade de cor (24 bits).
Depois de iniciar o XVFB, defina a variável de ambiente DISPLAY para apontar para a sessão XVFB antes de executar seu script Puppeteer:

bash
Copy code
export DISPLAY=:99
node seu_script.js