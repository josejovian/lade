import clsx from "clsx";
import { properifyMatrix } from "../Utility/matrix";
import Choice from "./Choice";

const ProblemAnswer = ({ id="", problem, state, setState, disabled = false }) => {
	// disabled props is only used for solve contest page.

	function setMatrix() {
		const matrix = properifyMatrix(id);

		setState({
			...state,
			answer: {
				matrix: matrix,
			},
		});
	}

	return (
		<div className="mt-8">
			{[
				problem.type === 0 && (
					<input
						key="short-answer"
						value={state.answer.string}
						onChange={(e) =>
							setState({
								...state,
								answer: {
									string: e.target.value
								},
							})
						}
						disabled={disabled || state.correct}
					/>
				),
				problem.type === 1 && (
					<div>
						{problem.choices.map((choice, index) => (
							<Choice
								key={`choice-${index}`}
								name={choice}
								index={index}
								removable={false}
								checked={
									state && state.answer.choice === choice
								}
								onCheck={(name, index) =>
									setState({
										...state,
										answer: {
											choice: name
										},
									})
								}
								disabled={disabled || (state && state.correct)}
								triggerWhenInputIsClicked
								readOnly
							/>
						))}
					</div>
				),
				problem.type === 2 && (
					<div key="matrix" className="flex flex-col h-auto">
						<div className="flex flex-col gap-2">
							{[0, 1, 2].map((row) => (
								<div
									className="flex flex-row gap-2"
									key={`row-${row}-${id}`}
								>
									{[0, 1, 2].map((col) => (
										<div
											className="flex w-16"
											key={`cell-${row}-${col}-${id}`}
										>
											<input
												id={`cell-${row}-${col}-${id}`}
												className={clsx("!w-16")}
												type="text"
												defaultValue={
													(state &&
														state.answer &&
														state.answer.matrix.rows >
															row &&
														state.answer.matrix
															.columns > col)
														? (state.answer.matrix
																.matrix[row][
																col
														  ])
														: ""
												}
												onBlur={() => setMatrix()}
												disabled={
													disabled ||
													(state && state.correct)
												}
												autoComplete="off"
											/>
										</div>
									))}
								</div>
							))}
						</div>
					</div>
				),
			]}
		</div>
	);
};
export default ProblemAnswer;
