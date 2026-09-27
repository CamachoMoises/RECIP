import { testReportAttemptAnswers, testReportRow } from '../../../types/utilities';
import { typeLabel } from '../test/components/questionTypeMeta';
import '../test/pdfStyle.css';

const cell = {
	border: '1px solid #1f2937',
	padding: '4px 6px',
	fontSize: 11,
} as const;

const TestReportResultsPdf = ({
	attempt,
	test,
}: {
	attempt: testReportAttemptAnswers;
	test: testReportRow;
}) => {
	const student = attempt.student?.user;
	const totalScored = attempt.questions?.reduce(
		(sum, q) => sum + (q.points_scored ?? 0),
		0,
	);

	return (
		<div className="printable flex flex-col gap-3">
			<div style={{ textAlign: 'center' }}>
				<h2 style={{ margin: 0, fontSize: 18 }}>
					Reporte preliminar de examen
				</h2>
				<p style={{ margin: '4px 0 0', fontSize: 12 }}>
					{test.course?.name ?? ''} {test.code}
				</p>
			</div>

			<table style={{ width: '100%', borderCollapse: 'collapse' }}>
				<tbody>
					<tr>
						<th style={{ ...cell, width: '18%' }}>Examen</th>
						<td style={cell}>{test.code}</td>
						<th style={{ ...cell, width: '18%' }}>Curso</th>
						<td style={cell}>{test.course?.name ?? '—'}</td>
					</tr>
					<tr>
						<th style={cell}>Intento</th>
						<td style={cell}>{attempt.code}</td>
						<th style={cell}>Fecha</th>
						<td style={cell}>
							{attempt.date
								? new Date(attempt.date).toLocaleString('es')
								: '—'}
						</td>
					</tr>
					<tr>
						<th style={cell}>Alumno</th>
						<td style={cell}>
							{student ? `${student.name} ${student.last_name}` : '—'}
						</td>
						<th style={cell}>Correo</th>
						<td style={cell}>{student?.email ?? '—'}</td>
					</tr>
					<tr>
						<th style={cell}>Puntaje</th>
						<td style={cell}>
							{attempt.score ?? 0} / {test.min_score} (mínimo)
						</td>
						<th style={cell}>Total obtenido</th>
						<td style={cell}>{totalScored ?? 0}</td>
					</tr>
				</tbody>
			</table>

			<h3 style={{ margin: 0, fontSize: 14 }}>Respuestas</h3>

			{attempt.questions?.map((question, index) => (
				<div
					key={question.id}
					style={{
						border: '1px solid #1f2937',
						padding: 8,
						display: 'flex',
						flexDirection: 'column',
						gap: 6,
					}}
				>
					<div
						style={{
							display: 'flex',
							justifyContent: 'space-between',
							fontSize: 11,
							fontWeight: 600,
						}}
					>
						<span>
							#{index + 1} — {typeLabel(question.question_type_id)}
						</span>
						<span>
							{question.result} · {question.points_scored ?? 0}/
							{question.points_possible ?? '—'} pts
						</span>
					</div>

					<p style={{ margin: 0, fontSize: 12 }}>{question.header}</p>

					<table style={{ width: '100%', borderCollapse: 'collapse' }}>
						<tbody>
							<tr>
								<td style={{ ...cell, width: '50%' }}>
									<strong>Correcta:</strong>{' '}
									{question.correct_answers_text || '—'}
								</td>
								<td style={cell}>
									<strong>Alumno:</strong>{' '}
									{question.student_response || '—'}
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			))}

			<p style={{ margin: 0, fontSize: 10, textAlign: 'center' }}>
				Documento generado automáticamente. No recalcula ni modifica puntajes.
			</p>
		</div>
	);
};

export default TestReportResultsPdf;
