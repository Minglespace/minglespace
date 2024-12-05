import React from "react";
import { BsPeopleFill } from "react-icons/bs";
import default_img from "../../asset/imgs/profile1.png";
import { HOST_URL } from "../../api/Api";

const ChatListItem = ({ chat }) => {
  // unread_count가 이미 더미 데이터에 포함되어 있으므로, 그것을 사용합니다.
  const unreadCount = chat.unreadCount || 0; // chat.unread_count 사용

  // const unreadCount = (chat.messages || []).filter(
  //   (msg) => !msg.read && msg.receiver !== me // 안 읽은 메시지 수
  // ).length;

  return (
    <div className="chat_list_item">
      <div className="chat_img">
        <img
          src={chat.imageUriPath ? `${HOST_URL}${chat.imageUriPath}` : default_img}
          alt="채팅방 이미지"
        />
      </div>
      <div className="chat_info">
        <div className="chat_header">
          <h3 className="chat_name">{chat.name}</h3>
          <span className="participants_count">
            <BsPeopleFill />
            {chat.participantCount}명 참여중
          </span>
        </div>
        <div className="chat_footer">
          <p className="last_message">{chat.lastMessage}</p>
          {unreadCount > 0 && (
            <span className="unread_count">{unreadCount}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatListItem;
