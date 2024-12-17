
import api, { HOST_URL } from "./Api";
import Repo from "../auth/Repo";
import Userinfo from "../common/Layouts/components/Userinfo";
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

  
  static updateUserInfoNew2 = async (req, imageFile) => {

    console.log("updateUserInfoNew2 req : ", req);
    console.log("updateUserInfoNew2 imageFile : ", imageFile);
    

    const formData = new FormData();

    formData.append('req', new Blob([JSON.stringify(req)], { type: 'application/json' }));
    formData.append('image', imageFile);

    //헤더 만들기
    const accessToken = Repo.getAccessToken();
    const headers = {
        'Authorization': `Bearer ${accessToken}`,
    };

    try {
        // 요청 보내기
        // const res = await axios.post(`${HOST_URL}/auth/updateNew2`, formData, { headers });
        const res = await axios.put(`${HOST_URL}/auth/updateNew2`, formData, { headers });
        console.log("updateUserInfoNew2 res : ", res);
        return res.data;  // 서버 응답 반환
    } catch (error) {
        console.error("채팅방 생성 실패:", error);
    }
  };

  static updateUserInfoNew = async (userInfo, file) => {
    try {
        // FormData 객체 생성
        const formData = new FormData();

        // userInfo를 FormData에 추가 (파일 외의 다른 정보들)
        formData.append('req', JSON.stringify(userInfo)); // req라는 이름으로 userInfo를 JSON 문자열로 전송

        // 파일이 있을 경우, FormData에 파일을 추가
        if (file) {
            formData.append('file', file);
        }

        console.log("회원정보 변경 formData : ", formData);

        // Axios 요청 보내기
        const res = await api.axiosIns.put("/auth/updateNew", formData, {
            headers: {
                'Content-Type': 'multipart/form-data', // 파일 전송을 위해 multipart/form-data로 설정
            }
        });

        if (res && res.data && res.data.code === 200) {
          console.log("회원정보 변경 성공 : ", res.data);
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