import { FiBell } from "react-icons/fi";
import Snackbar from "./Snackbar";
import NotificationList from "./NotificationList";
import NotificationClearAllModal from "./NotificationClearAllModal";
import { useNotification } from "./context/NotificationContext";

const NotificationIcon = () => {
  const {
    unreadcount,
    listOpen,
    snackbarMessages,
    handleIconClick,
    iconRef,
    noticeListRef,
    notifications
  } = useNotification();


  return (
    <div className="notification-container">
      <span ref={iconRef}>
        <FiBell className="notification-icon" onClick={handleIconClick} />
      </span>
      {unreadcount > 0 && (
        <span className="notification-count">{unreadcount}</span>
      )}
      {/* 알림 목록 */}
      {listOpen && (
        <div ref={noticeListRef}>
          <NotificationList
            notifications={notifications} />
        </div>
      )}

      {/* snackbar */}
      <div className="snackbar-container">
        {snackbarMessages.map((message, index) => (
          <Snackbar
            key={index}
            message={message}
          />
        ))}
      </div>

      {/* 전체 삭제 확인 모달 */}
      <NotificationClearAllModal />
    </div>
  );
};

export default NotificationIcon;