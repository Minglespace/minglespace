import api, { HOST_URL } from "./Api";

const prefix = `${HOST_URL}/workspace`;
class TodoApi {
  static getList = async (workspaceId, searchKeyword, sortType, searchType) => {
    try {
      let url = `${prefix}/${workspaceId}/todo/search`;
      if (searchKeyword) url += `/${searchKeyword}`;

      const params = [];
      if (searchType) params.push(`searchType=${searchType}`);
      if (sortType) params.push(`sortType=${sortType}`);
      if (params.length > 0) url += `?${params.join("&")}`;

      const res = await api.axiosIns.get(url);
      return res.data;
    } catch (error) {
      console.error("할일 목록 조회 실패", error);
      throw error;
    }
  };

  static getAllList = async (
    workspaceId,
    searchKeyword,
    sortType,
    searchType
  ) => {
    try {
      let url = `${prefix}/${workspaceId}/todo/leader`;

      if (searchKeyword) url += `/${searchKeyword}`;

      const params = [];
      if (searchType) params.push(`searchType=${searchType}`);
      if (sortType) params.push(`sortType=${sortType}`);
      if (params.length > 0) url += `?${params.join("&")}`;

      const res = await api.axiosIns.get(url);
      return res.data;
    } catch (error) {
      console.error("할일 전체목록 조회 실패", error);
      throw error;
    }
  };

  static getOne = async (workspaceId, todoId) => {
    const res = await api.axiosIns.get(`${workspaceId}/todo/${todoId}`);

    return res.data;
  };

  static postAddTodo = async (workspaceId, todoObj) => {
    const res = await api.axiosIns.post(
      `${prefix}/${workspaceId}/todo`,
      todoObj
    );

    return res.data;
  };

  static modifyTodo = async (todoId, workspaceId, todoObj) => {
    const res = await api.axiosIns.put(
      `${prefix}/${workspaceId}/todo/${todoId}`,
      todoObj
    );
    return res.data;
  };

  static deleteTodo = async (workspaceId, todoId) => {
    const res = await api.axiosIns.delete(
      `${prefix}/${workspaceId}/todo/${todoId}`
    );
    return res.data;
  };
}

export default TodoApi;
