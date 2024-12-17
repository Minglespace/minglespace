import e from "cors";
import api, { HOST_URL } from "./Api";

const prefix = `${HOST_URL}/workspace`;

class MembersApi {
  //멤버 목록 조회
  static getMemberList = async (workspaceId) => {
    try {
      const res = await api.axiosIns.get(`${prefix}/${workspaceId}/members`);
      return res.data;
    } catch (error) {
      console.error("멤버 목록조회 실패", error);
      throw error;
    }
  };

  //친구 목록 조회
  static getFriendList = async (workspaceId) => {
    try {
      const res = await api.axiosIns.get(`${prefix}/${workspaceId}/friends`);
      return res.data;
    } catch (error) {
      console.error("친구 목록조회 실패", error);
      throw error;
    }
  };

  //멤버 초대(친구목록에서)
  static inviteMember = async (workspaceId, friendId) => {
    try {
      const res = await api.axiosIns.post(
        `${prefix}/${workspaceId}/invite/${friendId}`
      );
      return res.data;
    } catch (error) {
      console.error("멤버 초대 실패", error);
      throw error;
    }
  };
  //멤버 초대(링크방식으로)
  static linkInviteMember = async (workspaceId, email) => {
    try {
      const res = await api.axiosIns.post(
        `${prefix}/${workspaceId}/linkInvite`,
        { email: email }
      );
      return res.data;
    } catch (error) {
      console.error("멤버 초대 실패", error);
      throw error;
    }
  };

  //멤버 내보내기
  static removeMember = async (workspaceId, memberId) => {
    try {
      const res = await api.axiosIns.delete(
        `${prefix}/${workspaceId}/removeMember/${memberId}`
      );
      return res.data;
    } catch (error) {
      console.error("멤버 추방 실패", error);
      throw error;
    }
  };

  //리더 위임하기
  static transferLeader = async (workspaceId, memberId) => {
    try {
      const res = await api.axiosIns.put(
        `${prefix}/${workspaceId}/transferLeader/${memberId}`
      );
      return res.data;
    } catch (error) {
      console.error("리더 위임 실패", error);
      throw error;
    }
  };

  //멤버 권한 바꾸기
  static transferRole = async (workspaceId, memberId, role) => {
    try {
      const res = await api.axiosIns.put(
        `${prefix}/${workspaceId}/transferRole/${memberId}`,
        { role }
      );
      return res.data;
    } catch (error) {
      console.error("멤버 권한 변경 실패", error);
      throw error;
    }
  };
}

export default MembersApi;
