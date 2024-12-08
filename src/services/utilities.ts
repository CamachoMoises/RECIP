export function splitStringIntoWords(input: string) {
    input = input.trim();
    return input.split(/\s+/);
}


export const cleanString = (input: string): string => {
    return input.trim().toLowerCase().replace(/\s+/g, "");
};