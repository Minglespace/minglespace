import React from "react";
import { BsPeopleFill } from "react-icons/bs";
import default_img from "../../asset/imgs/profile1.png";
import { HOST_URL } from "../../api/Api";
import { useNavigate } from "react-router-dom";
import { useChatApp } from "../context/ChatAppContext";

const ChatListItem = ({ chat }) => {
  const { handleReadMsg, workspaceId } = useChatApp();
  const navigate = useNavigate();

  const handleClick = async () => {
    // console.log("chatlistitem_click: ", typeof chat.chatRoomId);
    try {
      if (chat.notReadMsgCount > 0) {
        await handleReadMsg(chat.chatRoomId);
      }
      navigate(`/workspace/${workspaceId}/chat?chatRoomId=${chat.chatRoomId}`);
    } catch (e) {
      console.error("메시지 읽음 처리 중 오류 발생:", e);
    }
  };

  return (
    <div className="chat_list_item" onClick={handleClick}>
      <div className="chat_img">
        <img
          src={
            chat.imageUriPath ? `${HOST_URL}${chat.imageUriPath}` : default_img
          }
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
          <p className="last_message">
            {chat.lastMessage === null
              ? ""
              : chat.lastMessage
            }
          </p>
          {chat.notReadMsgCount > 0 && (
            <span className="unread_count">{chat.notReadMsgCount}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatListItem;
