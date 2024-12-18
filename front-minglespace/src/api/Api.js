
import axios from "axios";
import Repo from "../auth/Repo";

const HOST_URL = "http://localhost:8080";

axios.defaults.withCredentials = true;

class Api{

  constructor(){
    
    if(Api.instance){
      return Api.instance;
    }
    
    this.axiosPure = axios.create({
      headers:{"Content-Type": "application/json"},
      baseURL: HOST_URL,
      withCredentials: true,
    });

    // Axios 인스턴스 생성
    this.axiosIns = axios.create({
      headers:{
          "Content-Type": "application/json",
      },
      baseURL: HOST_URL,
      withCredentials: true,
    });

    // this.axiosIns = axios.create({
    //   timeout: 5000,
    //   baseURL: HOST_URL,
    //   withCredentials: true,
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Access-Control-Allow-Credentials': true,
    //   },
    // });



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
          console.log('accessToken 저장함.');
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
                  console.log("리프레시 토큰도 만료되었습니다.");
                  console.log("로그아웃 처리가 필요해요.");

                    // 서버 내부적으로 토큰 갱신하게 수정하면
                    // 여기서는
                    // 로그아웃 처리 하면 된다.

                    // RefreshToken을 이용해 새로운 AccessToken 요청
                    // const refreshToken = Repo.getRefreshToken();
                    // console.log("refreshToken", refreshToken);
                    // const reqRes = {
                    //     refreshToken: refreshToken,
                    //     // 여기에 필요한 다른 필드도 추가할 수 있음, 예: email, password 등
                    // };
                    // const res = await axios.post( `${HOST_URL}/auth/refresh`, reqRes);
                    // console.log("res.data : ", res.data);
                    // console.log("res.data : ", res.data.accessToken);

                    // if(res.data.code === 200){
                    //     // 새로운 AccessToken을 localStorage에 저장
                    //     const newAccessToken = res.data.accessToken;
                    //     Repo.setAccessToken(newAccessToken);
                        
                    //     // 원래 요청을 새로운 토큰을 포함해서 재시도
                    //     error.config.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    //     return axios(error.config);
                    // }else{
                    //     // something todo here
                    //     console.log("넌 어뷰저야 꺼정~")
                    // }
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
    const skipTokenPaths = ["/auth/login", "/auth/signup", "/auth/token"];
    return skipTokenPaths.some(path => url.includes(path));
  }
}


const api = new Api();
Object.freeze(api);

export default api;
export {HOST_URL};
