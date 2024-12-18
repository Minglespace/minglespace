import React, { useState } from "react";
import { FiCornerDownRight, FiDownload, FiTrash2 } from "react-icons/fi";
import { HOST_URL } from "../../api/Api";
import ProfileImage from "../../common/Layouts/components/ProfileImage";
import Lightbox from "react-18-image-lightbox";
import "react-18-image-lightbox/style.css";
import ChatApi from "../../api/chatApi";
import { AiOutlineFileExcel, AiOutlineFileMarkdown, AiOutlineFilePdf, AiOutlineFileUnknown, AiOutlineFileWord } from "react-icons/ai";
import { SiCss3, SiJavascript, SiMysql, SiPython, SiTableau, SiTypescript, SiYaml } from "react-icons/si";
import { RiJavaLine } from "react-icons/ri";
import { VscJson } from "react-icons/vsc";

const MessageListItem = ({
  message,
  isSameSender,
  currentMemberInfo,
  onMessageClick,
  onFindParentMessage,
  parsedMessage,
  openAnnounceMentModal,
  openDeleteModal
}) => {
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
    // console.log("Formatting message: ", message); // 메시지 형식화 확인
    return message
      .split(regex)
      .map((part, index) =>
        regex.test(`@${part}`) ? <strong key={index}>@{part}</strong> : part
      );
  };

  const openLightbox = (index) => {
    setPhotoIndex(index);
    setIsImageOpen(true);
  }

  const handleDownload = async (url, filename) => {
    const blob = await ChatApi.downloadFile(url);
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const visibleImages = message.imageUriPaths.slice(0, 3);
  const remainingImageCount = message.imageUriPaths.length - 3;

  const getFileIcon = (fileExtension) => {
    switch (fileExtension) {
      case 'pdf':
        return <AiOutlineFilePdf style={{ color: "red" }} />;
      case 'doc':
      case 'docx':
        return <AiOutlineFileWord style={{ color: "blue" }} />;
      case 'xlsx':
      case 'xls':
        return <AiOutlineFileExcel style={{ color: "green" }} />;
      case 'js':
        return <SiJavascript style={{ color: "#FFEB3B" }} />;
      case 'ts':
      case 'tsx':
        return <SiTypescript style={{ color: "blue" }} />;
      case 'css':
      case 'scss':
        return <SiCss3 style={{ color: "blue" }} />;
      case 'java':
        return <RiJavaLine style={{ color: "red" }} />;
      case 'py':
        return <SiPython style={{ color: "blue" }} />;
      case 'json':
        return <VscJson style={{ color: "orange" }} />;
      case 'md':
        return <AiOutlineFileMarkdown style={{ color: "purple" }} />;
      case 'sql':
        return <SiMysql style={{ color: 'blue' }} />;
      case 'csv':
        return <SiTableau style={{ color: 'blue' }} />;
      case 'yaml':
      case 'yml':
        return <SiYaml style={{ color: 'grey' }} />;
      default:
        return <AiOutlineFileUnknown style={{ color: "grey" }} />;
    }
  }

  const renderDocumentPreview = (uri) => {
    const fileExtension = uri.split('.').pop().toLowerCase();
    let filename = uri.split('/').pop();
    const filenameParts = filename.split('_');
    if (filenameParts.length > 1) {
      filename = filenameParts.slice(1).join('_');
    }

    return (
      <div className="document-card">
        <div className="document-icon">
          {getFileIcon(fileExtension)}
        </div>
        <div className="document-info">
          <span className="document-name">{filename}</span>
          <button onClick={() => handleDownload(uri, filename)} className="download-button">
            <FiDownload />
          </button>
        </div>
      </div>
    )
  }

  return (
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
          <div className="reply-line">--------------------------</div>
          <div className="reply-text">{message.content}</div>
        </>
      )}

      {/* 메시지의 포함된 이미지 표시 */}
      {message.imageUriPaths && message.imageUriPaths.length > 0 && (
        <div style={{ marginTop: "10px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "10px" }}>
          {visibleImages.map((imageUri, index) => (
            <img
              key={index}
              src={`${HOST_URL}${imageUri}`}
              alt={`chatImage-${index}`}
              style={{ maxWidth: "200px", marginRight: "10px", marginBottom: "10px" }}
              onClick={() => openLightbox(index)}
            />
          ))}
          {remainingImageCount > 0 && (
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f0f0f0",
              cursor: "pointer",
              fontSize: "18px",
              color: "#555",
              height: "100px"
            }}
              onClick={() => openLightbox(3)}>
              +{remainingImageCount} more
            </div>
          )}
        </div>
      )}
      {/* 문서 파일 */}
      {message.documentUriPaths && message.documentUriPaths.length > 0 && (
        <div style={{ marginTop: "10px" }}>
          {message.documentUriPaths.map((uri, index) => (
            <div key={index} style={{ marginBottom: "10px" }}>
              {renderDocumentPreview(`${HOST_URL}${uri}`)}
            </div>
          ))}
        </div>
      )}


      <div>
        <button
          className="reply-button"
          onClick={() => onMessageClick(message)}
        >
          답글
          <FiCornerDownRight />
        </button>
        <span onClick={() => openAnnounceMentModal(message)} style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }} > 공지사항 등록</span>

        {/* 안읽은 카운트 */}
        {message.unReadMembers && message.unReadMembers.length > 0
          && (
            <span
              style={{ fontWeight: "bold", color: "#FA8072", marginLeft: "10px", cursor: "pointer" }}
              onMouseEnter={() => handleUnreadMouseEnter(message.unReadMembers)}
              onMouseLeave={handleUnreadMouseLeave}
            >
              {message.unReadMembers.length}
              {
                hoveredUnread.length > 0 && (
                  hoveredUnread.map((member) => (
                    <div key={member.wsMemberId} style={{ display: "flex", marginLeft: "30px", marginBottom: "5px" }}>
                      <ProfileImage src={imageUrlPathCheck(member.profileImagePath)} userName={member.name} size={30} />
                      <span style={{ marginLeft: "10px", fontSize: "18px" }}>{member.name}</span>
                    </div>
                  ))
                )
              }
            </span>
          )}
        {/* 삭제 아이콘 */}
        <button
          className="delete-button"
          onClick={() => openDeleteModal(message)}
          style={{
            backgroundColor: "transparent",
            border: "none",
            color: "red",
            cursor: "pointer",
            fontSize: "20px",
          }}
        >
          <FiTrash2 />
        </button>
      </div>
      {isImageOpen && (
        <Lightbox
          mainSrc={`${HOST_URL}${message.imageUriPaths[photoIndex]}`}
          nextSrc={`${HOST_URL}${message.imageUriPaths[(photoIndex + 1) % message.imageUriPaths.length]}`}
          prevSrc={`${HOST_URL}${message.imageUriPaths[(photoIndex + message.imageUriPaths.length - 1) % message.imageUriPaths.length]}`}
          onCloseRequest={() => setIsImageOpen(false)}
          onMovePrevRequest={() =>
            setPhotoIndex((photoIndex + message.imageUriPaths.length - 1) % message.imageUriPaths.length)
          }
          onMoveNextRequest={() =>
            setPhotoIndex((photoIndex + 1) % message.imageUriPaths.length)
          }
          toolbarButtons={[
            <React.Fragment>
              <div className="toolbar-buttons">
                <button
                  onClick={() => handleDownload(`${HOST_URL}${message.imageUriPaths[photoIndex]}`, `chatImage-${photoIndex}`)}
                  className="imageDownload-button" >
                  <FiDownload />
                </button>
              </div>
            </React.Fragment>
          ]}
        />
      )}
    </div >
  );
};

export default MessageListItem;
