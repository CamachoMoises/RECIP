import { useSelector, useDispatch } from 'react-redux';
import {
	decrement,
	increment,
	incrementByAmount,
} from './counterSlice';
import { Button } from '@material-tailwind/react';

export function Counter() {
	const count = useSelector(
		(state: { counter: { value: number } }) => state.counter.value
	);
	const dispatch = useDispatch();

	return (
		<div>
			<div>
				<Button
					aria-label="Decrement value"
					onClick={() => dispatch(incrementByAmount(10))}
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					+10
				</Button>
				<Button
					aria-label="Increment value"
					onClick={() => dispatch(increment())}
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					+1
				</Button>
				<Button
					aria-label="Decrement value"
					onClick={() => dispatch(decrement())}
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					-1
				</Button>
				<Button
					aria-label="Decrement value"
					onClick={() => dispatch(incrementByAmount(-10))}
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					-10
				</Button>

				<span>{count}</span>
			</div>
		</div>
	);
}
