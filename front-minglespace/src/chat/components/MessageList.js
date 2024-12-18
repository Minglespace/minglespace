﻿import React, { useEffect, useState } from "react";
import MessageListItem from "./MessageListItem";
import Modal from "../../common/Layouts/components/Modal";
import useMessageListScroll from "../hooks/useMessageListScroll";

const MessageList = ({
  messages,
  onMessageClick,
  currentMemberInfo,
  onRegisterAnnouncement,
  onDeleteMessage,
  fetchMoreMessages,
  msgHasMore,
  currentChatRoomId
}) => {
  const [announcement, setAnnouncement] = useState(null);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [selectedAnnounce, setSelectedAnnounce] = useState(null);

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
    currentChatRoomId
  });


  ///공지사항
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
  };

  // @username 형식으로 멘션을 인식하고 표시하는 함수
  const parseMessage = (message) => {
    const regex = /@(\w+)/g;
    console.log("Parsing message: ", message); // 메시지 파싱 확인
    // @username 형식으로 멘션을 인식하고 표시
    return message.split(regex).map((part, index) =>
      regex.test(`@${part}`) ? (
        <strong key={index} style={{ color: "blue", fontWeight: "bold" }}>
          @{part}
        </strong>
      ) : (
        part
      )
    );
  };

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

  const getMessagePreview = (messageContent) => {
    console.log("msg preview: ", messageContent);
    return messageContent.length > 10 ? `${messageContent.slice(0, 10)}...` : messageContent;
  }

  return (
    <div>
      {announcement && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          공지사항
          <span className="message-sender">{announcement.sender} : </span>
          <span className="message-text">{announcement.content} </span>
        </div>
      )}

      <div className="message-list" onScroll={handleScroll} ref={messageListRef}>
        {newMessageVisible && (
          <div
            className="new-messages-preview"
            onClick={handleNewMessageClick}
            style={{
              position: "absolute",
              bottom: "100px",
              background: "#f0f0f0",
              textAlign: "center",
              padding: "10px",
              cursor: "pointer"
            }}
          >
            새 메시지가 도착했습니다. :
            <span style={{ fontWeight: "bold" }}>{getMessagePreview(newMessageVisible)}</span>
            <br />
            클릭하여 메시지로 이동
          </div>
        )}
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
              parsedMessage={parseMessage(message.content)}
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
    </div >
  );
};

export default MessageList;
