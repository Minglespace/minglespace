import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ResponsivePie } from "@nivo/pie";

const MainMilestone = ({ title, datas = [] }) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 3,
    slidesToScroll: 3,
  };
  return (
    <div style={{ textAlign: "center" }}>
      <h2>{title}</h2>
      <Slider {...settings}>
        {datas.map((data, index) => {
          let pieData;
          if (data.milestoneTaskStatusDTO.total === 0) {
            pieData = [
              {
                id: "No Data",
                label: "No Data",
                value: Math.max(data.milestoneTaskStatusDTO.total, 1),
                color: "hsl(29, 70%, 50%)",
              },
            ];
          } else {
            pieData = [
              {
                id: "완료",
                label: "완료",
                value: data.milestoneTaskStatusDTO.completed,
                color: "hsl(29, 70%, 50%)",
              },
              {
                id: "진행중",
                label: "진행중",
                value: data.milestoneTaskStatusDTO.in_progress,
                color: "hsl(108, 70%, 50%)",
              },
              {
                id: "시작전",
                label: "시작전",
                value: data.milestoneTaskStatusDTO.not_start,
                color: "hsl(160, 70%, 50%)",
              },
              {
                id: "보류",
                label: "보류",
                value: data.milestoneTaskStatusDTO.on_hold,
                color: "hsl(61, 70%, 50%)",
              },
            ];
          }
          return (
            <div key={index} style={{ width: "300px", height: "240px" }}>
              <div style={{ width: "300px", height: "240px" }}>
                <ResponsivePie
                  data={pieData}
                  margin={{ top: 10, right: 80, bottom: 10, left: 80 }}
                  innerRadius={0.5}
                  padAngle={8}
                  cornerRadius={1}
                  activeOuterRadiusOffset={8}
                  colors={{ scheme: "tableau10" }}
                  borderWidth={1}
                  borderColor={{
                    from: "color",
                    modifiers: [["darker", "0"]],
                  }}
                  arcLinkLabelsTextColor="#333333"
                  arcLinkLabelsOffset={-7}
                  arcLinkLabelsDiagonalLength={30}
                  arcLinkLabelsStraightLength={30}
                  arcLinkLabelsColor={{ from: "color" }}
                  arcLabelsTextColor={{
                    from: "color",
                    modifiers: [["darker", 2]],
                  }}
                  legends={[]}
                />
                <p className="descname wsname">{data.name}</p>
              </div>
            </div>
          );
        })}
      </Slider>
    </div>
  );
};

export default MainMilestone;
