import React from 'react'
import Modal from '../common/Layouts/components/Modal'
import { useNotification } from './context/NotificationContext'

const NotificationClearAllModal = () => {
	const { showClearModal, handleClearModalClose, handleClearAllNotifications } = useNotification();

	return (
		<div>
			<Modal open={showClearModal} onClose={handleClearModalClose}>
				<div>
					<p style={{ fontSize: "18px", margin: "20px 20px 0px 20px" }}>
						모든 알림을 삭제하시겠습니까?
					</p>
					<p style={{ fontSize: "18px", margin: "20px" }}>
						삭제하신 이후 복구가 불가능합니다.{" "}
					</p>
					<div
						style={{
							display: "flex",
							justifyContent: "space-around",
							gap: "10px",
							marginTop: "20px",
						}}
					>
						<button
							onClick={handleClearAllNotifications}
							style={{
								backgroundColor: "rgb(253, 113, 113)",
								padding: "10px",
								borderRadius: "5px",
								width: "80px",
								height: "30px",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								cursor: "pointer",
							}}
						>
							Delete
						</button>
						<button
							onClick={handleClearModalClose}
							style={{
								backgroundColor: "gray",
								padding: "10px",
								borderRadius: "5px",
								width: "80px",
								height: "30px",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								cursor: "pointer",
							}}
						>
							Cancel
						</button>
					</div>
				</div>
			</Modal>
		</div>
	)
}

export default NotificationClearAllModal