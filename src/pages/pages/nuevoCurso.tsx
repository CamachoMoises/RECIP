import {
	Card,
	CardBody,
	Checkbox,
	Input,
	Option,
	Radio,
	Select,
	Typography,
} from '@material-tailwind/react';
import { useState } from 'react';
import { participante } from '../../types/utilidades';

const NuevoCurso = () => {
	const [participanteSelec, setParticipanteSelec] =
		useState<participante | null>();
	const participantes: participante[] = [
		{
			id: 1,
			name: 'Juan',
			lastName: 'Perez',
			nro_doc: 12345678,
			email: 'juan.perez@gmail.com',
			country: 'Argentina',
			tipo: 1,
		},
		{
			id: 2,
			name: 'Maria',
			lastName: 'Garcia',
			nro_doc: 98765432,
			email: 'maria.garcia@gmail.com',
			country: 'Chile',
			tipo: 1,
		},
		{
			id: 3,
			name: 'Pedro',
			lastName: 'Lopez',
			nro_doc: 11111111,
			email: 'pedro.lopez@gmail.com',
			country: 'Uruguay',
			tipo: 1,
		},
	];
	const handlePartipante = (value: string | undefined) => {
		const ps = participantes.find(
			(part) => part.id == parseInt(value ? value : '-1')
		);
		if (ps) {
			setParticipanteSelec(ps);
		}
	};
	return (
		<div className="content-center">
			<Card
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				<CardBody
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					<div className="c">
						<Typography
							variant="h5"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							King Air B200 Curso de Entrenamiento Inicial
							Verificación de Competencia/Calificación del Piloto
							Registro de Entrenamiento de Escuela en Tierra
						</Typography>
					</div>
					<hr />
					<div className="grid grid-cols-2 gap-4 py-2">
						<div className="flex flex-col gap-2">
							<div className="w-72">
								<Select
									label="Selecionar estudiante"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
									onChange={(e) => {
										handlePartipante(e);
									}}
								>
									{participantes.map((participante) => (
										<Option
											key={participante.id}
											value={`${participante.id}`}
										>
											{participante.name} {participante.lastName}
										</Option>
									))}
								</Select>
							</div>

							{participanteSelec && (
								<>
									<Typography
										variant="small"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										{participanteSelec.nro_doc}
									</Typography>
								</>
							)}
							<Input
								type="date"
								label="Fecha de inicio"
								required={true}
								crossOrigin={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							/>
						</div>
						<div className="flex flex-col w-max ">
							<div className="flex flex-row w-max gap-4 px-20">
								<Checkbox
									color="red"
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
									crossOrigin={undefined}
								/>
								<Typography
									variant="small"
									className="pt-3"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									PIC
								</Typography>

								<Checkbox
									color="red"
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
									crossOrigin={undefined}
								/>
								<Typography
									variant="small"
									className="pt-3"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									SIC
								</Typography>
							</div>
							<div className="flex flex-row w-max gap-4">
								<Typography
									variant="h6"
									className="pt-2"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									Licencia
								</Typography>

								<div className="flex gap-10">
									<Radio
										name="licencia"
										label="ATP"
										color="red"
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
										crossOrigin={undefined}
									/>
									<Radio
										name="licencia"
										label="Commercial"
										color="red"
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
										crossOrigin={undefined}
									/>

									<Radio
										name="licencia"
										label="Private"
										defaultChecked
										color="red"
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
										crossOrigin={undefined}
									/>
								</div>
							</div>
							<div className="flex flex-row w-max gap-4">
								<Typography
									variant="h6"
									className="pt-2"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									Cumplimiento de la Normativa
								</Typography>

								<div className="flex gap-10">
									<Radio
										name="cump"
										label="INAC"
										color="red"
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
										crossOrigin={undefined}
									/>
									<Radio
										name="cump"
										label="No-INAC"
										defaultChecked
										color="red"
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
										crossOrigin={undefined}
									/>
								</div>
							</div>
						</div>
					</div>

					<hr />
				</CardBody>
			</Card>
		</div>
	);
};

export default NuevoCurso;
