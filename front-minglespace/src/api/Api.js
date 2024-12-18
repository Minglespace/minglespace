
import axios from "axios";
import Repo from "../auth/Repo";
import { MsStatus } from "./ApiType";

const HOST_URL = "http://localhost:8080";

axios.defaults.withCredentials = true;

class Api{

  constructor(){
    
    if(Api.instance){
      return Api.instance;
    }
    
    // Axios 인스턴스 생성
    this.axiosIns = axios.create({
      headers:{
          "Content-Type": "application/json",
      },
      baseURL: HOST_URL,
      withCredentials: true,
    });

    this.axiosIns.defaults.withCredentials = true;

    // 요청 인터셉터 설정
    this.axiosIns.interceptors.request.use(
      (config) => {

        console.log("요청 URL : ", config.url);
        
        const skipToken = this.isTokenSkipPacket(config.url); 
        const accessToken = Repo.getAccessToken();

        if (!skipToken && accessToken) {
          config.headers["Authorization"] = `Bearer ${accessToken}`;
          // console.log("요청 헤더에 같이 보내요, accessToken : ", accessToken)
        }else{
          // console.log("토큰이 불필요한 패킷이라 안보내요 : ", config.url)
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
        // 응답 헤더에서 JWT 토큰 추출
        // 토큰이 존재하면 localStorage에 저장
        // Bearer 'token' 형태로 들어오므로 'Bearer '를 제외하고 토큰만 저장
        const token = response.headers['authorization'] || response.headers['Authorization'];
        if (token) {
          const accessToken = token.replace('Bearer ', '');
          Repo.setAccessToken(accessToken);
          console.log('갱신된 accessToken 저장함.');
        }

        const msStatus = response.data.msStatus;

        console.log("msStatus : ", msStatus);
        console.log("MsStatus[msStatus] : ", MsStatus[msStatus]);

        if(msStatus === MsStatus.ExpiredRefreshToken.value){
          console.log(MsStatus.ExpiredRefreshToken.desc);
          console.log('[작업필요] 여기에서 팝업 띄우고 싶어');
          console.log('[작업필요] 로그인창으로 날려버려~');
          Repo.clearItem();
        }

        return response;
      },
      async (error) => {
          
        if (error.response) {
            // 서버가 응답을 반환한 경우
            const { status, data } = error.response;

            if (status === 500) {
                // 500 서버 오류
                console.log("서버 오류가 발생했습니다.");
            } else {
                console.log(`응답 오류 발생: ${data.message}`);
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
    const skipTokenPaths = ["/auth/login", "/auth/signup", "/auth/token"];
    return skipTokenPaths.some(path => url.includes(path));
  }
}


const api = new Api();
Object.freeze(api);

export default api;
export {HOST_URL};
