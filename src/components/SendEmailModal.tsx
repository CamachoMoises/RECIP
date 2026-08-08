import {
	Button,
	Dialog,
	DialogBody,
	DialogFooter,
	DialogHeader,
	Input,
	Radio,
	Typography,
} from '@material-tailwind/react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Props {
	open: boolean;
	onClose: () => void;
	participantEmail?: string;
	participantName?: string;
	sending?: boolean;
	onSend: (to: string) => void;
}

const SendEmailModal = ({
	open,
	onClose,
	participantEmail,
	participantName,
	sending,
	onSend,
}: Props) => {
	const [mode, setMode] = useState<'participant' | 'custom'>(
		'participant',
	);
	const [customEmail, setCustomEmail] = useState('');
	const [emailError, setEmailError] = useState('');

	const hasParticipantEmail = !!participantEmail;

	const handleSend = () => {
		if (mode === 'participant') {
			if (!participantEmail) {
				toast.error('El participante no tiene email registrado');
				return;
			}
			onSend(participantEmail);
			return;
		}

		const email = customEmail.trim();
		if (!email) {
			setEmailError('El correo es requerido');
			return;
		}
		if (!EMAIL_REGEX.test(email)) {
			setEmailError('Ingresa un correo electrónico válido');
			return;
		}
		setEmailError('');
		onSend(email);
	};

	const selectCustom = () => {
		setMode('custom');
		setEmailError('');
	};

	const selectParticipant = () => {
		setMode('participant');
		setEmailError('');
	};

	return (
		<Dialog
			open={open}
			handler={onClose}
			placeholder={undefined}
			onPointerEnterCapture={undefined}
			onPointerLeaveCapture={undefined}
		>
			<DialogHeader
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				Enviar documento
			</DialogHeader>
			<DialogBody
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				<div className="flex flex-col gap-4">
					<div className="flex items-start gap-3 rounded-lg border border-blue-gray-200 bg-white p-3">
						<Radio
							name="email_destination"
							checked={mode === 'participant'}
							onChange={selectParticipant}
							disabled={!hasParticipantEmail}
							label="Enviar participante"
							color="blue"
							crossOrigin={undefined}
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						/>
						<div className="flex flex-col">
							{hasParticipantEmail ? (
								<Typography
									variant="small"
									className="text-blue-gray-600"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									{participantName
										? `${participantName} `
										: ''}
									({participantEmail})
								</Typography>
							) : (
								<Typography
									variant="small"
									color="red"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									El participante no tiene email
									registrado
								</Typography>
							)}
						</div>
					</div>
					<div className="flex flex-col gap-3 rounded-lg border border-blue-gray-200 bg-white p-3">
						<Radio
							name="email_destination"
							checked={mode === 'custom'}
							onChange={selectCustom}
							label="Enviar a destinatario"
							color="blue"
							crossOrigin={undefined}
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						/>
						{mode === 'custom' && (
							<>
								<Input
									type="email"
									label="Correo electrónico"
									value={customEmail}
									onChange={(e) => {
										setCustomEmail(e.target.value);
										setEmailError('');
									}}
									error={!!emailError}
									crossOrigin={undefined}
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								/>
								{emailError && (
									<span className="text-sm text-red-500">
										{emailError}
									</span>
								)}
							</>
						)}
					</div>
				</div>
			</DialogBody>
			<DialogFooter
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				<Button
					variant="text"
					color="red"
					onClick={onClose}
					disabled={sending}
					className="mr-2"
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					Cancelar
				</Button>
				<Button
					variant="gradient"
					color="blue"
					onClick={handleSend}
					disabled={sending}
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					Enviar
				</Button>
			</DialogFooter>
		</Dialog>
	);
};

export default SendEmailModal;
