
import api from "./Api";
import Repo from "../auth/Repo";

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

}

export default AuthApi;