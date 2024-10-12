import {
	Accordion,
	AccordionBody,
	AccordionHeader,
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
import { moduloTeoria, participante } from '../../types/utilidades';

const NuevoCurso = () => {
	const [open, setOpen] = useState(1);

	const handleOpen = (value: number) =>
		setOpen(open === value ? 0 : value);
	const [participanteSelec, setParticipanteSelec] =
		useState<participante | null>();
	const personal: participante[] = [
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
		{
			id: 4,
			name: 'Ana',
			lastName: 'Rodriguez',
			nro_doc: 22222222,
			email: 'pedro.lopez@gmail.com',
			country: 'Venezuela',
			tipo: 2,
		},
		{
			id: 5,
			name: 'Jose',
			lastName: 'Clark',
			nro_doc: 33333333,
			email: 'jose.Clark@gmail.com',
			country: 'Argentina',
			tipo: 2,
		},
	];
	const participantes: participante[] = personal.filter(
		(part) => part.tipo === 1
	);
	const instructores: participante[] = personal.filter(
		(part) => part.tipo === 2
	);
	const modulos: moduloTeoria[] = [
		{
			id: 0,
			name: 'Bienvenida/Papeleo',
			hours: 0.25,
		},
		{
			id: 1,
			name: 'Generalidades de la Aeronave/ Procedimientos Operacionales / Plan de vuelo/ Maniobras. ',
			hours: 7.75,
		},
		{
			id: 2,
			name: 'Peso y Balance, Planificación y  Performance ',
			hours: 8,
		},
		{
			id: 3,
			name: 'Sistema eléctrico, Iluminación y Panel de Advertencia',
			hours: 3,
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
					<div className="">
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
									<div className="flex flex-row gap-3">
										<Typography
											variant="h6"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											Número de Identificación <br /> del Piloto
										</Typography>
										<Typography
											variant="paragraph"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											{participanteSelec.nro_doc}
										</Typography>
										<Typography
											variant="h6"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											Pais
										</Typography>
										<Typography
											variant="paragraph"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											{participanteSelec.country}
										</Typography>
									</div>
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
					<Accordion
						open={open === 1}
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<AccordionHeader
							onClick={() => handleOpen(1)}
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							Modulos del curso
						</AccordionHeader>
						<AccordionBody>
							<div className="flex flex-col gap-2 ">
								{modulos.map((modulo) => (
									<div
										key={modulo.id}
										className="flex flex-row gap-4 rounded-md border border-blue-gray-300"
									>
										<div className="grid grid-cols-4 gap-4 py-2 px-2">
											<div className="flex flex-row gap-2">
												<Typography
													variant="h6"
													className="w-60"
													placeholder={undefined}
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
												>
													{modulo.name}
												</Typography>
											</div>
											<div className="flex flex-row gap-2">
												<Input
													type="date"
													label="Fecha"
													required={true}
													crossOrigin={undefined}
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
												/>
											</div>
											<div className="flex flex-row gap-2">
												<Input
													type="number"
													inputMode="numeric"
													label="Horas "
													className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
													crossOrigin={undefined}
												/>
												<Typography
													variant="h6"
													className="w-60"
													placeholder={undefined}
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
												>
													Max:{modulo.hours}
												</Typography>
											</div>
											<div className="flex flex-row gap-2">
												<Select
													label="Selecionar Instructor"
													placeholder={undefined}
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
												>
													{instructores.map((instr) => (
														<Option
															key={instr.id}
															value={`${instr.id}`}
														>
															{instr.name} {instr.lastName}
														</Option>
													))}
												</Select>
											</div>
										</div>
									</div>
								))}
							</div>
						</AccordionBody>
					</Accordion>
					<Accordion
						open={open === 2}
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<AccordionHeader
							onClick={() => handleOpen(2)}
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							Resultados
						</AccordionHeader>
						<AccordionBody>
							We&apos;re not always in the position that we want to be
							at. We&apos;re constantly growing. We&apos;re constantly
							making mistakes. We&apos;re constantly trying to express
							ourselves and actualize our dreams.
						</AccordionBody>
					</Accordion>
				</CardBody>
			</Card>
		</div>
	);
};

export default NuevoCurso;
