﻿
import api, { HOST_URL } from "./Api";
import Repo from "../auth/Repo";
import axios from "axios";

class AuthApi{

  static signup = async (userData) => {
    try {
      const response = await api.axiosIns.post("/auth/signup", userData);
      return response.data;
    } catch (err) {
      console.error("회원가입 에러 : ", err);
      throw err;
    }
  };

  static login = async (email, password) => {
    try {
      const response = await api.axiosIns.post("/auth/login", { email, password });
      return response.data;
    } catch (err) {
      console.error("로그인 에러 : ", err);
      throw err;
    }
  };


  static logout = async () => {
    try{
      return (await api.axiosIns.post("/auth/logout")).data;
    }catch(err){
      throw err;
    }
  };

  static verify = async (code, encodedEmail) => {
    try{
      return await api.axiosIns.get(`/auth/verify/${ code }/${encodedEmail}`).data;
    }catch(err){
      throw err;
    }
  };

  static userInfo = async () => {
    try {
      const res = await api.axiosIns.get("/auth/user");
      return res.data;
    } catch (err) {
      throw err; 
    }
  };
  
  static updateUserInfo = async (req, imageFile) => {

    const formData = new FormData();

    formData.append('req', new Blob([JSON.stringify(req)], { type: 'application/json' }));
    formData.append('image', imageFile);

    const accessToken = Repo.getAccessToken();
    const headers = {
        'Authorization': `Bearer ${accessToken}`,
    };

    try {
        const res = await axios.put(`${HOST_URL}/auth/update`, formData, { headers });
        return res.data;
    } catch (error) {
        console.error("회원정보 변경 에러 :", error);
    }
  };

}

export default AuthApi;