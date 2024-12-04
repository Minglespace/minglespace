
import apiClient from "../api/ApiClient"

class ApiWorkspace{

  static prefix = `${ApiWorkspace.HOST_URL}/workspace`;

    
  static getList = async (userId) => {
    console.log("userId : ", userId);
    const res = await apiClient.get(`${ApiWorkspace.prefix}/user/${userId}`);
    console.log("res : ", res);

    return res.data;
  };

  static getOne = async (workspaceId) => {
    const res = await apiClient.get(`${ApiWorkspace.prefix}/${workspaceId}`);

    return res.data;
  };

  static postAdd = async (userId, workspaceObj) => {
    const res = await apiClient.post(`${ApiWorkspace.prefix}/user/${userId}`, workspaceObj);

    return res.data;
  };

  static modifyOne = async (workspaceId, workspaceObj) => {
    const res = await apiClient.put(`${ApiWorkspace.prefix}/${workspaceId}`, workspaceObj);
    return res.data;
  };

  static deleteOne = async (userId, workspaceId) => {
    const res = await apiClient.delete(`${ApiWorkspace.prefix}/${workspaceId}/user/${userId}`);
    return res.data;
  };



}

export default ApiWorkspace;