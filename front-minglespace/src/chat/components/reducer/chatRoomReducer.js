const initialRoomsState = [];

const roomsReducer = (state, action) => {
	switch (action.type) {
		case "SET_ROOMS":
			return action.payload;
		case "UPDATE_ROOM":
			return state.map(room =>
				room.chatRoomId === action.payload.chatRoomId
					? { ...room, ...action.payload.updates }
					: room
			);
		case "REMOVE_ROOM":
			return state.filter(room => room.chatRoomId !== action.payload.chatRoomId);
		default:
			return state;
	}
};

export { roomsReducer, initialRoomsState };