import React, { useState, useEffect, useRef } from "react";
import { FaLock, FaLockOpen, FaTrashAlt } from "react-icons/fa";
import Modal from "../../common/Layouts/components/Modal";

const MessageInput = ({ onSendMessage, replyToMessage, setReplyToMessage, currentMemberInfo }) => {
  const [newMessage, setNewMessage] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef();

  const MAX_FILE_COUNT = 10;
  const MAX_FILE_SIZE = 10 * 1024 * 1024; //10MB
  const MAX_TOTAL_SIZE = 100 * 1024 * 1024; //100MB

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
      setFiles([]);
      fileInputRef.current.value = "";
    } else {
      alert("메시지를 입력해주세요");
    }
  };

  const handleKeyDown = (e) => {
    console.log(typeof messages);
    if (e.key === "Enter" && !e.shiftKey && (newMessage.trim() || files.length > 0)) {
      e.preventDefault();
      handleSendMessage();
      setNewMessage("");
      setFiles([]);
      fileInputRef.current.value = "";
    }
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
    </div >
  );
};

export default MessageInput;
