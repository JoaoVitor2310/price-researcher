const searchRegion = (stringToSearch) => {

    

    // Remover todas as ocorrências de "dlc" ou "DLC"
    let normalizedString = stringToSearch.replace(dlcRegex, '').replace(expansionRegex, '');

    // Remover espaços extras para evitar fragmentos
    normalizedString = normalizedString.replace(/\s{2,}/g, ' ').trim(); // Normaliza a string para remover múltiplos espaços

    return normalizedString;
};

module.exports = searchRegion;