import { Cloudinary } from '@cloudinary/url-gen';

const cld = new Cloudinary({ cloud: { cloudName: 'moisesinc' } });

export const blobToDataURL = (blob: Blob): Promise<string> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => resolve(reader.result as string);
		reader.onerror = reject;
		reader.readAsDataURL(blob);
	});
};

export const webpToPng = (dataUrl: string): Promise<string> => {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => {
			const canvas = document.createElement('canvas');
			canvas.width = img.width;
			canvas.height = img.height;
			const ctx = canvas.getContext('2d');
			ctx!.drawImage(img, 0, 0);
			resolve(canvas.toDataURL('image/png'));
		};
		img.onerror = reject;
		img.src = dataUrl;
	});
};

export const toBase64 = async (url: string): Promise<string> => {
	if (!url || url.startsWith('data:')) return url;
	try {
		const resp = await fetch(url);
		if (!resp.ok) return url;
		const blob = await resp.blob();
		const dataUrl = await blobToDataURL(blob);
		if (blob.type === 'image/webp') {
			return await webpToPng(dataUrl);
		}
		return dataUrl;
	} catch {
		return url;
	}
};

export const resolveImageUrl = (url?: string | null): string => {
	if (!url) return '';
	if (
		url.startsWith('http://') ||
		url.startsWith('https://') ||
		url.startsWith('data:')
	)
		return url;
	return `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
};

export const processSigUrl = async (
	url?: string | null,
): Promise<string | undefined> => {
	if (!url) return undefined;
	const resolved = resolveImageUrl(url);
	return toBase64(resolved);
};

export const getCloudinaryPngBase64 = async (
	publicId: string,
): Promise<string> => {
	if (!publicId) return '';
	try {
		const url = cld.image(publicId).format('png').toURL();
		const resp = await fetch(url);
		if (!resp.ok) return '';
		const blob = await resp.blob();
		return await blobToDataURL(blob);
	} catch {
		return '';
	}
};
