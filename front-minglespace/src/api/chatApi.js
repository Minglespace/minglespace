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
    ////에러 발생 케이스 확인하기//////
    static getChatRoom = async (workspaceId, chatRoomId) => {
        try {
            const res = await api.axiosIns.get(`${prefix}/${workspaceId}/chatRooms/${chatRoomId}`);
            return res.data;
        } catch (error) {
            console.error("채팅방 정보 겟 실패:", error);
            // throw error;  // 에러 처리
        }

    };

    static addMemberToRoom = async (workspaceId, chatRoomId, addMemberId) => {
        try {
            const res = await api.axiosIns.post(`${prefix}/${workspaceId}/chatRooms/${chatRoomId}/members/${addMemberId}`);
            return res.data;
        } catch (error) {
            console.error("채팅방 멤버 추가 실패:", error);
            // throw error;  // 에러 처리
        }
    };

    static kickMemberFromRoom = async (workspaceId, chatRoomId, kickMemberId) => {
        try {
            const res = await api.axiosIns.delete(`${prefix}/${workspaceId}/chatRooms/${chatRoomId}/members/${kickMemberId}/kick`);
            return res.data;
        } catch (error) {
            console.error("채팅방 멤버 강퇴 실패:", error);
            // throw error;  // 에러 처리
        }
    };

    static leaveFromChat = async (workspaceId, chatRoomId) => {
        try {
            const res = await api.axiosIns.delete(`${prefix}/${workspaceId}/chatRooms/${chatRoomId}/leave`);
            return res.data;
        } catch (error) {
            console.error("채팅방 나가기 실패:", error);
            // throw error;  // 에러 처리
        }
    };

    static delegateLeader = async (workspaceId, chatRoomId, newLeaderId) => {
        try {
            const res = await api.axiosIns.put(`${prefix}/${workspaceId}/chatRooms/${chatRoomId}/leader/${newLeaderId}`);
            return res.data;
        } catch (error) {
            console.error("채팅방 방장 위임 실패:", error);
            // throw error;  // 에러 처리
        }
    };

}

export default ChatApi;



