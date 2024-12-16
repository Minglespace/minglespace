import React from "react";
import { useParams } from "react-router-dom";
import MembersApi from "../../api/membersApi";
import { getErrorMessage } from "../../common/Exception/errorUtils";
const MemberLinkInvite = () => {
  const { workspaceId } = useParams();
  //멤버 초대
  const linkInviteMember = async () => {
    try {
      const inviteResult = await MembersApi.linkInviteMember(
        workspaceId,
        "dldudtn118@ndvr.com"
      );
    } catch (error) {
      alert(`멤버 초대 실패 \n원인:${getErrorMessage(error)}`);
    }
  };

  const handleInviteMember = () => {
    linkInviteMember();
  };
  return (
    <div className="section_container myFriends_container_item member_inviteItem">
      <h2 className="section_container_title">
        워크스페이스 멤버를 <br />
        이메일로 초대 해보세요.
      </h2>

      <input type="email" placeholder="이메일 작성하세요" />
      <button className="add_button_2" onClick={() => linkInviteMember()}>
        초대하기
      </button>
    </div>
  );
};

export default MemberLinkInvite;
