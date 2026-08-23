import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { SignatureUrls } from '../../../types/utilities';
import { signatureUrl } from './csadForm.utils';

export const useCsadSignatures = (isLastStep: boolean) => {
	const CSAD_id = useSelector(
		(state: RootState) =>
			state.assessment.courseStudentAssessmentDaySelected?.id,
	);
	const [signatureUrls, setSignatureUrls] = useState<SignatureUrls>({});
	const [missingSignature, setMissingSignature] = useState<
		Partial<Record<keyof SignatureUrls, boolean>>
	>({});

	useEffect(() => {
		const fetchSignatures = async () => {
			if (!CSAD_id) return;

			setMissingSignature({});
			setSignatureUrls({
				student: signatureUrl(1, CSAD_id),
				instructor: signatureUrl(2, CSAD_id),
				fcaa: isLastStep ? signatureUrl(3, CSAD_id) : undefined,
			});
		};

		fetchSignatures();
	}, [CSAD_id, isLastStep]);

	return {
		signatureUrls,
		setSignatureUrls,
		missingSignature,
		setMissingSignature,
	};
};

export default useCsadSignatures;
