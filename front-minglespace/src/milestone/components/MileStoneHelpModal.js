import React from "react";
import Modal from "../../common/Layouts/components/Modal";

const MileStoneHelpModal = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <>
      <Modal open={open} onClose={onClose}>
        <div>
          <p>Milestone Helper</p>
        </div>
        <div>
          <p>그룹 생성</p>
          <p>
            그룹 추가하기 버튼을 클릭하여 새로운 작업 그룹을 만들수 있습니다.
          </p>
        </div>
        <div>
          <p>아이템 생성</p>
          <p>아이템 필드를 더블클릭하여 새로운 업무를 생성할수 있습니다.</p>
        </div>
        <div>
          <p>그룹 수정 및 삭제</p>
        </div>
        <div>
          <p>아이템 수정 및 삭제</p>
        </div>
      </Modal>
    </>
  );
};

export default MileStoneHelpModal;
