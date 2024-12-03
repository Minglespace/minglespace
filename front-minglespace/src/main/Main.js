import React from "react";
import Userinfo from "../common/Layouts/components/Userinfo";
import Button from "../common/Layouts/components/Button";

const MainComponent = () => {
  return (
    <div>
      <h1>Main 입니다,.</h1>
      <Userinfo
        name="홍길동"
        role="팀장"
        email="asd@naver.com"
        src="/profile1.png"
      />
      <Button btnStyle="add_button" title="추가" />
      <Button btnStyle="add_button_2" title="추가" />
      <Button btnStyle="exit_button" title="나가기" />
    </div>
  );
};

export default MainComponent;
