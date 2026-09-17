import React, { useState, useRef } from 'react';
import {
	Button,
	Card,
	CardBody,
	Typography,
	Dialog,
	DialogHeader,
	DialogBody,
	DialogFooter,
	Select,
	Option,
	Alert,
} from '@material-tailwind/react';
import { Upload, X, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { test, testImportResult } from '../../../types/utilities';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../store';
import {
	importCsvQuestions,
	importExcelQuestions,
	fetchTests,
} from '../../../features/testSlice';

interface ExcelUploadComponentProps {
	open: boolean;
	setOpen: (open: boolean) => void;
	courseId: number;
	testList: test[];
}

const ExcelUploadComponent: React.FC<ExcelUploadComponentProps> = ({
	open,
	setOpen,
	courseId,
	testList,
}) => {
	const dispatch = useDispatch<AppDispatch>();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [selectedTest, setSelectedTest] = useState<number | null>(null);
	const [selectedTestQuestionType, setSelectedTestQuestionType] =
		useState<number | null>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [uploading, setUploading] = useState(false);
	const [result, setResult] = useState<testImportResult | null>(null);

	const currentTest = testList.find(
		(test) => test.id === selectedTest,
	);
	const currentQuestionTypes =
		currentTest?.test_question_types || [];

	const handleFileSelect = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		if (file) {
			setSelectedFile(file);
			setResult(null);
		}
	};

	const handleUpload = async () => {
		if (!selectedTest) {
			toast.error('Por favor selecciona un examen');
			return;
		}
		if (!selectedTestQuestionType) {
			toast.error('Por favor selecciona un tipo de pregunta');
			return;
		}
		if (!selectedFile) {
			toast.error('Por favor selecciona un archivo');
			return;
		}

		const testQuestionType = currentQuestionTypes.find(
			(tqt) => tqt.id === selectedTestQuestionType,
		);

		setUploading(true);
		setResult(null);

		try {
			const isCsv =
				selectedFile.name.toLowerCase().endsWith('.csv') ||
				selectedFile.type === 'text/csv';
			const payload = {
				test_id: selectedTest,
				file: selectedFile,
				course_id: courseId,
				test_question_type_id: testQuestionType?.id || -1,
				question_type_id: testQuestionType?.question_type_id,
			};
			const response = isCsv
				? await dispatch(importCsvQuestions(payload)).unwrap()
				: await dispatch(importExcelQuestions(payload)).unwrap();

			setResult(response);
			toast.success(
				`Importadas ${response.questionsImported} preguntas y ${response.answersImported} respuestas`,
			);
			if (courseId) {
				dispatch(fetchTests(courseId));
			}
		} catch (error: any) {
			console.error('Error uploading file:', error);
			toast.error(
				error?.message || 'Error al importar el archivo',
			);
		} finally {
			setUploading(false);
		}
	};

	const resetComponent = () => {
		setSelectedTest(null);
		setSelectedTestQuestionType(null);
		setSelectedFile(null);
		setResult(null);
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
				{/* Seleccionar examen */}
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
						<Typography
							variant="small"
							className="mb-2 font-medium"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							Seleccionar examen:
						</Typography>
						<Select
							value={
								selectedTest !== null
									? selectedTest.toString()
									: undefined
							}
							onChange={(value) => {
								setSelectedTest(value ? parseInt(value) : null);
								setSelectedTestQuestionType(null);
								setResult(null);
							}}
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
					</CardBody>
				</Card>

				{/* Seleccionar tipo de pregunta */}
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
						<Typography
							variant="small"
							className="mb-2 font-medium"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							Seleccionar tipo de pregunta:
						</Typography>
						<Select
							value={
								selectedTestQuestionType !== null &&
								selectedTestQuestionType !== undefined
									? selectedTestQuestionType.toString()
									: undefined
							}
							onChange={(value) => {
								setSelectedTestQuestionType(
									value ? parseInt(value) : null,
								);
								setResult(null);
							}}
							disabled={currentQuestionTypes.length === 0}
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							{currentQuestionTypes.map((tqt) => (
								<Option
									key={tqt.id}
									value={tqt.id.toString()}
								>
									{tqt.question_type?.name || `Tipo ${tqt.id}`}
								</Option>
							))}
						</Select>
						{currentQuestionTypes.length === 0 && (
							<Typography
								variant="small"
								color="gray"
								className="mt-2"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								Selecciona primero un examen.
							</Typography>
						)}
					</CardBody>
				</Card>

				{/* Archivo */}
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
								accept=".xlsx,.xls,.csv"
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
									<span>Seleccionar archivo</span>
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
								<strong>Formato esperado:</strong> el examen
								y tipo de pregunta se envían desde
								este diálogo. Columna RespuestaCorrecta acepta
								el índice (4) o la letra (d).
								<br />
								Planilla en español: Pregunta | Respuesta1..
								RespuestaN | RespuestaCorrecta.
								<br />
								Planilla en inglés (legado): course_id,
								question_type_id, test_question_type_id, header,
								answer_1..answer_5, answer_1_correct..answer_5_correct.
							</Alert>
						</div>
					</CardBody>
				</Card>

				{/* Resultado */}
				{result && (
					<Alert
						color="green"
						icon={<CheckCircle2 size={16} />}
						className="text-sm"
					>
						<strong>Importación completada:</strong>{' '}
						{result.questionsImported} preguntas y{' '}
						{result.answersImported} respuestas importadas
						{result.skippedRows > 0
							? `, ${result.skippedRows} filas omitidas`
							: ''}
						.
					</Alert>
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
					disabled={uploading || !selectedTest || !selectedFile}
					loading={uploading}
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					{uploading ? 'Importando...' : 'Importar Preguntas'}
				</Button>
			</DialogFooter>
		</Dialog>
	);
};

export default ExcelUploadComponent;