import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { HOST_URL } from "../../api/Api";
import { getErrorMessage } from "../../common/Exception/errorUtils";

const InviteCheck = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [message, setMessage] = useState("");

  const segments = location.pathname.split("/");
  const workspacePath = `/${segments[1]}/${segments[2]}`;

  const checkInvite = async () => {
    try {
      const res = await axios.get(`${HOST_URL}${location.pathname}`);
      if (res.data === "existUser") {
        navigate(workspacePath, { state: { from: workspacePath } });
      } else if (res.data === "notExistUser") {
        navigate("/auth/signup", { state: { from: workspacePath } });
      } else {
        setMessage(res.data);
      }
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  };

  useEffect(() => {
    checkInvite();
  }, []);

  return (
    <div>
      <p>{message}</p>
      <p>다시 초대를 받으세요.</p>
      <Link to="/">
        <button className="add_button_2">loginPage</button>
      </Link>
    </div>
  );
};

export default InviteCheck;
