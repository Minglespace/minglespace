import React from "react";
import { FiCornerDownRight } from "react-icons/fi";

const MessageListItem = ({
  message,
  isSameSender,
  currentMemberInfo,
  onMessageClick,
  onFindParentMessage,
}) => {
  const parentMessage = message.replyId
    ? onFindParentMessage(message.replyId)
    : null;

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
            : message.content}
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
      {parentMessage && (
        <>
          <div className="reply-to-text">{parentMessage.content}</div>
          <div className="reply-line">--------------------------</div>
          <div className="reply-text">{message.content}</div>
        </>
      )}
    </div>
  );
};

export default MessageListItem;
