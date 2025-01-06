import React, { useState, useRef, useEffect } from "react";
import { FaLock, FaLockOpen, FaTrashAlt, FaFileImage } from "react-icons/fa";
import Modal from "../../common/Layouts/components/Modal";
import ProfileImage from "../../common/Layouts/components/ProfileImage";
import { HOST_URL } from "../../api/Api";
import { useChatRoom } from "../context/ChatRoomContext";

const MessageInput = ({
  onSendMessage,
  replyToMessage,
  setReplyToMessage,
  participants,
  currentChatRoomId,
}) => {
  const { currentMemberInfo } = useChatRoom();
  const [newMessage, setNewMessage] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef();

  const MAX_FILE_COUNT = 10;
  const MAX_FILE_SIZE = 10 * 1024 * 1024; //10MB
  const MAX_TOTAL_SIZE = 100 * 1024 * 1024; //100MB

  //멘션 관리 상태
  const [mentioning, setMentioning] = useState(false); //멘션 활성화
  const [filteredMembers, setFilteredMembers] = useState([]); //필터링된 멤버
  const [selectedIndex, setSelectedIndex] = useState(-1); //선택된 목록
  const mentionRef = useRef(null);

  useEffect(() => {
    setNewMessage("");
  }, [currentChatRoomId]);

  useEffect(() => {
    if (newMessage.includes("@")) {
      const mentionMatch = newMessage.match(/@(\S*)$/);
      if (mentionMatch) {
        const query = mentionMatch[1];
        const filteredList = query
          ? participants.filter(
            (member) =>
              member.name.toLowerCase().includes(query.toLowerCase()) &&
              member.userId !== currentMemberInfo.userId // currentMemberInfo.id와 동일한 멤버 제외
          )
          : participants.filter(
            (member) => member.userId !== currentMemberInfo.userId
          );

        setMentioning(true);
        setFilteredMembers(filteredList);
      }
    } else {
      setMentioning(false);
      setFilteredMembers([]);
    }
  }, [newMessage, participants, currentMemberInfo]);

  //멘션 선택 유저가 있다면 목록 스크롤 조정
  useEffect(() => {
    if (mentionRef.current && selectedIndex >= 0) {
      mentionRef.current.scrollTop = selectedIndex * 40;
    }
  }, [selectedIndex]);

  // 메시지 잠금 상태 변경 함수
  const toggleLock = () => {
    setIsLocked((prevState) => !prevState);
    // console.log("Lock toggled: ", !isLocked);
  };

  // 메시지 입력 < ----------- mention
  const handleMessageChange = (e) => {
    if (!isLocked) {
      const value = e.target.value;
      setNewMessage(value);
    }
  };

  // 메시지 전송 처리 함수  <<--------- 멘션 정보 같이 보내기 / 보내고 멘션 상태 초기화
  const handleSendMessage = () => {
    if (newMessage.trim() || files.length > 0) {
      const mentionedIds = [];
      const regex = /@(\S+)/g;
      let match;

      while ((match = regex.exec(newMessage)) !== null) {
        const mentionedName = match[1];

        const member = participants.find(
          (m) => m.name.toLowerCase() === mentionedName.toLowerCase()
        );
        if (member) {
          mentionedIds.push(member.userId);
        }
      }

      // console.log("멘션된 멤버 id들: ", mentionedIds);

      const messageToSend = {
        content: newMessage,
        replyId: replyToMessage ? replyToMessage.id : null,
        mentionedIds: mentionedIds,
      };
      onSendMessage(messageToSend, files);
      setNewMessage("");
      setReplyToMessage(null);
      setFiles([]);
      fileInputRef.current.value = "";
    } else {
      alert("메시지를 입력해주세요");
    }
    // console.log("Message sent: ", newMessage); // 전송된 메시지 확인
  };

  const handleKeyDown = (e) => {
    if (mentioning) {
      if (e.key === "ArrowDown") {
        setSelectedIndex((prev) => (prev + 1) % filteredMembers.length);
      } else if (e.key === "ArrowUp") {
        setSelectedIndex(
          (prev) => (prev - 1 + filteredMembers.length) % filteredMembers.length
        );
      } else if (e.key === "Enter" && selectedIndex >= 0) {
        handleMentionSelect(filteredMembers[selectedIndex]);
      }
    } else {
      if (
        e.key === "Enter" &&
        !e.shiftKey &&
        (newMessage.trim() || files.length > 0)
      ) {
        // e.preventDefault();
        handleSendMessage();
      }
    }
  };

  //멘션 목록에서 항목 선택한 경우
  const handleMentionSelect = (member) => {
    // console.log("클릭된 멤버 멘션: ", member);
    const updatedMessage = newMessage.replace(/@(\S*)$/, `@${member.name} `);
    setNewMessage(updatedMessage);
    setMentioning(false);
    setFilteredMembers([]);
    setSelectedIndex(-1);

    document.querySelector("input").focus();
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    let validFiles = [];
    let totalSize = 0;
    for (let file of selectedFiles) {
      if (file.size > MAX_FILE_SIZE) {
        setModalMessage(
          `${file.name} 파일이 너무 큽니다. 최대 파일 크기를 10MB 입니다.`
        );
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
        setModalMessage(
          `최대 ${MAX_FILE_COUNT}개의 파일만 업로드할 수 있습니다. `
        );
        setIsModalOpen(true);
        break;
      }
    }

    setFiles(validFiles);
  };

  //파일 제한 모달
  const handleCloseModal = () => {
    setIsModalOpen(false);
    fileInputRef.current.value = "";
  };

  const handleRemoveFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    //input file 갱신
    const dataTransfer = new DataTransfer();
    updatedFiles.forEach((file) => dataTransfer.items.add(file));
    fileInputRef.current.files = dataTransfer.files;
  };

  const imageUrlPathCheck = (src) => {
    if (src && src.trim() !== "") return `${HOST_URL}${src}`;
    else return null;
  };

  return (
    <div className="message-input-container">
      {/* 선택 파일 목록 */}
      {files.length > 0 && (
        <div
          className="file-preview"
        >
          {files.map((file, index) => (
            <div
              key={index}
              className="file-card"
            >
              <span
                className="file-name"
              >
                {file.name}
              </span>
              <button
                onClick={() => handleRemoveFile(index)}
                className="remove-file-button"
              >
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
        {mentioning && filteredMembers.length > 0 && (
          <div
            className="mention-suggestions"
            ref={mentionRef}
          >
            <ul>
              {filteredMembers.map((member, index) => (
                <li
                  key={member.wsMemberId}
                  onClick={() => handleMentionSelect(member)}
                  className={`member-item ${selectedIndex === index ? "selected" : ""
                    }`}
                >
                  <ProfileImage
                    src={imageUrlPathCheck(member.profileImagePath)}
                    userName={member.name}
                    size={20}
                  />
                  <span
                    className="member-name"
                  >
                    {member.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          className="send-btn"
          onClick={handleSendMessage}
          disabled={isLocked || (!newMessage.trim() && files.length === 0)}
        >
          전송
        </button>
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          ref={fileInputRef}
          style={{ display: "none" }}
        />
        <FaFileImage
          className="file-image"
          onClick={() => fileInputRef.current.click()} // 클릭 시 input 엽니다.
        />
        {/* 잠금 아이콘: 클릭 시 잠금 상태 토글 */}
        <div className="lock-icon" onClick={toggleLock}>
          {isLocked ? <FaLock /> : <FaLockOpen />}
        </div>

        <Modal open={isModalOpen} onClose={handleCloseModal}>
          <p className="modal-message">
            {modalMessage}
          </p>
          <button
            className="modal-ok-button"
            onClick={handleCloseModal}
          >
            OK
          </button>
        </Modal>
      </div>
    </div>
  );
};

export default MessageInput;
