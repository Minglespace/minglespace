import axios from "axios";

export const API_SERVER_HOST = "http://localhost:8080";

const prefix = `${API_SERVER_HOST}/workspace`;

export const getList = async (userId) => {
  const res = await axios.get(`${prefix}/user/${userId}`);

  return res.data;
};

export const getOne = async (workspaceId) => {
  const res = await axios.get(`${prefix}/${workspaceId}`);

  return res.data;
};

export const postAdd = async (userId, workspaceObj) => {
  const res = await axios.post(`${prefix}/user/${userId}`, workspaceObj);

  return res.data;
};

export const modifyOne = async (workspaceId, workspaceObj) => {
  const res = await axios.put(`${prefix}/${workspaceId}`, workspaceObj);
  return res.data;
};

export const deleteOne = async (userId, workspaceId) => {
  const res = await axios.delete(`${prefix}/${workspaceId}/user/${userId}`);
  return res.data;
};
