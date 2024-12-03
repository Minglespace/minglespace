import Timeline, { TimelineHeaders, DateHeader } from "react-calendar-timeline";
// make sure you include the timeline stylesheet or the timeline will not be styled
// import "react-calendar-timeline/styles.css";
import moment from "moment";
import { useEffect, useRef, useState } from "react";

const groups = [
  { id: 1, title: "group 1", stackItems: true },
  { id: 2, title: "group 1" },
  { id: 29, title: "group 1" },
  { id: 30, title: "group 30" },
];

const items = [
  {
    id: 1,
    group: 1,
    title: "1234",
    start_time: moment(),
    end_time: moment() + 200000000,
  },
  {
    id: 2,
    group: 1,
    title: "qwer",
    start_time: moment(),
    end_time: moment() + 200000000,
  },
];

const MileStoneApi = () => {
  const [visibleTimeStart, setVisibleTimeStart] = useState(
    moment().startOf("month").valueOf()
  );
  const [visibleTimeEnd, setVisibleTimeEnd] = useState(
    moment().endOf("month").valueOf()
  );
  const handleTimeChange = (start, end, updateScrollCanvas, unit) => {
    setVisibleTimeStart(start);
    setVisibleTimeEnd(end);
    updateScrollCanvas(start, end);
  };

  const calculateUnit = (start, end) => {
    const duration = end - start; // 시간 간격 (밀리초)
    console.log("start : " + start);
    console.log("end : " + end);
    console.log(duration);
    if (duration > 2678400000) return "month"; // 1달 이상
    if (duration > 86400000) return "day"; // 1일 이상
    if (duration > 3600000) return "hour"; // 1시간 이상
    return "minute"; // 기본
  };

  let unitTime = "day";
  unitTime = calculateUnit(visibleTimeStart, visibleTimeEnd);

  console.log(unitTime);

  return (
    <div
      style={{
        overflowX: "auto",
        overflowY: "auto",
        height: "500px",
      }}
    >
      <Timeline
        groups={groups}
        items={items}
        defaultTimeStart={moment().add(0, "day")}
        defaultTimeEnd={moment().add(31, "day")}
        onTimeChange={handleTimeChange}
      >
        <TimelineHeaders>
          <DateHeader unit="primaryHeader" />
          <DateHeader />
        </TimelineHeaders>
      </Timeline>
    </div>
  );
};

export default MileStoneApi;
