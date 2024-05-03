const clearEdition = (stringToSearch) => {
    const definitiveEditionRegex = /\bdefinitive edition\b/gi; // Detectar "Definitive Edition" como palavra separada

    // Remover "Definitive Edition"
    let normalizedString = stringToSearch.replace(definitiveEditionRegex, '');

    // Remover espaços extras para evitar fragmentos
    normalizedString = normalizedString.replace(/\s{2,}/g, ' ').trim(); // Normaliza a string para evitar múltiplos espaços

    return normalizedString;
};

export default clearEdition;