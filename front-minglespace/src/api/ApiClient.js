// import apiClient from "./ApiClient";
// import Repo from "../auth/Repo";


// class ApiAuth{

//   static signup = async (userData) => {
//     try {
//       const response = await apiClient.post("/auth/signup", userData);

//       if (response.data.code === 200) {
//         console.log("회원가입 성공");
//       } else {
//         console.log("회원가입 실패");
//       }

//       return response.data;
//     } catch (err) {
//       console.error("회원가입 에러 : ", err);
//       throw err;
//     }
//   };

//   static login = async (email, password) => {
//     try {
//       const response = await apiClient.post("/auth/login", { email, password });

//       if (response.data.code === 200) {
//         console.log("로그인 성공 : ", response.data);

//         Repo.setItem(response.data);
//       } else {
//         console.log("로그인 실패 : ");
//       }

//       return response.data;
//     } catch (err) {
//       console.error("로그인 에러 : ", err);
//       throw err;
//     }
//   };


//   static logout = async () => {
//     try {
//       const refreshToken = Repo.getRefreshToken();
//       console.log("refreshToken", refreshToken);
//       const reqRes = { refreshToken: refreshToken };

//       const response = await this.axiosInstance.post("/auth/logout", reqRes);

//       if (response.data.code === 200) {
//         console.error("로그아웃 성공 : ");
//         Repo.clearItem();
//       } else {
//         console.error("로그아웃 실패 : ");
//       }

//       return response.data;
//     } catch (err) {
//       console.error("로그아웃 에러 : ", err);
//       throw err;
//     }
//   };



// }

// export default ApiAuth;


import axios from "axios";
import Repo from "../auth/Repo";

class ApiClient{

  static API_SERVER_HOST = "http://localhost:8080";

  constructor(){
    
    if(ApiClient.instance){
      return ApiClient.instance;
    }

  // Axios 인스턴스 생성
  const axiosInstance = axios.create({
    headers:{
        "Content-Type": "application/json"
    },
    baseURL: API_SERVER_HOST,
  });

  // 요청 인터셉터 설정
  axiosInstance.interceptors.request.use(
    (config) => {

      // for test
      // Repo.cleaerItem();

      console.log("요청 URL : ", config.url);
      

      const skipToken = isSkipTokenPacket(config.url);
    
      console.log("skipToken : ", skipToken);

      const accessToken = Repo.getAccessToken();
      if (!skipToken && accessToken) {
        config.headers["Authorization"] = `Bearer ${accessToken}`;
        console.log("accessToken : ", accessToken)
      }else{
        console.log("토큰이 불필요한 패킷이라 같이 안보내요 : ", accessToken)
      } 
        
      
      return config;
    },
    (error) => {
        console.error("요청 Error:", error);
        return Promise.reject(error);
    }
  );

  const isSkipTokenPacket = (url)=>{
    if(url.includes("/auth/login"))
      return true;

    if(url.includes("/auth/signup"))
      return true;

    return false;
  }


  // 응답 인터셉터 설정
  axiosInstance.interceptors.response.use(
    (response) => {
        if(response.data){
          if(response.data.code === 200){
              console.log("응답 성공: ", response.data);
          }else{
              console.log("응답 실패: ", response.data);
          }
        }
        return response;
    },
    async (error) => {
        
      if (error.response) {
          // 서버가 응답을 반환한 경우
          const { status, data } = error.response;

          if (status === 401) {
              // 401 Unauthorized: 토큰 만료 처리
              if (data.code === "EXPIRED_TOKEN") {
                  console.log("토큰이 만료되었습니다. 리프레시 토큰을 요청합니다.");

                  // RefreshToken을 이용해 새로운 AccessToken 요청
                  const refreshToken = Repo.getRefreshToken();
                  console.log("refreshToken", refreshToken);
                  const reqRes = {
                      refreshToken: refreshToken,
                      // 여기에 필요한 다른 필드도 추가할 수 있음, 예: email, password 등
                  };
                  const res = await axios.post( `${API_SERVER_HOST}/auth/refresh`, reqRes);
                  console.log("res.data : ", res.data);
                  console.log("res.data : ", res.data.accessToken);

                  if(res.data.code === 200){
                      // 새로운 AccessToken을 localStorage에 저장
                      const newAccessToken = res.data.accessToken;
                      Repo.setAccessToken(newAccessToken);
                      
                      // 원래 요청을 새로운 토큰을 포함해서 재시도
                      error.config.headers['Authorization'] = `Bearer ${newAccessToken}`;
                      return axios(error.config);
                  }else{
                      // something todo here
                      console.log("넌 어뷰저야 꺼정~")
                  }
              }
          } else if (status === 500) {
              // 500 서버 오류
              console.log("서버 오류가 발생했습니다.");
          } else {
              console.log(`응답 오류 발생: ${data.message}`);
          }

          // 사용자 정의 에러 코드에 따른 추가 처리 (예: EXPIRED_TOKEN 등)
          if (data.code === "EXPIRED_TOKEN") {
              console.log("리프레시 토큰을 요청하세요.");

            // 어떤 패킷을 보내든 토큰 에러가 났을경우
            // 공통에러처리가 필요하다

          }

          return Promise.reject(error); // 계속해서 오류를 처리할 수 있도록 반환
      } else {
          // 서버 응답이 없거나 네트워크 오류
          console.log("네트워크 오류 또는 서버 응답 없음");
          return Promise.reject(error);
      }
  }
  );    

  }


}

export default ApiClient;