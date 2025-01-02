import React from 'react'
import { useChatRoom } from '../context/ChatRoomContext'

const ModalAlert = () => {
	const { showAlert, alertMessage } = useChatRoom();
	if (!showAlert) return null;
	return (
		<div className='update-alert'>
			{alertMessage}
		</div>
	)
}

export default ModalAlert
