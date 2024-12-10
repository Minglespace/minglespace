import SockJS from "sockjs-client";
import { HOST_URL } from "./Api";
import { Client } from "@stomp/stompjs";
import Repo from "../auth/Repo";

let stompClient = null;

export const createWebSocketClient = (subscribeCallback) => {
	const socket = new SockJS(`${HOST_URL}/ws`);

	stompClient = new Client({
		webSocketFactory: () => socket,
		connectHeaders: {
			Authorization: `Bearer ${Repo.getAccessToken()}`,
		},
		onConnect: () => {
			console.log("websocket connected");
			if (subscribeCallback) {
				subscribeCallback(stompClient);
			}
		},
		onWebSocketError: (error) => {
			console.error("websocket error: ", error);
		},
		withCredentials: true,
	});

	stompClient.activate();
	return stompClient;
};

export const disconnectWebsocket = (stompClient) => {
	if (stompClient) {
		stompClient.deactivate();
		console.log("websocket 연결 끊김");
	}
};

export const getStompClient = () => {
	return stompClient;
};

///////////구독//////////////////
////chatApp에서 받는 모든 채팅방들의 새 메시지
export const subToMsgByWsId = (workspaceId, stompClient, callback) => {
	stompClient.subscribe(`topic/workspaces/${workspaceId}`, (msg) => {
		const newMsg = JSON.parse(msg.body);
		callback(newMsg);
	});
};

export const unsubFromMsgByWsId = (workspaceId, stompClient) => {
	stompClient.unsubscribe(`topic/workspaces/${workspaceId}`);
}

///채팅방 하나 구독
export const subToMsgByChatRoom = (stompClient, chatRoomId, callback) => {
	stompClient.subscribe(`topic/chatRooms/${chatRoomId}/msg`, (msg) => {
		const newMsg = JSON.parse(msg.body);
		callback(newMsg);
	});
};


export const unsubFromMsgByChatRoom = (chatRoomId, stompClient) => {
	stompClient.unsubscribe(`topic/chatRooms/${chatRoomId}/msg`);
};
