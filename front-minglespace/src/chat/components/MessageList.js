import React, { useState } from "react";

const MessageList = ({ messages, setReplyToMessage }) => {
  const safeMessaes = messages || [];
  return (
    <div className="message-list">
      {safeMessaes.map((message, index) => (
        <div
          key={index}
          className={`message-item ${
            message.isCurrentUser ? "sender" : "received"
          }`}
        >
          {console.log(
            `Message ${index}:`,
            message,
            message.isCurrentUser ? "sender" : "received"
          )}
          <span className="message-sender">{message.sender}: </span>
          <span className="message-text">{message.text}</span>
          {/* 답글 달기 버튼 */}
          <button
            className="reply-button"
            onClick={() => setReplyToMessage(message)} // 해당 메시지에 답글을 다는 것으로 설정
          >
            답장
          </button>
          {/* 답글 목록 */}
          {message.replies && message.replies.length > 0 && (
            <div className="replies">
              {message.replies.map((reply, replyIndex) => (
                <div key={replyIndex} className="reply">
                  <p className="reply-text">
                    {reply.sender} :{reply.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MessageList;
