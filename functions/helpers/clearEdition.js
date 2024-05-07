const clearEdition = (stringToSearch) => {
    const definitiveEditionRegex = /\bdefinitive edition\b/gi; // Detectar "Definitive Edition" como palavra separada
    const rowRegex = /\brow\b/gi; // Detectar "ROW" como palavra separada
    const euRegex = /\beu\b/gi; // Detectar "EU" como palavra separada

    // Remover "Definitive Edition"
    let normalizedString = stringToSearch
        .replace(definitiveEditionRegex, '')
        .replace(rowRegex, '') // Remove "ROW"
        .replace(euRegex, ''); // Remove "EU"

    // Remover espaços extras para evitar fragmentos
    normalizedString = normalizedString.replace(/\s{2,}/g, ' ').trim(); // Normaliza a string para evitar múltiplos espaços

    return normalizedString;
};

module.exports = clearEdition;