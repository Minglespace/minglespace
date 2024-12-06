import React, { useState } from "react";
import { FaLock, FaLockOpen } from "react-icons/fa";

const MessageInput = ({ onSendMessage }) => {
  // 메시지 입력을 잠그는 상태 변수
  const [isLocked, setIsLocked] = useState(false);
  const [message, setMessage] = useState("");

  // 메시지 잠금 상태 변경 함수
  const toggleLock = () => {
    setIsLocked((prevState) => !prevState);
  };

  // 메시지 입력
  const handleMessageChange = (e) => {
    if (!isLocked) {
      setMessage(e.target.value);
    }
  };

  const handleSendMessage = () => {
    if (message.trim() !== "") {
      onSendMessage(message);
      setMessage("");
    }
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && message.trim()) {
      onSendMessage(message);
      setMessage(""); // 메시지 전송 후 입력란 초기화
    }
  };

  return (
    <div className="message-input-container">
      <div className="message-input-wrapper">
        <input
          type="text"
          value={message}
          onChange={handleMessageChange}
          onKeyDown={handleKeyDown} // Enter 키 입력 감지
          disabled={isLocked} // 잠금 상태에서 입력을 못 하게 함
          placeholder={
            isLocked ? "입력이 잠겨 있습니다." : "메시지를 입력하세요..."
          }
          className="message-input"
        />

        <button
          className="input_btn"
          onClick={handleSendMessage}
          disabled={isLocked || !message.trim()}
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
