import api from "./Api";

const notificationPrefix = '/notifications';

class NotificationApi {
	static getNotifications = async () => {
			try{
					const res = await api.axiosIns.get(`${notificationPrefix}`);
					return res.data;
			}catch(error){
				console.error("알림 가져오기 실패: ", error);
			}
	}

	static confirmNotification = async (notificationId) => {
		try{
			await api.axiosIns.delete(`${notificationPrefix}/${notificationId}`);
		}catch(error){
			console.error("알림 삭제하기 실패: ", error);
		}
	}
}

export default NotificationApi;