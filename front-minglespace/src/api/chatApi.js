import axios from "axios";
import Repo from "../auth/Repo";
import api, { HOST_URL } from "./Api";


const prefix = `/workspaces`;


class ChatApi {
    /////ChatList.js와 관련 API////////////
    static getChatList = async (workspaceId) => {
        try {
            const res = await api.axiosIns.get(`${prefix}/${workspaceId}/chatRooms/members`);
            console.log("채팅방 목록 응답:", res);
            return res.data;  // 서버 응답 데이터 반환
        } catch (error) {
            if (error.response && error.response.status === 403) {
                alert(error.response.data.error);
                window.location.href = `/workspace`;
            } else {
                console.error("채팅방 목록 가져오기 실패:", error);
                throw error;  // 에러 발생시 예외 처리
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
            const res = await axios.post(`${HOST_URL}${prefix}/${workspaceId}/chatRooms`, formData, { headers });
            return res.data;  // 서버 응답 반환
        } catch (error) {
            console.error("채팅방 생성 실패:", error);
            throw error;  // 에러 처리
        }
    };


    static getwsMembers = async (workspaceId) => {
        const res = await api.axiosIns.get(`/workspace/${workspaceId}/members`);
        return res.data;
    };

    ////ChatRoom 관련 API//////
    static getChatRoom = async (workspaceId, chatRoomId) => {
        const res = await api.axiosIns.get(`${prefix}/${workspaceId}/chatRooms/${chatRoomId}`);

        return res.data;
    };

    static addMemberToRoom = async (workspaceId, chatRoomId, addMemberId) => {
        const res = await api.axiosIns.post(`${prefix}/${workspaceId}/chatRooms/${chatRoomId}/members/${addMemberId}`);
        return res.data;
    };

    static kickMemberFromRoom = async (workspaceId, chatRoomId, kickMemberId) => {
        const res = await api.axiosIns.delete(`${prefix}/${workspaceId}/chatRooms/${chatRoomId}/members/${kickMemberId}/kick`);
        return res.data;
    };

    static leaveFromChat = async (workspaceId, chatRoomId) => {
        const res = await api.axiosIns.delete(`${prefix}/${workspaceId}/chatRooms/${chatRoomId}/leave`);
        return res.data;
    };

    static delegateLeader = async (workspaceId, chatRoomId, newLeaderId) => {
        const res = await api.axiosIns.delete(`${prefix}/${workspaceId}/chatRooms/${chatRoomId}/leader/${newLeaderId}`);
        return res.data;
    };

}

export default ChatApi;

//////////////////////ChatList.js와 관련 API/////////////////////////////
//채팅방 목록 조회
// export const getChatList = async (workspaceId) => {
// 	try {
// 		const res = await axiosInstance.get(`${prefix}/${workspaceId}/chatRooms/members`);
// 		console.log("채팅방 목록 응답:", res);
// 		return res.data;  // 서버 응답 데이터 반환
// 	} catch (error) {
// 		if (error.response && error.response.status === 403) {
// 			alert(error.response.data.error);
// 			window.location.href = `/workspace`;
// 		} else {
// 			console.error("채팅방 목록 가져오기 실패:", error);
// 			throw error;  // 에러 발생시 예외 처리
// 		}
// 	}
// };

//채팅방 생성
// export const createChatRoom = async (workspaceId, requestDTO, imageFile) => {

// 	const formData = new FormData();

// 	formData.append('requestDTO', new Blob([JSON.stringify(requestDTO)], { type: 'application/json' }));
// 	formData.append('image', imageFile);

// 	//헤더 만들기
// 	const accessToken = Repo.getAccessToken();
// 	const headers = {
// 		'Authorization': `Bearer ${accessToken}`,
// 	};

// 	try {
// 		// 요청 보내기
// 		const res = await axios.post(`${prefix}/${workspaceId}/chatRooms`, formData, { headers });
// 		return res.data;  // 서버 응답 반환
// 	} catch (error) {
// 		console.error("채팅방 생성 실패:", error);
// 		throw error;  // 에러 처리
// 	}
// };

// //워크스페이스 참여 멤버 가져오기.
// export const getwsMembers = async (workspaceId) => {
// 	const res = await axiosInstance.get(`http://localhost:8080/workspace/${workspaceId}/members`);
// 	return res.data;
// };




/////////////////ChatRoom 관련 API//////////////////////////
//특정방 조회
// export const getChatRoom = async (workspaceId, chatRoomId) => {
// 	const res = await axiosInstance.get(`${prefix}/${workspaceId}/chatRooms/${chatRoomId}`);

// 	return res.data;
// };


//채팅방 멤버추가
// export const addMemberToRoom = async (workspaceId, chatRoomId, addMemberId) => {
// 	const res = await axiosInstance.post(`${prefix}/${workspaceId}/chatRooms/${chatRoomId}/members/${addMemberId}`);
// 	return res.data;
// };

//채팅방 멤버강퇴
// export const kickMemberFromRoom = async (workspaceId, chatRoomId, kickMemberId) => {
// 	const res = await axiosInstance.delete(`${prefix}/${workspaceId}/chatRooms/${chatRoomId}/members/${kickMemberId}/kick`);
// 	return res.data;
// };


//방 나가기
// export const leaveFromChat = async (workspaceId, chatRoomId) => {
// 	const res = await axiosInstance.delete(`${prefix}/${workspaceId}/chatRooms/${chatRoomId}/leave`);
// 	return res.data;
// };

//방장 위임
// export const delegateLeader = async (workspaceId, chatRoomId, newLeaderId) => {
// 	const res = await axiosInstance.delete(`${prefix}/${workspaceId}/chatRooms/${chatRoomId}/leader/${newLeaderId}`);
// 	return res.data;
// };


