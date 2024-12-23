import React from 'react'

const borderTopColorMap = {
  CHAT: "#e6ccd2",
  CHAT_NEW_MESSAGE: "#e6ccd2",
  FRIEND: "#5c6ac4",
  SCHEDULE: "rgb(46, 235, 58)",
  default: "#dfe6e9",
};

const Snackbar = ({ message, onClose, onConfirmClick }) => {
  const borderColor = borderTopColorMap[message.type] || borderTopColorMap.default;

  return (
    <div className='snackbar' style={{ borderTop: `5px solid ${borderColor}` }}>
      <span className="snackbar-title" onClick={() => onConfirmClick(message.id, message.path)}>{message.noticeMsg}</span>
      <button className='snackbar-close' onClick={onClose}>
        &times;
      </button>
    </div>
  )
}

export default Snackbar
