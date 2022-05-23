const initialState = {
	loggedIn: null,
	problems: []
};

export const reducer = (state = initialState, action) => {
	switch (action.type) {
		case "userLogin":
			return {
				...state,
				loggedIn: action.loggedIn,
			};
		case "userLogout":
			return {
				...state,
				loggedIn: null,
			};
		case "problemsSet":
			return {
				...state,
				problems: action.problems,
			};
		default:
			return state;
	}
};

export default reducer;