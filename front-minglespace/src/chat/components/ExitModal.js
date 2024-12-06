import React from "react";

const ExitModal = ({ isOpen, onClose, isRoomOwner, onExit }) => {
  if (!isOpen) return null;

  const handleExit = () => {
    // console.log("나가기 버튼 클릭 ");
    // console.log("isRoomOwner: ", isRoomOwner);
    if (isRoomOwner) {
      onClose("transfer");
    } else {
      onExit()
      onClose();
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="exit_modal">
      <h1>정말로 나가시겠습니까? </h1>
      <button onClick={handleExit}>
        {isRoomOwner ? "방장 위임 후 나가기" : "나가기"}
      </button>

      <button onClick={handleClose}>닫기 </button>
    </div>
  );
};

export default ExitModal;
