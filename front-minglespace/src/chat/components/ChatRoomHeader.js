import { useState } from "react";
import ChatRoomModal from "./ChatRoomModal";
import { FcExport } from "react-icons/fc";
import { FiSettings } from "react-icons/fi";
import { useChatRoom } from "../context/ChatRoomContext";

const ChatRoomHeader = ({
  onUpdateChatRoom
}) => {
  const [modalType, setModalType] = useState("");
  const { chatRoomInfo, isRoomOwner, setIsModalOpen } = useChatRoom();

  const openModal = (type) => {
    // console.log(`opening modal: ${type}`);

    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = (newModalType) => {
    if (newModalType) {
      setModalType(newModalType);
    } else {
      setIsModalOpen(false);
    }
  };

  // 헤더 클릭 핸들러
  const handleHeaderClick = (e) => {
    // 아이콘 외의 부분을 클릭했을 때 모달이 열리지 않도록
    if (
      !e.target.closest(".chatroom-invite-btn") &&
      !e.target.closest(".chatroom-exit-btn")
    ) {
      e.stopPropagation(); // 모달이 열리지 않게 하기 위해 이벤트 전파를 막음
    }
  };

  return (
    <div className="chatroom-header" onClick={handleHeaderClick}>
      {isRoomOwner && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            openModal("invite");
          }}
          className="chatroom-invite-btn"
        >
          <FiSettings className="icon" />
        </button>
      )}
      <ChatRoomModal
        modalType={modalType}
        onClose={closeModal}
        roomMembers={chatRoomInfo.participants}
        onUpdateChatRoom={onUpdateChatRoom}
      />
      <span className="chatroominfo-name">{chatRoomInfo.name}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          openModal("exit");
        }}
        className="chatroom-exit-btn"
      >
        <FcExport className="icon" />
      </button>
    </div>
  );
};

export default ChatRoomHeader;
