import React, { useCallback, useContext, useEffect, useState } from "react";
import MemberList from "./components/MemberList";
import MembersApi from "../api/membersApi";
import { useParams } from "react-router-dom";
import UserInfoDetail from "../common/Layouts/components/UserInfoDetail";
import { WSMemberRoleContext } from "../workspace/context/WSMemberRoleContext";
import MemberInvite from "./components/MemberInvite";

const memberInitData = [
  {
    wsMemberId: 0,
    userId: 0,
    email: "",
    name: "",
    imageUriPath: "",
    position: "",
    introduction: "",
    role: "",
  },
];

const myFriendInitData = [
  {
    friendId: 0,
    email: "",
    name: "",
    imageUriPath: "",
    position: "",
    inWorkSpace: "",
  },
];

const Member = () => {
  const { workspaceId } = useParams();
  const { role } = useContext(WSMemberRoleContext);

  const [loading, setLoading] = useState(true); //로딩 상태관리

  const [members, setMembers] = useState([...memberInitData]);
  const [myFriends, setMyFreinds] = useState([...myFriendInitData]);
  //선택됫을때 상세정보 보여주기위한 useState
  const [selectedMember, setSelectedMember] = useState(null);

  //멤버 목록조회
  const getMemberList = useCallback(() => {
    MembersApi.getMemberList(workspaceId).then((data) => {
      setMembers(data);
    });
  }, [workspaceId]);
  //워크스페이스 참여중 구분한 친구목록조회
  const getFriendList = useCallback(() => {
    MembersApi.getFriendList(workspaceId).then((data) => {
      setMyFreinds(data);
    });
  }, [workspaceId]);

  useEffect(() => {
    getMemberList();
    getFriendList();
    setLoading(false);
  }, [workspaceId, getMemberList, getFriendList]);

  //멤버 클릭시 상세조회 기능.
  const handleMemberClick = useCallback((Member) => {
    setSelectedMember(Member);
  }, []);

  //멤버 초대
  const handleInviteMember = useCallback(
    (friendId) => {
      MembersApi.inviteMember(workspaceId, friendId).then((data) => {
        getMemberList();
        getFriendList();
        alert(data);
      });
    },
    [workspaceId, getFriendList, getMemberList]
  );
  return (
    <div className="myFriends_container">
      {loading ? (
        <p>로딩 중입니다....</p>
      ) : (
        <>
          <MemberList members={members} onClickMember={handleMemberClick} />
          {role === "MEMBER" ? (
            <div className="section_container myFriends_container_item">
              {selectedMember && <UserInfoDetail user={selectedMember} />}
            </div>
          ) : (
            <MemberInvite
              friends={myFriends}
              handleInviteMember={handleInviteMember}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Member;
