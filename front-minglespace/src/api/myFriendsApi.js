import api, { HOST_URL } from "./Api";

const prefix = `${HOST_URL}/myFriends`;

class MyFriendsApi {
  //친구 목록 조회
  static getList = async (searchKeyword) => {
    try {
      const url = searchKeyword ? `${prefix}/${searchKeyword}` : prefix;
      const res = await api.axiosIns.get(url);
      return res.data;
    } catch (error) {
      console.error("친구 목록조회 실패", error);
      throw error;
    }
  };

  //친구 삭제
  static remove = async (friendId) => {
    try {
      const res = await api.axiosIns.delete(`${prefix}/${friendId}`);
      return res.data;
    } catch (error) {
      console.error("친구 삭제 실패", error);
      throw error;
    }
  };

  //친추를 위한 유저 조회
  static getUserList = async (searchKeyword) => {
    try {
      const url = searchKeyword
        ? `${prefix}/userSearch/${searchKeyword}`
        : `${prefix}/userSearch`;
      const res = await api.axiosIns.get(url);
      return res.data;
    } catch (error) {
      console.error("유저 조회 실패", error);
      throw error;
    }
  };

  //친구 신청
  static friendRequest = async (friendId) => {
    try {
      const res = await api.axiosIns.post(`${prefix}/${friendId}`);
      return res.data;
    } catch (error) {
      console.error("친구 신청 실패");
      throw error;
    }
  };
  //친구 수락
  static acceptFriend = async (friendId) => {
    try {
      const res = await api.axiosIns.put(`${prefix}/accept/${friendId}`);
      return res.data;
    } catch (error) {
      console.error("친구 수락 실패");
      throw error;
    }
  };
  //친구 거절
  static refuseFriend = async (friendId) => {
    try {
      const res = await api.axiosIns.delete(`${prefix}/refuse/${friendId}`);
      return res.data;
    } catch (error) {
      console.error("친구 거절 실패");
      throw error;
    }
  };
  //친구 신청한 목록
  static friendRequestList = async () => {
    try {
      const res = await api.axiosIns.get(`${prefix}/request`);
      return res.data;
    } catch (error) {
      console.error("친구 신청 목록 조회 실패");
      throw error;
    }
  };
  //친구 요청온 목록
  static friendPendingList = async () => {
    try {
      const res = await api.axiosIns.get(`${prefix}/pending`);
      return res.data;
    } catch (error) {
      console.error("친구 요청온 목록 조회 실패");
      throw error;
    }
  };

}

export default MyFriendsApi;
