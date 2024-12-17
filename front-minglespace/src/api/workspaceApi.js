import api, { HOST_URL } from "./Api";

class WorkspaceApi {
  static prefix = `${HOST_URL}/workspace`;

  static getList = async () => {
    try {
      const res = await api.axiosIns.get(`${WorkspaceApi.prefix}`);

      return res.data;
    } catch (error) {
      console.error("워크스페이스 목록조회 실패", error);
      throw error;
    }
  };

  static getOne = async (workspaceId) => {
    try {
      const res = await api.axiosIns.get(
        `${WorkspaceApi.prefix}/${workspaceId}`
      );
      return res.data;
    } catch (error) {
      console.error("워크스페이스 조회 실패", error);
      throw error;
    }
  };

  static getWsMemberRole = async (workspaceId) => {
    try {
      const res = await api.axiosIns.get(
        `${WorkspaceApi.prefix}/${workspaceId}/role`
      );

      return res.data;
    } catch (error) {
      console.error("권한 조회 실패", error);
      throw error;
    }
  };

  static postAdd = async (workspaceObj) => {
    try {
      const res = await api.axiosIns.post(
        `${WorkspaceApi.prefix}`,
        workspaceObj
      );

      return res.data;
    } catch (error) {
      console.error("워크스페이스 작성 실패", error);
      throw error;
    }
  };

  static modifyOne = async (workspaceId, workspaceObj) => {
    try {
      const res = await api.axiosIns.put(
        `${WorkspaceApi.prefix}/${workspaceId}`,
        workspaceObj
      );
      return res.data;
    } catch (error) {
      console.error("워크스페이스 수정 실패", error);
      throw error;
    }
  };

  static deleteOne = async (workspaceId) => {
    try {
      const res = await api.axiosIns.delete(
        `${WorkspaceApi.prefix}/${workspaceId}`
      );
      return res.data;
    } catch (error) {
      console.error("워크스페이스 삭제 실패", error);
      throw error;
    }
  };
}

export default WorkspaceApi;
