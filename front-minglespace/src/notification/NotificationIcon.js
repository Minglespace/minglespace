import React, { useEffect, useRef, useState } from 'react'
import { FiBell } from 'react-icons/fi';
import NotificationApi from '../api/notificationApi';
import { useNavigate } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { HOST_URL } from '../api/Api';
import { Client } from '@stomp/stompjs';
import Repo from '../auth/Repo';
import Snackbar from './Snackbar';

const NotificationIcon = () => {
  const [notifications, setNotifications] = useState([]);
	const [unreadcount, setUnreadCount] = useState(0);
	const [listOpen, setListOpen] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState(null);
	const socketRef = useRef(null);
	const navigate = useNavigate();

	useEffect(() => {
	const fetchNotifications = async () => {
		try{
			const notifications = await NotificationApi.getNotifications();
			if(notifications){
				setNotifications(notifications);
				setUnreadCount(notifications.length);
			}
		}catch(error){
			console.error("알림 가져오기 실패");
		}
	}

	fetchNotifications();
	},[]);

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

        ///실시간 추가 알림 구독 < notifications
				// 목록에 추가하면서, 카운트 재설정 및 스낵바
				stompClient.subscribe(`/user/queue/notifications`, (notice) => {
          const noticeMsg = JSON.parse(notice.body);
          console.log("새 알림: ", noticeMsg.noticeMsg);
          
					setNotifications((prev)=> [noticeMsg, ...prev]);
					setUnreadCount((prev) => prev + 1);
					setSnackbarMessage(noticeMsg);

					setTimeout(() => setSnackbarMessage(null), 3000);
        });

				//확인(삭제 처리) 관련 구독 < 확인됐다는 알림을 목록에서 제거
				
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


	const handleIconClick = () => {
		setListOpen(!listOpen);
		// setUnreadCount(0); //누르면 알림 아예 없어지는가
	};


	const handleConfirmNotification = async (notificationId, path) => {
		try{
			await NotificationApi.confirmNotification(notificationId);
			navigate(path);
		}catch(error){
			console.error("알림 확인 작업 실패");
		}
	}

	
  return (
    <div className='notification-container'>
      <FiBell className='notification-icon' onClick={handleIconClick}/>
			{unreadcount > 0 && (
				<span className='notification-count'>{unreadcount}</span>
			)}
			{/* 알림 목록 */}
			{listOpen && (
				<div className='notification-dropdown'>
					{notifications.length > 0 ? (
						notifications.map((notice) => (
							<div
								key={notice.id}
								className={`notification-item`}
								onClick={() => handleConfirmNotification(notice.id, notice.path)} //경로 옮기는 함수
								>
								<span>{notice.noticeMsg}</span>
								<span className='notification-time'>{notice.noticeTime}</span>
							</div>
						))
					) : (
						<p className='notification-empty'>알림이 없습니다.</p>
					)}
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
    </div>
  )
}

export default NotificationIcon
