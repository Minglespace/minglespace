import { Italic } from "lucide-react";
import React from "react";
import { BiCircle } from "react-icons/bi";

const NoData = ({ title }) => {
  const containerStyle = {
    display: "flex", // Flexbox 사용
    flexDirection: "column", // 세로 방향 정렬
    justifyContent: "center", // 수직 중앙 정렬
    alignItems: "center", // 수평 중앙 정렬
    height: "100%", // 화면 전체 높이
    textAlign: "center", // 텍스트 가운데 정렬
  };

  const circleContainerStyle = {
    position: "relative",
    display: "inline-block",
  };
  const textStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%) skew(-10deg)",
    fontSize: "16px",
    color: "gray",
  };
  return (
    <div style={containerStyle}>
      <p style={{ fontStyle: "italic", opacity: 0.6 }}>{title}</p>
      <div style={circleContainerStyle}>
        <BiCircle style={{ opacity: 0.2 }} size={130} color="gray" />
        <div style={textStyle}>No Data</div>
      </div>
    </div>
  );
};

export default NoData;
