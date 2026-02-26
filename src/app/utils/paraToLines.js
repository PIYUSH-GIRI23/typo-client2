let measureCtx = null;

const getMeasureCtx = () => {
    if (measureCtx) return measureCtx;

    if (typeof document === "undefined") return null;

    const canvas = document.createElement("canvas");
    measureCtx = canvas.getContext("2d");

    return measureCtx;
};

const paraToLines = (para, maxWidth, font, letterSpacing = 0, wordSpacing = 0) => {
    if (!para || !maxWidth) return [];

    const ctx = getMeasureCtx();
    if (!ctx) return []; 

    ctx.font = font;

    const words = para.split(" ");
    const lines = [];
    let currentLine = "";

    const getAdjustedWidth = (text) => {
        const baseWidth = ctx.measureText(text).width;

        const letters = text.length;
        const spaces = (text.match(/ /g) || []).length;

        const extra =
            (letters - 1) * letterSpacing +
            spaces * wordSpacing;

        return baseWidth + extra;
    };

    for (let word of words) {
        const testLine = currentLine ? currentLine + " " + word : word;
        const width = getAdjustedWidth(testLine);

        if (width > maxWidth) {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    }

    if (currentLine) lines.push(currentLine);

    return lines;
};

export default paraToLines;