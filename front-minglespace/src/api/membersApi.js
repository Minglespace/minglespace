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

  //멤버 초대
  static inviteMember = async (workspaceId, friendId) => {
    try {
      const res = await api.axiosIns.post(
        `${prefix}/${workspaceId}/invite/${friendId}`
      );
      return res.data;
    } catch (error) {
      console.error("친구 초대 실패", error);
      throw error;
    }
  };
}

export default MembersApi;
