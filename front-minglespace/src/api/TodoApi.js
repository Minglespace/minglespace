import api, { HOST_URL } from "./Api";

class TodoApi {
  static prefix = `${HOST_URL}/workspace`;

  static getList = async (workspaceId, wsmemberId) => {
    const res = await api.axiosIns.get(
      `${TodoApi.prefix}/${workspaceId}/todo/${wsmemberId}`
    );

    return res.data;
  };

  static getOne = async (workspaceId) => {
    const res = await api.axiosIns.get(`${TodoApi.prefix}/${workspaceId}`);

    return res.data;
  };

  static postAddGroup = async (workspaceId, milestoneGroupObj) => {
    const res = await api.axiosIns.post(
      `${TodoApi.prefix}/${workspaceId}/milestone/milestoneGroup`,
      milestoneGroupObj
    );

    return res.data;
  };

  static postAddItem = async (
    workspaceId,
    milestoneGroupId,
    milestoneItemObj
  ) => {
    const res = await api.axiosIns.post(
      `${TodoApi.prefix}/${workspaceId}/milestone/milestoneGroup/${milestoneGroupId}`,
      milestoneItemObj
    );

    return res.data;
  };

  static modifyGroup = async (
    workspaceId,
    milestoneGroupId,
    milestoneGroupObj
  ) => {
    const res = await api.axiosIns.put(
      `${TodoApi.prefix}/${workspaceId}/milestone/milestoneGroup/${milestoneGroupId}`,
      milestoneGroupObj
    );
    return res.data;
  };

  static modifyItem = async (
    workspaceId,
    milestoneItemId,
    milestoneItemObj
  ) => {
    const res = await api.axiosIns.put(
      `${TodoApi.prefix}/${workspaceId}/milestone/milestoneItem/${milestoneItemId}`,
      milestoneItemObj
    );
    return res.data;
  };

  static deleteGroup = async (workspaceId, milestoneGroupId) => {
    const res = await api.axiosIns.delete(
      `${TodoApi.prefix}/${workspaceId}/milestone/milestoneGroup/${milestoneGroupId}`
    );
    return res.data;
  };

  static deleteItem = async (workspaceId, milestoneItemId) => {
    const res = await api.axiosIns.delete(
      `${TodoApi.prefix}/${workspaceId}/milestone/milestoneItem/${milestoneItemId}`
    );
    return res.data;
  };
}

export default TodoApi;
