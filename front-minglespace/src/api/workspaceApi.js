import api, { HOST_URL } from "./Api";

class WorkspaceApi {
  static prefix = `${HOST_URL}/workspace`;

  static getList = async () => {
    const res = await api.axiosIns.get(`${WorkspaceApi.prefix}`);

    return res.data;
  };

  static getOne = async (workspaceId) => {
    const res = await api.axiosIns.get(`${WorkspaceApi.prefix}/${workspaceId}`);

    return res.data;
  };

  static getWsMemberRole = async (workspaceId) => {
    const res = await api.axiosIns.get(
      `${WorkspaceApi.prefix}/${workspaceId}/role`
    );

    return res.data;
  };

  static postAdd = async (workspaceObj) => {
    const res = await api.axiosIns.post(`${WorkspaceApi.prefix}`, workspaceObj);

    return res.data;
  };

  static modifyOne = async (workspaceId, workspaceObj) => {
    const res = await api.axiosIns.put(
      `${WorkspaceApi.prefix}/${workspaceId}`,
      workspaceObj
    );
    return res.data;
  };

  static deleteOne = async (workspaceId) => {
    const res = await api.axiosIns.delete(
      `${WorkspaceApi.prefix}/${workspaceId}`
    );
    return res.data;
  };
}

export default WorkspaceApi;
