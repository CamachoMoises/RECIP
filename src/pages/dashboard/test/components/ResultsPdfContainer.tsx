import ResultsTestPdf from '../resultsTestPdf';

interface ResultsPdfContainerProps {
	componentRef: React.RefObject<HTMLDivElement>;
	course: any;
	test: any;
	user: any;
}

const ResultsPdfContainer = ({
	componentRef,
	course,
	test,
	user,
}: ResultsPdfContainerProps) => {
	return (
		<div style={{ display: 'none' }}>
			<div ref={componentRef} className="flex flex-col w-full">
				<ResultsTestPdf course={course} test={test} user={user} />
			</div>
		</div>
	);
};

export default ResultsPdfContainer;