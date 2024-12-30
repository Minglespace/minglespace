import React from "react";
import ExitModal from "./ExitModal";
import InviteFriendModal from "./InviteFriendModal";
import DelegateModal from "./DelegateModal";
import { useChatRoom } from "../context/ChatRoomContext";

const ChatRoomModal = ({
  modalType,
  onClose,
  roomMembers,
  onUpdateChatRoom,
}) => {
  const { isModalOpen } = useChatRoom();
  if (!isModalOpen) return null;

  const renderModal = () => {
    switch (modalType) {
      case "exit":
        return (
          <ExitModal
            onClose={onClose}
            participants={roomMembers}
          />
        );
      case "invite":
        // console.log("InviteFriendModal props:", inviteUsers);
        return (
          <InviteFriendModal
            onClose={onClose}
            participants={roomMembers}
            onUpdateChatRoom={onUpdateChatRoom}
          />
        );
      case "transfer":
        // console.log("delegateModal 렌더링");
        return (
          <DelegateModal
            onClose={onClose}
            participants={roomMembers}
          />
        );
      default:
        return null;
    }
  };
  return (
    <div className="chatroom-modal-wrapper" onClick={onClose}>
      <div
        className="chatroom-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {renderModal()}
      </div>
    </div>
  );
};

export default ChatRoomModal;
