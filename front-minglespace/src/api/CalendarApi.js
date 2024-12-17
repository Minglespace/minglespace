import api, { HOST_URL } from "./Api";

const prefix = `${HOST_URL}/workspace`;

class CalendarApi {
  //캘린더 이벤트 목록 가져오기
  static getList = async (workspaceId) => {
    try {
      const res = await api.axiosIns.get(`${prefix}/${workspaceId}/calendar`);
      return res.data;
    } catch (error) {
      console.error("캘린더 이벤트 목록조회 실패", error);
      throw error;
    }
  };

  //꼭 필요할까?
  static getOneCalendar = async (workspaceId, calendarId) => {
    try {
      const res = await api.axiosIns.get(
        `${prefix}/${workspaceId}/calendar/${calendarId}`
      );
      return res.data;
    } catch (error) {
      console.error("캘린더 이벤트 세부내용 조회 실패", error);
      throw error;
    }
  };

  //캘린더 이벤트 추가
  static addCalendar = async (workspaceId, calendarObj) => {
    try {
      const res = await api.axiosIns.post(
        `${prefix}/${workspaceId}/calendar`,
        calendarObj
      );
      return res.data;
    } catch (error) {
      console.error("캘린더 이벤트 조회 실패", error);
      throw error;
    }
  };

  //캘린더 이벤트 수정
  static modifyCalendar = async (workspaceId, calendarId, calendarObj) => {
    try {
      const res = await api.axiosIns.put(
        `${prefix}/${workspaceId}/calendar/${calendarId}`,
        calendarObj
      );
      return res.data;
    } catch (error) {
      console.error("캘린더 이벤트 수정 실패", error);
      throw error;
    }
  };

  //캘린더 이벤트 삭제
  static deleteCalendar = async (workspaceId, calendarId) => {
    try {
      const res = await api.axiosIns.delete(
        `${prefix}/${workspaceId}/calendar/${calendarId}`
      );
      return res.data;
    } catch (error) {
      console.error("캘린더 이벤트 삭제 실패", error);
      throw error;
    }
  };
}

export default CalendarApi;
