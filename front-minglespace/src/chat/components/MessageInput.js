import React, { useState, useEffect, useRef } from "react";
import { MentionsInput, Mention } from "react-mentions";
import Mentions from "./Mentions";
import { FaLock, FaLockOpen, FaTrashAlt } from "react-icons/fa";
import Modal from "../../common/Layouts/components/Modal";

const MessageInput = ({
  onSendMessage,
  replyToMessage,
  setReplyToMessage,
  currentMemberInfo,
  userList = [],
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef();

  const MAX_FILE_COUNT = 10;
  const MAX_FILE_SIZE = 10 * 1024 * 1024; //10MB
  const MAX_TOTAL_SIZE = 100 * 1024 * 1024; //100MB

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

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    let validFiles = [];
    let totalSize = 0;
    for (let file of selectedFiles) {
      if (file.size > MAX_FILE_SIZE) {
        setModalMessage(`${file.name} 파일이 너무 큽니다. 최대 파일 크기를 10MB 입니다.`);
        setIsModalOpen(true);
        continue;
      }
      totalSize += file.size;
      if (totalSize > MAX_TOTAL_SIZE) {
        setModalMessage(`총 파일 크기가 100MB를 초과했습니다.`);
        setIsModalOpen(true);
        break;
      }
      validFiles.push(file);
      if (validFiles.length >= MAX_FILE_COUNT) {
        setModalMessage(`최대 ${MAX_FILE_COUNT}개의 파일만 업로드할 수 있습니다. `);
        setIsModalOpen(true);
        break;
      }
    }

    setFiles(validFiles);
  };

  // 메시지 전송 처리 함수
  const handleSendMessage = () => {
    if (newMessage.trim() || files.length > 0) {
      const messageToSend = {
        content: newMessage,
        replyId: replyToMessage ? replyToMessage.id : null,
      };
      onSendMessage(messageToSend, files);
      setNewMessage("");
      setReplyToMessage(null);
      setFilteredUsers([]);
      setFiles([]);
      fileInputRef.current.value = "";
    } else {
      alert("메시지를 입력해주세요");
    }
    console.log("Message sent: ", newMessage); // 전송된 메시지 확인
  };

  const handleKeyDown = (e) => {
    console.log(typeof messages);
    if (e.key === "Enter" && !e.shiftKey && (newMessage.trim() || files.length > 0)) {
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

  const handleCloseModal = () => {
    setIsModalOpen(false);
    fileInputRef.current.value = "";
  };

  const handleRemoveFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    //input file 갱신
    const dataTransfer = new DataTransfer();
    updatedFiles.forEach(file => dataTransfer.items.add(file));
    fileInputRef.current.files = dataTransfer.files;
  };


  return (
    <div className="message-input-container">
      {/* 선택 파일 목록 */}
      {files.length > 0 && (
        <div
          className="file-preview"
          style={{ display: "flex", flexDirection: "row", gap: "10px", overflowX: "auto", padding: "10px", borderRadius: "5px", backgroundColor: "#f0f0f0", marginBottom: "10px", position: "absolute", bottom: "72px", width: "100%" }}>
          {files.map((file, index) => (
            <div
              key={index}
              className="file-card"
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px", border: "1px solid #ccc", borderRadius: "5px", backgroundColor: "#fff", minWidth: "150px" }}>
              <span
                className="file-name"
                style={{ flex: "1", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {file.name}
              </span>
              <button
                onClick={() => handleRemoveFile(index)}
                className="remove-file-button" style={{ background: "none", border: "none", cursor: "pointer", color: "red" }}>
                <FaTrashAlt />
              </button>
            </div>
          ))}
        </div>
      )}

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
            isLocked || (!newMessage.trim() && files.length === 0)
          }
        >
          전송
        </button>

        {/* 잠금 아이콘: 클릭 시 잠금 상태 토글 */}
        <div className="lock-icon" onClick={toggleLock}>
          {isLocked ? <FaLock /> : <FaLockOpen />}
        </div>
        <input type="file" multiple onChange={handleFileChange} ref={fileInputRef} />

        <Modal open={isModalOpen} onClose={handleCloseModal}>
          <p style={{ margin: "25px 15px" }}>{modalMessage}</p>
          <button onClick={handleCloseModal} style={{ backgroundColor: "gray", padding: "10px", borderRadius: "5px", marginLeft: "133px", fontSize: "15px" }}>OK</button>
        </Modal>
      </div>

      {/* 렌더링 시, 메시지 내 멘션 부분을 굵게 표시 */}
      <div className="message-preview">{formatMessage(newMessage)}</div>
    </div>
  );
};

export default MessageInput;
