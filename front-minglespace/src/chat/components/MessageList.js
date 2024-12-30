﻿﻿import React, { useEffect, useState } from "react";
import MessageListItem from "./MessageListItem";
import Modal from "../../common/Layouts/components/Modal";
import useMessageListScroll from "../hooks/useMessageListScroll";
import { FaBell } from "react-icons/fa";
import { useChatRoom } from "../context/ChatRoomContext";

const MessageList = ({
  messages,
  onMessageClick,
  fetchMoreMessages,
  msgHasMore,
  currentChatRoomId,
}) => {
  const { currentMemberInfo, handleRegisterAnnouncement, handleDeleteMessage, groupMessagesByDate } = useChatRoom();
  const [announcement, setAnnouncement] = useState(null);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [selectedAnnounce, setSelectedAnnounce] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDelete, setSelectedDelete] = useState(null);

  // 스크롤과 메시지 관련
  const {
    messageListRef,
    newMessageVisible,
    handleScroll,
    handleNewMessageClick,
  } = useMessageListScroll({
    messages,
    currentMemberInfo,
    msgHasMore,
    fetchMoreMessages,
    currentChatRoomId,
  });

  ///공지사항
  useEffect(() => {
    const newAnnouncement = messages.find((message) => message.isAnnouncement) || null;
    setAnnouncement(newAnnouncement);
    // console.log("공지", newAnnouncement)
  }, [messages]);

  const registerAnnouncment = async (msg) => {
    await handleRegisterAnnouncement(msg);
    setAnnouncement(msg);
    // console.log(msg);
  };

  //부모 댓글 찾기
  const findParentMessage = (replyId) => {
    return messages.find((message) => message.id === replyId);
  };

  const openAnnouncementModal = (message) => {
    // console.log("openAnnounce_msg: ", message);
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

  const getMessagePreview = (messageContent) => {
    // console.log("msg preview: ", messageContent);
    return messageContent.length > 10 ? `${messageContent.slice(0, 10)}...` : messageContent;
  }

  //메시지 삭제 모달
  const openDeleteModal = (message) => {
    setSelectedDelete(message);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedDelete) {
      await handleDeleteMessage(selectedDelete);
      setIsDeleteModalOpen(false);
      setSelectedDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setSelectedDelete(null);
  };

  const groupedMessages = groupMessagesByDate(messages);
  // console.log("그룹화된 메시지: ", groupedMessages);

  return (
    <div>
      {announcement && (
        <div className="announcement">
          <FaBell className="announcement-icon" />
          <div className="announcement-content">
            <span className="announcement-text">
              공지사항: {/*{announcement.sender}*/} {announcement.content}
            </span>
          </div>
        </div>
      )}

      <div className="message-list" onScroll={handleScroll} ref={messageListRef}>
        {newMessageVisible && (
          <div className="new-messages-preview" onClick={handleNewMessageClick}>
            새 메시지가 도착했습니다. :
            <span style={{ fontWeight: "bold" }}>
              {getMessagePreview(newMessageVisible)}
            </span>
            <br />
            클릭하여 메시지로 이동
          </div>
        )}
        {Object.keys(groupedMessages).map((date) => (
          <div key={date}>
            <div className="msg-date-header">
              <span>{date}</span>
            </div>
            {groupedMessages[date].map((message) => {
              return (
                <MessageListItem
                  key={message.id}
                  message={message}
                  isSameSender={message.writerWsMemberId === currentMemberInfo.wsMemberId}
                  currentMemberInfo={currentMemberInfo}
                  onMessageClick={onMessageClick}
                  onFindParentMessage={findParentMessage}
                  openAnnounceMentModal={openAnnouncementModal}
                  openDeleteModal={openDeleteModal}
                />
              );
            })}
          </div>
        ))}
      </div>

      <Modal open={isAnnouncementModalOpen} onClose={handleAnnounceCancel}>
        <div>
          <p className="text1">공지사항은 하나만 등록 가능합니다.</p>
          <p className="text2">이 메시지를 공지사항으로 등록하시겠습니까?</p>
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              gap: "10px",
              marginTop: "20px",
            }}
          >
            <button className="save-btn" onClick={handleAnnounceConfirm}>
              Save
            </button>
            <button className="cancel-btn" onClick={handleAnnounceCancel}>
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={isDeleteModalOpen} onClose={handleDeleteCancel}>
        <div>
          <p style={{ fontSize: "20px", margin: "20px" }}>이 메시지를 삭제하시겠습니까?</p>
          <div style={{ display: 'flex', justifyContent: 'space-around', gap: '10px', marginTop: '20px' }}>
            <button
              onClick={handleDeleteConfirm}
              style={{
                backgroundColor: "rgb(253, 113, 113)",
                padding: "10px",
                borderRadius: "5px",
                width: "80px",
                height: "30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              Delete
            </button>
            <button
              onClick={handleDeleteCancel}
              style={{
                backgroundColor: "gray",
                padding: "10px",
                borderRadius: "5px",
                width: "80px",
                height: "30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
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
