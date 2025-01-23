import {
	// useDispatch,
	useSelector,
} from 'react-redux';
import {
	// AppDispatch,
	RootState,
} from '../../../../store';
import {
	List,
	ListItem,
	ListItemSuffix,
	Radio,
	Typography,
} from '@material-tailwind/react';

const LessonDetails = ({ day }: { day: number }) => {
	// const dispatch = useDispatch<AppDispatch>();

	const { assessment } = useSelector((state: RootState) => {
		return {
			assessment: state.assessment,
		};
	});

	console.log(assessment.subjectList);

	return (
		<div>
			<Typography
				variant="h4"
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				Secciones del dia {day}
			</Typography>
			<div className="flex flex-col gap-2 py-2">
				{assessment.subjectList?.map((SL, index) => {
					return (
						<div key={`SL-list${index}`}>
							<Typography
								variant="h6"
								className="text-left"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								{SL.name}
							</Typography>
							<List
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								{SL.subject_lessons?.map((SLE, index2) => {
									return (
										<ListItem
											key={`SLE-list${index2}`}
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											<Typography
												variant="paragraph"
												placeholder={undefined}
												className="text-left"
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												{SLE.name}
											</Typography>
											<ListItemSuffix
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												<Radio
													name="type"
													label="HTML"
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
													crossOrigin={undefined}
												/>
											</ListItemSuffix>
										</ListItem>
									);
								})}
							</List>
							<hr />
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default LessonDetails;
