
import api, { HOST_URL } from "./Api";
import Repo from "../auth/Repo";
import Userinfo from "../common/Layouts/components/Userinfo";
import axios from "axios";

class AuthApi{

  static signup = async (userData) => {
    try {
      const response = await api.axiosIns.post("/auth/signup", userData);

      if (response.data.code === 200) {
        console.log("회원가입 성공");
      } else {
        console.log("회원가입 실패");
      }

      return response.data;
    } catch (err) {
      console.error("회원가입 에러 : ", err);
      throw err;
    }
  };

  static login = async (email, password) => {
    try {
      const response = await api.axiosIns.post("/auth/login", { email, password });

      if (response.data.code === 200) {
        console.log("로그인 성공 : ", response.data);

        Repo.setItem(response.data);
      } else {
        console.log("로그인 실패 : ");
      }

      return response.data;
    } catch (err) {
      console.error("로그인 에러 : ", err);
      throw err;
    }
  };


  static logout = async () => {
    try {
      const refreshToken = Repo.getRefreshToken();
      console.log("refreshToken", refreshToken);
      const reqRes = { refreshToken: refreshToken };

      const response = await api.axiosIns.post("/auth/logout", reqRes);

      if (response.data.code === 200) {
        console.error("로그아웃 성공 : ");
        Repo.clearItem();
      } else {
        console.error("로그아웃 실패 : ");
      }

      return response.data;
    } catch (err) {
      console.error("로그아웃 에러 : ", err);
      throw err;
    }
  };

  static verify = async (code, encodedEmail) => {
    try{
      return await api.axiosIns.get(`/auth/verify/${ code }/${encodedEmail}`);
    }catch(err){
      throw err;
    }
  };

  static userInfo = async () => {
    try {
        const res = await api.axiosIns.get("/auth/user");
        if (res && res.data && res.data.code === 200) {
            return res.data;
        } else {
            console.error("회원정보 불러오기 실패 res.data : ", res.data);
            throw new Error("Invalid API response"); 
        }
    } catch (err) {
        console.error("회원정보 불러오기 에러 err : ", err);
        throw err; 
    }
  };

  static updateUserInfo_old = async (userInfo) => {
    try {
      const res = await api.axiosIns.put("/auth/update", userInfo);
      if (res && res.data && res.data.code === 200) {
          return res.data;
      } else {
          console.error("회원정보 변경 실패 res.data : ", res.data);
          throw new Error("Invalid API response"); 
      }
  } catch (err) {
      console.error("회원정보 변경 에러 err : ", err);
      throw err; 
  }
  }


  static updateUserInfo = async (userInfo, imageFile) => {

    console.log("updateUserInfo params userInfo : ", userInfo);
    console.log("updateUserInfo params imageFile : ", imageFile);

    const formData = new FormData();

    formData.append("userInfo", new Blob([JSON.stringify(Userinfo)], { type: 'application/json' }));
    formData.append("image", imageFile);

    const accessToken = Repo.getAccessToken();
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
    }

    try {
      const url = `${HOST_URL}/auth/update`;
      console.log("updateUserInfo url : ", url);

      const res = await axios.put(url, userInfo, { headers } );

      console.log("updateUserInfo res : ", res);

      if (res && res.data && res.data.code === 200) {
          return res.data;
      } else {
          console.error("회원정보 변경 실패 res.data : ", res.data);
          throw new Error("Invalid API response"); 
      }
  } catch (err) {
      console.error("회원정보 변경 에러 err : ", err);
      throw err; 
  }
  }









}

export default AuthApi;