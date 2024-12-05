import Timeline, { TimelineHeaders, DateHeader } from "react-calendar-timeline";
// make sure you include the timeline stylesheet or the timeline will not be styled
// import "react-calendar-timeline/styles.css";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { getList, postAddItem } from "../../api/milestoneApi";
import { useParams } from "react-router-dom";

const initGroup = [{ id: 0, title: "" }];

const initItem = [
  {
    id: 0,
    groupid: 0,
    title: "",
    start_time: 0,
    end_time: 1,
  },
];

const MileStoneApi = () => {
  console.log("API");
  const [groups, setGroups] = useState([...initGroup]);
  const [items, setItems] = useState([...initItem]);
  const { workspaceId } = useParams("workspaceId");
  console.error = (...args) => {
    if (args[0].includes("React keys must be passed directly to JSX")) {
      return;
    }
    console.warn(...args);
  };
  console.log("items : ", items);
  useEffect(() => {
    getList(workspaceId).then((data) => {
      console.log("data : ", data);
      const updateGroup = data.map(({ id, title }) => ({
        id: id,
        title: title,
      }));
      setGroups(updateGroup);

      const updateItem = data.flatMap((groups) =>
        groups.milestoneItemDTOList.map((items) => ({
          id: items.id,
          group: groups.id,
          title: items.title,
          start_time: items.start_time,
          end_time: items.end_time,
        }))
      );
      setItems(updateItem);
    });
  }, [workspaceId]);

  useEffect(() => {
    console.log("group : ", groups);
    console.log("item : ", items);
  }, [groups, items]);

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

  // const calculateUnit = (start, end) => {
  //   const duration = end - start; // 시간 간격 (밀리초)
  //   if (duration > 2678400000) return "month"; // 1달 이상
  //   if (duration > 86400000) return "day"; // 1일 이상
  //   if (duration > 3600000) return "hour"; // 1시간 이상
  //   return "minute"; // 기본
  // };

  //아이템 이동 핸들러
  function handleItemMove(itemId, time) {
    const updatedItems = items.map((item) =>
      item.id === itemId
        ? {
            ...item,
            start_time: time,
            end_time: time + (item.end_time - item.start_time),
          }
        : item
    );
    setItems(updatedItems);
  }

  function handleItemResize(itemId, time, edge) {
    const updatedItems = items.map((item) =>
      item.id === itemId
        ? {
            ...item,
            start_time: edge === "left" ? time : item.start_time,
            end_time: edge === "right" ? time : item.end_time,
          }
        : item
    );
    setItems(updatedItems);
  }

  function handleCanvasClick(groupId, time) {
    const startOfDay = new Date(new Date(time).setHours(0, 0, 0, 0)).getTime();
    const endOfDay = startOfDay + 86400000;
    const newItem = {
      groupid: groupId,
      title: `item ${items.length + 1}`,
      start_time: startOfDay,
      end_time: endOfDay,
    };

    postAddItem(workspaceId, groupId, newItem).then(
      ({ id, title, start_time, end_time }) => {
        setItems([
          ...items,
          {
            id,
            group: groupId,
            title,
            start_time,
            end_time,
          },
        ]);
      }
    );
  }

  function handleItemDoubleClick(itemId) {
    const newTitle = prompt("Enter new title:");
    if (newTitle) {
      setItems(
        items.map((item) =>
          item.id === itemId ? { ...item, title: newTitle } : item
        )
      );
    }
  }

  function handleItemKeyDown(itemId, e) {
    console.log("e.key : " + e.key);
    console.log("itmeId : " + itemId);
    if (e.key === "Delete") {
      handleItemDelete(itemId);
    }
  }
  function handleItemDelete(itemId) {
    setItems(items.filter((item) => item.id !== itemId));
  }

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
        onItemMove={handleItemMove}
        onItemResize={handleItemResize}
        itemRenderer={({ item, itemContext, getItemProps, getResizeProps }) => {
          const { left: leftResizeProps, right: rightResizeProps } =
            getResizeProps();
          return (
            <div
              tabIndex={0}
              style={{ outline: "none" }}
              className={`timeline-item ${
                itemContext.selected ? "timeline-item-selected" : ""
              }`}
              {...getItemProps({
                onMouseDown: () => console.log("onMouseDown", item),
                onDoubleClick: () => handleItemDoubleClick(item.id),
                onKeyDown: (e) => handleItemKeyDown(item.id, e),
              })}
            >
              {" "}
              {itemContext.title}{" "}
              {itemContext.useResizeHandle ? (
                <div>
                  {" "}
                  <div {...leftResizeProps} /> <div {...rightResizeProps} />{" "}
                </div>
              ) : null}{" "}
            </div>
          );
        }}
        onCanvasClick={handleCanvasClick}
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
