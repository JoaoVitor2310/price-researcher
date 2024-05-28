const clearRomamNumber = (stringToSearch) => {
    const romanNumeralsRegex = /\b[IVXLCDM]+\b/g;

    // Substituir os números romanos por uma string vazia (removê-los)
    const cleanedString = stringToSearch.replace(romanNumeralsRegex, '').trim();

    // Remover espaços extras entre palavras
    const normalizedString = cleanedString.replace(/\s{2,}/g, ' ');

    return normalizedString;
}

export default clearRomamNumber;