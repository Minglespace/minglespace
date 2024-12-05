import axios from "axios";
import Repo from "../auth/Repo";

export const API_SERVER_HOST = "http://localhost:8080";
// export const API_SERVER_HOST = "http://localhost:8081";
const prefix = `${API_SERVER_HOST}/workspace`;

// ======================================================================================
// ======================================================================================
// ======================================================================================
// ======================================================================================

// Axios 인스턴스 생성
const axiosInstance = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
  baseURL: API_SERVER_HOST,
});

// 요청 인터셉터 설정
axiosInstance.interceptors.request.use(
  (config) => {
    // Repo.cleaerItem();

    const accessToken = Repo.getAccessToken();
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }

    console.log("요청 URL : {}", config.url);
    console.log("  accessToken이 보여? 그럼 서버로 보낸거에요 : ", accessToken);

    return config;
  },
  (error) => {
    console.error("요청 Error:", error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 설정
axiosInstance.interceptors.response.use(
  (response) => {
    if (response.data) {
      if (response.data.code === 200) {
        console.log("응답 성공: ", response.data);
      } else {
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
          const res = await axios.post(
            `${API_SERVER_HOST}/auth/refresh`,
            reqRes
          );
          console.log("res : {}", res);
          console.log("res.data : {}", res.data.accessToken);

          // 새로운 AccessToken을 localStorage에 저장
          const newAccessToken = res.data.accessToken;
          Repo.setAccessToken(newAccessToken);

          // 원래 요청을 새로운 토큰을 포함해서 재시도
          error.config.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return axios(error.config);
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
      }

      return Promise.reject(error); // 계속해서 오류를 처리할 수 있도록 반환
    } else {
      // 서버 응답이 없거나 네트워크 오류
      console.log("네트워크 오류 또는 서버 응답 없음");
      return Promise.reject(error);
    }
  }
);

export const getList = async (workspaceId) => {
  const res = await axiosInstance.get(`${prefix}/${workspaceId}/milestone`);

  return res.data;
};

export const getOne = async (workspaceId) => {
  const res = await axiosInstance.get(`${prefix}/${workspaceId}`);

  return res.data;
};

export const postAddGroup = async (workspaceId, milestoneGroupObj) => {
  const res = await axiosInstance.post(
    `${prefix}/${workspaceId}/milestone/milestoneGroup`,
    milestoneGroupObj
  );

  return res.data;
};

export const postAddItem = async (
  workspaceId,
  milestoneGroupId,
  milestoneItemObj
) => {
  const res = await axiosInstance.post(
    `${prefix}/${workspaceId}/milestone/milestoneGroup/${milestoneGroupId}`,
    milestoneItemObj
  );

  return res.data;
};

export const modifyOne = async (workspaceId, workspaceObj) => {
  const res = await axiosInstance.put(`${prefix}/${workspaceId}`, workspaceObj);
  return res.data;
};

export const deleteOne = async (userId, workspaceId) => {
  const res = await axiosInstance.delete(
    `${prefix}/${workspaceId}/user/${userId}`
  );
  return res.data;
};

export const signup = async (userData) => {
  try {
    const response = await axiosInstance.post("/auth/signup", userData);

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

export const login = async (email, password) => {
  try {
    const response = await axiosInstance.post("/auth/login", {
      email,
      password,
    });

    if (response.data.code === 200) {
      console.log("로그인 성공 : ", response.data);

      Repo.setItem(response.data);
    } else {
      console.log("로그인 실패 : ");
    }

    return response.data;
  } catch (err) {
    console.error("로그인 에러 : ", err);
    throw err; // 오류를 다시 던져서 호출된 곳에서 처리하도록 할 수 있음
  }
};

export const logout = async () => {
  try {
    const refreshToken = Repo.getRefreshToken();
    console.log("refreshToken", refreshToken);
    const reqRes = {
      refreshToken: refreshToken,
    };

    const response = await axiosInstance.post("/auth/logout", reqRes);

    if (response.data.code === 200) {
      console.error("로그아웃 성공 : ");
      Repo.cleaerItem();
    } else {
      console.error("로그아웃 실패 : ");
    }

    return response.data;
  } catch (err) {
    console.error("로그아웃 에러 : ", err);
    throw err;
  }
};
