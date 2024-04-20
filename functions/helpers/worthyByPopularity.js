const worthyByPopularity = (price, minPopularity, popularity) => {
    // console.log('worthyByPopularity');
    // console.log('price: ' + price);
    // console.log('minPopularity: ' + minPopularity);
    // console.log("popularity: " + popularity);

    const asString = popularity.toString(); // Converte para string
    popularity = parseInt(asString.replace('.', ''), 10); // Remove o ponto e transforma para inteiro

    if (popularity < minPopularity && price > 2.00) {
        console.log('ene')
        return 'N';
    } else {
        return price;
    }
}

export default worthyByPopularity;