import axios from "axios";
import Repo from "../auth/Repo";

export const API_SERVER_HOST = "http://localhost:8080";

const prefix = `${API_SERVER_HOST}/workspaces`;

// ======================================================================================
// ======================================================================================
// ======================================================================================
// ======================================================================================


// Axios 인스턴스 생성
const axiosInstance = axios.create({
	headers: {
		"Content-Type": "application/json"
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
		console.log("  accessToken이 보여? 그럼 서버로 보낸거에요 : ", accessToken)

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
					const res = await axios.post(`${API_SERVER_HOST}/auth/refresh`, reqRes);
					console.log("res : {}", res);
					console.log("res.data : {}", res.data.accessToken);

					// 새로운 AccessToken을 localStorage에 저장
					const newAccessToken = res.data.accessToken;
					Repo.setAccessToken(newAccessToken);

					// 원래 요청을 새로운 토큰을 포함해서 재시도
					error.config.headers['Authorization'] = `Bearer ${newAccessToken}`;
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

// 방법이...
// export default axiosInstance;

// ======================================================================================
// ======================================================================================
// ======================================================================================
// ======================================================================================

//////////////////////ChatList.js와 관련 API/////////////////////////////
//채팅방 목록 조회
export const getChatList = async (workspaceId) => {
	try {
		const res = await axiosInstance.get(`${prefix}/${workspaceId}/chatRooms/members`);
		console.log("채팅방 목록 응답:", res);
		return res.data;  // 서버 응답 데이터 반환
	} catch (error) {
		if (error.response && error.response.status === 403) {
			alert(error.response.data.error);
			window.location.href = `/workspace`;
		} else {
			console.error("채팅방 목록 가져오기 실패:", error);
			throw error;  // 에러 발생시 예외 처리
		}
	}
};

//채팅방 생성
export const createChatRoom = async (workspaceId, requestDTO, imageFile) => {

	const formData = new FormData();

	formData.append('requestDTO', new Blob([JSON.stringify(requestDTO)], { type: 'application/json' }));
	formData.append('image', imageFile);

	//헤더 만들기
	const accessToken = Repo.getAccessToken();
	const headers = {
		'Authorization': `Bearer ${accessToken}`,
	};

	try {
		// 요청 보내기
		const res = await axios.post(`${prefix}/${workspaceId}/chatRooms`, formData, { headers });
		return res.data;  // 서버 응답 반환
	} catch (error) {
		console.error("채팅방 생성 실패:", error);
		throw error;  // 에러 처리
	}
};

//워크스페이스 참여 멤버 가져오기.
export const getwsMembers = async (workspaceId) => {
	const res = await axiosInstance.get(`http://localhost:8080/workspace/${workspaceId}/members`);
	return res.data;
};




/////////////////ChatRoom 관련 API//////////////////////////
//특정방 조회
export const getChatRoom = async (workspaceId, chatRoomId) => {
	const res = await axiosInstance.get(`${prefix}/${workspaceId}/chatRooms/${chatRoomId}`);

	return res.data;
};


//채팅방 멤버추가
export const addMemberToRoom = async (workspaceId, chatRoomId, addMemberId) => {
	const res = await axiosInstance.post(`${prefix}/${workspaceId}/chatRooms/${chatRoomId}/members/${addMemberId}`);
	return res.data;
};

//채팅방 멤버강퇴
export const kickMemberFromRoom = async (workspaceId, chatRoomId, kickMemberId) => {
	const res = await axiosInstance.delete(`${prefix}/${workspaceId}/chatRooms/${chatRoomId}/members/${kickMemberId}/kick`);
	return res.data;
};


//방 나가기
export const leaveFromChat = async (workspaceId, chatRoomId) => {
	const res = await axiosInstance.delete(`${prefix}/${workspaceId}/chatRooms/${chatRoomId}/leave`);
	return res.data;
};

//방장 위임
export const delegateLeader = async (workspaceId, chatRoomId, newLeaderId) => {
	const res = await axiosInstance.delete(`${prefix}/${workspaceId}/chatRooms/${chatRoomId}/leader/${newLeaderId}`);
	return res.data;
};


