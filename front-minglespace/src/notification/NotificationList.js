import React, { useState } from 'react'
import { FiInfo } from 'react-icons/fi'
import NotificationItem from './NotificationItem'
import { useNotification } from './context/NotificationContext';

const isWithinLastMonth = (date) => {
	const now = new Date();
	const lastMonth = new Date();
	lastMonth.setMonth(now.getMonth() - 1);
	return new Date(date) >= lastMonth;
};

const NotificationList = ({ notifications, styleClass }) => {
	const { handleClearModalOpen } = useNotification();

	const [showInfo, setShowInfo] = useState(false);
	const recentList = notifications.filter((notice) => isWithinLastMonth(notice.noticeTime));
	const olderList = notifications.filter((notice) => !isWithinLastMonth(notice.noticeTime));

	return (
		<div className={`notification-dropdown ${styleClass || ''}`}>
			<div className='info-container'>
				<FiInfo
					className='info-icon'
					onClick={() => setShowInfo(!showInfo)}
				/>
				{showInfo && (
					<div className='info-message'>
						<p>확인된 알림은 한 달 후 자동으로 삭제됩니다. </p>
						<p>미확인 알림은 그대로 유지됩니다.</p>
					</div>
				)}
				<button className='clear-all-notification' onClick={handleClearModalOpen}>
					전체 알림 삭제
				</button>
			</div>

			{recentList.length > 0 && (
				recentList.map((notice) => (
					<NotificationItem
						key={notice.id}
						notification={notice}
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
