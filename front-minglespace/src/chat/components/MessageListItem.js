import React from "react";
import { FiCornerDownRight } from "react-icons/fi";

const MessageListItem = ({
  message,
  isSameSender,
  currentUser,
  onMessageClick,
}) => {
  return (
    <div
      key={message.message_id}
      className={`message-item ${
        message.isCurrentUser ? "sender" : "received"
      }`}
    >
      {/* 발신자 이름 출력 */}
      {!isSameSender && message.sender && message.sender !== "나" && (
        <span className="message-sender">{message.sender}</span>
      )}

      {/* 메시지 텍스트 */}
      <div className="message-text-container">
        <span className="message-text">
          {message.replyTo
            ? message.replyTo.sender === currentUser
              ? "나에게 답장"
              : `${message.replyTo.sender}에게 답장`
            : message.text}
        </span>
      </div>
      {/* 답글 달기 버튼 */}
      <button
        className="reply-button"
        onClick={() => onMessageClick(message)} // 해당 메시지에 답글을 다는 것으로 설정
      >
        답글
        <FiCornerDownRight />
      </button>

      {/* 답장 내용 추가 */}
      {message.replyTo && (
        <>
          <div className="reply-to-text">{message.replyTo.text}</div>
          <div className="reply-line">--------------------------</div>
          <div className="reply-text">{message.text}</div>
        </>
      )}
    </div>
  );
};

export default MessageListItem;
