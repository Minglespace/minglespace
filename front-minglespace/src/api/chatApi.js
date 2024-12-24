import axios from "axios";
import Repo from "../auth/Repo";
import api, { HOST_URL } from "./Api";


const chatroomPrefix = `/workspaces`;
const messagePrefix = `/chatRooms`;


class ChatApi {
	/////ChatList.js와 관련 API////////////
	static getChatList = async (workspaceId) => {
		try {
			const res = await api.axiosIns.get(`${chatroomPrefix}/${workspaceId}/chatRooms/members`);
			console.log("채팅방 목록 응답:", res);
			return res.data;  // 서버 응답 데이터 반환
		} catch (error) {
			if (error.response && error.response.status === 403) {
				alert("현재 채팅방에는 참여할 수 없습니다.");
				window.location.href = `/workspace`;
			} else {
				console.error("채팅방 목록 가져오기 실패:", error.message);
			}
		}
	};

	static createChatRoom = async (workspaceId, requestDTO, imageFile) => {

		const formData = new FormData();

		formData.append('requestDTO', new Blob([JSON.stringify(requestDTO)], { type: 'application/json' }));
		formData.append('image', imageFile);

		//헤더 만들기
		const accessToken = Repo.getAccessToken();
		const headers = {
			'Authorization': `Bearer ${accessToken}`,
		};

		try {
			// 요청 보내기
			const res = await axios.post(`${HOST_URL}${chatroomPrefix}/${workspaceId}/chatRooms`, formData, { headers });
			return res.data;  // 서버 응답 반환
		} catch (error) {
			console.error("채팅방 생성 실패:", error.message);
		}
	};


	static getwsMembers = async (workspaceId) => {
		const res = await api.axiosIns.get(`/workspace/${workspaceId}/members`);
		return res.data;
	};

	////ChatRoom 관련 API//////
	////에러 발생 케이스 확인하기//////
	static getChatRoom = async (workspaceId, chatRoomId) => {
		try {
			const res = await api.axiosIns.get(`${chatroomPrefix}/${workspaceId}/chatRooms/${chatRoomId}`);
			return res.data;
		} catch (error) {
			if (error.response && error.response.status === 404) {
				alert("채팅방에 참여하실 수 없습니다.", error.response.message);
				window.location.href = `/workspace/${workspaceId}/chat`;
				return;
			} else {
				console.error("채팅방 정보 겟 실패:", error.message);
			}
		}

	};

	static addMemberToRoom = async (workspaceId, chatRoomId, addMemberId) => {
		try {
			const res = await api.axiosIns.post(`${chatroomPrefix}/${workspaceId}/chatRooms/${chatRoomId}/members/${addMemberId}`);
			return res.data;
		} catch (error) {
			if (error.response && error.response.status === 403) {
				alert("채팅방 멤버 추가 실패", error.response.data.message);
			} else {
				console.error("채팅방 멤버 추가 실패:", error.message);
			}

		}
	};

	static kickMemberFromRoom = async (workspaceId, chatRoomId, kickMemberId) => {
		try {
			const res = await api.axiosIns.delete(`${chatroomPrefix}/${workspaceId}/chatRooms/${chatRoomId}/members/${kickMemberId}/kick`);
			return res.data;
		} catch (error) {
			console.error("채팅방 멤버 강퇴 실패:", error.message);
		}
	};

	static leaveFromChat = async (workspaceId, chatRoomId) => {
		try {
			const res = await api.axiosIns.delete(`${chatroomPrefix}/${workspaceId}/chatRooms/${chatRoomId}/leave`);
			return res.data;
		} catch (error) {
			console.error("채팅방 나가기 실패:", error.message);
		}
	};

	static delegateLeader = async (workspaceId, chatRoomId, newLeaderId) => {
		try {
			const res = await api.axiosIns.put(`${chatroomPrefix}/${workspaceId}/chatRooms/${chatRoomId}/leader/${newLeaderId}`);
			return res.data;
		} catch (error) {
			console.error("채팅방 방장 위임 실패:", error.message);
		}
	};

	static readMessage = async (workspaceId, chatRoomId) => {
		try {
			await api.axiosIns.delete(`${chatroomPrefix}/${workspaceId}/chatRooms/${chatRoomId}/readMsg`);
		} catch (error) {
			console.log("메시지 읽음 처리 실패: ", error.message);
		}
	}

	/////////message///////////
	static getMoreMessages = async (chatRoomId, page, size) => {
		try {
			const response = await api.axiosIns.get(`${messagePrefix}/${chatRoomId}/messages`, {
				params: { page, size },
			});
			return response.data;
		} catch (error) {
			console.log("메시지 가져오기 실패: ", error.message);
		}
	}

	static registerAnnouncementMsg = async (chatRoomId, messageId) => {
		try {
			await api.axiosIns.put(`${messagePrefix}/${chatRoomId}/messages/${messageId}/announcement`);
		} catch (error) {
			console.log("공지 등록에 실패: ", error.message);
		}
	}

	static deleteMessage = async (chatRoomId, messageId) => {
		try {
			await api.axiosIns.delete(`${messagePrefix}/${chatRoomId}/messages/${messageId}`);
		} catch (error) {
			console.log("메시지 삭제 실패: ", error.message);
		}
	}

	static uploadChatFile = async (files) => {
		try {
			const formData = new FormData();
			files.forEach(file => {
				formData.append("files", file);
			});

			const res = await api.axiosIns.post("/upload/files", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});
			return res.data;
		} catch (error) {
			console.error("채팅 파일 업로드 실패: ", error.message);
		}
	}

	static downloadFile = async (url) => {
		try {
			const res = await api.axiosIns.get(url, {
				responseType: 'blob',
			});
			return res.data;
		} catch (error) {
			console.error("파일 다운로드 실패: ", error.message);
		}
	}

}

export default ChatApi;



