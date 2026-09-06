

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Cloudinary } from '@cloudinary/url-gen';

const cld = new Cloudinary({
  cloud: {
    cloudName: 'moisesinc', // Reemplaza con tu cloud name de Cloudinary
  },
});
export { cld }

export const signatureUrl = (slot: 1 | 2 | 3, csadId: number) =>
	cld
		.image(`firmas/firmas/signature_${slot}_${csadId}`)
		.format('webp')
		.toURL();

export const proficiencyLabel = (score: number | undefined) => {
	if (score == null) return '';
	if (score < 3) return 'Insatisfactorio';
	if (score < 4) return 'Satisfactorio';
	return 'Excelente';
};

export default function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


