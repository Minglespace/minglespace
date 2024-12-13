import React, { useState, useEffect } from "react";
import { FaLock, FaLockOpen } from "react-icons/fa";

const MessageInput = ({ onSendMessage, replyToMessage, setReplyToMessage }) => {
  const [newMessage, setNewMessage] = useState("");
  // 메시지 입력을 잠그는 상태 변수
  const [isLocked, setIsLocked] = useState(false);
  // const [messages, setMessages] = useState(newMessage || "");

  // 메시지 잠금 상태 변경 함수
  const toggleLock = () => {
    setIsLocked((prevState) => !prevState);
  };

  // 메시지 입력
  const handleMessageChange = (e) => {
    // console.log("메시지:", e.target.value);
    if (!isLocked) {
      setNewMessage(e.target.value);
    }
  };

  // 메시지 전송 처리 함수
  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const messageToSend = {
        content: newMessage,
        replyId: replyToMessage ? replyToMessage.id : null,
      };
      onSendMessage(messageToSend);
      setNewMessage("");
      setReplyToMessage(null);
    } else {
      alert("메시지를 입력해주세요");
    }
  };

  const handleKeyDown = (e) => {
    console.log(typeof messages);
    if (e.key === "Enter" && !e.shiftKey && newMessage.trim()) {
      e.preventDefault();
      handleSendMessage();
      setNewMessage("");
    }
  };

  return (
    <div className="message-input-container">
      <div className="message-input-wrapper">
        {replyToMessage && (
          <div className="replying-to-message">
            <span>답글 대상: {replyToMessage.sender}</span>
            <p>{replyToMessage.content}</p>
            <button onClick={() => setReplyToMessage(null)}>취소</button>
          </div>
        )}
        <input
          type="text"
          value={newMessage}
          onChange={handleMessageChange}
          onKeyDown={handleKeyDown}
          disabled={isLocked}
          placeholder={
            isLocked ? "입력이 잠겨 있습니다." : "메시지를 입력하세요..."
          }
          className="message-input"
        />
        <button
          className="send-btn"
          onClick={handleSendMessage}
          disabled={
            isLocked || (typeof newMessage === "string" && !newMessage.trim())
          }
        >
          전송
        </button>

        {/* 잠금 아이콘: 클릭 시 잠금 상태 토글 */}
        <div className="lock-icon" onClick={toggleLock}>
          {isLocked ? <FaLock /> : <FaLockOpen />}
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
