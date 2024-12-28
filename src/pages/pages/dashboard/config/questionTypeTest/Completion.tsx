import { useState } from 'react';
import { answer, question } from '../../../../../types/utilities';
import { Button } from '@material-tailwind/react';
// import { axiosPostDefault } from '../../../../services/axios';
import { Minus, Save } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../../store';
import { updateAnswerQuestionTest } from '../../../../../features/testSlice';
import QuestionHeader from './components/questionHeader';

const TestCompletion = ({
	question,
}: {
	question: question;
	type: number;
}) => {
	const dispatch = useDispatch<AppDispatch>();
	const [editHeader, setEditHeader] = useState(false);

	const answerLength = question?.answers
		? question.answers.length
		: 0;
	const loadAnswers: string[] = question.answers
		? question.answers.map((answer) => {
				return answer.value;
		  })
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
		if (question.answers) {
			for (let index = 0; index < question.answers.length; index++) {
				const oldAnswer = question.answers[index];
				const newAnswer = resp[index];
				if (oldAnswer.value != newAnswer) {
					const newAnswerData: answer = {
						...oldAnswer,
						value: newAnswer,
					};
					await dispatch(
						updateAnswerQuestionTest({
							answerData: newAnswerData,
							question_id: question.id,
						})
					);
				}
			}
		}
		console.log('Se guardaron las respuestas ');
	};

	const handleSaveAnswer = async () => {
		if (hasChange) {
			const nonNullValues = answers.filter(
				(value) => value !== null && value !== ''
			);

			if (nonNullValues.length > 0) {
				saveAnswers(answers);
				setHasChange(false);
			}
		}
	};

	// useEffect(() => {
	// 	const interval = setInterval(() => {

	// 	}, 5000);

	// 	return () => clearInterval(interval); // Limpia el intervalo al desmontar el componente
	// }, [answers, hasChange, saveAnswers]);

	return (
		<div>
			<QuestionHeader
				question={question}
				editHeader={editHeader}
				editAnswer={false}
				setEditHeader={setEditHeader}
			/>
			<br />
			{answerLength === 44 && (
				<table className="table-auto text-left px-5 overflow-scroll">
					<thead>
						<tr>
							<th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4 text-center">
								CONDICIÓN DE <br /> OPERACIÓN
							</th>
							<th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4 text-center">
								SHP
							</th>
							<th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4 text-center">
								TORSIÓN <br /> LBS/PIE
							</th>
							<th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4 text-center">
								ITT MAXIMA <br /> OBSERVADA (ºC)
							</th>
							<th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4 text-center">
								GENERADOR DE <br /> GAS RPM N1
							</th>
							<th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4 text-center">
								GENERADOR DE <br /> GAS RPM N1
							</th>
							<th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4 text-center">
								RPM DE <br />
								HELICE N2
							</th>
							<th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4 text-center">
								PRESIÓN DE <br /> ACEITE PSI (2)
							</th>
							<th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4 text-center">
								TEMP. DE <br /> ACEITE ºC
							</th>
						</tr>
					</thead>
					<tbody>
						<tr className="hover:bg-gray-50">
							<td className="text-center">STARTING</td>
							<td className="text-center">
								<div className="flex flex-row w-full justify-center">
									<Minus color="red" />
								</div>
							</td>
							<td className="text-center">
								<div className="flex flex-row w-full justify-center">
									<Minus color="red" />
								</div>
							</td>
							<td className="text-center">
								<div className="flex items-center rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
									<input
										type="text"
										name="price"
										id="price"
										onChange={(e) => handleChange(0, e.target.value)}
										value={answers[0] === undefined ? '' : answers[0]}
										className="py-1.5 w-24 px-3 block min-w-0 text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
									/>
								</div>
							</td>
							<td className="text-center">
								<div className="flex flex-row w-full justify-center">
									<Minus color="red" />
								</div>
							</td>
							<td className="text-center">
								<div className="flex flex-row w-full justify-center">
									<Minus color="red" />
								</div>
							</td>
							<td className="text-center">
								<div className="flex flex-row w-full justify-center">
									<Minus color="red" />
								</div>
							</td>
							<td className="text-center">
								<div className="flex flex-row w-full justify-center">
									<Minus color="red" />
								</div>
							</td>
							<td className="text-center">
								<div className="flex items-center rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
									<input
										type="text"
										name="price"
										id="price"
										onChange={(e) => handleChange(1, e.target.value)}
										value={answers[1] === undefined ? '' : answers[1]}
										className="py-1.5 w-24 px-3 block text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
									/>
								</div>
							</td>
						</tr>
						<tr className="hover:bg-gray-50">
							<td className="text-center">LOW IDLE</td>
							<td className="text-center">
								<div className="flex flex-row w-full justify-center">
									<Minus color="red" />
								</div>
							</td>
							<td className="text-center">
								<div className="flex flex-row w-full justify-center">
									<Minus color="red" />
								</div>
							</td>
							<td className="text-center">
								<div className="flex items-center rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
									<input
										type="text"
										name="price"
										id="price"
										onChange={(e) => handleChange(2, e.target.value)}
										value={answers[2] === undefined ? '' : answers[2]}
										className="py-1.5 w-24 px-3 block text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
									/>
								</div>
							</td>
							<td className="text-center">
								<div className="flex items-center rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
									<input
										type="text"
										name="price"
										id="price"
										onChange={(e) => handleChange(3, e.target.value)}
										value={answers[3] === undefined ? '' : answers[3]}
										className="py-1.5 w-24 px-3 block text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
									/>
								</div>
							</td>
							<td className="text-center">
								<div className="flex items-center rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
									<input
										type="text"
										name="price"
										id="price"
										onChange={(e) => handleChange(4, e.target.value)}
										value={answers[4] === undefined ? '' : answers[4]}
										className="py-1.5 w-24 px-3 block text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
									/>
								</div>
							</td>
							<td className="text-center">
								<div className="flex flex-row w-full justify-center">
									<Minus color="red" />
								</div>
							</td>
							<td className="text-center">
								<div className="flex items-center rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
									<input
										type="text"
										name="price"
										id="price"
										onChange={(e) => handleChange(5, e.target.value)}
										value={answers[5] === undefined ? '' : answers[5]}
										className="py-1.5 w-24 px-3 block text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
									/>
								</div>
							</td>
							<td className="text-center">
								<div className="flex items-center rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
									<input
										type="text"
										name="price"
										id="price"
										onChange={(e) => handleChange(6, e.target.value)}
										value={answers[6] === undefined ? '' : answers[6]}
										className="py-1.5 w-24 px-3 block text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
									/>
								</div>
							</td>
						</tr>
						<tr className="hover:bg-gray-50">
							<td className="text-center">HIGH IDEL</td>
							<td className="text-center">
								<div className="flex flex-row w-full justify-center">
									<Minus color="red" />
								</div>
							</td>
							<td className="text-center">
								<div className="flex flex-row w-full justify-center">
									<Minus color="red" />
								</div>
							</td>
							<td className="text-center">
								<div className="flex flex-row w-full justify-center">
									<Minus color="red" />
								</div>
							</td>
							<td className="text-center">
								<div className="flex flex-row w-full justify-center">
									<Minus color="red" />
								</div>
							</td>
							<td className="text-center">
								<div className="flex flex-row w-full justify-center">
									<Minus color="red" />
								</div>
							</td>
							<td className="text-center">
								<div className="flex flex-row w-full justify-center">
									<Minus color="red" />
								</div>
							</td>
							<td className="text-center">
								<div className="flex flex-row w-full justify-center">
									<Minus color="red" />
								</div>
							</td>
							<td className="text-center">
								<div className="flex items-center rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
									<input
										type="text"
										name="price"
										id="price"
										onChange={(e) => handleChange(7, e.target.value)}
										value={answers[7] === undefined ? '' : answers[7]}
										className="py-1.5 w-24 px-3 block text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
									/>
								</div>
							</td>
						</tr>
						<tr className="hover:bg-gray-50">
							<td className="text-center">
								TAKEOFF AND <br /> MAX CONT
							</td>
							<td className="text-center">
								<div className="flex items-center rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
									<input
										type="text"
										name="price"
										id="price"
										onChange={(e) => handleChange(8, e.target.value)}
										value={answers[8] === undefined ? '' : answers[8]}
										className="py-1.5 w-24 px-3 block text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
									/>
								</div>
							</td>
							<td className="text-center">
								<div className="flex items-center rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
									<input
										type="text"
										name="price"
										id="price"
										onChange={(e) => handleChange(9, e.target.value)}
										value={answers[9] === undefined ? '' : answers[9]}
										className="py-1.5 w-24 px-3 block text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
									/>
								</div>
							</td>
							<td className="text-center">
								<div className="flex items-center rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
									<input
										type="text"
										name="price"
										id="price"
										onChange={(e) => handleChange(10, e.target.value)}
										value={
											answers[10] === undefined ? '' : answers[10]
										}
										className="py-1.5 w-24 px-3 block text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
									/>
								</div>
							</td>
							<td className="text-center">
								<div className="flex items-center rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
									<input
										type="text"
										name="price"
										id="price"
										onChange={(e) => handleChange(11, e.target.value)}
										value={
											answers[11] === undefined ? '' : answers[11]
										}
										className="py-1.5 w-24 px-3 block text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
									/>
								</div>
							</td>
							<td className="text-center">
								<div className="flex items-center rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
									<input
										type="text"
										name="price"
										id="price"
										onChange={(e) => handleChange(12, e.target.value)}
										value={
											answers[12] === undefined ? '' : answers[12]
										}
										className="py-1.5 w-24 px-3 block text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
									/>
								</div>
							</td>
							<td className="text-center">
								<div className="flex items-center rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
									<input
										type="text"
										name="price"
										id="price"
										onChange={(e) => handleChange(13, e.target.value)}
										value={
											answers[13] === undefined ? '' : answers[13]
										}
										className="py-1.5 w-24 px-3 block text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
									/>
								</div>
							</td>
							<td className="text-center">
								<div className="flex items-center rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
									<input
										type="text"
										name="price"
										id="price"
										onChange={(e) => handleChange(14, e.target.value)}
										value={
											answers[14] === undefined ? '' : answers[14]
										}
										className="py-1.5 w-24 px-3 block text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
									/>
								</div>
							</td>
							<td className="text-center">
								<div className="flex items-center rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
									<input
										type="text"
										name="price"
										id="price"
										onChange={(e) => handleChange(15, e.target.value)}
										value={
											answers[15] === undefined ? '' : answers[15]
										}
										className="py-1.5 w-24 px-3 block text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
									/>
								</div>
							</td>
						</tr>
						<tr className="hover:bg-gray-50">
							<td className="text-center">MAX CRUISE</td>
							<td className="text-center">
								<div className="flex items-center rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
									<input
										type="text"
										name="price"
										id="price"
										onChange={(e) => handleChange(16, e.target.value)}
										value={
											answers[16] === undefined ? '' : answers[16]
										}
										className="py-1.5 w-24 px-3 block text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
									/>
								</div>
							</td>
							<td className="text-center">
								<div className="flex items-center rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
									<input
										type="text"
										name="price"
										id="price"
										onChange={(e) => handleChange(17, e.target.value)}
										value={
											answers[17] === undefined ? '' : answers[17]
										}
										className="py-1.5 w-24 px-3 block text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
									/>
								</div>
							</td>
							<td className="text-center">
								<div className="flex items-center rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
									<input
										type="text"
										name="price"
										id="price"
										onChange={(e) => handleChange(18, e.target.value)}
										value={
											answers[18] === undefined ? '' : answers[18]
										}
										className="py-1.5 w-24 px-3 block text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
									/>
								</div>
							</td>
							<td className="text-center">
								<div className="flex items-center rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
									<input
										type="text"
										name="price"
										id="price"
										onChange={(e) => handleChange(19, e.target.value)}
										value={
											answers[19] === undefined ? '' : answers[19]
										}
										className="py-1.5 w-24 px-3 block text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
									/>
								</div>
							</td>
							<td className="text-center">
								<div className="flex items-center rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
									<input
										type="text"
										name="price"
										id="price"
										onChange={(e) => handleChange(20, e.target.value)}
										value={
											answers[20] === undefined ? '' : answers[20]
										}
										className="py-1.5 w-24 px-3 block text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
									/>
								</div>
							</td>
							<td className="text-center">
								<div className="flex items-center rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
									<input
										type="text"
										name="price"
										id="price"
										onChange={(e) => handleChange(21, e.target.value)}
										value={
											answers[21] === undefined ? '' : answers[21]
										}
										className="py-1.5 w-24 px-3 block text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
									/>
								</div>
							</td>
							<td className="text-center">
								<div className="flex items-center rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
									<input
										type="text"
										name="price"
										id="price"
										onChange={(e) => handleChange(22, e.target.value)}
										value={
											answers[22] === undefined ? '' : answers[22]
										}
										className="py-1.5 w-24 px-3 block text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
									/>
								</div>
							</td>
							<td className="text-center">
								<div className="flex items-center rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
									<input
										type="text"
										name="price"
										id="price"
										onChange={(e) => handleChange(23, e.target.value)}
										value={
											answers[23] === undefined ? '' : answers[23]
										}
										className="py-1.5 w-24 px-3 block text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
									/>
								</div>
							</td>
						</tr>
						<tr className="hover:bg-gray-50">
							<td className="text-center">
								CRUISE CLIMB AND <br />
								REC (NORMAL) <br />
								CRUISE
							</td>
							<td className="text-center">
								<div className="flex items-center rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
									<input
										type="text"
										name="price"
										id="price"
										onChange={(e) => handleChange(24, e.target.value)}
										value={
											answers[24] === undefined ? '' : answers[24]
										}
										className="py-1.5 w-24 px-3 block text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
									/>
								</div>
							</td>
							<td className="text-center">
								<div className="flex items-center rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
									<input
										type="text"
										name="price"
										id="price"
										onChange={(e) => handleChange(25, e.target.value)}
										value={
											answers[25] === undefined ? '' : answers[25]
										}
										className="py-1.5 w-24 px-3 block text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
									/>
								</div>
							</td>
							<td className="text-center">
								<div className="flex items-center rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
									<input
										type="text"
										name="price"
										id="price"
										onChange={(e) => handleChange(26, e.target.value)}
										value={
											answers[26] === undefined ? '' : answers[26]
										}
										className="py-1.5 w-24 px-3 block text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
									/>
								</div>
							</td>
							<td className="text-center">
								<div className="flex items-center rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
									<input
										type="text"
										name="price"
										id="price"
										onChange={(e) => handleChange(27, e.target.value)}
										value={
											answers[27] === undefined ? '' : answers[27]
										}
										className="py-1.5 w-24 px-3 block text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
									/>
								</div>
							</td>
							<td className="text-center">
								<div className="flex items-center rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
									<input
										type="text"
										name="price"
										id="price"
										onChange={(e) => handleChange(28, e.target.value)}
										value={
											answers[28] === undefined ? '' : answers[28]
										}
										className="py-1.5 w-24 px-3 block text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
									/>
								</div>
							</td>
							<td className="text-center">
								<div className="flex items-center rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
									<input
										type="text"
										name="price"
										id="price"
										onChange={(e) => handleChange(29, e.target.value)}
										value={
											answers[29] === undefined ? '' : answers[29]
										}
										className="py-1.5 w-24 px-3 block text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
									/>
								</div>
							</td>
							<td className="text-center">
								<div className="flex items-center rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
									<input
										type="text"
										name="price"
										id="price"
										onChange={(e) => handleChange(30, e.target.value)}
										value={
											answers[30] === undefined ? '' : answers[30]
										}
										className="py-1.5 w-24 px-3 block text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
									/>
								</div>
							</td>
							<td className="text-center">
								<div className="flex items-center rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
									<input
										type="text"
										name="price"
										id="price"
										onChange={(e) => handleChange(31, e.target.value)}
										value={
											answers[31] === undefined ? '' : answers[31]
										}
										className="py-1.5 w-24 px-3 block text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
									/>
								</div>
							</td>
						</tr>
						<tr className="hover:bg-gray-50">
							<td className="text-center">MAX REVERSE (9)</td>
							<td className="text-center">
								<div className="flex items-center rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
									<input
										type="text"
										name="price"
										id="price"
										onChange={(e) => handleChange(32, e.target.value)}
										value={
											answers[32] === undefined ? '' : answers[32]
										}
										className="py-1.5 w-24 px-3 block text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
									/>
								</div>
							</td>
							<td className="text-center">
								<div className="flex flex-row w-full justify-center">
									<Minus color="red" />
								</div>
							</td>
							<td className="text-center">
								<div className="flex items-center rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
									<input
										type="text"
										name="price"
										id="price"
										onChange={(e) => handleChange(33, e.target.value)}
										value={
											answers[33] === undefined ? '' : answers[33]
										}
										className="py-1.5 w-24 px-3 block text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
									/>
								</div>
							</td>
							<td className="text-center">
								<div className="flex flex-row w-full justify-center">
									<Minus color="red" />
								</div>
							</td>
							<td className="text-center">
								<div className="flex items-center rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
									<input
										type="text"
										name="price"
										id="price"
										onChange={(e) => handleChange(34, e.target.value)}
										value={
											answers[34] === undefined ? '' : answers[34]
										}
										className="py-1.5 w-24 px-3 block text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
									/>
								</div>
							</td>
							<td className="text-center">
								<div className="flex items-center rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
									<input
										type="text"
										name="price"
										id="price"
										onChange={(e) => handleChange(35, e.target.value)}
										value={
											answers[35] === undefined ? '' : answers[35]
										}
										className="py-1.5 w-24 px-3 block text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
									/>
								</div>
							</td>
							<td className="text-center">
								<div className="flex items-center rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
									<input
										type="text"
										name="price"
										id="price"
										onChange={(e) => handleChange(36, e.target.value)}
										value={
											answers[36] === undefined ? '' : answers[36]
										}
										className="py-1.5 w-24 px-3 block text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
									/>
								</div>
							</td>
							<td className="text-center">
								<div className="flex items-center rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
									<input
										type="text"
										name="price"
										id="price"
										onChange={(e) => handleChange(37, e.target.value)}
										value={
											answers[37] === undefined ? '' : answers[37]
										}
										className="py-1.5 w-24 px-3 block text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
									/>
								</div>
							</td>
						</tr>
						<tr className="hover:bg-gray-50">
							<td className="text-center">TRANSIENT</td>
							<td className="text-center">
								<div className="flex flex-row w-full justify-center">
									<Minus color="red" />
								</div>
							</td>
							<td className="text-center">
								<div className="flex items-center rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
									<input
										type="text"
										name="price"
										id="price"
										onChange={(e) => handleChange(38, e.target.value)}
										value={
											answers[38] === undefined ? '' : answers[38]
										}
										className="py-1.5 w-24 px-3 block text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
									/>
								</div>
							</td>
							<td className="text-center">
								<div className="flex items-center rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
									<input
										type="text"
										name="price"
										id="price"
										onChange={(e) => handleChange(39, e.target.value)}
										value={
											answers[39] === undefined ? '' : answers[39]
										}
										className="py-1.5 w-24 px-3 block text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
									/>
								</div>
							</td>
							<td className="text-center">
								<div className="flex items-center rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
									<input
										type="text"
										name="price"
										id="price"
										onChange={(e) => handleChange(40, e.target.value)}
										value={
											answers[40] === undefined ? '' : answers[40]
										}
										className="py-1.5 w-24 px-3 block text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
									/>
								</div>
							</td>
							<td className="text-center">
								<div className="flex items-center rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
									<input
										type="text"
										name="price"
										id="price"
										onChange={(e) => handleChange(41, e.target.value)}
										value={
											answers[41] === undefined ? '' : answers[41]
										}
										className="py-1.5 w-24 px-3 block text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
									/>
								</div>
							</td>
							<td className="text-center">
								<div className="flex items-center rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
									<input
										type="text"
										name="price"
										id="price"
										onChange={(e) => handleChange(42, e.target.value)}
										value={
											answers[42] === undefined ? '' : answers[42]
										}
										className="py-1.5 w-24 px-3 block text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
									/>
								</div>
							</td>
							<td className="text-center">
								<div className="flex flex-row w-full justify-center">
									<Minus color="red" />
								</div>
							</td>
							<td className="text-center">
								<div className="flex items-center rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
									<input
										type="text"
										name="price"
										id="price"
										onChange={(e) => handleChange(43, e.target.value)}
										value={
											answers[43] === undefined ? '' : answers[43]
										}
										className="py-1.5 w-24 px-3 block text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
									/>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			)}
			<div>
				<Button
					title="Guardar"
					size="sm"
					disabled={!hasChange}
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
					onClick={async () => handleSaveAnswer()}
				>
					<Save size={15} />
				</Button>
			</div>
			{/* {questionTest.question?.answers?.length}
			{JSON.stringify(questionTest.question?.answers, null, 4)} */}
		</div>
	);
};

export default TestCompletion;
