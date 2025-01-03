import React, { useCallback, useContext, useEffect, useState } from "react";
import MemberList from "./components/MemberList";
import MembersApi from "../api/membersApi";
import { useNavigate, useParams } from "react-router-dom";
import UserInfoDetail from "../common/Layouts/components/UserInfoDetail";
import { WSMemberRoleContext } from "../workspace/context/WSMemberRoleContext";
import MemberInvite from "./components/MemberInvite";
import { HOST_URL } from "../api/Api";
import { getErrorMessage } from "../common/Exception/errorUtils";
import MemberLinkInvite from "./components/MemberLinkInvite";
import { FiLogOut } from "react-icons/fi";
import NoData from "../common/Layouts/components/NoData";

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
    withdrawalType: "",
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
    withdrawalType: "",
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
  const navigate = useNavigate();
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
      MembersApi.inviteMember(workspaceId, friendId)
        .then((data) => {
          getMemberList();
          getFriendList();
          alert(data);
        })
        .catch((error) => {
          alert(`맴버 초대 실패 : \n원인:+${getErrorMessage(error)}`);
        });
    },
    [workspaceId, getFriendList, getMemberList]
  );

  //멤버 추방
  const handleRemoveMember = useCallback(
    (memberId) => {
      MembersApi.removeMember(workspaceId, memberId)
        .then((data) => {
          getMemberList();
          getFriendList();
          setSelectedMember(null);
          alert(data);
        })
        .catch((error) => {
          alert(`맴버 추방 실패 : \n원인:+${getErrorMessage(error)}`);
        });
    },
    [workspaceId, getFriendList, getMemberList]
  );

  //워크스페이스 퇴장 아직 navigate 안붙인 상태
  const handleExitMember = () => {
    if (role === "LEADER") {
      alert("리더 권한을 먼저 위임해주시기 바랍니다.");
    } else {
      MembersApi.exitMember(workspaceId)
        .then((data) => {
          alert(data);
          navigate("/workspace");
        })
        .catch((error) => {
          alert(`워크스페이스 나가기 실패 : \n원인:+${getErrorMessage(error)}`);
        });
    }
  };

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
            {selectedMember ? (
              <UserInfoDetail
                user={selectedMember}
                src={imageUrlPathCheck(selectedMember.imageUriPath)}
                handleRemoveMember={handleRemoveMember}
                handleTransferLeader={handleTransferLeader}
                handleTransferRole={handleTransferRole}
              />
            ) : (
              <>
                <h2 className="section_container_title">유저 상세보기</h2>
                <NoData title={"멤버를 클릭해 상세정보를 확인하세요!"} />
              </>
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
      <button className="add_button_2" onClick={handleExitMember}>
        <p style={{ opacity: 0.6 }}>
          워크
          <br />
          스페이스
          <br />
          <br />
          나가기
        </p>
        <FiLogOut
          style={{ marginTop: "10px", fontSize: "40px", opacity: 0.5 }}
        />
      </button>
    </div>
  );
};

export default Member;
