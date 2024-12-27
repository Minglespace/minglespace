
import api, { HOST_URL } from "./Api";
import Repo from "../auth/Repo";
import axios from "axios";
import { AuthStatusOk } from "./AuthStatus";

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

  // static login = async (email, password) => {
  //   try {
  //     const response = await api.axiosIns.post("/auth/login", { email, password });
  //     if (response.data.code === 200) {
  //       console.log("로그인 성공 : ", response.data);
  //       Repo.setItem(response.data);
  //     } else {
  //       console.log("로그인 실패 : ");
  //     }

  //     return response.data;
  //   } catch (err) {
  //     console.error("로그인 에러 : ", err);
  //     throw err;
  //   }
  // };
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
      const res = await api.axiosIns.post("/auth/logout");
      if (AuthStatusOk(res.data.msStatus)) {
        Repo.clearItem();
        // navigate("/auth/login");
      }
    }catch(err){
      throw err;
    }
  };

  // static verify = async (code, encodedEmail) => {
  //   try{
  //     return await api.axiosIns.get(`/auth/verify/${ code }/${encodedEmail}`).data;
  //   }catch(err){
  //     throw err;
  //   }
  // };

  static verify = async (code, encodedEmail, encodedVerifyType) => {
    try{
      const res = await api.axiosIns.get(`/auth/verify/${ code }/${encodedEmail}/${encodedVerifyType}`);
      console.log("응답 res : ", res);
      return res.data;
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

  static withdrawalInfo = async () => {
    try {
      const res = await api.axiosIns.get("/auth/withdrawal/Info");
      return res.data;
    } catch (err) {
      throw err; 
    }
  };

  static withdrawalEmail = async () => {
    try {
      const res = await api.axiosIns.get("/auth/withdrawal/Email");
      return res.data;
    } catch (err) {
      throw err; 
    }
  };
    
  static withdrawalEnroll = async () => {
    try {
      const res = await api.axiosIns.get("/auth/withdrawal/Enroll");
      return res.data;
    } catch (err) {
      throw err; 
    }    
  }
  
  static withdrawalImmediately = async () => {
    try {
      const res = await api.axiosIns.get("/auth/withdrawal/Immediately");
      return res.data;
    } catch (err) {
      throw err; 
    }    
  }
  
  static withdrawalCancel = async () => {
    try {
      const res = await api.axiosIns.get("/auth/withdrawal/Cancel");
      return res.data;
    } catch (err) {
      throw err; 
    }    
  }

  
}

export default AuthApi;