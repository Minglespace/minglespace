import React, { useState, useEffect } from "react";
import { FaLock, FaLockOpen } from "react-icons/fa";
import { MentionsInput, Mention } from "react-mentions";
import Mentions from "./Mentions";

const MessageInput = ({
  onSendMessage,
  replyToMessage,
  setReplyToMessage,
  currentMemberInfo,
  userList = [],
}) => {
  const [newMessage, setNewMessage] = useState("");
  // 메시지 입력을 잠그는 상태 변수
  const [isLocked, setIsLocked] = useState(false);
  // const [messages, setMessages] = useState(newMessage || "");

  const [isMentioning, setIsMentioning] = useState(false);
  const [mention, setMention] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  // 메시지 잠금 상태 변경 함수
  const toggleLock = () => {
    setIsLocked((prevState) => !prevState);
    // console.log("Lock toggled: ", !isLocked);
  };

  // 메시지 입력
  const handleMessageChange = (e) => {
    // console.log("메시지:", e.target.value);
    if (!isLocked) {
      const value = e.target.value;
      setNewMessage(value);
      // 멘션 처리
      const mentionMatch = e.target.value.match(/@(\S+)$/);
      if (mentionMatch) {
        setIsMentioning(true);
        setMention(mentionMatch[1]);
        console.log("Mentions match found: ", mentionMatch[1]); // 멘션을 콘솔에 바로 출력

        // 사용자 목록을 필터링하여 자동완성 목록을 설정
        const filteredUsersList = userList.filter((user) =>
          user.includes(mentionMatch[1])
        );
        setFilteredUsers(filteredUsersList);
      } else {
        setIsMentioning(false);
        setMention("");
        setFilteredUsers([]);
        console.log("No mention found"); // 멘션이 없을 경우
      }
      console.log("New message: ", value); // 입력한 메시지 상태 확인
    }
  };

  // 메시지 전송 처리 함수
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      //답글처리
      const messageToSend = {
        content: newMessage,
        replyId: replyToMessage ? replyToMessage.id : null,
      };
      onSendMessage(messageToSend); //메시지 전송
      setNewMessage("");
      setReplyToMessage(null);
      setFilteredUsers([]);
    } else {
      alert("메시지를 입력해주세요");
    }
    console.log("Message sent: ", newMessage); // 전송된 메시지 확인
  };

  const handleKeyDown = (e) => {
    console.log(typeof messages);
    if (e.key === "Enter" && !e.shiftKey && newMessage.trim()) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 메시지 내 멘션을 폰트만 굵게 표시하는 함수
  const formatMessage = (message) => {
    const regex = /@(\S+)/g; // @멘션 형식으로 추출
    return message.split(regex).map((part, index) => {
      if (regex.test(`@${part}`)) {
        return (
          <strong key={index} style={{ fontWeight: "bold" }}>
            @{part}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="message-input-container">
      {replyToMessage && (
        <div className="replying-to-message">
          {replyToMessage
            ? Number(replyToMessage.writerWsMemberId) ===
              Number(currentMemberInfo.wsMemberId)
              ? "나에게 답장"
              : `${replyToMessage.sender}에게 답장`
            : replyToMessage.content}

          <p>{replyToMessage.content}</p>
          <button onClick={() => setReplyToMessage(null)}>취소</button>
        </div>
      )}

      <div className="message-input-wrapper">
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

        {/* 멘션이 활성화된 경우, 사용자를 필터링하여 보여줍니다 */}
        {isMentioning && filteredUsers.length > 0 && (
          <div className="mention-suggestions">
            <ul>
              {filteredUsers.map((user, index) => (
                <li
                  key={index}
                  onClick={() => {
                    setMention(user); // 멘션된 사용자 설정
                    setIsMentioning(false); // 멘션 상태 종료
                    setNewMessage(newMessage + "@" + user); // 메시지에 멘션 추가
                    setFilteredUsers([]); // 자동완성 목록 숨기기
                  }}
                >
                  {user}
                </li>
              ))}
            </ul>
          </div>
        )}

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

      {/* 렌더링 시, 메시지 내 멘션 부분을 굵게 표시 */}
      <div className="message-preview">{formatMessage(newMessage)}</div>
    </div>
  );
};

export default MessageInput;
