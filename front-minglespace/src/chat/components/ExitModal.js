import React from "react";

const ExitModal = ({ isOpen, onClose, isRoomOwner }) => {
  if (!isOpen) return null;

  const handleExit = () => {
    console.log("나가기 버튼 클릭 ");
    console.log("isRoomOwner: ", isRoomOwner);
    if (isRoomOwner) {
      // 방장이라면 방장 위임 모달
      console.log("방장: 방장 위임 후 나가기");
      onClose("transfer");
    } else {
      // 방장이 아니라면 바로 나간다
      console.log("비방장:나가기 ");
      onClose("exit");
    }
  };

  const handleClose = () => {
    console.log("닫기 버튼 클릭");
    onClose(); // 모달을 닫기 위해 부모 컴포넌트의 onClose 호출
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
