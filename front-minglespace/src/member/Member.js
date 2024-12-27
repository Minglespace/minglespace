import React, { useCallback, useContext, useEffect, useState } from "react";
import MemberList from "./components/MemberList";
import MembersApi from "../api/membersApi";
import { useParams } from "react-router-dom";
import UserInfoDetail from "../common/Layouts/components/UserInfoDetail";
import { WSMemberRoleContext } from "../workspace/context/WSMemberRoleContext";
import MemberInvite from "./components/MemberInvite";
import { HOST_URL } from "../api/Api";
import { getErrorMessage } from "../common/Exception/errorUtils";
import MemberLinkInvite from "./components/MemberLinkInvite";

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
  const {
    wsMemberData: { role },
    refreshMemberContext,
  } = useContext(WSMemberRoleContext);
  const [loading, setLoading] = useState(true); //로딩 상태관리

  const [members, setMembers] = useState([...memberInitData]);
  const [myFriends, setMyFreinds] = useState([...myFriendInitData]);
  //선택됫을때 상세정보 보여주기위한 useState
  const [selectedMember, setSelectedMember] = useState(null);

  //멤버 목록조회
  const getMemberList = useCallback(() => {
    MembersApi.getMemberList(workspaceId)
      .then((data) => {
        setMembers(data);
      })
      .catch((error) => {
        alert(`멤버 목록 조회 실패 : \n원인:+${getErrorMessage(error)}`);
      });
  }, [workspaceId]);
  //워크스페이스 참여중 구분한 친구목록조회
  const getFriendList = useCallback(() => {
    MembersApi.getFriendList(workspaceId)
      .then((data) => {
        setMyFreinds(data);
      })
      .catch((error) => {
        alert(`친구 목록 조회 실패 : \n원인:+${getErrorMessage(error)}`);
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

  //멤버 추방
  const handleRemoveMember = useCallback(
    (memberId) => {
      MembersApi.removeMember(workspaceId, memberId).then((data) => {
        getMemberList();
        getFriendList();
        setSelectedMember(null);
        alert(data);
      });
    },
    [workspaceId, getFriendList, getMemberList]
  );

  //리더 위임
  const handleTransferLeader = useCallback(
    (memberId) => {
      MembersApi.transferLeader(workspaceId, memberId)
        .then((data) => {
          getMemberList();
          setSelectedMember(null);
          refreshMemberContext();
          alert(data);
        })
        .catch((error) => {
          alert(`리더 위임 실패 : \n원인:+${getErrorMessage(error)}`);
        });
    },
    [workspaceId, getMemberList, refreshMemberContext]
  );

  //멤버 권한 바꾸기
  const handleTransferRole = useCallback(
    (memberId, role) => {
      MembersApi.transferRole(workspaceId, memberId, role)
        .then((data) => {
          getMemberList();
          setSelectedMember(null);
          alert(data);
        })
        .catch((error) => {
          alert(`멤버 권한 바꾸기 실패 : \n원인:+${getErrorMessage(error)}`);
        });
    },
    [workspaceId, getMemberList]
  );

  //이미지 체크함수
  const imageUrlPathCheck = (src) => {
    if (src && src.trim() !== "") return `${HOST_URL}${src}`;
    else return null;
  };

  //컨텐츠 보여주기위한 랜더링컨텐츠
  const renderContent = () => {
    if (loading) {
      return <p>로딩 중입니다....</p>;
    }

    if (role === "MEMBER") {
      return (
        <div className="section_container myFriends_container_item">
          {selectedMember && (
            <UserInfoDetail
              user={selectedMember}
              src={imageUrlPathCheck(selectedMember.imageUriPath)}
            />
          )}
        </div>
      );
    } else if (role === "SUB_LEADER") {
      return (
        <>
          <MemberInvite
            friends={myFriends}
            handleInviteMember={handleInviteMember}
          />
          <MemberLinkInvite />
          <div className="section_container myFriends_container_item">
            {selectedMember && (
              <UserInfoDetail
                user={selectedMember}
                src={imageUrlPathCheck(selectedMember.imageUriPath)}
              />
            )}
          </div>
        </>
      );
    } else if (role === "LEADER") {
      return (
        <>
          <div className="member_inviteBox">
            <MemberInvite
              friends={myFriends}
              handleInviteMember={handleInviteMember}
            />
            <MemberLinkInvite />
          </div>
          <div className="section_container myFriends_container_item">
            {selectedMember && (
              <UserInfoDetail
                user={selectedMember}
                src={imageUrlPathCheck(selectedMember.imageUriPath)}
                handleRemoveMember={handleRemoveMember}
                handleTransferLeader={handleTransferLeader}
                handleTransferRole={handleTransferRole}
              />
            )}
          </div>
        </>
      );
    }
  };

  return (
    <div className="myFriends_container">
      <MemberList members={members} onClickMember={handleMemberClick} />
      {renderContent()}
    </div>
  );
};

export default Member;
