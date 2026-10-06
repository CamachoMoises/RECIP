import {
	Card,
	CardBody,
	Chip,
	Typography,
} from '@material-tailwind/react';
import {
	courseLabelOfGrouped,
	EvaluationGroupedItem,
} from '../../../../features/instructorSlice';
import { course } from '../../../../types/utilities';
import { pilotName } from './instructorShared';

const InstructorEvaluationsGroupedTab = ({
	evaluations,
}: {
	instructor_id: number;
	evaluations: EvaluationGroupedItem[];
	courses: course[];
}) => {
	const filtered = evaluations.filter((item) => {
		const id = item.course?.id;
		return id != null && id === item.course?.id;
	});

	if (!filtered.length) {
		return (
			<Typography
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
				className="py-8 text-center text-blue-gray-500"
			>
				No hay evaluaciones
			</Typography>
		);
	}

	return (
		<Card
			placeholder={undefined}
			onPointerEnterCapture={undefined}
			onPointerLeaveCapture={undefined}
		>
			<CardBody
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
				className="flex flex-col gap-4"
			>
				<Typography
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
					className="text-sm text-blue-gray-500"
				>
					{filtered.length} evaluaciones
				</Typography>

				{filtered.map((item, index) => {
					const csa = item.CSA;

					return (
						<div
							key={csa?.id ?? item.course_student_id ?? index}
							className="rounded-lg border border-blue-gray-100 p-4"
						>
							<div className="flex flex-wrap items-center justify-between gap-2">
								<span className="font-semibold text-blue-gray-900">
									{pilotName(item) || 'Piloto'}
								</span>
								<span className="flex flex-wrap items-center gap-2 text-xs text-blue-gray-500">
									{item.course?.course_type?.name}
									{item.course?.course_level?.name}
									{courseLabelOfGrouped(item)}
								</span>
							</div>

							<div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-blue-gray-700">
								<span>Código: {csa?.code ?? '-'}</span>
								<span>Fecha: {csa?.date ?? '-'}</span>
								<span>Puntaje: {csa?.score ?? '-'}</span>
								{csa?.course_score_average != null ? (
									<span>Promedio: {csa.course_score_average}</span>
								) : null}
							</div>

							<div className="mt-2 flex flex-wrap items-center gap-2">
								{csa?.finished ? (
									<Chip
										size="sm"
										value="Finalizada"
										className="bg-blue-100 text-blue-700"
									/>
								) : (
									<Chip
										size="sm"
										value="En proceso"
										className="bg-blue-gray-100 text-blue-gray-600"
									/>
								)}
								{csa?.approve ? (
									<Chip
										size="sm"
										value="Aprobada"
										className="bg-green-100 text-green-700"
									/>
								) : null}
							</div>

							{csa?.comments ? (
								<p className="mt-2 text-sm text-blue-gray-600">
									{csa.comments}
								</p>
							) : null}
						</div>
					);
				})}
			</CardBody>
		</Card>
	);
};

export default InstructorEvaluationsGroupedTab;
