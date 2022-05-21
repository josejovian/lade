import Head from "next/head";
import Image from "next/image";
// import styles from "../styles/Home.module.css";
import Button from "../components/Generic/Button";
import Sidebar from "../components/sidebar";
import Card from "../components/Card";
import { useContext } from "react";
import { FirebaseContext } from "../firebase/FirebaseContext";
import Landing from "../components/Home/Landing";
import ShapeDivider from "../components/Generic/ShapeDivider";
import Folder from "../components/Home/Folder";

const Home = () => {
	const db = useContext(FirebaseContext);

	const topQuestions = [{
		id: "014f",
		topic: "Calculus with Differential Equations",
		subtopic: "Exact Equation",
		statement: "Solve y' = y.",
		accepted: 514,
		attempted: 41946,
		comments: 31,
	}, {
		id: "02gf",
		topic: "Calculus with Differential Equations",
		subtopic: "Method of Separation Variables",
		statement: "Solve y' = y.",
		accepted: 794,
		attempted: 4156,
		comments: 2,
	}];
	const newQuestions = [{
		id: "014f",
		topic: "Calculus with Differential Equations",
		subtopic: "Exact Equation",
		statement: "Solve y' = y.",
		accepted: 514,
		attempted: 41946,
		comments: 31,
	}, {
		id: "02gf",
		topic: "Calculus with Differential Equations",
		subtopic: "Method of Separation Variables",
		statement: "Solve y' = y.",
		accepted: 794,
		attempted: 4156,
		comments: 2,
	}];

	return (
		<>
			<Head>
				<title className="text-blue-200">Create Next App</title>
				<meta
					name="description"
					content="Generated by create next app"
				/>
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<main className="flex flex-col w-full h-screen mt-12">
				<Landing />
				<ShapeDivider />
				<section className="bg-gray-200 flex-grow px-28 z-20 grid grid-cols-2 gap-14">
					<Folder title="New Questions" cards={newQuestions} />
					<Folder title="Top Questions" cards={topQuestions} />
				</section>
				{/* <Sidebar />
                <content className="flex-grow">

                </content> */}
			</main>
		</>
	);
};

export default Home;
