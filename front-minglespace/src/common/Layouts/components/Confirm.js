import React from "react";

const Confirm = ({ onClose, onDelete }) => {
  return (
    <>
      <div className="confirm_container">
        <div className="confirm_label_container">
          <p>정말 삭제 하시겠습니까?</p>
        </div>
        <div className="confirm_button_container">
          <button className="confirm_yes_button" onClick={onDelete}>
            예
          </button>
          <button className="confirm_no_button" onClick={onClose}>
            예니오
          </button>
        </div>
      </div>
    </>
  );
};

export default Confirm;
