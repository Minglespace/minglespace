import api, { HOST_URL } from "./Api";

const prefix = `${HOST_URL}/main`;

class MainApi {
  //ALL 캘린더 이벤트 목록 가져오기
  static getMainNotice = async () => {
    try {
      const res = await api.axiosIns.get(`${prefix}`);
      return res.data;
    } catch (error) {
      console.error("캘린더 최신 공지 조회 실패", error);
      throw error;
    }
  };
}

export default MainApi;
