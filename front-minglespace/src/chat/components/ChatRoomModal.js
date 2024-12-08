import React from "react";
import ExitModal from "./ExitModal";
import InviteFriendModal from "./InviteFriendModal";
import DelegateModal from "./DelegateModal";

const ChatRoomModal = ({
  modalType,
  isOpen,
  onClose,
  roomMembers,
  onTransfer, // 방장 위임 함수
  inviteUsers,
  isRoomOwner,
  onInvite,
}) => {
  if (!isOpen) return null;

  console.log(`Rendering modal: ${modalType}`);
  console.log("ChatRoomModal_isRoomOwner: ", isRoomOwner);

  const renderModal = () => {
    switch (modalType) {
      case "exit":
        return (
          <ExitModal
            isOpen={isOpen}
            onClose={onClose}
            isRoomOwner={isRoomOwner}
          />
        );
      case "invite":
        console.log("InviteFriendModal props:", inviteUsers);
        return (
          <InviteFriendModal
            isOpen={isOpen}
            onClose={onClose}
            inviteUsers={inviteUsers}
            onInvite={onInvite}
            onTransfer={onTransfer}
          />
        );
      case "transfer":
        console.log("delegateModal 렌더링");
        return (
          <DelegateModal
            isOpen={isOpen}
            onClose={onClose}
            roomMembers={roomMembers}
            onTransfer={onTransfer}
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
