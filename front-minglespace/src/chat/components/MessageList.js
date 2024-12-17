import React, { useEffect, useRef, useState } from "react";
import MessageListItem from "./MessageListItem";
import Modal from "../../common/Layouts/components/Modal";
import InfiniteScroll from "react-infinite-scroll-component";
import { useSpring, animated } from "@react-spring/web";

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
  const [newMessageVisible, setNewMessageVisible] = useState(null); //새 메시지 미리보기
  const messageListRef = useRef(null);
  const isAtBottom = useRef(true);
  const lastMessageTimestamp = useRef(0);


  const scrollAnimaion = useSpring({
    transform: 'translateY(0)',
    from: { transform: 'translateY(20px)' },
    config: { tension: 150, friction: 15 },
  });

  useEffect(() => {
    console.log("currentChatRoomId: ", currentChatRoomId);
    // console.log("lastMessageCount: ", lastMessageCount);
    setNewMessageVisible(false);
    isAtBottom.current = true;
    lastMessageTimestamp.current = 0;

    // messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
  }, [currentChatRoomId]);


  //메시지 갱신되면 
  useEffect(() => {
    const latestMessageTimestamp = messages[messages.length - 1]?.date;

    if (latestMessageTimestamp > lastMessageTimestamp.current) {
      if (!isAtBottom.current) {
        const newMessageContent = messages[messages.length - 1]?.content;

        if (!newMessageContent || newMessageContent.trim() === "") {
          setNewMessageVisible("(파일)");
        } else {
          setNewMessageVisible(newMessageContent);
        }
      } else {
        setNewMessageVisible(null);
        messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
      }
    }

    if (latestMessageTimestamp < lastMessageTimestamp.current) {
      setNewMessageVisible(null);
    }

    lastMessageTimestamp.current = latestMessageTimestamp;
  }, [messages]);

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

  const handleScroll = () => {
    if (messageListRef.current) {
      const scrollTop = messageListRef.current.scrollTop;
      const scrollHeight = messageListRef.current.scrollHeight;
      const clientHeight = messageListRef.current.clientHeight;

      // 사용자가 하단에 있으면 true
      isAtBottom.current = scrollHeight - scrollTop === clientHeight;

    }

    if (messageListRef.current.scrollTop === 0 && msgHasMore) {
      console.log("Fetching more messages...");
      fetchMoreMessages();
    }
  };

  const handleNewMessageClick = () => {
    messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    setNewMessageVisible(null);
  };

  const getMessagePreview = (messageContent) => {
    console.log("msg preview: ", messageContent);
    // if (!messageContent || messageContent.trim() === "") {
    //   return "(파일)";
    // }
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
            // <animated.div style={scrollAnimaion} key={message.id}>
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
            // </animated.div>
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
