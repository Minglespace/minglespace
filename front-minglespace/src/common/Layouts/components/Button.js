import React from "react";

const Button = ({ btnStyle, title }) => {
  return <button className={btnStyle}> {title}</button>;
};

export default Button;
