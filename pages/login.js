import Head from "next/head";
import { useContext } from "react";
import { useRouter } from "next/router";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {
	getErrorMessage,
	FirebaseContext,
	getData,
} from "../components/firebase";
import clsx from "clsx";
import FormTemplate from "../components/FormTemplate";
import * as Yup from "yup";
import { genericToast, ToastContext } from "../components/Generic/Toast";
import { connect } from "react-redux";
import {
	mapDispatchToProps,
	mapStateToProps,
} from "../components/Redux/setter";
import Meta from "../components/Generic/Meta";

const LoginSchema = Yup.object().shape({
	email: Yup.string()
		.email("Email is in the wrong format!")
		.required("Email is required!"),
	password: Yup.string().required("Password is required!"),
});

const Login = ({ loginUser }) => {
	const auth = getAuth();
	const router = useRouter();
	const { db } = useContext(FirebaseContext);

	// Contexts to invoke toasts.
	const { addToast } = useContext(ToastContext);

	async function login(values) {
		return await new Promise((res, rej) => {
			signInWithEmailAndPassword(
				auth,
				values["email"],
				values["password"]
			)
				.then(async (cred) => {
					const result = await getData(db, `/user/${cred.user.uid}`);
					loginUser({
						...result,
						id: cred.user.uid,
					});
				})
				.then(() => {
					router.push("/problems");
					addToast({
						title: "Login Success!",
						desc: "Welcome to the site!",
						variant: "success",
					});
					res(null);
				})
				.catch((error) => {
					console.log(error);
					addToast(genericToast("generic-fail"));
					rej(getErrorMessage(error.code));
				});
		});
	}

	return (
		<>
			<Meta page="Login" />
			<FormTemplate
				title="Login"
				formik={{
					initialValues: {
						email: "",
						password: "",
					},
					validationSchema: LoginSchema,
					onSubmit: login,
				}}
				fields={[
					{
						title: "Email",
						id: "email",
						type: "email",
					},
					{
						title: "Password",
						id: "password",
						type: "password",
					},
				]}
				callback={{ success: () => {} }}
			/>
		</>
	);
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
