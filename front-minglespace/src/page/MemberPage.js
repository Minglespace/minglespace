import React from "react";
import BasicLayout from "../common/Layouts/BasicLayout";
import Member from "../member/Member";

const MemberPage = () => {
  return (
    <BasicLayout props="1">
      <Member />
    </BasicLayout>
  );
};

export default MemberPage;
