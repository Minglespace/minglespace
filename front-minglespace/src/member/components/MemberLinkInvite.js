import React, {useEffect, useState} from "react";
import { useParams } from "react-router-dom";
import MembersApi from "../../api/membersApi";
import { getErrorMessage } from "../../common/Exception/errorUtils";
import Modal from "../../common/Layouts/components/Modal";
import {BeatLoader} from "react-spinners";
const MemberLinkInvite = () => {
  const { workspaceId } = useParams();
  const [email, setEmail] = useState("");
  const [isValid, setIsValid] = useState(true);
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가

  //멤버 초대
  const linkInviteMember = async () => {
      setIsLoading(true);
    try {
      const inviteResult = await MembersApi.linkInviteMember(
        workspaceId,
        email
      );
      alert(inviteResult);
    } catch (error) {
      alert(`멤버 초대 실패 \n원인:${getErrorMessage(error)}`);
    } finally {
        setIsLoading(false);
    }
  };

    useEffect(() =>  {
        const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
        setIsValid(emailRegex.test(email));
    }, [email]);

  const handleInviteMember = () => {
      if(isValid)
      linkInviteMember();
  };

   const handleEmailChange = (e) => {
       setEmail(e.target.value);
   };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleInviteMember();
        }
    };
  return (
    <div className="section_container myFriends_container_item member_inviteItem">
      <h2 className="section_container_title">
        워크스페이스 멤버를 <br />
        이메일로 초대 해보세요.
      </h2>

      <input type="email" value={email} onChange={handleEmailChange} onKeyDown={handleKeyDown}
             style={{ borderColor: isValid ? "black" : "red" }}
             placeholder="이메일 입력하세요" />
      <button className="add_button_2" onClick={handleInviteMember}>
        초대하기
      </button>
        {email && !isValid && <p style={{ color: "red" }}>유효하지 않은 이메일 형식입니다.</p>}
        {
            isLoading && (
                <Modal open={isLoading} onClose={()=> setIsLoading(false)}>
                    이메일 전송 중 입니다 <BeatLoader />
                </Modal>
            )
        }
    </div>
  );
};

export default MemberLinkInvite;
