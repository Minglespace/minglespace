import React from "react";
import { useNotification } from "./context/NotificationContext";

const borderTopColorMap = {
  CHAT: "#e6ccd2",
  CHAT_NEW_MESSAGE: "#e6ccd2",
  FRIEND: "#5c6ac4",
  WORKSPACE: "rgb(46, 235, 58)",
  KICK: "#FF0000",
  default: "#dfe6e9",
};

const Snackbar = ({ message }) => {
  const { handleConfirmNotification, setSnackbarMessages } = useNotification();
  const borderColor =
    borderTopColorMap[message.type] || borderTopColorMap.default;

  return (
    <div className="snackbar" style={{ borderTop: `5px solid ${borderColor}` }}>
      <span
        className="snackbar-title"
        onClick={() => handleConfirmNotification(message.id, message.path)}
      >
        {message.noticeMsg}
      </span>
      <button
        className="snackbar-close"
        onClick={() =>
          setSnackbarMessages((prevMessages) =>
            prevMessages.filter((msg) => msg !== message)
          )
        }
      >
        &times;
      </button>
    </div>
  );
};

export default Snackbar;
