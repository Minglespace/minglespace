import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import NotificationApi from "../../api/notificationApi";
import SockJS from "sockjs-client";
import { HOST_URL } from "../../api/Api";
import Repo from "../../auth/Repo";
import { Client } from "@stomp/stompjs";

const NotificationContext = createContext();

export const useNotification = () => {
	return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
	const [notifications, setNotifications] = useState([]);
	const [unreadcount, setUnreadCount] = useState(0);
	const [listOpen, setListOpen] = useState(false);
	const [snackbarMessages, setSnackbarMessages] = useState([]);
	const [showClearModal, setShowClearModal] = useState(false);

	const socketRef = useRef(null);
	const noticeListRef = useRef();
	const iconRef = useRef();
	const isChatNMSnackbarVisibleRef = useRef(false); //스낵바에 새 메시지 알림 중복 방지
	const navigate = useNavigate();

	useEffect(() => {
		const fetchNotifications = async () => {
			try {
				const notifications = await NotificationApi.getNotifications();
				console.log("알림 목록: ", notifications);
				if (notifications) {
					setNotifications(notifications);
					setUnreadCount(notifications.filter((notice) => !notice.read).length); // 읽지 않은 알림만 카운트
				}
			} catch (error) {
				console.error("알림 가져오기 실패");
			}
		};

		fetchNotifications();
	}, []);

	useEffect(() => {
		const handleClickOutside = (e) => {
			if (
				listOpen &&
				noticeListRef.current &&
				!noticeListRef.current.contains(e.target) &&
				!iconRef.current.contains(e.target)
			) {
				setListOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [listOpen]);


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
					console.log("알림 메시지: ", noticeMsg.noticeMsg)

					if (noticeMsg.type === "CHAT_NEW_MESSAGE") {
						handleChatNewMessage(noticeMsg);
					} else {
						handleNewNotification(noticeMsg);
					}

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


	const addSnackbarMessage = (message) => {
		if (message.type === "CHAT_NEW_MESSAGE" && !isChatNMSnackbarVisibleRef.current) {
			isChatNMSnackbarVisibleRef.current = true;
			setSnackbarMessages((prevMessages) => [...prevMessages, message]);

			setTimeout(() => {
				setSnackbarMessages((prevMessages) =>
					prevMessages.filter((msg) => msg !== message)
				);
				isChatNMSnackbarVisibleRef.current = false;
			}, 3000);
		} else if (message.type !== "CHAT_NEW_MESSAGE") {
			setSnackbarMessages((prevMessages) => [...prevMessages, message]);

			setTimeout(() => {
				setSnackbarMessages((prevMessages) =>
					prevMessages.filter((msg) => msg !== message)
				);
			}, 3000);
		}
	};


	//새로운 메시지일 때 
	const handleChatNewMessage = (noticeMsg) => {
		setNotifications((prev) => {
			const existing = prev.find(
				(notice) => notice.type === "CHAT_NEW_MESSAGE"
			);

			if (existing) {
				if (existing.read) {
					setUnreadCount(prev => prev + 1);
				}
				return [
					noticeMsg,
					...prev.filter(
						(notice) => notice.type !== "CHAT_NEW_MESSAGE"
					),
				];
			} else {
				setUnreadCount(prev => prev + 1);
				return [noticeMsg, ...prev];
			}
		});
		addSnackbarMessage(noticeMsg);
	};

	//그 외
	const handleNewNotification = (noticeMsg) => {
		setNotifications((prev) => [noticeMsg, ...prev]);
		setUnreadCount((prev) => prev + 1);

		addSnackbarMessage(noticeMsg);
	}

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
			setShowClearModal(false);
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
		setListOpen((prev) => !prev);
	};


	return (
		<NotificationContext.Provider
			value={{
				notifications,
				unreadcount,
				listOpen,
				snackbarMessages,
				showClearModal,
				handleConfirmNotification,
				handleClearModalOpen,
				setSnackbarMessages,
				handleClearModalClose,
				handleClearAllNotifications,
				handleIconClick,
				iconRef,
				noticeListRef
			}}
		>
			{children}
		</NotificationContext.Provider>
	);
};