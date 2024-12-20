import React, { useEffect, useRef, useState } from 'react'
import { FiBell, FiInfo } from 'react-icons/fi';
import NotificationApi from '../api/notificationApi';
import { useNavigate } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { HOST_URL } from '../api/Api';
import { Client } from '@stomp/stompjs';
import Repo from '../auth/Repo';
import Snackbar from './Snackbar';
import NotificationList from './NotificationList';
import Modal from '../common/Layouts/components/Modal';

const NotificationIcon = () => {
	const [notifications, setNotifications] = useState([]);
	const [unreadcount, setUnreadCount] = useState(0);
	const [listOpen, setListOpen] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState(null);
	const [showInfo, setShowInfo] = useState(false);
	const [showClearModal, setShowClearModal] = useState(false);

	const socketRef = useRef(null);
	const noticeListRef = useRef();
	const iconRef = useRef();
	const navigate = useNavigate();

	useEffect(() => {
		const fetchNotifications = async () => {
			try {
				const notifications = await NotificationApi.getNotifications();
				console.log("알림 목록: ", notifications);
				if (notifications) {
					setNotifications(notifications);
					setUnreadCount(notifications.filter(notice => !notice.read).length); // 읽지 않은 알림만 카운트
				}
			} catch (error) {
				console.error("알림 가져오기 실패");
			}
		}

		fetchNotifications();
	}, []);

	useEffect(() => {
		if (socketRef.current) {
			socketRef.current.deactivate();
			socketRef.current = null;
		}

		const socket = new SockJS(`${HOST_URL}/ws`);
		const stompClient = new Client({
			webSocketFactory: () => socket,
			connectHeaders: {
				Authorization: `Bearer ${Repo.getAccessToken()}`,
			},
			onConnect: () => {
				console.log(`알림 websocket 연결 완료`);

				stompClient.subscribe(`/user/queue/notifications`, (notice) => {
					const noticeMsg = JSON.parse(notice.body);
					console.log("새 알림: ", noticeMsg.noticeMsg);

					setNotifications((prev) => [noticeMsg, ...prev]);
					setUnreadCount((prev) => prev + 1);
					setSnackbarMessage(noticeMsg);

					setTimeout(() => setSnackbarMessage(null), 3000);
				});
			},
			onWebSocketError: (error) => {
				console.log(`알림 websocket 연결 오류:`, error);
				alert("실시간 연결 오류가 발생했습니다. 다시 시도");
				window.location.reload();
			},
			reconnectDelay: 5000,
			heartbeatIncoming: 4000,
			heartbeatOutgoing: 4000,
			withCredentials: true,
		});

		stompClient.activate();
		socketRef.current = stompClient;

		return () => {
			if (socketRef.current) {
				socketRef.current.deactivate();
				socketRef.current = null;
			}
		};
	}, []);



	useEffect(() => {
		const handleClickOutside = (e) => {
			console.log("iconRef: ", iconRef);
			console.log("noticeRef: ", noticeListRef)
			if (listOpen && noticeListRef.current && !noticeListRef.current.contains(e.target) && !iconRef.current.contains(e.target)) {
				setListOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [listOpen]);



	const handleConfirmNotification = async (notificationId, path) => {
		try {
			await NotificationApi.confirmNotification(notificationId);
			setNotifications((prev) =>
				prev.map((notice) =>
					notice.id === notificationId ? { ...notice, read: true } : notice
				)
			);
			setUnreadCount((prev) => prev - 1);
			navigate(path);
			setListOpen(false);
		} catch (error) {
			console.error("알림 확인 작업 실패");
		}
	};

	const handleClearAllNotifications = async () => {
		const notificationIds = notifications.map((notice) => notice.id);
		try {
			await NotificationApi.clearNotification(notificationIds);
			setNotifications([]);
			setUnreadCount(0);
			setListOpen(false);
		} catch (error) {
			console.error("알림 삭제 실패", error);
		}
	};

	const handleClearModalOpen = () => {
		setShowClearModal(true);
	};

	const handleClearModalClose = () => {
		setShowClearModal(false);
	};

	const handleIconClick = (e) => {
		e.stopPropagation();
		setListOpen(prev => !prev);
		// setUnreadCount(0); //누르면 알림 아예 없어지는가
	};

	return (
		<div className='notification-container'>
			<span ref={iconRef} >
				<FiBell className='notification-icon' onClick={handleIconClick} />
			</span>
			{unreadcount > 0 && (
				<span className='notification-count'>{unreadcount}</span>
			)}
			{/* 알림 목록 */}
			{listOpen && (
				<div ref={noticeListRef}>
					<NotificationList
						notifications={notifications}
						handleConfirmNotification={handleConfirmNotification}
						handleClearAllNotifications={handleClearModalOpen}
						showInfo={showInfo}
						handleInfoClick={() => setShowInfo(!showInfo)}
					/>
				</div>
			)}

			{/* snackbar */}
			{snackbarMessage && (
				<Snackbar
					message={snackbarMessage}
					onConfirmClick={handleConfirmNotification}
					onClose={() => setSnackbarMessage('')}
				/>
			)}

			{/* 전체 삭제 확인 모달 */}
			<Modal open={showClearModal} onClose={handleClearModalClose}>
				<div>
					<p style={{ fontSize: "18px", margin: "20px 20px 0px 20px" }}>모든 알림을 삭제하시겠습니까?</p>
					<p style={{ fontSize: "18px", margin: "20px" }}>삭제하신 이후 복구가 불가능합니다. </p>
					<div style={{ display: 'flex', justifyContent: 'space-around', gap: '10px', marginTop: '20px' }}>
						<button
							onClick={handleClearAllNotifications}
							style={{ backgroundColor: "rgb(253, 113, 113)", padding: "10px", borderRadius: "5px", width: "80px", height: "30px", display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: "pointer" }}
						>
							Delete
						</button>
						<button
							onClick={handleClearModalClose}
							style={{ backgroundColor: "gray", padding: "10px", borderRadius: "5px", width: "80px", height: "30px", display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: "pointer" }}
						>
							Cancel
						</button>
					</div>
				</div>
			</Modal>
		</div>
	)
}

export default NotificationIcon
