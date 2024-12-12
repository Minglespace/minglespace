import api, { HOST_URL } from "./Api";

class TodoApi {
  static prefix = `${HOST_URL}/workspace`;

  static getList = async (workspaceId) => {
    const res = await api.axiosIns.get(`${TodoApi.prefix}/${workspaceId}/todo`);

    return res.data;
  };

  static getAllList = async (workspaceId) => {
    const res = await api.axiosIns.get(
      `${TodoApi.prefix}/${workspaceId}/todo/leader`
    );

    return res.data;
  };

  static getOne = async (workspaceId, todoId) => {
    const res = await api.axiosIns.get(`${workspaceId}/todo/${todoId}`);

    return res.data;
  };

  static postAddTodo = async (workspaceId, todoObj) => {
    const res = await api.axiosIns.post(
      `${TodoApi.prefix}/${workspaceId}/todo`,
      todoObj
    );

    return res.data;
  };

  static modifyTodo = async (todoId, workspaceId, todoObj) => {
    const res = await api.axiosIns.put(
      `${TodoApi.prefix}/${workspaceId}/todo/${todoId}`,
      todoObj
    );
    return res.data;
  };

  static deleteTodo = async (workspaceId, todoId) => {
    const res = await api.axiosIns.delete(
      `${TodoApi.prefix}/${workspaceId}/todo/${todoId}`
    );
    return res.data;
  };
}

export default TodoApi;
