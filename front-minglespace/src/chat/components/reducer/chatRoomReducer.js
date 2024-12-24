const initialRoomState = {
	chatRoomInfo: {
		chatRoomId: 0,
		name: "",
		imageUriPath: "",
		workSpaceId: 0,
		messages: [],
		participants: [],
		msgHasMore: false,
	},
	inviteMembers: [],
	isRoomOwner: false,
	// isModalOpen: false,
	currentMemberInfo: null,
	// replyToMessage: null,
	// page: 0,
};

const roomReducer = (state, action) => {
	console.log("action.payload: ", action.payload)
	switch (action.type) {
		case "SET_CHAT_ROOM_INFO":
			return { ...state, chatRoomInfo: action.payload }
		case "SET_INVITE_MEMBERS":
			return { ...state, inviteMembers: action.payload }
		case "SET_CURRENT_MEMBER_INFO":
			return { ...state, currentMemberInfo: action.payload }
		case "SET_IS_ROOM_OWNER":
			return { ...state, isRoomOwner: action.payload }
		case "UPDATE_CHAT_ROOM_INFO_MSG":
			return {
				...state,
				chatRoomInfo: {
					...state.chatRoomInfo,
					messages: action.payload.messages,
				}
			};

		// case "SET_REPLY_TO_MESSAGE":
		// 	return { ...state, replyToMessage: action.payload }
		// case "SET_PAGE":
		// 	return { ...state, page: action.payload }
		// case "SET_IS_MODAL_OPEN":
		// 	return { ...state, isModalOpen: action.payload }
		default:
			return state;
	}

};

export { roomReducer, initialRoomState };