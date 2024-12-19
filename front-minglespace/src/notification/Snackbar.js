import React from 'react'

const Snackbar = ({message, onClose, onConfirmClick}) => {
  return (
    <div className='snackbar'>
			<span className="snackbar-title" onClick={() => onConfirmClick(message.id, message.path)}>{message.noticeMsg}</span>
      <button className='snackbar-close' onClick={onClose}>
        &times;
      </button>
    </div>
  )
}

export default Snackbar
