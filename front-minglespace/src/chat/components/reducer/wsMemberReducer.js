const initialWsMemberState = [];

const wsMemberReducer = (state, action) => {
	switch (action.type) {
		case "SET_WS_MEMBERS":
			return action.payload;
		default:
			return state;
	}
};

export { wsMemberReducer, initialWsMemberState };