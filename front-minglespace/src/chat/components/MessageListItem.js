﻿import React, { useState, useEffect } from "react";
import { FiCornerDownRight, FiDownload, FiTrash2 } from "react-icons/fi";
import { HOST_URL } from "../../api/Api";
import ProfileImage from "../../common/Layouts/components/ProfileImage";
import Lightbox from "react-18-image-lightbox";
import "react-18-image-lightbox/style.css";
import ChatApi from "../../api/chatApi";
import { TbPinFilled } from "react-icons/tb";
import {
  AiOutlineFileExcel,
  AiOutlineFileMarkdown,
  AiOutlineFilePdf,
  AiOutlineFileUnknown,
  AiOutlineFileWord,
} from "react-icons/ai";
import {
  SiCss3,
  SiJavascript,
  SiMysql,
  SiPython,
  SiTableau,
  SiTypescript,
  SiYaml,
} from "react-icons/si";
import { RiJavaLine } from "react-icons/ri";
import { VscJson } from "react-icons/vsc";
import { useChatApp } from "../context/ChatAppContext";

const MessageListItem = ({
  message,
  isSameSender,
  currentMemberInfo,
  onMessageClick,
  onFindParentMessage,
  openAnnounceMentModal,
  openDeleteModal,
}) => {
  const { wsMemberState } = useChatApp();

  const parentMessage = message.replyId
    ? onFindParentMessage(message.replyId)
    : null;
  const [hoveredUnread, setHoveredUnread] = useState([]);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  const handleUnreadMouseEnter = (unReadMembers) => {
    setHoveredUnread(unReadMembers);
  };

  const handleUnreadMouseLeave = () => {
    setHoveredUnread([]);
  };

  const imageUrlPathCheck = (src) => {
    if (src && src.trim() !== "") return `${HOST_URL}${src}`;
    else return null;
  };

  const formatMessage = (message) => {
    const regex = /@(\w+)/g;
    return message.split(regex).map((part, index) => {
      const isMention =
        wsMemberState.some((member) => member.name === part) ||
        part === currentMemberInfo.name;
      return isMention ? (
        <span
          className="mention"
          // style={{ fontWeight: "bold", color: "#6495ED" }}
          key={index}
        >
          @{part}
        </span>
      ) : (
        part
      );
    });
  };

  const openLightbox = (index) => {
    setPhotoIndex(index);
    setIsImageOpen(true);
  };

  const handleDownload = async (url, filename) => {
    const blob = await ChatApi.downloadFile(url);
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const visibleImages = message.imageUriPaths.slice(0, 3);
  const remainingImageCount = message.imageUriPaths.length - 3;

  const getFileIcon = (fileExtension) => {
    switch (fileExtension) {
      case "pdf":
        return <AiOutlineFilePdf style={{ color: "red" }} />;
      case "doc":
      case "docx":
        return <AiOutlineFileWord style={{ color: "blue" }} />;
      case "xlsx":
      case "xls":
        return <AiOutlineFileExcel style={{ color: "green" }} />;
      case "js":
        return <SiJavascript style={{ color: "#FFEB3B" }} />;
      case "ts":
      case "tsx":
        return <SiTypescript style={{ color: "blue" }} />;
      case "css":
      case "scss":
        return <SiCss3 style={{ color: "blue" }} />;
      case "java":
        return <RiJavaLine style={{ color: "red" }} />;
      case "py":
        return <SiPython style={{ color: "blue" }} />;
      case "json":
        return <VscJson style={{ color: "orange" }} />;
      case "md":
        return <AiOutlineFileMarkdown style={{ color: "purple" }} />;
      case "sql":
        return <SiMysql style={{ color: "blue" }} />;
      case "csv":
        return <SiTableau style={{ color: "blue" }} />;
      case "yaml":
      case "yml":
        return <SiYaml style={{ color: "grey" }} />;
      default:
        return <AiOutlineFileUnknown style={{ color: "grey" }} />;
    }
  };

  const renderDocumentPreview = (uri) => {
    const fileExtension = uri.split(".").pop().toLowerCase();
    let filename = uri.split("/").pop();
    const filenameParts = filename.split("_");
    if (filenameParts.length > 1) {
      filename = filenameParts.slice(1).join("_");
    }

    return (
      <div className="document-card">
        <div className="document-icon">{getFileIcon(fileExtension)}</div>
        <div className="document-info">
          <span className="document-name">{filename}</span>
          <button
            onClick={() => handleDownload(uri, filename)}
            className="download-button"
          >
            <FiDownload />
          </button>
        </div>
      </div>
    );
  };

  const getFormattedTime = (timestamp) => {
    // console.log("Timestamp:", timestamp);
    if (typeof timestamp === "string") {
      timestamp = Date.parse(timestamp);
    }
    const date = new Date(timestamp);

    if (isNaN(date.getTime())) {
      console.error("Invalid Date:", timestamp);
      return "Invalid Date";
    }
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",

      hour12: false,
    });
  };

  return (
    <div className="message-container">
      <div
        key={message.message_id}
        className={`message-item ${isSameSender ? "sender" : "received"}`}
      >
        {/* 발신자 이름 출력 */}
        {!isSameSender && (
          <span className="message-sender">{message.sender}</span>
        )}

        {/* 메시지 텍스트 */}
        <div className="message-text-container">
          <span className="message-text">
            {parentMessage
              ? Number(parentMessage.writerWsMemberId) ===
                Number(currentMemberInfo.wsMemberId)
                ? "나에게 답장"
                : `${parentMessage.sender}에게 답장`
              : formatMessage(message.content)}
          </span>
        </div>

        {/* 답장 내용 추가 */}
        {parentMessage && (
          <>
            <div className="reply-to-text">{parentMessage.content}</div>
            <div className="reply-line"></div>
            <div className="reply-text">{message.content}</div>
          </>
        )}

        {/* 메시지 시간 표시  */}
        <div className="message-time">{getFormattedTime(message.date)}</div>

        {/* 메시지의 포함된 이미지 표시 */}
        {message.imageUriPaths && message.imageUriPaths.length > 0 && (
          <div
            className={`image-message-container ${
              message.imageUriPaths.length === 1 ? "single" : "multiple"
            }`}
            // style={{
            //   marginTop: "10px",
            //   display: "grid",
            //   gridTemplateColumns:
            //     message.imageUriPaths.length === 1 ? "1fr" : "repeat(2, 1fr)",
            //   gap: "10px",
            //   gridAutoRows: "130px",
            // }}
          >
            {visibleImages.map((imageUri, index) => (
              <img
                key={index}
                src={`${HOST_URL}${imageUri}`}
                alt={`chatImage-${index}`}
                className="image-item"
                // style={{
                //   width: "100%",
                //   height: "100%",
                //   objectFit: "cover",
                //   minWidth: "130px",
                //   maxWidth: "250px",
                // }}
                onClick={() => openLightbox(index)}
              />
            ))}
            {remainingImageCount > 0 && (
              <div
                className="more-images"
                // style={{
                //   display: "flex",
                //   alignItems: "center",
                //   justifyContent: "center",
                //   backgroundColor: "#f0f0f0",
                //   cursor: "pointer",
                //   fontSize: "18px",
                //   color: "#555",
                //   height: "130px",
                // }}
                onClick={() => openLightbox(3)}
              >
                +{remainingImageCount} more
              </div>
            )}
          </div>
        )}
        {/* 문서 파일 */}
        {message.documentUriPaths && message.documentUriPaths.length > 0 && (
          <div className="document-container">
            {message.documentUriPaths.map((uri, index) => (
              <div
                key={index}
                className="document-item"
                // style={{ marginBottom: "10px" }}
              >
                {renderDocumentPreview(`${HOST_URL}${uri}`)}
              </div>
            ))}
          </div>
        )}

        {isImageOpen && (
          <Lightbox
            mainSrc={`${HOST_URL}${message.imageUriPaths[photoIndex]}`}
            nextSrc={`${HOST_URL}${
              message.imageUriPaths[
                (photoIndex + 1) % message.imageUriPaths.length
              ]
            }`}
            prevSrc={`${HOST_URL}${
              message.imageUriPaths[
                (photoIndex + message.imageUriPaths.length - 1) %
                  message.imageUriPaths.length
              ]
            }`}
            onCloseRequest={() => setIsImageOpen(false)}
            onMovePrevRequest={() =>
              setPhotoIndex(
                (photoIndex + message.imageUriPaths.length - 1) %
                  message.imageUriPaths.length
              )
            }
            onMoveNextRequest={() =>
              setPhotoIndex((photoIndex + 1) % message.imageUriPaths.length)
            }
            toolbarButtons={[
              <React.Fragment>
                <div className="toolbar-buttons">
                  <button
                    onClick={() =>
                      handleDownload(
                        `${HOST_URL}${message.imageUriPaths[photoIndex]}`,
                        `chatImage-${photoIndex}`
                      )
                    }
                    className="imageDownload-button"
                  >
                    <FiDownload />
                  </button>
                </div>
              </React.Fragment>,
            ]}
          />
        )}
      </div>

      <div
        className={`message-footer ${isSameSender ? "right" : "left"}`}
        // style={{
        //   textAlign: isSameSender ? "right" : "left",
        // }}
      >
        <button
          className="reply-button"
          onClick={() => onMessageClick(message)}
        >
          <FiCornerDownRight />
        </button>
        <span
          className="pin-icon"
          onClick={() => openAnnounceMentModal(message)}
          // style={{
          //   cursor: "pointer",
          //   color: "blue",
          //   textDecoration: "underline",
          //   fontsize: "20px",
          // }}
        >
          <TbPinFilled />
        </span>

        {/* 삭제 아이콘 */}
        {message.writerWsMemberId === currentMemberInfo.wsMemberId && (
          <button
            className="delete-button"
            onClick={() => openDeleteModal(message)}
            // style={{
            //   backgroundColor: "transparent",
            //   border: "none",
            //   color: "red",
            //   cursor: "pointer",
            //   fontSize: "18px",
            // }}
          >
            <FiTrash2 />
          </button>
        )}

        {/* 안읽은 카운트 */}
        {message.unReadMembers && message.unReadMembers.length > 0 && (
          <span
            className="unread-count"
            // style={{
            //   fontWeight: "bold",
            //   color: "#FA8072",
            //   marginLeft: "10px",
            //   cursor: "pointer",
            //   fontSize: "15px",
            // }}
            onMouseEnter={() => handleUnreadMouseEnter(message.unReadMembers)}
            onMouseLeave={handleUnreadMouseLeave}
          >
            {message.unReadMembers.length}
            {hoveredUnread.length > 0 &&
              hoveredUnread.map((member) => (
                <div
                  key={member.wsMemberId}
                  className={`unread-member ${isSameSender ? "right" : ""}`}
                  // style={{
                  //   display: "flex",
                  //   marginLeft: "30px",
                  //   marginBottom: "5px",
                  //   textAlign: "left",
                  //   justifyContent: isSameSender ? "flex-end" : "flex-start",
                  // }}
                >
                  <ProfileImage
                    src={imageUrlPathCheck(member.profileImagePath)}
                    userName={member.name}
                    size={30}
                  />
                  <span
                    style={{
                      marginLeft: "10px",
                      fontSize: "18px",
                    }}
                  >
                    {member.name}
                  </span>
                </div>
              ))}
          </span>
        )}
      </div>
      {isImageOpen && (
        <Lightbox
          mainSrc={`${HOST_URL}${message.imageUriPaths[photoIndex]}`}
          nextSrc={`${HOST_URL}${
            message.imageUriPaths[
              (photoIndex + 1) % message.imageUriPaths.length
            ]
          }`}
          prevSrc={`${HOST_URL}${
            message.imageUriPaths[
              (photoIndex + message.imageUriPaths.length - 1) %
                message.imageUriPaths.length
            ]
          }`}
          onCloseRequest={() => setIsImageOpen(false)}
          onMovePrevRequest={() =>
            setPhotoIndex(
              (photoIndex + message.imageUriPaths.length - 1) %
                message.imageUriPaths.length
            )
          }
          onMoveNextRequest={() =>
            setPhotoIndex((photoIndex + 1) % message.imageUriPaths.length)
          }
          toolbarButtons={[
            <React.Fragment>
              <div className="toolbar-buttons">
                <button
                  onClick={() =>
                    handleDownload(
                      `${HOST_URL}${message.imageUriPaths[photoIndex]}`,
                      `chatImage-${photoIndex}`
                    )
                  }
                  className="imageDownload-button"
                >
                  <FiDownload />
                </button>
              </div>
            </React.Fragment>,
          ]}
        />
      )}
    </div>
  );
};

export default MessageListItem;
