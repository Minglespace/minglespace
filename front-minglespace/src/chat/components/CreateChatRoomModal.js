import { useState, useRef, useEffect } from "react";
import Userinfo from "../../common/Layouts/components/Userinfo";
import default_img from "../../asset/imgs/profile1.png";
import { HOST_URL } from "../../api/Api";

const initCreateChatRoomRequest = {
  name: "",
  workspaceId: 0,
  participantIds: [],
};

const CreateChatRoomModal = ({ isOpen, onClose, onCreate, wsMembers }) => {
  const [newChatRoomData, setNewChatRoomData] = useState(
    initCreateChatRoomRequest
  );
  const [selectedImage, setSelectedImage] = useState(null); // 선택된 이미지 파일 선택
  const [errorMsg, setErrorMsg] = useState(null);
  const fileInputRef = useRef(null);

  // useEffect(() => {
  //   console.log("selectedFriends updated: ", newChatRoomData.participantIds);
  // }, [newChatRoomData.participantIds]);

  //폼에서 채팅방 이름을 변경하는 함수
  const handleInputChange = (e) => {
    setNewChatRoomData((prev) => ({
      ...prev,
      name: e.target.value,
    }));
  };

  const handleMemberSelect = (e, memberId) => {
    setNewChatRoomData((prev) => {
      const updatedParticipantIds = e.target.checked
        ? [...prev.participantIds, memberId] // 배열에 멤버 ID 추가
        : prev.participantIds.filter((id) => id !== memberId); // 배열에서 멤버 ID 제거

      // 만약 prev.participantIds가 배열이 아니라면 빈 배열로 초기화
      return {
        ...prev,
        participantIds: Array.isArray(updatedParticipantIds)
          ? updatedParticipantIds
          : [],
      };
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files ? e.target.files[0] : null; // 파일이 있는지 확인
    if (file) {
      setSelectedImage(URL.createObjectURL(file)); // 선택된 파일을 미리보기로 사용
      setNewChatRoomData((prev) => ({
        ...prev,
        image: file,
      }));
    }
  };

  const validateForm = () => {
    if (!newChatRoomData.name.trim()) {
      setErrorMsg("채팅방 이름을 입력해주세요.");
      return false;
    }
    if (newChatRoomData.participantIds.length < 1) {
      setErrorMsg("최소 1명 이상의 참여자를 선택해주세요.");
      return false;
    }
    setErrorMsg(""); // 유효성 검사 통과 시 에러 메시지 초기화
    return true;
  };

  //채팅방 생성 버튼 클릭시
  const handleCreate = async () => {
    if(!validateForm()) return;
    try{
      await onCreate(newChatRoomData, newChatRoomData.image);

      //초기화
      setNewChatRoomData(initCreateChatRoomRequest);
      setSelectedImage(null);
      onClose();
    }catch(error){
      setErrorMsg("채팅방 생성 중 오류가 발생했습니다. 다시 시도해주세요");
      console.error(error);
    }
    
  };

  // 모달 닫기 버튼
  const handleClose = () => {
    setErrorMsg(null);
    onClose(); // 부모 컴포넌트에게 모달을 닫을 것을 알림
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal_wrapper">
        <div className="modal_content">
          <h1> 채팅방 생성 </h1>

          {/* 이미지 선택 (기본 동그라미 이미지와 선택된 이미지 변경) */}
          <div className="modal_img">
            <img
              className="chat_create_Img"
              src={selectedImage || default_img}
              alt="채팅방 이미지"
            />
          </div>

          <button
            className="select_img_btn"
            onClick={() => fileInputRef.current.click()} // 버튼 클릭 시 파일 선택창 열기
          >
            변경
          </button>

          <input
            className="hidden-file-input"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          ></input>

          {/* 채팅방 이름 입력 */}
          <input
            className="chatroom_name"
            type="text"
            value={newChatRoomData.name}
            onChange={handleInputChange}
            placeholder="채팅방 이름을 입력해주세요"
          />

          {/* 친구 추가 목록 */}
          <div className="friends-list">
            <h1>친구 추가</h1>
            <ul>
              {wsMembers.map((member) => (
                <li key={member.wsMemberId}>
                  <label>
                    <input
                      type="checkbox"
                      checked={newChatRoomData.participantIds.includes(
                        member.wsMemberId
                      )} // 체크 상태 유지
                      onChange={(e) => handleMemberSelect(e, member.wsMemberId)}
                    />
                    <Userinfo
                      name={member.name}
                      role={member.position}
                      email={member.email}
                      src={`${HOST_URL}${member.imageUriPath}`}
                      title="친구 정보"
                    />
                  </label>
                </li>
              ))}
            </ul>
          </div>

          {errorMsg && <p style={{color:"#e52500", fontSize:"14px", marginTop:"10px", textAlign:"center"}}>{errorMsg}</p>}
          <button className="create_btn" onClick={handleCreate}>생성</button>
          <button className="close_btn" onClick={handleClose}>닫기</button>
        </div>
      </div>
    </>
  );
};

export default CreateChatRoomModal;
