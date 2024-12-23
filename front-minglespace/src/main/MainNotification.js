import NotificationList from '../notification/NotificationList'
import NotificationClearAllModal from '../notification/NotificationClearAllModal';
import { useNotification } from '../notification/context/NotificationContext';

const MainNotification = () => {
	const { notifications } = useNotification();

	const notificationsToShow = notifications.slice(0, 8);

	return (
		<div className='main-notificationList'>
			<h2 className='main-notificationTitle'>최신 알림 목록</h2>
			<NotificationList styleClass={"main"} notifications={notificationsToShow} />
			<NotificationClearAllModal />
		</div>
	)
}

export default MainNotification
