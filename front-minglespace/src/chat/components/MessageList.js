import React, { useState } from "react";

const MessageList = ({ messages, onMessageClick }) => {
  const safeMessages = messages || [];

  return (
    <div className="message-list">
      {safeMessages.map((message, index) => {
        const isSameSender =
          index > 0 && safeMessages[index - 1].sender === message.sender;

        return (
          <div
            key={message.message_id}
            className={`message-item ${
              message.isCurrentUser ? "sender" : "received"
            }`}
          >
            {/* 이전 메시지와 다른 사용자일 경우만 sender를 표시 */}
            {!isSameSender && (
              <span className="message-sender">{message.sender}</span>
            )}
            <span className="message-text">
              {message.replyTo
                ? `${message.replyTo.sender}님에게 답장`
                : message.text}
            </span>

            {/* 답글 달기 버튼 */}
            <button
              className="reply-button"
              onClick={() => onMessageClick(message)} // 해당 메시지에 답글을 다는 것으로 설정
            >
              답장
            </button>

            {/* 답장 내용 추가 */}
            {message.replyTo && (
              <>
                <div className="reply-line">--------------------------</div>
                <div className="reply-text">{message.text}</div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;
