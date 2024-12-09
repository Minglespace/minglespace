import React, { useRef, useState } from "react";
import Modal from "../../common/Layouts/components/Modal";
import { now } from "moment";
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
  taskStatus,
  onTaskStatusChange,
}) => {
  const inputFocus = useRef(null);
  const endTimeFocus = useRef(null);
  const [currentEndTime, setCurrentEndTime] = useState(endTime);
  const handleSave = () => {
    if (!title.trim()) {
      alert("내용을 입력해 주세요");
      inputFocus.current.focus();
      return;
    }
    onSave();
  };

  const handleEndTimeChange = (e) => {
    const newEndTime = e.target.value;
    if (new Date(newEndTime) >= new Date(startTime)) {
      onEndTimeChange(newEndTime);
    } else {
      alert("종료일이 시작일보다 먼저일수 없습니다.");
      e.target.value = currentEndTime;
    }
  };

  const handleTaskStatusChange = (e) => {
    const newTaskStatus = e.target.value;
    console.log("change : ", newTaskStatus);
    onTaskStatusChange(newTaskStatus);
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
                ref={endTimeFocus}
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
                onChange={handleEndTimeChange}
              />
            </div>
            <div className="milestone_modal_taskStatus">
              <p>Task Status : </p>
              <select value={taskStatus} onChange={handleTaskStatusChange}>
                <option value="NOT_START">시작 전</option>
                <option value="IN_PROGRESS">진행중</option>
                <option value="COMPLETED">완료</option>
                <option value="ON_HOLD">보류</option>
              </select>
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
