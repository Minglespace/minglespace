import React, { useRef } from "react";
import Modal from "../../common/Layouts/components/Modal";
const MileStoneModal = ({
  open,
  onClose,
  title,
  startTime,
  endTime,
  onTitleChange,
  onStartTimeChange,
  onEndTimeChange,
  onSave,
  onDelete,
  mode,
}) => {
  const inputFocus = useRef(null);

  const handleSave = () => {
    if (!title.trim()) {
      alert("내용을 입력해 주세요");
      inputFocus.current.focus();
      return;
    }
    onSave();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="milestone_modal_container">
        <h2 className="milestone_modal_title">아이템 수정하기</h2>
        <div className="milestone_modal_modify_title">
          <p>Title :</p>
          <input
            ref={inputFocus}
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            required
            maxLength={30}
          />
        </div>
        {mode != "titleOnly" && (
          <>
            <div className="milestone_modal_modify_starttime">
              <p>Start Time :</p>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => onStartTimeChange(e.target.value)}
              />
            </div>
            <div className="milestone_modal_modify_endtime">
              <p>End Time :</p>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => onEndTimeChange(e.target.value)}
              />
            </div>
          </>
        )}
        <div className="milestone_modal_modify_button">
          <button onClick={handleSave}>Save</button>
          <button onClick={onDelete}>Delete</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </Modal>
  );
};

export default MileStoneModal;
