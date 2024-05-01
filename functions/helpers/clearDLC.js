const clearDLC = (stringToSearch) => {
    const dlcRegex = /\bdlc\b/gi; // 'gi' para case-insensitive e busca global
    
    // Remover "dlc" quando é uma palavra separada
    const normalizedString = stringToSearch.replace(dlcRegex, '').trim(); // 'trim' para remover espaços extras
    
    return normalizedString;
}

const testString = "Jogo Novo DLC e mais DLC";
const result = clearDLC(testString);
console.log(result); // Deve retornar: "Jogo Novo e mais"

export default clearDLC;