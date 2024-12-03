export function splitStringIntoWords(input: string) {
    input = input.trim();
    return input.split(/\s+/);
}