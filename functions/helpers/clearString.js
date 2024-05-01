const clearString = (stringToSearch) => {

    const romanRegex = /\b[IVXLCDM]+\b/g;

    // Substituir números romanos pelo equivalente decimal
    stringToSearch = stringToSearch.replace(romanRegex, (match) => {
        const decimalValue = RomantoInt(match);
        return decimalValue.toString(); // Converter para string para colocar de volta
    });

    // Remove ":", "-", "™" e, quando "-", remove também o espaço subsequente, colocando tudo em minúsculas para melhor reconhecimento dos jogos
    stringToSearch = stringToSearch.replace(/-\s?/g, '').toLowerCase();

    // Remove somente o  ™, : e ®. Precisa ser feito separado
    stringToSearch = stringToSearch.replace(/[™:®]/g, '');


    return stringToSearch;
}

function RomantoInt(romanStr) {

    let num = 0;
    let objRoman = { M: 1000, D: 500, C: 100, L: 50, X: 10, V: 5, I: 1 };

    for (let i = 0; i < romanStr.length; i++) {

        if (objRoman[romanStr[i]] < objRoman[romanStr[i + 1]]) {
            num -= objRoman[romanStr[i]];
        }
        else {
            num += objRoman[romanStr[i]];
        }
    }

    return num;

}


// Testar a função
// const testString = "Sid Meier's Civilization IV: Beyond the Sword";
// const result = clearString(testString);
// console.log(result); // Deve retornar: "street fighter 6"




export default clearString;