import { Button, Typography } from '@material-tailwind/react';
import { Mail, Printer, Save } from 'lucide-react';

type Props = {
	isFormDisabled: boolean;
	isSuperuser: boolean;
	consentChecked: boolean;
	onEdit: () => void;
	dayStarted: boolean;
	sendingEmail: boolean;
	printCSA: () => Promise<void>;
	sendCSA: () => Promise<void>;
};

const CsadActionsRow = ({
	isFormDisabled,
	isSuperuser,
	consentChecked,
	onEdit,
	dayStarted,
	sendingEmail,
	printCSA,
	sendCSA,
}: Props) => {
	return (
		<>
			<div className="flex flex-row gap-2">
				{isFormDisabled && (
					<div className="mb-4 flex flex-col sm:flex-row items-center justify-between gap-3">
						{isSuperuser ? (
							<Button
								variant="outlined"
								color="blue"
								onClick={onEdit}
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								Editar
							</Button>
						) : (
							<Typography
								variant="small"
								className="text-slate-700"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								Formulario bloqueado
							</Typography>
						)}
					</div>
				)}
			</div>
			<div className="flex flex-row gap-2">
				<fieldset disabled={isFormDisabled} className="contents">
					<Button
						variant="gradient"
						color="green"
						type="submit"
						title="Guardar datos"
						className="flex flex-row justify-center"
						fullWidth
						disabled={!consentChecked}
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<Save size={15} />
					</Button>
				</fieldset>
				{dayStarted && (
					<Button
						variant="gradient"
						onClick={async () => {
							printCSA();
						}}
						title="imprimir resultados"
						className="flex flex-row justify-center"
						fullWidth
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<Printer size={15} />
					</Button>
				)}
				{dayStarted && (
					<Button
						variant="gradient"
						color="blue"
						onClick={async () => {
							sendCSA();
						}}
						disabled={sendingEmail}
						title="enviar resultados por correo"
						className="flex flex-row justify-center"
						fullWidth
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<Mail size={15} />
					</Button>
				)}
			</div>
		</>
	);
};

export default CsadActionsRow;
