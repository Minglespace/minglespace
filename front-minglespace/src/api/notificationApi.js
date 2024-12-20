import api from "./Api";

const notificationPrefix = '/notifications';

class NotificationApi {
	static getNotifications = async () => {
		try {
			const res = await api.axiosIns.get(`${notificationPrefix}`);
			return res.data;
		} catch (error) {
			console.error("알림 가져오기 실패: ", error);
		}
	}

	static clearNotification = async (notificationIds) => {
		try {
			await api.axiosIns.delete(`${notificationPrefix}/clear`, { data: notificationIds });
		} catch (error) {
			console.error("알림 삭제하기 실패: ", error);
		}
	}

	static confirmNotification = async (notificationId) => {
		try {
			const res = await api.axiosIns.put(`${notificationPrefix}/${notificationId}`);
			if (res.data === "SUCCESS") {
				console.log("알림 읽음 처리 완료")
			} else if (res.data === "FAILED") {
				console.error("알림 읽음 처리 실패")
			}
		} catch (error) {
			console.error("알림 읽음 처리 중 에러 발생: ", error);
		}
	}
}

export default NotificationApi;