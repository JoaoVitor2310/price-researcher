
export const hasRegionLock = (str: string): Set<string> => {
    const regexList: RegExp[] = [
        /\bEU\b/gi,
        /\bROW\b/gi,
        /\bAR\b/gi,
        /\bUS\b/gi,
        /\bRU\b/gi,
        /\bNA\b/gi,
        /\bLATAM\b/gi,
        /\bEMEA\b/gi,
        /\bCIS\b/gi,
        /\bSEA\b/gi,
        /\bME\b/gi,
        /\bBR\b/gi,
    ];
    const foundKeywords = new Set<string>();

    for (const regex of regexList) {
        if (regex.test(str)) {
            foundKeywords.add(regex.source);
        }
    }

    return foundKeywords;
};
