import { createContext, useContext, useEffect, useReducer, useRef, useState } from "react";
import { initialRoomsState, roomsReducer } from "../components/reducer/chatRoomReducer";
import { initialWsMemberState, wsMemberReducer } from "../components/reducer/wsMemberReducer";
import SockJS from "sockjs-client";
import { HOST_URL } from "../../api/Api";
import { Client } from "@stomp/stompjs";
import Repo from "../../auth/Repo";
import ChatApi from "../../api/chatApi";
import { useParams } from "react-router-dom";

const ChatAppContext = createContext();

export const useChatApp = () => useContext(ChatAppContext);

export const ChatAppProvider = ({ children }) => {
	const [roomsState, roomsDispatch] = useReducer(roomsReducer, initialRoomsState);
	const [wsMemberState, wsMemberDispatch] = useReducer(wsMemberReducer, initialWsMemberState);

	const [validChatRoomId, setValidChatRoomId] = useState(null);

	const socketRef = useRef(null);

	const { workspaceId } = useParams();

	useEffect(() => {
		const fetchChatRooms = async () => {
      try {
        const roomsData = await ChatApi.getChatList(workspaceId);
				roomsDispatch({
					type:"SET_ROOMS",
					payload:roomsData
				});
      } catch (e) {
        // console.log("chatrooms: ", roomsData);
        console.error("채팅방 데이터를 가져오는 데 문제가 발생했습니다.");
      }
    };

    //워크스페이스 멤버 목록
    const fetchWsMembers = async () => {
      try {
        const wsmembersData = await ChatApi.getwsMembers(workspaceId);
				wsMemberDispatch({
					type:"SET_WS_MEMBERS",
					payload: wsmembersData.filter(
            (member) => member.userId !== Number(Repo.getUserId())
          )
				});
      } catch (e) {
        console.error("Error fetching ws members:", e);
      }
    };

    fetchChatRooms();
    fetchWsMembers();
	},[workspaceId]);

	useEffect(() => {
		if (socketRef.current) {
			socketRef.current.deactivate();
			socketRef.current = null;
		}

		const socket = new SockJS(`${HOST_URL}/ws`);

		const stompClient = new Client({
			webSocketFactory: () => socket,
			connectHeaders: {
				Authorization: `Bearer ${Repo.getAccessToken()}`
			},
			onConnect: () => {
				console.log("chatapp _ websocket 연결 성공");

				stompClient.subscribe(`/topic/workspaces/${workspaceId}`, (msg) => {
					const newMsg = JSON.parse(msg.body);
					if (validChatRoomId == null || Number(validChatRoomId) !== Number(newMsg.chatRoomId)) {
						roomsDispatch({
							type: "UPDATE_ROOM_SUB",
							payload: {
								newMsg:newMsg
							},
						});
					} else {
						roomsDispatch({
							type: "UPDATE_ROOM",
							payload: {
								chatRoomId: newMsg.chatRoomId,
								updates: { lastMessage: newMsg.content }
							},
						});
					}
				});
			},
			onWebSocketError: (error) => {
				console.error(`채팅 목록 _ 웹소켓 연결 오류 : `, error);
			},
			reconnectDelay: 5000,  // 5초마다 자동 재연결 시도
			heartbeatIncoming: 4000,  // 서버에서 4초마다 ping
			heartbeatOutgoing: 4000,  // 클라이언트에서 4초마다 pong
			withCredentials: true,
		});

		stompClient.activate();
		socketRef.current = stompClient;

		return () => {
			if (socketRef.current) {
				socketRef.current.deactivate();
				socketRef.current = null;
			}
		};
	}, [workspaceId, validChatRoomId]);


	const handleCreateRoom = async (newRoomData, imageFile) => {
		try {
			const createdRoomData = await ChatApi.createChatRoom(workspaceId, newRoomData, imageFile);
			roomsDispatch({ type: "SET_ROOMS", payload: [createdRoomData, ...roomsState] });
		} catch (e) {
			console.error("채팅방 생성 실패");
		}
	};


	const handleReadMsg = async (chatRoomId) => {
		try {
			await ChatApi.readMessage(workspaceId, chatRoomId);

			roomsDispatch({
				type: "SET_ROOMS",
				payload: {
					chatRoomId: chatRoomId,
					updates: {
						notReadMsgCount: 0
					}
				}
			});
		} catch (e) {
			console.error(e);
		}
	};

	const updateRoomParticipantCount = (chatRoomId, change) => {
		roomsDispatch({
			type: "UPDATE_ROOM_PARTICIPANT",
			payload: {
				chatRoomId: chatRoomId,
				change:change
			}
		});
	};

	const removeRoom = (chatRoomId) => {
		roomsDispatch({
			type: "REMOVE_ROOM",
			payload: { chatRoomId: chatRoomId }
		})
	};


	return (
		<ChatAppContext.Provider
			value={{
				workspaceId,
				roomsState,
				roomsDispatch,
				wsMemberState,
				wsMemberDispatch,
				socketRef,
				setValidChatRoomId,
				handleCreateRoom,
				handleReadMsg,
				updateRoomParticipantCount,
				removeRoom,
			}}
		>
			{children}
		</ChatAppContext.Provider>
	)
};