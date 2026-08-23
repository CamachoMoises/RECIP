import { RefObject } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Typography } from '@material-tailwind/react';

type Props = {
	title: string;
	alt: string;
	imageUrl?: string;
	imageMissing?: boolean;
	onImageError: () => void;
	onImageLoad: () => void;
	canvasRef: RefObject<SignatureCanvas>;
	disabled: boolean;
	className?: string;
};

const CsadSignaturePanel = ({
	title,
	alt,
	imageUrl,
	imageMissing,
	onImageError,
	onImageLoad,
	canvasRef,
	disabled,
	className,
}: Props) => {
	return (
		<div
			className={`flex flex-col gap-3 border border-[#b0bec5] bg-white rounded-sm ${
				className ?? ''
			}`}
		>
			<Typography
				variant="h5"
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				{title}
			</Typography>
			{imageUrl && !imageMissing ? (
				<img
					src={imageUrl}
					className="signature-image"
					alt={alt}
					onError={onImageError}
					onLoad={onImageLoad}
				/>
			) : (
				<SignatureCanvas
					ref={canvasRef}
					penColor="black"
					canvasProps={{
						width: 500,
						height: 200,
						className: disabled
							? 'signatureCanvas pointer-events-none'
							: 'signatureCanvas',
					}}
				/>
			)}
			<hr />
		</div>
	);
};

export default CsadSignaturePanel;
