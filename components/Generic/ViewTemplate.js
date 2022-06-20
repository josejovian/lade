import { useContext, useEffect, useState } from "react";
import {
	FirebaseContext,
	getData,
	setProblemsFromSnapshot,
	turnProblemsObjectToArray,
} from "../firebase";
import { connect } from "react-redux";
import {
	mapDispatchToProps,
	mapStateToProps,
} from "../Redux/setter";
import Frame from "./Frame";
import { ProblemCardSK } from "./Skeleton";
import { genericToast, ToastContext } from "./Toast";

import "firebase/database";
import "firebase/compat/database";
import firebase from "firebase/compat/app";
import clsx from "clsx";
import Button from "./Button";
import { GoChevronDown, GoChevronUp, GoDash } from "react-icons/go";
import FrameHead from "./FrameHead";

const objectsPerPage = 5;

const Criteria = ({ children, thisCrit, criteria, onClick }) => {

	const [state, setState] = useState(null);

	useEffect(() => {
		if(Math.abs(criteria) !== thisCrit) {
			setState(<GoDash />);
			return;
		}
	
		if(criteria === thisCrit) {
			setState(<GoChevronUp />);
		} else {
			setState(<GoChevronDown />);
		}
	}, [criteria]);

	return (
		<Button
			className={clsx("flex flex-row justify-between py-1 gap-4")}
			variant={Math.abs(criteria) === thisCrit ? "primary" : "ghost"}
			onClick={onClick}
		>
			<span>
				{state}
			</span>
			<span>
				{children}
			</span>
		</Button>
	);
};

// List of all criterias
const crits = [{
	id: 1,
	type: "Time"
}, {
	id: 2,
	type: "Accepted"
}, {
	id: 3,
	type: "Attempted"
}, {
	id: 4,
	type: "Comments"
}];

const ViewTemplate = ({ title, crits, dataPath, objects, setObjects, component }) => {
	const [displayObjects, setDisplayObjects] = useState([]);
	const { db, _topics, _subtopics } = useContext(FirebaseContext);
	const [cursor, setCursor] = useState(0);
	const [criteria, setCriteria] = useState(-1);
	const [fetch, setFetch] = useState(0);
	// 1 -> time
	// 2 -> accepted
	// 3 -> attempted
	// 4 -> comments
	// + -> ascending
	// - -> descending

	// Contexts to invoke toasts.
	const { addToast } = useContext(ToastContext);

	function limitObjects(_objects) {
		return _objects.filter((val, idx) => idx >= cursor && Math.min(objectsPerPage + cursor, _objects.length) >= idx );
	}

	async function sortObjects(criteriaId) {
		// Given the criteriaId, get the word for the criteria.
		let _criteria = crits.filter(({id}) => id === Math.abs(criteriaId))[0].type.toLowerCase();

		// Time is not saved as a property in the database,
		// but the id generated by pushid is always incremental,
		// so we just reverse them from the original data fetched.
		if(_criteria === "time") {
			setDisplayObjects(() => {
				return objects.reverse();
			});
			return;
		}

		// Other criteria are properties, so we define a custom sort function for it.
		setDisplayObjects(() => {
			const sortedObjects = objects.sort(
				(a, b) => (b.metrics[_criteria] - a.metrics[_criteria]) * Math.sign(criteriaId)
			);
			const limitedObjects = limitObjects(sortedObjects);
			return limitedObjects;
		});
	}

	useEffect(() => {
		sortObjects(criteria);
	}, [ criteria ]);

	async function getObjects() {
		await getData(db, dataPath)
			.then((_objects) => {
				console.log(_objects);
				const arrayObjects = turnProblemsObjectToArray(
					_objects,
					_topics,
					_subtopics
				);
				setObjects(arrayObjects);
				// console.log( limitObjects(arrayObjects));
				setDisplayObjects(limitObjects(arrayObjects));
				setFetch(1);
			})
			.catch((e) => {
				addToast(genericToast("get-fail"));
				setFetch(-1);
			});
	}

	/*
		Clicking one criteria button repeatedly will rotate between two modes:
		-> ascending
		-> descending

		If user clicks 
	*/
	function newCriteria(_criteria) {
		// The user is already using this criteria to sort, but wants
		// to switch between ascending and descending.
		if (Math.abs(_criteria) === Math.abs(criteria)) {
			setCriteria(prevCrit => prevCrit*-1);
		} else {
			setCriteria(_criteria);
		}
	}

	useEffect(() => {
		if (db && _topics && _subtopics) getObjects();
	}, [db, _topics, _subtopics]);

	return (
		<Frame page={title}>
			<FrameHead>
				<h1 className="h2">{title}</h1>
				<article className="flex flex-row items-center mt-4">
					<span className="small-head w-32">Sort By</span>
					<div className="flex flex-row gap-4 w-full">
						{ crits.map(({id, type}) => (
							<Criteria
								key={`criteria-${type}`}
								thisCrit={id}
								criteria={criteria}
								onClick={() => newCriteria(id)}
							>
								{type}
							</Criteria>
						))}
						{/* <button className="border-2 border-gray-400 p-2 rounded-full text-gray-400" onClick={()=>sortProblems("upvote")}>upvote</button>
						<button className="border-2 border-gray-400 p-2 rounded-full text-gray-400" onClick={()=>sortProblems("downvote")}>downvote</button> */}
					</div>
				</article>
			</FrameHead>
			{fetch === 1 ? (
				displayObjects.map((card, index) => component(card))
			) : (
				<>
					<ProblemCardSK className="relative top-44" />
					<ProblemCardSK className="relative top-44" />
					<ProblemCardSK className="relative top-44" />
				</>
			)}
		</Frame>
	);
};

export default connect(mapStateToProps, mapDispatchToProps)(ViewTemplate);
