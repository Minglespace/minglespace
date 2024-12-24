import api, { HOST_URL } from "./Api";

class MilestoneApi {
  static prefix = `${HOST_URL}/workspace`;

  static getList = async (workspaceId) => {
    try {
      const res = await api.axiosIns.get(
        `${MilestoneApi.prefix}/${workspaceId}/milestone`
      );
      return res.data;
    } catch (error) {
      console.error("마일스톤 목록조회 실패", error);
      throw error;
    }
  };

  static getOne = async (workspaceId) => {
    try {
      const res = await api.axiosIns.get(
        `${MilestoneApi.prefix}/${workspaceId}`
      );
      return res.data;
    } catch (error) {
      console.error("마일스톤 세부조회 실패", error);
      throw error;
    }
  };

  static postAddGroup = async (workspaceId, milestoneGroupObj) => {
    try {
      const res = await api.axiosIns.post(
        `${MilestoneApi.prefix}/${workspaceId}/milestone/milestoneGroup`,
        milestoneGroupObj
      );
      return res.data;
    } catch (error) {
      console.error("마일스톤 그룹생성 실패", error);
      throw error;
    }
  };

  static postAddItem = async (
    workspaceId,
    milestoneGroupId,
    milestoneItemObj
  ) => {
    try {
      const res = await api.axiosIns.post(
        `${MilestoneApi.prefix}/${workspaceId}/milestone/milestoneGroup/${milestoneGroupId}`,
        milestoneItemObj
      );
      return res.data;
    } catch (error) {
      console.log("마일스톤 아이템 생성 실패", error);
      throw error;
    }
  };

  static modifyGroup = async (
    workspaceId,
    milestoneGroupId,
    milestoneGroupObj
  ) => {
    try {
      const res = await api.axiosIns.put(
        `${MilestoneApi.prefix}/${workspaceId}/milestone/milestoneGroup/${milestoneGroupId}`,
        milestoneGroupObj
      );
      return res.data;
    } catch (error) {
      console.log("마일스톤 그룹 수정 실패", error);
      throw error;
    }
  };

  static modifyItem = async (
    workspaceId,
    milestoneItemId,
    milestoneItemObj
  ) => {
    try {
      const res = await api.axiosIns.put(
        `${MilestoneApi.prefix}/${workspaceId}/milestone/milestoneItem/${milestoneItemId}`,
        milestoneItemObj
      );
      return res.data;
    } catch (error) {
      console.log("마일스톤 아이템 수정 실패", error);
      throw error;
    }
  };

  static deleteGroup = async (workspaceId, milestoneGroupId) => {
    try {
      const res = await api.axiosIns.delete(
        `${MilestoneApi.prefix}/${workspaceId}/milestone/milestoneGroup/${milestoneGroupId}`
      );
      return res.data;
    } catch (error) {
      console.log("마일스톤 그룹 삭제 실패", error);
      throw error;
    }
  };

  static deleteItem = async (workspaceId, milestoneItemId) => {
    try {
      const res = await api.axiosIns.delete(
        `${MilestoneApi.prefix}/${workspaceId}/milestone/milestoneItem/${milestoneItemId}`
      );
      return res.data;
    } catch (error) {
      console.log("마일스톤 아이템 삭제 실패", error);
      throw error;
    }
  };
}

export default MilestoneApi;
