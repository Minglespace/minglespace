import { useState, useRef, useEffect } from "react";
import Userinfo from "../../common/Layouts/components/Userinfo";

const CreateChatRoomModal = ({ isOpen, onClose, onCreate }) => {
  // 모달이 열렸을 때 폼에서 입력하는 값을 관리하는 상태
  const [chatRoomName, setChatRoomName] = useState("");
  const [selectedFriends, setSelectedFriends] = useState([]); // 선택된 친구 목록
  const [selectedImage, setSelectedImage] = useState(null); // 선택된 이미지 파일 선택

  const fileInputRef = useRef(null);

  // 친구 목록 더미 데이터
  const friendsList = [
    {
      id: 1,
      name: "친구1",
      role: "멤버",
      email: "friend1@example.com",
      src: "path_to_image1",
    },
    {
      id: 2,
      name: "친구2",
      role: "멤버",
      email: "friend2@example.com",
      src: "path_to_image2",
    },
    {
      id: 3,
      name: "친구3",
      role: "방장",
      email: "friend3@example.com",
      src: "path_to_image3",
    },
    {
      id: 4,
      name: "친구4",
      role: "멤버",
      email: "friend4@example.com",
      src: "path_to_image4",
    },
    {
      id: 5,
      name: "친구5",
      role: "멤버",
      email: "friend5@example.com",
      src: "path_to_image5",
    },
  ];

  // selectedFriends가 변경될 때마다 로그를 찍는 useEffect
  useEffect(() => {
    console.log("selectedFriends updated: ", selectedFriends);
  }, [selectedFriends]);

  //폼에서 채팅방 이름을 변경하는 함수
  const handleInputChange = (e) => {
    setChatRoomName(e.target.value);
  };

  // 친구 선택 변경 함수
  const handleFriendSelect = (e, friendId) => {
    console.log("checkbox _ click: ", friendId);
    console.log("checkbox _ check: ", e.target.checked);
    if (e.target.checked) {
      setSelectedFriends((prevSelected) => [...prevSelected, friendId]);
    } else {
      setSelectedFriends((prevSelected) =>
        prevSelected.filter((id) => id !== friendId)
      );
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files ? e.target.files[0] : null; // 파일이 있는지 확인
    if (file) {
      setSelectedImage(URL.createObjectURL(file)); // 선택된 파일을 미리보기로 사용
    }
  };

  // 모달 닫기 버튼
  const handleClose = () => {
    onClose(); // 부모 컴포넌트에게 모달을 닫을 것을 알림
  };

  //채팅방 생성 버튼 클릭시
  const handleCreate = () => {
    // 채팅방 생성 API 호출이나 데이터 저장 등 처리 가능
    // console.log(` 새 채팅방 이름 : ${chatRoomName}`);
    // console.log(`선택된 친구들 : ${selectedFriends}`);
    // console.log(` 선택된 이미지 : ${selectedImage}`);

    const newChatRoom = {
      name: chatRoomName,
      friends: selectedFriends,
      img: selectedImage,
    };
    onCreate(newChatRoom);
    onClose(); // 채팅방 생성 후 모달 닫기
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
              src={selectedImage || "../../asset/imgs/default-profile.png"}
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
            value={chatRoomName}
            onChange={handleInputChange}
            placeholder="채팅방 이름을 입력해주세요"
          />

          {/* 친구 추가 목록 */}
          <div className="friends-list">
            <h1>친구 추가</h1>
            <ul>
              {friendsList.map((friend) => (
                <li key={friend.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedFriends.includes(friend.id)} // 체크 상태 유지
                      onChange={(e) => handleFriendSelect(e, friend.id)}
                    />
                    <Userinfo
                      name={friend.name}
                      role={friend.role}
                      email={friend.email}
                      src={friend.src}
                      title="친구 정보"
                    />
                  </label>
                </li>
              ))}
            </ul>
          </div>

          {/* 버튼들  */}
          <button onClick={handleCreate}>생성</button>
          <button onClick={handleClose}>닫기</button>
        </div>
      </div>
    </>
  );
};

export default CreateChatRoomModal;
