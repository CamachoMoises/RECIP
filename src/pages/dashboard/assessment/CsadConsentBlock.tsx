import { Checkbox, Typography } from '@material-tailwind/react';

type Props = {
	checked: boolean;
	onChange: (checked: boolean) => void;
};

const CsadConsentBlock = ({ checked, onChange }: Props) => {
	return (
		<div className="mt-6 p-4 border border-[#b0bec5] rounded-md bg-gray-50">
			<div className="flex items-start gap-3">
				<Checkbox
					checked={checked}
					onChange={(e) => onChange(e.target.checked)}
					className="mt-1"
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
					crossOrigin={undefined}
				/>
				<Typography
					variant="small"
					className="text-slate-700 leading-relaxed"
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					Por medio del presente, autorizo a CEA 360 ATC, de forma
					expresa el registro en audio y video de la sesión de
					entrenamiento con el único fin de recibir instrucción,
					evaluación técnica y retroalimentación operativa. Esta
					captura de imagen y voz se gestionará bajo estricta
					confidencialidad, garantizando que el material no será
					difundido públicamente ni utilizado con fines
					comerciales. Asimismo, se reconoce el derecho a revocar
					este consentimiento y a solicitar el borrado seguro del
					contenido audiovisual según la normativa vigente de
					protección de datos.
				</Typography>
			</div>
			{!checked && (
				<span className="text-red-500 text-sm ml-10">
					Debe aceptar el consentimiento para guardar
				</span>
			)}
		</div>
	);
};

export default CsadConsentBlock;
