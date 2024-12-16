import React, { useEffect, useRef, useState } from "react";
import MessageListItem from "./MessageListItem";
import Modal from "../../common/Layouts/components/Modal";

const MessageList = ({
  messages,
  onMessageClick,
  currentMemberInfo,
  onRegisterAnnouncement,
  onDeleteMessage
}) => {
  const [announcement, setAnnouncement] = useState(null);
  const messageListRef = useRef(null);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [selectedAnnounce, setSelectedAnnounce] = useState(null);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
    // console.log(messages);
  }, [messages]);

  useEffect(() => {
    const newAnnouncement = messages.find((message) => message.isAnnouncement) || null;
    setAnnouncement(newAnnouncement);
    console.log("공지", newAnnouncement)
  }, [messages]);

  const registerAnnouncment = async (msg) => {
    await onRegisterAnnouncement(msg);
    setAnnouncement(msg);
    console.log(msg);
  }

  //부모 댓글 찾기
  const findParentMessage = (replyId) => {
    return messages.find((message) => message.id === replyId);
  }

  const openAnnouncementModal = (message) => {
    console.log("openAnnounce_msg: ", message);
    setSelectedAnnounce(message);
    setIsAnnouncementModalOpen(true);
  };

  const handleAnnounceConfirm = () => {
    if (selectedAnnounce) {
      registerAnnouncment(selectedAnnounce);
      setSelectedAnnounce(null);
      setIsAnnouncementModalOpen(false);
    }
  };

  const handleAnnounceCancel = () => {
    setSelectedAnnounce(null);
    setIsAnnouncementModalOpen(false);
  };

  return (
    <div>
      {announcement && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          공지사항
          <span className="message-sender">{announcement.sender} : </span>
          <span className="message-text">{announcement.content} </span>
        </div>
      )}
      <div className="message-list" ref={messageListRef}>
        {messages.map((message) => {
          return (
            <MessageListItem
              key={message.id}
              message={message}
              isSameSender={
                message.writerWsMemberId === currentMemberInfo.wsMemberId
              }
              currentMemberInfo={currentMemberInfo}
              onMessageClick={onMessageClick}
              onFindParentMessage={findParentMessage}
              openAnnounceMentModal={openAnnouncementModal}
              onDeleteMessage={onDeleteMessage}
            />
          );
        })}
      </div>

      <Modal open={isAnnouncementModalOpen} onClose={handleAnnounceCancel}>
        <div>
          <p style={{ fontSize: "18px", margin: "10px", padding: "10px" }}>공지사항은 하나만 등록 가능합니다.</p>
          <p style={{ fontSize: "20px", margin: "0 10px 10px 10px", padding: "0 10px 10px 10px" }}>이 메시지를 공지사항으로 등록하시겠습니까?</p>
          <div style={{ display: 'flex', justifyContent: 'space-around', gap: '10px', marginTop: '20px' }}>
            <button
              onClick={handleAnnounceConfirm}
              style={{ backgroundColor: "rgb(92, 173, 240)", padding: "10px", borderRadius: "5px", width: "80px", height: "30px", display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: "pointer" }}
            >
              Save
            </button>
            <button
              onClick={handleAnnounceCancel}
              style={{ backgroundColor: "gray", padding: "10px", borderRadius: "5px", width: "80px", height: "30px", display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: "pointer" }}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MessageList;
