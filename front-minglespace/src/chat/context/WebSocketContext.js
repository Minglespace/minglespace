import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { HOST_URL } from "../../api/Api";
import { Client } from "@stomp/stompjs";
import Repo from "../../auth/Repo";

const WebSocketContext = createContext(null);



export const WebSocketProvider = ({ children }) => {
	const socketRef = useRef(null); //websocket client
	const stompClientRef = useRef(null); //stomp client
	const subscriptionRefs = useRef(new Map()); //여러 구독 

	const [isConnected, setIsConnected] = useState(false);

	const connectWebSocket = useCallback((subscriptions) => {
		if (stompClientRef.current) return;

		const socket = new SockJS(`${HOST_URL}/ws`);
		const stompClient = new Client({
			webSocketFactory: () => socket,
			connectHeaders: {
				Authorization: `Bearer ${Repo.getAccessToken()}`, // 토큰 관리 방식에 맞게 수정
			},
			onConnect: () => {
				setIsConnected(true);
				console.log("WebSocket connected!");

				// 각 구독을 동적으로 구독
				subscriptions.forEach(({ path, messageHandler }) => {
					if (!subscriptionRefs.current.has(path)) {
						const subscription = stompClient.subscribe(path, (msg) => {
							console.log("구독 메시지 도착 : ", msg.body, ", path: ", path);
							const newMsg = JSON.parse(msg.body);
							messageHandler(newMsg); // 메시지 처리 함수 호출
						});
						subscriptionRefs.current.set(path, subscription);
						console.log("update subscriptions: ", subscriptionRefs.current);
					}
				});
			},
			onWebSocketError: (error) => {
				console.error("WebSocket error:", error);
			},
			reconnectDelay: 5000, // 자동 재연결 시도
			heartbeatIncoming: 4000,  // 서버에서 4초마다 ping
			heartbeatOutgoing: 4000,  // 클라이언트에서 4초마다 pong
			withCredentials: true, // 인증 정보 포함
		});

		stompClient.activate();
		stompClientRef.current = stompClient;
		socketRef.current = socket;
	}, []);


	//unmount
	useEffect(() => {
		return () => {
			if (stompClientRef.current) {
				subscriptionRefs.current.forEach((subs) => {
					subs.unsubscribe();
				});
				stompClientRef.current.deactivate();
				stompClientRef.current = null;
			}

			if (socketRef.current) {
				socketRef.current.close();
				socketRef.current = null;
			}
			setIsConnected(false);
		};
	}, []);

	return (
		<WebSocketContext.Provider value={{ connectWebSocket, isConnected, stompClientRef, subscriptionRefs }}>
			{children}
		</WebSocketContext.Provider>
	);
};



//websocket context hook
export const useWebSocket = (subscriptions) => {
	const { connectWebSocket, isConnected, stompClientRef, subscriptionRefs } = useContext(WebSocketContext);


	useEffect(() => {
		const activeSubscriptions = subscriptions?.filter((sub) => !!sub.path) || [];
		const client = stompClientRef.current;
		const subscriptionMap = subscriptionRefs.current;


		if (activeSubscriptions.length > 0) {
			if (isConnected) {
				activeSubscriptions.forEach(({ path, messageHandler }) => {

					// const existingSubChat = Array.from(subscriptionMap.keys()).find((key) => key.startsWith('/topic/chatRooms/') && path.startsWith('/topic/chatRooms'));
					// console.log("기존 구독 존재: ", existingSubChat);

					// if (existingSubChat) {
					// 	const beforeSubChat = subscriptionMap.get(existingSubChat);
					// 	beforeSubChat.unsubscribe();
					// 	console.log("기존 구독 취소: ", existingSubChat);
					// 	subscriptionMap.delete(existingSubChat);
					// }

					if (!subscriptionMap.has(path)) {
						const subscription = client.subscribe(path, (msg) => {
							console.log("구독 메시지 도착 2: ", msg.body, ", path: ", path);
							const newMsg = JSON.parse(msg.body);
							messageHandler(newMsg);
						});
						subscriptionMap.set(path, subscription);
						console.log("구독 추가됨:", path);
						console.log("현 전체 구독:", subscriptionMap);
					}
				});
			} else {
				connectWebSocket(activeSubscriptions);
			}
		}

		// return () => {
		// 	if (client && activeSubscriptions.length > 0) {
		// 		activeSubscriptions.forEach(({ path }) => {
		// 			if (subscriptionMap.has(path)) {
		// 				const subscription = subscriptionMap.get(path);
		// 				subscription.unsubscribe();
		// 				console.log("usewebsocket _ unmount_ unsubPath: ", path);
		// 				subscriptionMap.delete(path);
		// 			}
		// 		});
		// 	}

		// };
	}, [subscriptions, connectWebSocket, isConnected]);

	return { isConnected, stompClientRef };
};