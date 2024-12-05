
import axios from "axios";
import Repo from "../auth/Repo";

const HOST_URL = "http://localhost:8080";
// const HOST_URL = "http://localhost:8081";

class Api{

  constructor(){
    
    if(Api.instance){
      return Api.instance;
    }

    // Axios 인스턴스 생성
    this.axiosIns = axios.create({
      headers:{
          "Content-Type": "application/json"
      },
      baseURL: HOST_URL,
    });

    // // 확인을 위한 로그 추가
    // console.log("Axios baseURL:", this.axiosIns.defaults.baseURL);

    // 요청 인터셉터 설정
    this.axiosIns.interceptors.request.use(
      (config) => {

        // for test
        // Repo.clearItem();

        console.log("요청 URL : ", config.url);
        
        const skipToken = this.isTokenSkipPacket(config.url); 
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

    // 응답 인터셉터 설정
    this.axiosIns.interceptors.response.use(
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
                    const res = await axios.post( `${HOST_URL}/auth/refresh`, reqRes);
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

    Api.instance = this;
  }

  isTokenSkipPacket = (url) => {
    const skipTokenPaths = ["/auth/login", "/auth/signup"];
    return skipTokenPaths.some(path => url.includes(path));
  }
}


const api = new Api();
Object.freeze(api);

export default api;
export {HOST_URL};
