import React, { useEffect, useState } from 'react';
import {
	courseStudentTestAnswer,
	courseStudentTestQuestion,
} from '../../../../types/utilities';
import { Typography } from '@material-tailwind/react';
import { axiosPostDefault } from '../../../../services/axios';

const QuestionTypeCompletion = ({
	questionTest,
	countKey,
}: {
	questionTest: courseStudentTestQuestion;
	countKey: number;
	type: number;
}) => {
	const answerLength = questionTest.question?.answers
		? questionTest.question.answers.length
		: 0;
	const loadAnswers: string[] = questionTest
		.course_student_test_answer?.resp
		? JSON.parse(questionTest.course_student_test_answer.resp)
		: Array(answerLength).fill('');
	const [answers, setAnswers] = useState<string[]>(loadAnswers);
	const [hasChange, setHasChange] = useState(false);
	const handleChange = (index: number, value: string) => {
		const newInputs = [...answers];
		newInputs[index] = value;
		setAnswers(newInputs);
		setHasChange(true);
	};

	const saveAnswers = async (resp: string[]) => {
		const CSTA: courseStudentTestAnswer = {
			course_student_test_id: questionTest.course_student_test_id,
			course_student_test_question_id: questionTest.id,
			course_student_id: questionTest.course_student_id,
			student_id: questionTest.student_id,
			question_id: questionTest.question_id,
			resp: JSON.stringify(resp),
			test_id: questionTest.test_id,
			course_id: questionTest.course_id,
		};
		await axiosPostDefault(`api/test/courseStudentTestAnswer`, {
			courseStudentTestAnswer: CSTA,
		});
		console.log('Se guardaron las respuestas ');
	};
	useEffect(() => {
		const interval = setInterval(() => {
			if (hasChange) {
				const nonNullValues = answers.filter(
					(value) => value !== null && value !== ''
				);

				if (nonNullValues.length > 0) {
					saveAnswers(answers);
					setHasChange(false);
				}
			}
		}, 5000);

		return () => clearInterval(interval); // Limpia el intervalo al desmontar el componente
	}, [answers, hasChange, saveAnswers]);
	return (
		<div
			className={`${
				questionTest.Answered ? 'bg-light-green-200' : ''
			} px-5`}
		>
			<Typography
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
				variant="h5"
			>
				Pregunta de dompletacion Nº{countKey + 1}
			</Typography>
			<Typography
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
				variant="h6"
			>
				{questionTest.question?.header}
			</Typography>

			<table className="w-full min-w-max table-auto text-left px-5">
				<thead>
					<tr>
						<th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
							CONDICIÓN DE <br /> OPERACIÓN
						</th>
						<th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
							SHP
						</th>
						<th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
							TORSIÓN <br /> LBS/PIE
						</th>
						<th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
							ITT MAXIMA <br /> OBSERVADA (ºC)
						</th>
						<th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
							GENERADOR DE <br /> GAS RPM N1
						</th>
						<th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
							GENERADOR DE <br /> GAS RPM N1
						</th>
						<th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
							RPM DE <br />
							HELICE N2
						</th>
						<th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
							PRESIÓN DE <br /> ACEITE PSI (2)
						</th>
						<th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
							TEMP. DE <br /> ACEITE ºC
						</th>
					</tr>
				</thead>
				<tbody>
					<tr className="hover:bg-gray-50">
						<td className="">STARTING</td>
						<td className=""></td>
						<td className=""></td>
						<td className=""></td>
						<td className=""></td>
						<td className=""></td>
						<td className=""></td>
						<td className=""></td>
						<td className=""></td>
					</tr>
					<tr className="hover:bg-gray-50">
						<td className="">LOW IDLE</td>
						<td className=""></td>
						<td className=""></td>
						<td className=""></td>
						<td className=""></td>
						<td className=""></td>
						<td className=""></td>
						<td className=""></td>
						<td className=""></td>
					</tr>
					<tr className="hover:bg-gray-50">
						<td className="">HIGH IDEL</td>
						<td className=""></td>
						<td className=""></td>
						<td className=""></td>
						<td className=""></td>
						<td className=""></td>
						<td className=""></td>
						<td className=""></td>
						<td className=""></td>
					</tr>
					<tr className="hover:bg-gray-50">
						<td className="">
							TAKEOFF AND <br /> MAX CONT
						</td>
						<td className=""></td>
						<td className=""></td>
						<td className=""></td>
						<td className=""></td>
						<td className=""></td>
						<td className=""></td>
						<td className=""></td>
						<td className=""></td>
					</tr>
					<tr className="hover:bg-gray-50">
						<td className="">MAX CRUISE</td>
						<td className=""></td>
						<td className=""></td>
						<td className=""></td>
						<td className=""></td>
						<td className=""></td>
						<td className=""></td>
						<td className=""></td>
						<td className=""></td>
					</tr>
					<tr className="hover:bg-gray-50">
						<td className="">
							CRUISE CLIMB AND <br />
							REC (NORMAL) <br />
							CRUISE
						</td>
						<td className=""></td>
						<td className=""></td>
						<td className=""></td>
						<td className=""></td>
						<td className=""></td>
						<td className=""></td>
						<td className=""></td>
						<td className=""></td>
					</tr>
					<tr className="hover:bg-gray-50">
						<td className="">MAX REVERSE (9)</td>
						<td className=""></td>
						<td className=""></td>
						<td className=""></td>
						<td className=""></td>
						<td className=""></td>
						<td className=""></td>
						<td className=""></td>
						<td className=""></td>
					</tr>
					<tr className="hover:bg-gray-50">
						<td className="">TRANSIENT</td>
						<td className=""></td>
						<td className=""></td>
						<td className=""></td>
						<td className=""></td>
						<td className=""></td>
						<td className=""></td>
						<td className=""></td>
						<td className=""></td>
					</tr>
				</tbody>
			</table>
			{/* {questionTest.question?.answers?.length}
			{JSON.stringify(questionTest.question?.answers, null, 4)} */}
		</div>
	);
};

export default QuestionTypeCompletion;
