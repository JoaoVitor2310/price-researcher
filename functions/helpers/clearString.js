const clearString = (stringToSearch) => {

    // Remove ":", "-", "™" e, quando "-", remove também o espaço subsequente, colocando tudo em minúsculas para melhor reconhecimento dos jogos
    stringToSearch = stringToSearch.replace(/-\s?/g, '').toLowerCase();

    // Remove somente o  ™, : e ®. Precisa ser feito separado
    stringToSearch = stringToSearch.replace(/[™:®]/g, '');

    return stringToSearch;
}

export default clearString;