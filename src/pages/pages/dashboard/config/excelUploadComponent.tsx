import React, { useState, useRef } from 'react';
import {
	Button,
	Card,
	CardBody,
	Typography,
	Collapse,
	Dialog,
	DialogHeader,
	DialogBody,
	DialogFooter,
	Select,
	Option,
	Alert,
} from '@material-tailwind/react';
import {
	Upload,
	X,
	FileText,
	Check,
	AlertCircle,
} from 'lucide-react';
import { questionType, test } from '../../../../types/utilities';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

interface ExcelUploadComponentProps {
	open: boolean;
	setOpen: (open: boolean) => void;
	courseId: number;
	questionTypes: questionType[];
	testList: test[];
}

interface ExcelQuestion {
	header: string;
	answers: string[];
	correctAnswer: number;
	questionType: string;
}

interface QuestionTypeUpload {
	questionType: questionType;
	questions: ExcelQuestion[];
	selectedTest: number | null;
}

const ExcelUploadComponent: React.FC<ExcelUploadComponentProps> = ({
	open,
	setOpen,
	courseId,
	questionTypes,
	testList,
}) => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [uploading, setUploading] = useState(false);
	const [parsedData, setParsedData] = useState<QuestionTypeUpload[]>(
		[]
	);
	const [collapseStates, setCollapseStates] = useState<{
		[key: string]: boolean;
	}>({});
	console.log(courseId);

	const handleFileSelect = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = event.target.files?.[0];
		if (file) {
			if (
				file.type ===
					'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
				file.type === 'application/vnd.ms-excel'
			) {
				setSelectedFile(file);
				parseExcelFile(file);
			} else {
				toast.error(
					'Por favor selecciona un archivo Excel válido (.xlsx o .xls)'
				);
			}
		}
	};

	const parseExcelFile = (file: File) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const data = new Uint8Array(e.target?.result as ArrayBuffer);
				const workbook = XLSX.read(data, { type: 'array' });

				const questionTypeData: QuestionTypeUpload[] = [];

				// Process each sheet (assuming each sheet represents a question type)
				workbook.SheetNames.forEach((sheetName) => {
					const worksheet = workbook.Sheets[sheetName];
					const jsonData = XLSX.utils.sheet_to_json(worksheet, {
						header: 1,
					});

					// Find matching question type
					const matchingQuestionType = questionTypes.find(
						(qt) =>
							qt.name
								.toLowerCase()
								.includes(sheetName.toLowerCase()) ||
							sheetName.toLowerCase().includes(qt.name.toLowerCase())
					);

					if (matchingQuestionType && jsonData.length > 1) {
						const questions: ExcelQuestion[] = [];

						// Skip header row and process data rows
						for (let i = 1; i < jsonData.length; i++) {
							const row = jsonData[i] as any[];
							if (row.length >= 3) {
								const header = row[0]?.toString() || '';
								const answers: string[] = [];
								let correctAnswer = 1;

								// Extract answers based on question type max_answer
								for (
									let j = 1;
									j <= matchingQuestionType.max_answer;
									j++
								) {
									if (row[j]) {
										answers.push(row[j].toString());
									}
								}

								// Find correct answer column (after all answer columns)
								const correctAnswerColumn =
									matchingQuestionType.max_answer + 1;
								if (row[correctAnswerColumn]) {
									correctAnswer =
										parseInt(row[correctAnswerColumn].toString()) ||
										1;
								}

								if (header && answers.length > 0) {
									questions.push({
										header,
										answers,
										correctAnswer,
										questionType: matchingQuestionType.name,
									});
								}
							}
						}

						if (questions.length > 0) {
							questionTypeData.push({
								questionType: matchingQuestionType,
								questions,
								selectedTest: null,
							});
						}
					}
				});

				setParsedData(questionTypeData);

				// Initialize collapse states
				const initialCollapseStates: { [key: string]: boolean } = {};
				questionTypeData.forEach((qtd) => {
					initialCollapseStates[qtd.questionType.name] = false;
				});
				setCollapseStates(initialCollapseStates);

				if (questionTypeData.length === 0) {
					toast.error(
						'No se encontraron tipos de pregunta válidos en el archivo Excel'
					);
				} else {
					toast.success(
						`Se encontraron ${questionTypeData.length} tipos de pregunta`
					);
				}
			} catch (error) {
				console.error('Error parsing Excel file:', error);
				toast.error('Error al procesar el archivo Excel');
			}
		};
		reader.readAsArrayBuffer(file);
	};

	const toggleCollapse = (questionTypeName: string) => {
		setCollapseStates((prev) => ({
			...prev,
			[questionTypeName]: !prev[questionTypeName],
		}));
	};

	const handleTestSelection = (
		questionTypeName: string,
		testId: number
	) => {
		setParsedData((prev) =>
			prev.map((qtd) =>
				qtd.questionType.name === questionTypeName
					? { ...qtd, selectedTest: testId }
					: qtd
			)
		);
	};

	const handleUpload = async () => {
		if (!selectedFile || parsedData.length === 0) {
			toast.error('No hay datos para subir');
			return;
		}

		// Validate all question types have selected tests
		const invalidQuestionTypes = parsedData.filter(
			(qtd) => qtd.selectedTest === null
		);
		if (invalidQuestionTypes.length > 0) {
			toast.error(
				'Por favor selecciona un examen para todos los tipos de pregunta'
			);
			return;
		}

		setUploading(true);

		try {
			// Here you would implement the actual upload logic
			// For now, we'll just simulate the upload
			await new Promise((resolve) => setTimeout(resolve, 2000));

			// TODO: Implement actual API call to upload questions
			// const uploadPromises = parsedData.map(qtd =>
			// 	uploadQuestionsToBackend(qtd.questions, qtd.selectedTest!, qtd.questionType)
			// );
			// await Promise.all(uploadPromises);

			toast.success('Preguntas subidas exitosamente');
			setOpen(false);
			resetComponent();
		} catch (error) {
			console.error('Error uploading questions:', error);
			toast.error('Error al subir las preguntas');
		} finally {
			setUploading(false);
		}
	};

	const resetComponent = () => {
		setSelectedFile(null);
		setParsedData([]);
		setCollapseStates({});
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	const handleClose = () => {
		setOpen(false);
		resetComponent();
	};

	return (
		<Dialog
			open={open}
			handler={handleClose}
			size="xl"
			className="max-h-[90vh] overflow-y-auto"
			placeholder={undefined}
			onPointerEnterCapture={undefined}
			onPointerLeaveCapture={undefined}
		>
			<DialogHeader
				className="flex items-center justify-between"
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				<Typography
					variant="h5"
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					Subir Preguntas desde Excel
				</Typography>
				<Button
					variant="text"
					size="sm"
					onClick={handleClose}
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					<X size={20} />
				</Button>
			</DialogHeader>

			<DialogBody
				className="space-y-4"
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				{/* File Upload Section */}
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
						<div className="flex flex-col items-center space-y-4">
							<input
								ref={fileInputRef}
								type="file"
								accept=".xlsx,.xls"
								onChange={handleFileSelect}
								className="hidden"
							/>

							<div className="flex items-center space-x-4">
								<Button
									variant="outlined"
									onClick={() => fileInputRef.current?.click()}
									className="flex items-center space-x-2"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									<Upload size={20} />
									<span>Seleccionar archivo Excel</span>
								</Button>

								{selectedFile && (
									<div className="flex items-center space-x-2 text-green-600">
										<FileText size={16} />
										<span className="text-sm">
											{selectedFile.name}
										</span>
									</div>
								)}
							</div>

							<Alert
								color="blue"
								icon={<AlertCircle size={16} />}
								className="text-sm"
							>
								<strong>Formato esperado:</strong> Cada hoja debe
								corresponder a un tipo de pregunta. Columnas:
								Pregunta, Respuesta1, Respuesta2, ...,
								RespuestaCorrecta (número)
							</Alert>
						</div>
					</CardBody>
				</Card>

				{/* Parsed Data Section */}
				{parsedData.length > 0 && (
					<div className="space-y-4">
						<Typography
							variant="h6"
							className="text-center"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							Datos procesados del archivo Excel
						</Typography>

						{parsedData.map((qtData, index) => (
							<Card
								key={index}
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								<CardBody
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									<div className="space-y-4">
										<div className="flex items-center justify-between">
											<Typography
												variant="h6"
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												{qtData.questionType.name} (
												{qtData.questions.length} preguntas)
											</Typography>
											<Button
												variant="text"
												size="sm"
												onClick={() =>
													toggleCollapse(qtData.questionType.name)
												}
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												{collapseStates[qtData.questionType.name]
													? 'Ocultar'
													: 'Mostrar'}
											</Button>
										</div>

										<div className="w-72">
											<Typography
												variant="small"
												className="mb-2"
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												Seleccionar examen:
											</Typography>
											<Select
												value={qtData.selectedTest?.toString() || ''}
												onChange={(value) =>
													handleTestSelection(
														qtData.questionType.name,
														parseInt(value!)
													)
												}
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												{testList.map((test) => (
													<Option
														key={test.id}
														value={test.id.toString()}
													>
														{test.code} -{' '}
														{test.status ? 'Activo' : 'Inactivo'}
													</Option>
												))}
											</Select>
										</div>

										<Collapse
											open={collapseStates[qtData.questionType.name]}
										>
											<div className="space-y-3 mt-4">
												{qtData.questions.map((question, qIndex) => (
													<Card
														key={qIndex}
														className="border border-gray-300"
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
													>
														<CardBody
															className="py-3"
															placeholder={undefined}
															onPointerEnterCapture={undefined}
															onPointerLeaveCapture={undefined}
														>
															<Typography
																variant="small"
																className="font-medium mb-2"
																placeholder={undefined}
																onPointerEnterCapture={undefined}
																onPointerLeaveCapture={undefined}
															>
																Pregunta {qIndex + 1}:{' '}
																{question.header}
															</Typography>
															<div className="space-y-1">
																{question.answers.map(
																	(answer, aIndex) => (
																		<div
																			key={aIndex}
																			className="flex items-center space-x-2"
																		>
																			{question.correctAnswer ===
																				aIndex + 1 && (
																				<Check
																					size={16}
																					className="text-green-600"
																				/>
																			)}
																			<Typography
																				variant="small"
																				className={
																					question.correctAnswer ===
																					aIndex + 1
																						? 'text-green-600 font-medium'
																						: ''
																				}
																				placeholder={undefined}
																				onPointerEnterCapture={
																					undefined
																				}
																				onPointerLeaveCapture={
																					undefined
																				}
																			>
																				{aIndex + 1}. {answer}
																			</Typography>
																		</div>
																	)
																)}
															</div>
														</CardBody>
													</Card>
												))}
											</div>
										</Collapse>
									</div>
								</CardBody>
							</Card>
						))}
					</div>
				)}
			</DialogBody>

			<DialogFooter
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				<Button
					variant="text"
					onClick={handleClose}
					className="mr-2"
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					Cancelar
				</Button>
				<Button
					variant="filled"
					onClick={handleUpload}
					disabled={uploading || parsedData.length === 0}
					loading={uploading}
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					{uploading ? 'Subiendo...' : 'Subir Preguntas'}
				</Button>
			</DialogFooter>
		</Dialog>
	);
};

export default ExcelUploadComponent;
