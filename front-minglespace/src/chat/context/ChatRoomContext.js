import { createContext, useContext, useEffect, useReducer, useRef, useState } from "react";
import { roomReducer, initialRoomState } from "../components/reducer/chatRoomReducer";
import { useChatApp } from "./ChatAppContext";
import ChatApi from "../../api/chatApi";
import Repo from "../../auth/Repo";
import React from "react";
import { useNavigate } from "react-router-dom";
import SockJS from "sockjs-client";
import { HOST_URL } from "../../api/Api";
import { Client } from "@stomp/stompjs";

const ChatRoomContext = createContext();

export const useChatRoom = () => useContext(ChatRoomContext);

export const ChatRoomProvider = ({ children }) => {
	const [roomState, roomDispatch] = useReducer(roomReducer, initialRoomState);
	const { workspaceId, chatRoomId, wsMemberState, updateRoomParticipantCount, removeRoom } = useChatApp();

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [replyToMessage, setReplyToMessage] = useState(null);
	const [page, setPage] = useState(0);
	const socketRef = useRef(null);
	const navigate = useNavigate();


	useEffect(() => {
		console.log("Updated chatRoomInfo:", roomState.chatRoomInfo); // 상태가 바뀔 때마다 콘솔로 확인
	}, [roomState.chatRoomInfo]);

	useEffect(() => {
		if (!chatRoomId) {
			console.log("No chatRoomId provided, skipping server request.");
			return;
		}

		// 이전 연결 있으면 제거
		if (socketRef.current) {
			//&& socketRef.current.active
			socketRef.current.deactivate();
			socketRef.current = null;
		}

		const socket = new SockJS(`${HOST_URL}/ws`);

		const stompClient = new Client({
			webSocketFactory: () => socket,
			connectHeaders: {
				Authorization: `Bearer ${Repo.getAccessToken()}`,
			},
			onConnect: () => {
				console.log(`채팅방 ${chatRoomId}번 websocket 연결 완료`);

				///채팅 실시간 메시지 구독
				stompClient.subscribe(`/topic/chatRooms/${chatRoomId}/msg`, (msg) => {
					const newMsg = JSON.parse(msg.body);
					console.log("chatRoom_ new msg: ", newMsg);

					// setChatRoomInfo((prev) => ({
					// 	...prev,
					// 	messages: [...prev.messages, newMsg],
					// }));

					roomDispatch({
						type: "UPDATE_CHAT_ROOM_INFO_MSG",
						payload: {
							messages: [...roomState.chatRoomInfo.messages, newMsg]
						}
					});
				});

				//메시지 읽음/삭제 실시간 구독
				stompClient.subscribe(`/topic/chatRooms/${chatRoomId}/message-status`, (status) => {
					const statusData = JSON.parse(status.body);
					console.log("읽음 처리 메시지", statusData);

					if (statusData.type === "READ") {
						console.log("새로 읽은 유저가 있음: ", statusData.type)
						///특정 유저가 실시간으로 읽은 메시지 상태 반영
						// setChatRoomInfo((prev) => ({
						// 	...prev,
						// 	messages: prev.messages.map((message) => ({
						// 		...message,
						// 		unReadMembers: message.unReadMembers.filter(
						// 			(member) => Number(member.wsMemberId) !== statusData.wsMemberId
						// 		),
						// 	})),
						// }));
						roomDispatch({
							type: "UPDATE_CHAT_ROOM_INFO_MSG",
							payload: {
								messages: roomState.chatRoomInfo.messages.map((message) => ({
									...message,
									unReadMembers: message.unReadMembers.filter((member) => Number(member.wsMemberId) !== statusData.wsMemberId)
								}))
							}
							// (prev) => ({
							// 	...prev,
							// 	chatRoomInfo: {
							// 		...prev.chatRoomInfo,
							// 		messages: prev.chatRoomInfo.messages.map((message) => ({
							// 			...message,
							// 			unReadMembers: message.unReadMembers.filter(
							// 				(member) => Number(member.wsMemberId) !== statusData.wsMemberId
							// 			),
							// 		})),
							// 	},
							// }),
						});
					} else if (statusData.type === "DELETE") {
						// setChatRoomInfo((prev) => {
						// 	const updatedMessages = prev.messages.filter((msg) => Number(msg.id) !== status.messageId);
						// 	return { ...prev, messages: updatedMessages };
						// });
						const updatedMessages = roomState.chatRoomInfo.messages.filter((msg) => Number(msg.id) !== status.messageId);
						roomDispatch({
							type: "UPDATE_CHAT_ROOM_INFO_MSG",
							payload: {
								messages: updatedMessages
							}
							// (prev) => {
							// 	const updatedMessages = prev.chatRoomInfo.messages.filter((msg) => Number(msg.id) !== status.messageId);
							// 	return {
							// 		...prev,
							// 		chatRoomInfo: {
							// 			...prev.chatRoomInfo,
							// 			messages: updatedMessages,
							// 		},
							// 	};
							// },
						});
					}
				});
			},
			onWebSocketError: (error) => {
				console.log(`채팅방 ${chatRoomId}번 websocket 연결 오류:`, error);
				alert("실시간 연결 오류가 발생했습니다. 다시 시도");
				window.location.reload();
			},
			reconnectDelay: 5000, // 5초마다 자동 재연결 시도
			heartbeatIncoming: 4000, // 서버에서 4초마다 ping
			heartbeatOutgoing: 4000, // 클라이언트에서 4초마다 pong
			withCredentials: true, //쿠키, 인증정보 포함
		});

		stompClient.activate();
		socketRef.current = stompClient;

		//언마운트시 연결 종료
		return () => {
			if (socketRef.current) {
				socketRef.current.deactivate();
				socketRef.current = null;
			}
		};
	}, [chatRoomId]);


	// const fetchRoomInfo = async () => {
	// 	console.log("workspaceId - chatRoomId: ", workspaceId, chatRoomId);
	// 	try {
	// 		const roomInfo = await ChatApi.getChatRoom(workspaceId, chatRoomId);
	// 		console.log("chatRoom_ get info: ", roomInfo);
	// 		roomInfo.messages.reverse();
	// 		// setChatRoomInfo(roomInfo);
	// 		roomDispatch({
	// 			type: "SET_CHAT_ROOM_INFO",
	// 			payload: roomInfo
	// 		});

	// 		const participantsIds = roomInfo.participants.map((participant) =>
	// 			Number(participant.userId)
	// 		);
	// 		// console.log("participantsId: ", participantsIds);

	// 		const nonParticipants = wsMemberState.filter(
	// 			(member) => !participantsIds.includes(Number(member.userId))
	// 		);
	// 		// console.log("wsmembers: ", wsMembers);
	// 		// console.log("nonparticipants: ", nonParticipants);

	// 		// setInviteMembers(nonParticipants);
	// 		roomDispatch({
	// 			type: "SET_INVITE_MEMBERS",
	// 			payload: nonParticipants
	// 		});

	// 		//방 리더인지 확인
	// 		const currentMemberInfo = roomInfo.participants.find(
	// 			(participant) =>
	// 				Number(participant.userId) === Number(Repo.getUserId())
	// 		);
	// 		// setCurrentMemberInfo(currentMemberInfo);
	// 		roomDispatch({
	// 			type: "SET_CURRENT_MEMBER_INFO",
	// 			payload: currentMemberInfo
	// 		});
	// 		// console.log("chatroom_ currentmemberinfo:", currentMemberInfo);
	// 		if (currentMemberInfo.chatRole === "CHATLEADER") {
	// 			// setIsRoomOwner(true);
	// 			roomDispatch({
	// 				type: "SET_IS_ROOM_OWNER",
	// 				payload: true
	// 			});
	// 		} else {
	// 			roomDispatch({
	// 				type: "SET_IS_ROOM_OWNER",
	// 				payload: false
	// 			});
	// 		}
	// 	} catch (error) {
	// 		console.error("error fetching get chatroominfo: ", error);
	// 	}
	// };

	useEffect(() => {
		if (!chatRoomId) {
			console.log("No chatRoomId provided, skipping server request.");
			return;
		}
		const fetchRoomInfo = async () => {
			console.log("workspaceId - chatRoomId: ", workspaceId, chatRoomId);
			try {
				const roomInfo = await ChatApi.getChatRoom(workspaceId, chatRoomId);
				console.log("chatRoom_ get info: ", roomInfo);
				roomInfo.messages.reverse();
				// setChatRoomInfo(roomInfo);
				roomDispatch({
					type: "SET_CHAT_ROOM_INFO",
					payload: roomInfo
				});

				const participantsIds = roomInfo.participants.map((participant) =>
					Number(participant.userId)
				);
				// console.log("participantsId: ", participantsIds);

				const nonParticipants = wsMemberState.filter(
					(member) => !participantsIds.includes(Number(member.userId))
				);
				// console.log("wsmembers: ", wsMembers);
				// console.log("nonparticipants: ", nonParticipants);

				// setInviteMembers(nonParticipants);
				roomDispatch({
					type: "SET_INVITE_MEMBERS",
					payload: nonParticipants
				});

				//방 리더인지 확인
				const currentMemberInfo = roomInfo.participants.find(
					(participant) =>
						Number(participant.userId) === Number(Repo.getUserId())
				);
				// setCurrentMemberInfo(currentMemberInfo);
				roomDispatch({
					type: "SET_CURRENT_MEMBER_INFO",
					payload: currentMemberInfo
				});
				// console.log("chatroom_ currentmemberinfo:", currentMemberInfo);
				if (currentMemberInfo.chatRole === "CHATLEADER") {
					// setIsRoomOwner(true);
					roomDispatch({
						type: "SET_IS_ROOM_OWNER",
						payload: true
					});
				} else {
					roomDispatch({
						type: "SET_IS_ROOM_OWNER",
						payload: false
					});
				}
			} catch (error) {
				console.error("error fetching get chatroominfo: ", error);
			}
		};

		fetchRoomInfo();
		setIsModalOpen(false);
	}, [chatRoomId, wsMemberState, workspaceId]);


	const handleInvite = async (addMember) => {
		try {
			// console.log("add member wsmemberId: ", addMember.wsMemberId);
			await ChatApi.addMemberToRoom(
				workspaceId,
				chatRoomId,
				addMember.wsMemberId
			);

			//참여자 갱신
			const newParticipant = {
				...addMember,
				chatRole: "CHATMEMBER",
			};
			const updatedParticipants = [
				...roomState.chatRoomInfo.participants,
				newParticipant,
			];

			// setChatRoomInfo((prev) => ({
			//   ...prev,
			//   participants: updatedParticipants,
			// }));

			roomDispatch({
				type: "SET_CHAT_ROOM_INFO",
				payload: { ...roomState.chatRoomInfo, participants: updatedParticipants }
			});

			//초대 목록 갱신
			const updatedInviteMembers = roomState.inviteMembers.filter(
				(member) => member.wsMemberId !== addMember.wsMemberId
			);
			// setInviteMembers(updatedInviteMembers);
			roomDispatch({
				type: "SET_INVITE_MEMBERS",
				payload: updatedInviteMembers
			});

			//목록에 보이는 참여 카운트 갱신
			updateRoomParticipantCount(chatRoomId, 1);

			// alert(addMember.name, "님 채팅방 초대 완료: ", data);
			setIsModalOpen(false);
		} catch (error) {
			console.error("error fetching addMemberToRoom: ", error);
		}
	};

	const handleKick = async (kickMember) => {
		try {
			// console.log("kick member wsmemberId: ", kickMember.wsMemberId);
			await ChatApi.kickMemberFromRoom(
				workspaceId,
				chatRoomId,
				kickMember.wsMemberId
			);

			//참여 멤버 갱신
			const updatedParticipants = roomState.chatRoomInfo.participants.filter(
				(member) => member.wsMemberId !== kickMember.wsMemberId
			);

			// setChatRoomInfo((prev) => ({
			//   ...prev,
			//   participants: updatedParticipants,
			// }));
			roomDispatch({
				type: "SET_CHAT_ROOM_INFO",
				payload: { ...roomState.chatRoomInfo, participants: updatedParticipants }
			});

			const kickedMember = roomState.chatRoomInfo.participants.find(
				(member) => member.wsMemberId === kickMember.wsMemberId
			);

			// setInviteMembers((prev) => [...prev, kickedMember]);
			roomDispatch({
				type: "SET_INVITE_MEMBERS",
				payload: [...roomState.inviteMembers, kickedMember]
			});

			updateRoomParticipantCount(chatRoomId, -1);

			setIsModalOpen(false);
		} catch (error) {
			console.error("error fetching kickMemberToRoom: ", error);
		}
	};


	const handleDelegate = async (newLeader) => {
		try {
			await ChatApi.delegateLeader(
				workspaceId,
				chatRoomId,
				newLeader.wsMemberId
			);

			//방장 위임 로컬 업데이트
			// setChatRoomInfo((prev) => {
			// 	const updatedParticipants = prev.participants.map((member) => {
			// 		//현재 방장 역할 변경
			// 		if (Number(member.userId) === Number(Repo.getUserId)) {
			// 			return { ...member, chatRole: "CHATMEMBER" };
			// 		}

			// 		//새 방장 위임
			// 		if (Number(member.wsMemberId) === Number(newLeader.wsMemberId)) {
			// 			return { ...member, chatRole: "CHATLEADER" };
			// 		}
			// 		return member;
			// 	});

			// 	return {
			// 		...prev,
			// 		participants: updatedParticipants,
			// 	};
			// });
			const updatedParticipants = roomState.chatRoomInfo.participants.map((member) => {
				//현재 방장 역할 변경
				if (Number(member.userId) === Number(Repo.getUserId)) {
					return { ...member, chatRole: "CHATMEMBER" };
				}

				//새 방장 위임
				if (Number(member.wsMemberId) === Number(newLeader.wsMemberId)) {
					return { ...member, chatRole: "CHATLEADER" };
				}
				return member;
			});

			roomDispatch({
				type: "SET_CHAT_ROOM_INFO",
				payload: {
					...roomState.chatRoomInfo,
					participants: updatedParticipants
				}
				// (prev) => {
				// 	const updatedParticipants = prev.chatRoomInfo.participants.map((member) => {
				// 		//현재 방장 역할 변경
				// 		if (Number(member.userId) === Number(Repo.getUserId)) {
				// 			return { ...member, chatRole: "CHATMEMBER" };
				// 		}

				// 		//새 방장 위임
				// 		if (Number(member.wsMemberId) === Number(newLeader.wsMemberId)) {
				// 			return { ...member, chatRole: "CHATLEADER" };
				// 		}
				// 		return member;
				// 	});

				// 	return {
				// 		...prev,
				// 		chatRoomInfo: {
				// 			...prev.chatRoomInfo,
				// 			participants: updatedParticipants,
				// 		},
				// 	};
				// }
			});

			handleExit();
		} catch (error) {
			console.error("error fetching delegateChatLeader: ", error);
		}
	};

	const handleExit = async () => {
		try {
			const data = await ChatApi.leaveFromChat(workspaceId, chatRoomId);

			if (data) {
				removeRoom(chatRoomId);
				setIsModalOpen(false);
				navigate(`${window.location.pathname}`); // chatRoomId 쿼리 파라미터를 제거
			}
		} catch (error) {
			console.error("error fetching exit: ", error);
		}
	};


	const handleRegisterAnnouncement = async (message) => {
		try {
			await ChatApi.registerAnnouncementMsg(chatRoomId, message.id);

			// setChatRoomInfo((prev) => {
			// 	const updatedMessages = prev.messages.map((msg) =>
			// 		Number(msg.id) === Number(message.id)
			// 			? { ...msg, isAnnouncement: true }
			// 			: { ...msg, isAnnouncement: false }
			// 	);
			// 	return { ...prev, messages: updatedMessages };
			// });

			roomDispatch({
				type: "SET_CHAT_ROOM_INFO",
				payload: (prev) => {
					const updatedMessages = prev.chatRoomInfo.messages.map((msg) =>
						Number(msg.id) === Number(message.id)
							? { ...msg, isAnnouncement: true }
							: { ...msg, isAnnouncement: false }
					);
					return {
						...prev,
						chatRoomInfo: {
							...prev.chatRoomInfo,
							messages: updatedMessages
						}
					};
				}
			});

		} catch (error) {
			console.error("chatroom _ 공지 등록 에러: ", error);
		}
	};

	const handleDeleteMessage = async (message) => {
		try {
			await ChatApi.deleteMessage(chatRoomId, message.id);

			// setChatRoomInfo((prev) => {
			// 	const updatedMessages = prev.messages.filter((msg) =>
			// 		Number(msg.id) !== Number(message.id))
			// 	return { ...prev, messages: updatedMessages };
			// })

			const updatedMessages = roomState.chatRoomInfo.messages.filter((msg) =>
				Number(msg.id) !== Number(message.id));


			roomDispatch({
				type: "UPDATE_CHAT_ROOM_INFO_MSG",
				payload: {
					messages: updatedMessages
				}
			});
		} catch (error) {
			console.error("chatroom _ 공지 등록 에러: ", error);
		}
	}

	const fetchMoreMessages = async () => {
		if (!roomState.chatRoomInfo.msgHasMore) return;
		try {
			const res = await ChatApi.getMoreMessages(chatRoomId, page + 1, 50);
			if (res.messages.length > 0) {
				// setChatRoomInfo((prev) => ({
				// 	...prev,
				// 	messages: [...res.messages.reverse(), ...prev.messages],
				// 	msgHasMore: Boolean(res.msgHasMore),
				// }))

				roomDispatch({
					type: "SET_CHAT_ROOM_INFO",
					payload: (prev) => ({
						...prev,
						chatRoomInfo: {
							...prev.chatRoomInfo,
							messages: [...res.messages.reverse(), ...prev.messages],
							msgHasMore: Boolean(res.msgHasMore)
						}
					})
				});

				setPage(page + 1);
			} else {
				// setChatRoomInfo((prev) => ({
				// 	...prev,
				// 	msgHasMore: false,
				// }));

				roomDispatch({
					type: "SET_CHAT_ROOM_INFO",
					payload: (prev) => ({
						...prev,
						chatRoomInfo: {
							...prev.chatRoomInfo,
							msgHasMore: false
						}
					})
				});
			}
		} catch (error) {
			console.error("추가 메시지 로드 실패: ", error);
		}
	}


	const handleSendMessage = async (newMessage, files) => {
		try {
			let uploadedFileIds = [];
			if (files && files.length > 0) {
				const uploadRes = await ChatApi.uploadChatFile(files);
				uploadedFileIds = uploadRes.imageIds;
			}

			const sendMessage = {
				content: newMessage.content,
				isAnnouncement: false,
				mentionedUserIds: newMessage.mentionedIds,
				replyId: newMessage.replyId,
				// sender: currentMemberInfo.name,
				workspaceId: roomState.chatRoomInfo.workSpaceId,
				// writerWsMemberId: currentMemberInfo.wsMemberId,
				imageIds: uploadedFileIds,
			};

			console.log("Sending message:", JSON.stringify(sendMessage));
			if (socketRef && socketRef.current) {
				socketRef.current.publish({
					destination: `/app/messages/${chatRoomId}`,
					body: JSON.stringify(sendMessage),
				});
			} else {
				console.warn("websocket 미연결 or 메시지 빔");
			}
		} catch (error) {
			console.error("메시지 전송 실패:", error);
		}
	};

	// 메시지를 클릭하면 해당 메시지를 선택
	const handleMessageClick = (messages) => {
		// console.log("답장할 메시지:", messages);
		// setSelectedMessageId(messageId);
		setReplyToMessage(messages);

		// console.log("입력창에 표시된 답장 대상:", `${messages.text}`);
	};



	return (
		<ChatRoomContext.Provider
			value={{
				// fetchRoomInfo,
				isModalOpen,
				setIsModalOpen,
				roomState,
				handleInvite,
				handleKick,
				handleDelegate,
				handleExit,
				handleMessageClick,
				handleRegisterAnnouncement,
				handleDeleteMessage,
				fetchMoreMessages,
				handleSendMessage,
				replyToMessage,
				setReplyToMessage
			}}
		>
			{children}
		</ChatRoomContext.Provider>
	)
}