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
  console.log("InviteFriendModal_ props:", inviteUsers);

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
        console.log("InviteFriendModal props:", roomMembers);
        return (
          <InviteFriendModal
            isOpen={isOpen}
            onClose={onClose}
            inviteUsers={inviteUsers}
            participants={roomMembers}
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
            participants={roomMembers}
            onTransfer={onTransfer}
          />
        );
      default:
        return null;
    }
  };
  return (
    <div className="chatroom_modal_wrapper" onClick={onClose}>
      <div
        className="chatroom_modal_content"
        onClick={(e) => e.stopPropagation()}
      >
        {renderModal()}
      </div>
    </div>
  );
};

export default ChatRoomModal;
