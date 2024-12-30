import React from 'react'
import { X } from 'lucide-react';

const ModalMessage = ({message}) => {
  if (!message) return null;

  return (
    <div className="modal-message-overlay">
      <div className="modal-message-container" onClick={(e) => e.stopPropagation()}>
        {/* 닫기 */}
        <button onClick={message.callbackOk || message.callbackNo } className="modal-message-close-button">
          <X size={24} />
        </button>
        {/* 제목 */}
        <div className="modal-message-title">{message.title}</div>
        {/* 내용: HTML 태그를 포함하기 위해 dangerouslySetInnerHTML 사용 */}
        <div className="modal-message-content" dangerouslySetInnerHTML={{ __html: message.content }} />

        {/* 버튼들 */}
        <div className="modal-message-button-container">
          {message.callbackOk && <button type="submit" className="modal-message-button-common" onClick={message.callbackOk}>확인</button> }
          {message.callbackYes && <button type="submit" className="modal-message-button-common" onClick={message.callbackYes}>네</button> }
          {message.callbackNo && <button type="submit" className="modal-message-button-common" onClick={message.callbackNo}>아니요</button> }
        </div>
      </div>
    </div>
  );

}

export default ModalMessage