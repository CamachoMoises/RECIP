export async function getImageBase64(path: string): Promise<string> {
    const response = await fetch(path);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

export async function getLogoBase64(): Promise<string> {
    return getImageBase64('/images/logo.png');
}

export async function getFirmaDirectorBase64(): Promise<string> {
    return getImageBase64('/images/firma_director.png');
}