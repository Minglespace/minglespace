
import api, {HOST_URL} from "./Api"

class WorkspaceApi{

  static prefix = `${HOST_URL}/workspace`;

    
  static getList = async (userId) => {
    console.log("userId : ", userId);
    const res = await api.axiosIns.get(`${WorkspaceApi.prefix}/user/${userId}`);
    console.log("res : ", res);

    return res.data;
  };

  static getOne = async (workspaceId) => {
    const res = await api.axiosIns.get(`${WorkspaceApi.prefix}/${workspaceId}`);

    return res.data;
  };

  static postAdd = async (userId, workspaceObj) => {
    const res = await api.axiosIns.post(`${WorkspaceApi.prefix}/user/${userId}`, workspaceObj);

    return res.data;
  };

  static modifyOne = async (workspaceId, workspaceObj) => {
    const res = await api.axiosIns.put(`${WorkspaceApi.prefix}/${workspaceId}`, workspaceObj);
    return res.data;
  };

  static deleteOne = async (userId, workspaceId) => {
    const res = await api.axiosIns.delete(`${WorkspaceApi.prefix}/${workspaceId}/user/${userId}`);
    return res.data;
  };



}

export default WorkspaceApi;