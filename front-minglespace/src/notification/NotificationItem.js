import React from 'react'

const dotColorMap = {
	CHAT: "#e6ccd2", //채팅
	CHAT_NEW_MESSAGE: "#e6ccd2",
	FRIEND: "#5c6ac4", // 친구
	SCHEDULE: "rgb(46, 235, 58)", // 일정
	default: "#dfe6e9", // 기본 (타입이 지정되지 않은 경우)
};

const NotificationItem = ({ notification, onClick }) => {
	return (
		<div
			className={`notification-item`}
			onClick={() => onClick(notification.id, notification.path)} //경로 옮기는 함수
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
