import React from "react";
import Modal from "../../common/Layouts/components/Modal";

const TodoModal = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="milestone_help">
      <Modal open={open} onClose={onClose}>
        <div className="title">
          <p>Milestone Helper</p>
        </div>
        <div className="create_group">
          <p>그룹 생성</p>
          <p>
            그룹 추가하기 버튼을 클릭하여 새로운 작업 그룹을 만들수 있습니다.
          </p>
        </div>
        <div className="create_item">
          <p>아이템 생성</p>
          <p>아이템 필드를 더블클릭하여 새로운 업무를 생성할수 있습니다.</p>
        </div>
        <div className="modify_group">
          <p>그룹 수정 및 삭제</p>
          <p>1. 그룹 이름을 더블클릭 하면 수정창을 확인하실수 있습니다.</p>
          <p>2. 그룹의 이름을 수정할수 있습니다.</p>
          <p>3. 삭제버튼을 눌러 현재 선택된 그룹을 삭제할수 있습니다.</p>
        </div>
        <div className="modify_item">
          <p>아이템 수정 및 삭제</p>
          <p>1. 아이템을 더블클릭 하면 수정창을 확인하실 수 있습니다.</p>
          <p>
            2. 수정창에서는 아이템의 이름, 시작과 끝시간, 현재 진행상태를
            수정할수 있습니다.
          </p>
          <p>3. 삭제버튼을 눌러 현재 선택된 아이템을 삭제할수 있습니다.</p>
        </div>
        <div className="modify_controll">
          <p>조작법</p>
          <p>1. Ctrl + 마우스 휠 : 빠른 줌</p>
          <p>2. Alt + 마우스 휠 : 느린 줌</p>
          <p>3. Shift + 마우스 휠 : 좌우 스크롤</p>
        </div>
      </Modal>
    </div>
  );
};

export default TodoModal;
