import { Cloudinary } from '@cloudinary/url-gen';

export const cld = new Cloudinary({ cloud: { cloudName: 'moisesinc' } });

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
