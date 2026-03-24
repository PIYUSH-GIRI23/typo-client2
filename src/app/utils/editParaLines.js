const editParaLines = (type, paraLines, fullstop = false, allsmallcase = false, punctuation = false, numbers = false, symbols = false) => {
    if (type !== 'para' || !Array.isArray(paraLines) || (!fullstop && !allsmallcase && !punctuation && !numbers && !symbols)) 
        return paraLines;

    const allowedSymbols = [",", "$", "&", "@"];

    const processLine = (text) => {
        if (!text || typeof text !== "string") return text;

        text = text.trim();

        // Remove all full stops when the fullstop option is enabled.
        if (fullstop) {
            text = text.replace(/\./g, "");
        }

        // Capitalize sentences if punctuation flag is on
        if (punctuation) {
            text = text.charAt(0).toUpperCase() + text.slice(1);
            text = text.replace(/\.\s*(\w)/g, (_, ch) => ". " + ch.toUpperCase());
        }

        if (allsmallcase) {
            text = text.toLowerCase();
        }

        // Only replace words if numbers or symbols are true
        if (!numbers && !symbols) return text;

        const words = text.split(/\s+/);
        const total = words.length;
        const replaceableIndices = Array.from({ length: total }, (_, i) => i).filter((i) => i !== 0);
        const replaceCount = Math.min(
            Math.floor(total * 0.24),
            replaceableIndices.length
        ); // ~24% words, excluding first word

        if (replaceCount <= 0) return words.join(" ");

        // Pick random indices to replace
        const indices = replaceableIndices
                            .sort(() => Math.random() - 0.5)
                            .slice(0, replaceCount);

        for (const idx of indices) {
            if (numbers && symbols) {
                words[idx] = Math.random() < 0.5 
                    ? String(Math.floor(Math.random() * 1000)) 
                    : allowedSymbols[Math.floor(Math.random() * allowedSymbols.length)];
            } 
            else if (numbers) {
                words[idx] = String(Math.floor(Math.random() * 1000));
            } 
            else if (symbols) {
                words[idx] = allowedSymbols[Math.floor(Math.random() * allowedSymbols.length)];
            }
        }

        return words.join(" ");
    };

    return paraLines.map(line => processLine(line));
};

export default editParaLines;