import { Typography } from '@material-tailwind/react';
import {
	CourseState,
	UserState,
	answer,
	testState,
} from '../../../../types/utilities';
import './pdfStyle.css';
import { Check } from 'lucide-react';
import moment from 'moment';

const ResultsTestPdf = ({
	test,
	user,
	course,
}: {
	test: testState;
	course: CourseState;
	user: UserState;
}) => {
	const type_trip = ['', 'PIC', 'SIC', 'TRIP'];
	const license = ['', 'ATP', 'Commercial', 'Privado'];
	const regulation = ['', 'INAC', 'No-INAC'];
	const questions =
		test.courseStudentTestSelected?.course_student_test_questions;
	console.log('Examen', test.courseStudentTestSelected);

	return (
		<div className="printable">
			<div className="flex flex-row justify-between">
				<div className="flex flex-col bg-gray-400 w-full border-4  border-blue-gray-800 p-1 gap-2">
					<div className="flex flex-row justify-around">
						<img
							src="/images/logo.png"
							alt="Descripción de la imagen"
							width={125}
						/>

						<div className="flex-col justify-center text-center">
							<Typography
								variant="h6"
								color="black"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								Curso {course.courseSelected?.course_level.name}{' '}
								{course.courseSelected?.name}
							</Typography>
							<Typography
								variant="h6"
								color="black"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								{course.courseSelected?.description}{' '}
								{course.courseSelected?.course_type.name}
							</Typography>
						</div>
					</div>
					<div className="flex flex-col border-4  border-blue-gray-800  bg-white p-2 ">
						<table className="table-auto ">
							<tbody>
								<tr>
									<td className="border border-green-800 px-2 text-xs">
										<strong> Nombre del Piloto:</strong>
										{user.userSelected?.name}{' '}
										{user.userSelected?.last_name}
									</td>
									<td className="border border-green-800 px-2 col-span-2 text-xs">
										<div className="flex flex-row gap-3">
											<strong>Tipo:</strong>{' '}
											<Check size={15} color="green" />
											{
												type_trip[
													course.courseStudent?.type_trip
														? course.courseStudent.type_trip
														: 0
												]
											}{' '}
										</div>
									</td>
								</tr>
								<tr>
									<td className="border border-green-800 px-2  text-xs">
										<strong>Identificacion:</strong>{' '}
										{user.userSelected?.user_doc_type?.symbol}-
										{user.userSelected?.doc_number}
									</td>
									<td className="border border-green-800 px-2  text-xs">
										<div className="flex flex-row gap-3">
											<strong>Licencia:</strong>
											<Check size={15} color="green" />
											{
												license[
													course.courseStudent?.license
														? course.courseStudent.license
														: 0
												]
											}
										</div>
									</td>
								</tr>
								<tr>
									<td className="border border-green-800 px-2  text-xs">
										<strong>Fecha de inicio:</strong>{' '}
										{moment(course.courseStudent?.date).format(
											'DD-MM-YYYY'
										)}
									</td>

									<td className="border border-green-800 px-2 text-xs">
										<div className="flex flex-row gap-3">
											<strong>Normativa:</strong>{' '}
											<Check size={15} color="green" />
											{
												regulation[
													course.courseStudent?.regulation
														? course.courseStudent.regulation
														: 0
												]
											}
										</div>
									</td>
								</tr>
								<tr>
									<td className="border border-green-800 px-2  text-xs">
										<strong>Correo:</strong>
										{user.userSelected?.email}
									</td>
									<td className="border border-green-800 px-2  text-xs">
										<strong>Telefono:</strong>
										{user.userSelected?.phone}
										<div className="fle flex-row">
											<strong>Pais:</strong>
										</div>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</div>
			<div className="flex flex-col border-4 border-blue-gray-800 p-2 gap-2">
				<div className="text-center">
					<Typography
						variant="h3"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						Respuestas
					</Typography>
				</div>
			</div>

			<div className="flex flex-col">
				{questions?.map((question, index) => {
					let respData: string[] = ['Sin respuesta'];
					let findAnswerMulti: answer | undefined;
					let multiResp: number = 0;
					let findAnswer = null;
					const correctAnswers = question.question?.answers?.filter(
						(QA) => QA.is_correct
					);
					const type = question.question?.question_type_id;

					switch (type) {
						case 1:
							findAnswer = question.question?.answers?.find(
								(ans) =>
									ans.id ===
									parseInt(
										question.course_student_test_answer?.resp
											? question.course_student_test_answer.resp
											: '-1'
									)
							);
							if (findAnswer) {
								respData.shift();
								respData.push(findAnswer.value);
							}

							break;
						case 2:
							findAnswer = JSON.parse(
								question.course_student_test_answer?.resp
									? question.course_student_test_answer.resp
									: ''
							);
							for (const answer of findAnswer) {
								if (answer.check) {
									findAnswerMulti = question.question?.answers?.find(
										(ans) => ans.id === answer.id
									);
									if (findAnswerMulti) {
										multiResp++;
									}
									respData.push(
										findAnswerMulti?.value
											? findAnswerMulti.value
											: ''
									);
								}
							}
							if (multiResp > 0) {
								respData.shift();
							}
							break;
						case 3:
							findAnswer = question.question?.answers?.find(
								(ans) =>
									ans.id ===
									parseInt(
										question.course_student_test_answer?.resp
											? question.course_student_test_answer.resp
											: '-1'
									)
							);
							if (findAnswer) {
								respData.shift();
								respData.push(findAnswer.value);
							}

							break;
						case 4:
							findAnswer = JSON.parse(
								question.course_student_test_answer?.resp
									? question.course_student_test_answer.resp
									: ''
							);

							if (findAnswer.length > 0) {
								respData = findAnswer;
							}

							break;

						case 5:
							findAnswer = JSON.parse(
								question.course_student_test_answer?.resp
									? question.course_student_test_answer.resp
									: ''
							);

							if (findAnswer.length > 0) {
								respData = findAnswer;
							}

							break;

						default:
							break;
					}

					return (
						<div
							key={question.id}
							className="flex flex-col gap-2 border-2 p-2 border-blue-gray-800"
						>
							<div className="text-left">
								Pregunta #{index + 1} (
								{question.question?.question_type?.name}):
								{question.question?.header}
							</div>
							<div className=" flex flex-col text-left px-2 gap-1">
								<div className="flex flex-row gap-2 text-justify">
									<div className="basis-1/2">
										Resp:
										{respData.map((RD, index) => (
											<div key={`Res${question.id}-${index}`}>
												{index + 1}:{RD}
												<br />
											</div>
										))}
									</div>
									<div className="basis-1/2">
										Correcta:
										{correctAnswers?.map((CA, index) => (
											<div key={`CA${question.id}-${CA.id}`}>
												{index + 1}:{CA.value}
												<br />
											</div>
										))}
									</div>
								</div>
								<div className="flex flex-col w-full text-center">
									<Typography
										variant="h5"
										className={
											question.course_student_test_answer?.score
												? 'text-light-green-500'
												: 'text-red-700'
										}
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										Puntaje :
										{question.course_student_test_answer?.score}/
										{question.question?.question_type?.value}
									</Typography>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default ResultsTestPdf;
