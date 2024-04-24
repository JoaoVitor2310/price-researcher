const worthyByPopularity = (price, minPopularity, popularity) => {
    const asString = popularity.toString(); // Converte para string
    popularity = parseInt(asString.replace('.', ''), 10); // Remove o ponto e transforma para inteiro

    if (popularity < minPopularity && price > 2.00) {
        return 'N';
    } else {
        const priceAsNumber = Number(price);
        return priceAsNumber.toFixed(2);
    }
}

export default worthyByPopularity;