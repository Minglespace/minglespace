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
		case "UPDATE_ROOM_SUB":
			return state.map(room => 
				room.chatRoomId === action.payload.newMsg.chatRoomId
					? { ...room, lastMessage: action.payload.newMsg.content, notReadMsgCount: room.notReadMsgCount + 1 }
					: room
			);
		case "UPDATE_ROOM_PARTICIPANT":
			return state.map(room => 
				room.chatRoomId === action.payload.chatRoomId
					? { ...room, participantCount: Number(room.participantCount) + Number(action.payload.change)}
					: room
			);
		case "REMOVE_ROOM":
			return state.filter(room => room.chatRoomId !== action.payload.chatRoomId);
		default:
			return state;
	}
};

export { roomsReducer, initialRoomsState };