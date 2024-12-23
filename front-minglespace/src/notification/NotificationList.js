import React from 'react'
import { FiInfo } from 'react-icons/fi'
import NotificationItem from './NotificationItem'

const isWithinLastMonth = (date) => {
	const now = new Date();
	const lastMonth = new Date();
	lastMonth.setMonth(now.getMonth() - 1);
	// const givenDate = new Date(date);
	// return givenDate >= lastMonth && givenDate <= now;
	return new Date(date) >= lastMonth;
};

const NotificationList = ({ notifications, handleConfirmNotification, handleClearAllNotifications, showInfo, handleInfoClick }) => {
	const recentList = notifications.filter((notice) => isWithinLastMonth(notice.noticeTime));
	const olderList = notifications.filter((notice) => !isWithinLastMonth(notice.noticeTime));

	return (
		<div className='notification-dropdown'>
			<div className='info-container'>
				<FiInfo
					className='info-icon'
					onClick={handleInfoClick}
				/>
				{showInfo && (
					<div className='info-message'>
						<p>확인된 알림은 한 달 후 자동으로 삭제됩니다. </p>
						<p>미확인 알림은 그대로 유지됩니다.</p>
					</div>
				)}
				<button className='clear-all-notification' onClick={handleClearAllNotifications}>
					전체 알림 삭제
				</button>
			</div>

			{recentList.length > 0 && (
				recentList.map((notice) => (
					<NotificationItem
						key={notice.id}
						notification={notice}
						onClick={handleConfirmNotification}
					/>
				))
			)}

			{olderList.length > 0 && (
				<>
					<div className='notification-separator'>
						<span>한 달 전 알림</span>
					</div>
					{olderList.map((notice) => (
						<NotificationItem
							key={notice.id}
							notification={notice}
							onClick={handleConfirmNotification}
						/>
					))}
				</>
			)}

			{notifications.length === 0 && (
				<p className='notification-empty'>알림이 없습니다.</p>
			)}
		</div>
	)
}

export default NotificationList
