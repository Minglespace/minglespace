import React from "react";

const Button = ({ btnStyle, title, onClick }) => {
  return (
    <button className={btnStyle} onClick={onClick}>
      {title}
    </button>
  );
};

export default Button;
