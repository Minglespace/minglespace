import React, { useState } from "react";
import { FaLock, FaLockOpen } from "react-icons/fa";

const MessageInput = ({ onSendMessage }) => {
  // 메시지 입력을 잠그는 상태 변수
  const [isLocked, setIsLocked] = useState(false);
  const [messages, setMessages] = useState("");

  // 메시지 잠금 상태 변경 함수
  const toggleLock = () => {
    setIsLocked((prevState) => !prevState);
  };

  // 메시지 입력
  const handleMessageChange = (e) => {
    if (!isLocked) {
      setMessages(e.target.value);
    }
  };

  // 메시지 전송 처리 함수
  const handleSendMessage = () => {
    if (messages.trim() !== "") {
      onSendMessage(messages);
      setMessages("");
    } else {
      alert("메시지를 입력해주세요");
    }
  };

  const handleKeyDown = (e) => {
    console.log(typeof messages);
    if (e.key === "Enter" && !e.shiftKey && messages.trim()) {
      handleSendMessage();
      setMessages(""); // 메시지 전송 후 입력란 초기화
    }
  };

  return (
    <div className="message-input-container">
      <div className="message-input-wrapper">
        <input
          type="text"
          value={messages}
          onChange={handleMessageChange}
          onKeyDown={handleKeyDown} // Enter 키 입력 감지
          disabled={isLocked} // 잠금 상태에서 입력을 못 하게 함
          placeholder={
            isLocked ? "입력이 잠겨 있습니다." : "메시지를 입력하세요..."
          }
          className="message-input"
        />

        <button
          className="send-btn"
          onClick={handleSendMessage}
          disabled={isLocked || !messages.trim()}
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
