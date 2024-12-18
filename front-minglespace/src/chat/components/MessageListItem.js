import React, { useState } from "react";
import { FiCornerDownRight } from "react-icons/fi";
import { HOST_URL } from "../../api/Api";
import ProfileImage from "../../common/Layouts/components/ProfileImage";

const MessageListItem = ({
  message,
  isSameSender,
  currentMemberInfo,
  onMessageClick,
  onFindParentMessage,
  onRegisterAnnouncment,
  parsedMessage,
}) => {
  const parentMessage = message.replyId
    ? onFindParentMessage(message.replyId)
    : null;
  const [hoveredUnread, setHoveredUnread] = useState([]);

  const handleUnreadMouseEnter = (unReadMembers) => {
    setHoveredUnread(unReadMembers);
  };

  const handleUnreadMouseLeave = () => {
    setHoveredUnread([]);
  };

  const imageUrlPathCheck = (src) => {
    if (src && src.trim() !== "") return `${HOST_URL}${src}`;
    else return null;
  };
  const formatMessage = (message) => {
    const regex = /@(\w+)/g;
    console.log("Formatting message: ", message); // 메시지 형식화 확인
    return message
      .split(regex)
      .map((part, index) =>
        regex.test(`@${part}`) ? <strong key={index}>@{part}</strong> : part
      );
  };

  return (
    <div
      key={message.message_id}
      className={`message-item ${isSameSender ? "sender" : "received"}`}
    >
      {/* 발신자 이름 출력 */}
      {!isSameSender && (
        <span className="message-sender">{message.sender}</span>
      )}

      {/* 메시지 텍스트 */}
      <div className="message-text-container">
        <span className="message-text">
          {parentMessage
            ? Number(parentMessage.writerWsMemberId) ===
              Number(currentMemberInfo.wsMemberId)
              ? "나에게 답장"
              : `${parentMessage.sender}에게 답장`
            : formatMessage(message.content)}
        </span>
      </div>

      {/* 답장 내용 추가 */}
      {parentMessage && (
        <>
          <div className="reply-to-text">{parentMessage.content}</div>
          <div className="reply-line">--------------------------</div>
          <div className="reply-text">{message.content}</div>
        </>
      )}

      <div>
        <button
          className="reply-button"
          onClick={() => onMessageClick(message)}
        >
          답글
          <FiCornerDownRight />
        </button>
        <span
          onClick={() => onRegisterAnnouncment(message)}
          style={{
            cursor: "pointer",
            color: "blue",
            textDecoration: "underline",
          }}
        >
          {" "}
          공지사항 등록
        </span>
        {/* 안읽은 카운트 */}
        {message.unReadMembers && message.unReadMembers.length > 0 && (
          <span
            style={{ fontWeight: "bold", color: "#FA8072", marginLeft: "10px" }}
            onMouseEnter={() => handleUnreadMouseEnter(message.unReadMembers)}
            onMouseLeave={handleUnreadMouseLeave}
          >
            {message.unReadMembers.length}
            {hoveredUnread.length > 0 &&
              hoveredUnread.map((member) => (
                <div
                  key={member.wsMemberId}
                  style={{
                    display: "flex",
                    marginLeft: "30px",
                    marginBottom: "5px",
                  }}
                >
                  <ProfileImage
                    src={imageUrlPathCheck(member.profileImagePath)}
                    userName={member.name}
                    size={30}
                  />
                  <span style={{ marginLeft: "10px" }}>{member.name}</span>
                </div>
              ))}
          </span>
        )}
      </div>
    </div>
  );
};

export default MessageListItem;
