import emojiFlags from "emoji-flags";

export function splitStringIntoWords(input: string) {
    input = input.trim();
    return input.split(/\s+/);
}


export const cleanString = (input: string): string => {
    return input.trim().toLowerCase().replace(/\s+/g, "");
};


export const getFlagEmoji = (isoCode: string): string => {
    return isoCode
        .toUpperCase()
        .replace(/./g, (char) =>
            String.fromCodePoint(127397 + char.charCodeAt(0))
        );
};

export const getFlagEmoji2 = (isoCode: string): string => {
    const flag = emojiFlags.data.find((flag) => flag.code === isoCode.toUpperCase());
    return flag ? flag.emoji : "";
};
export const formatUserName = (fullName: string): string => {
    if (!fullName) return '';
    const firstWord = fullName.trim().split(' ')[0];
    if (firstWord.length > 14) {
        return firstWord.slice(0, 10) + '...';
    }

    return firstWord;
}