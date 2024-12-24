import React from 'react'
import { useNotification } from './context/NotificationContext';

const dotColorMap = {
	CHAT: "#e6ccd2", //채팅
	CHAT_NEW_MESSAGE: "#e6ccd2",
	FRIEND: "#5c6ac4", // 친구 _ 임의
	SCHEDULE: "rgb(46, 235, 58)", // 일정 _ 임의
	default: "#dfe6e9", // 기본 (타입이 지정되지 않은 경우)
};

const NotificationItem = ({ notification }) => {
	const { handleConfirmNotification } = useNotification();
	return (
		<div
			className={`notification-item`}
			onClick={() => handleConfirmNotification(notification.id, notification.path)} //경로 옮기는 함수
		>
			{!notification.read && (
				<span
					className='unread-dot'
					style={{ backgroundColor: dotColorMap[notification.type] || dotColorMap.default }}
				></span>
			)}
			<span className='notification-msg'>{notification.noticeMsg}</span>
			<span className='notification-time'>{new Date(notification.noticeTime).toLocaleDateString('ko-KR')}</span>
		</div>
	)
}

export default NotificationItem
