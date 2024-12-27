const initialRoomsState = [];

const chatListReducer = (state, action) => {
	switch (action.type) {
		case "SET_ROOMS":
			return action.payload;
		case "ADD_ROOMS":
			return [action.payload, ...state];
		case "UPDATE_ROOMS":
			return state.map(room =>
				room.chatRoomId === Number(action.payload.chatRoomId)
					? { ...room, ...action.payload.updates }
					: room
			);
		case "UPDATE_ROOMS_SUB":
			return state.map(room =>
				room.chatRoomId === Number(action.payload.newMsg.chatRoomId)
					? { ...room, lastMessage: action.payload.newMsg.content, notReadMsgCount: room.notReadMsgCount + 1 }
					: room
			);
		case "UPDATE_ROOMS_PARTICIPANT":
			return state.map(room =>
				room.chatRoomId === Number(action.payload.chatRoomId)
					? { ...room, participantCount: Number(room.participantCount) + Number(action.payload.change) }
					: room
			);
		case "REMOVE_ROOM":
			return state.filter(room => Number(room.chatRoomId) !== Number(action.payload.chatRoomId));
		default:
			return state;
	}
};

export { chatListReducer, initialRoomsState };