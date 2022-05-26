import { useContext, useEffect, useState } from "react";
import { FirebaseContext, getData } from "../../components/firebase";
import Frame from "../../components/Generic/Frame";
import "react-quill/dist/quill.snow.css";
import dynamic from "next/dynamic";
import { Interweave } from "interweave";
import CommentEntry from "../../components/Comment/CommentEntry";
import CommentEditor from "../../components/Comment/CommentEditor";

const QuillNoSSRWrapper = dynamic(import("react-quill"), {
    ssr: false,
    loading: () => <></>,
});

const Problems = ({ id }) => {
    const { db, _topics, _subtopics } = useContext(FirebaseContext);
    const [problem, setProblem] = useState(null);
    const [comments, setComment] = useState(null);

    async function getProblemData() {
        await getData(db, `/problem/${id}`)
            .then((_problem) => {
                console.log(_problem);
                let { topic, subtopic } = _problem;
                _problem.id = id;
                _problem.topic = _topics[topic];
                _problem.subtopic = _subtopics[topic][subtopic];
                setProblem(_problem);
            })
            .catch((e) => {});
    }

    async function getCommentData() {
        await getData(db, `/comment/${id}`)
            .then((_comments) => {
                const tempComments = [];
                for (let [id, _comment] of Object.entries(_comments)) {
                    _comment.id = id;
                    tempComments.unshift(_comment);
                }
                setComment(tempComments);
            })
            .catch((e) => {
                console.log(e);
            });
    }

    if (!comments) {
        getCommentData();
    }

    useEffect(() => {
        if (db && _topics && _subtopics && !problem) getProblemData();
    }, [db, _topics, _subtopics]);

    return (
        <Frame>
            {problem ? (
                <>
                    <div>
                        <h1 className="h2">{problem.topic}</h1>
                        <p className="mt-4">{problem.subtopic}</p>
                    </div>
                    <div>
                        <Interweave content={problem.statement} />
                    </div>
                    <div>
                        <CommentEditor problem_id={problem.id} />
                        {comments.map((comment) => (
                            <CommentEntry comment={comment} />
                        ))}
                    </div>
                </>
            ) : (
                <div>The problem is not found.</div>
            )}
        </Frame>
    );
};

export async function getServerSideProps({ params }) {
    const { id } = params;

    return { props: { id } };
}

export default Problems;
