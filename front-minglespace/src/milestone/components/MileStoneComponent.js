import Timeline, { TimelineHeaders, DateHeader } from "react-calendar-timeline";
// make sure you include the timeline stylesheet or the timeline will not be styled
// import "react-calendar-timeline/styles.css";
import moment from "moment";
import { useEffect, useState } from "react";
import MilestoneApi from "../../api/milestoneApi";
import { useParams } from "react-router-dom";
import MileStoneModal from "./MileStoneModal";

const initGroup = [{ id: 0, title: "" }];

const initItem = [
  {
    id: 0,
    groupid: 0,
    title: "",
    start_time: 0,
    end_time: 1,
    taskStatus: "NOT_START",
  },
];

const MileStoneComponent = () => {
  const [groups, setGroups] = useState([...initGroup]);
  const [items, setItems] = useState([...initItem]);
  const { workspaceId } = useParams("workspaceId");
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newStartTime, setNewStartTime] = useState("");
  const [newEndTime, setNewEndTime] = useState("");
  const [mode, setMode] = useState("default");
  const [newTaskStatus, setNewTaskStatus] = useState("");
  const [status, setStatus] = useState("");

  console.error = (...args) => {
    if (args[0].includes("React keys must be passed directly to JSX")) {
      return;
    }
    console.warn(...args);
  };
  useEffect(() => {
    MilestoneApi.getList(workspaceId).then((data) => {
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
          taskStatus: items.taskStatus,
        }))
      );
      setItems(updateItem);
      console.log("task:", updateItem);
    });
  }, [workspaceId]);

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

  //아이템 이동 핸들러
  const handleItemMove = (itemId, time) => {
    const updatedItems = items.map((item) =>
      item.id === itemId
        ? {
            ...item,
            start_time: time,
            end_time: time + (item.end_time - item.start_time),
          }
        : item
    );

    // 아이템 이동 후 서버에 업데이트 요청
    const movedItem = updatedItems.find((item) => item.id === itemId);
    if (movedItem) {
      MilestoneApi.modifyItem(workspaceId, movedItem.id, movedItem).then(
        ({ id, title, start_time, end_time }) => {
          // 서버 응답으로 업데이트된 아이템을 상태에 반영
          setItems(
            updatedItems.map((item) =>
              item.id === id
                ? {
                    ...item,
                    title,
                    start_time,
                    end_time,
                  }
                : item
            )
          );
        }
      );
    }
    setItems(updatedItems); // 로컬 상태에서 아이템 위치 업데이트
  };

  //아이템 사이즈 조절 핸들러
  const handleItemResize = (itemId, time, edge) => {
    const updatedItems = items.map((item) =>
      item.id === itemId
        ? {
            ...item,
            start_time: edge === "left" ? time : item.start_time,
            end_time: edge === "right" ? time : item.end_time,
          }
        : item
    );

    // 크기 조정 후 서버에 업데이트 요청
    const resizedItem = updatedItems.find((item) => item.id === itemId);
    if (resizedItem) {
      MilestoneApi.modifyItem(workspaceId, resizedItem.id, resizedItem).then(
        ({ id, title, start_time, end_time }) => {
          // 서버 응답으로 업데이트된 아이템을 상태에 반영
          setItems(
            updatedItems.map((item) =>
              item.id === id
                ? {
                    ...item,
                    title,
                    start_time,
                    end_time,
                  }
                : item
            )
          );
        }
      );
    }

    setItems(updatedItems); // 로컬 상태에서 아이템 크기 업데이트
  };

  //단위 시간 계산
  const calculateUnit = () => {
    const duration = visibleTimeEnd - visibleTimeStart; // 시간 간격 (밀리초)
    if (duration > 2678400000) return "month"; // 1달 이상
    if (duration > 86400000) return "day"; // 1일 이상
    return "hour"; // 1시간 이상
  };

  //단위시간별 시작,마감시간 계산
  const calStartAndEndTime = (unitTime, time) => {
    const dates = new Date(time);
    console.log(dates);
    const unitStartAndEndTime = {
      startTime: 0,
      endTime: 0,
    };
    switch (unitTime) {
      case "month": {
        const date = new Date(time);
        unitStartAndEndTime.startTime = new Date(
          date.getFullYear(),
          date.getMonth(),
          1,
          0,
          0,
          0,
          0
        ).getTime();
        unitStartAndEndTime.endTime =
          new Date(
            date.getFullYear(),
            date.getMonth() + 1,
            1,
            0,
            0,
            0,
            0
          ).getTime() - 1;
        break;
      }
      case "day": {
        unitStartAndEndTime.startTime = new Date(
          new Date(time).setHours(0, 0, 0, 0)
        ).getTime();
        unitStartAndEndTime.endTime = unitStartAndEndTime.startTime + 86400000;
        break;
      }
      case "hour": {
        unitStartAndEndTime.startTime = new Date(
          new Date(time).setMinutes(0, 0, 0)
        ).getTime();
        unitStartAndEndTime.endTime = unitStartAndEndTime.startTime + 3600000;
        break;
      }
      default: {
        unitStartAndEndTime.startTime = time;
        unitStartAndEndTime.endTime = time;
        break;
      }
    }
    return unitStartAndEndTime;
  };

  //캔버스 클릭 핸들러(아이템 추가)
  const handleCanvasClick = (groupId, time) => {
    const unitTime = calculateUnit();
    const startAndEndTime = calStartAndEndTime(unitTime, time);

    const startOfTime = startAndEndTime.startTime;
    const endOfTime = startAndEndTime.endTime;
    const newItem = {
      groupid: groupId,
      title: "New item",
      start_time: startOfTime,
      end_time: endOfTime,
      taskStatus: "NOT_START",
    };

    MilestoneApi.postAddItem(workspaceId, groupId, newItem).then(
      ({ id, title, start_time, end_time, taskStatus }) => {
        console.log(newItem.taskStatus);
        setItems([
          ...items,
          {
            id,
            group: groupId,
            title,
            start_time,
            end_time,
            taskStatus,
          },
        ]);
      }
    );
    console.log("add : ", items);
  };

  const handleGroupAdd = () => {
    const newGroup = {
      title: "New Group",
    };
    MilestoneApi.postAddGroup(workspaceId, newGroup).then(({ id, title }) => {
      setGroups([...groups, { id, title }]);
    });
  };

  //아이템 더블클릭 핸들러(아이템 title 수정)
  const handleItemDoubleClick = (itemId) => {
    const item = items.find((i) => i.id === itemId);
    setSelectedItem(item);
    setSelectedGroup(null);
    setNewTitle(item.title);
    setNewStartTime(moment(item.start_time).format("YYYY-MM-DDTHH:mm"));
    setNewEndTime(moment(item.end_time).format("YYYY-MM-DDTHH:mm"));
    setNewTaskStatus(item.taskStatus);
    setMode("default");
    setModalOpen(true);
  };
  const handleGroupDoubleClick = (groupId) => {
    const group = groups.find((i) => i.id === groupId);
    setSelectedGroup(group);
    setSelectedItem(null);
    setNewTitle(group.title);
    setMode("titleOnly");
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };
  const handleModalSave = () => {
    if (selectedItem) {
      const updatedItem = {
        ...selectedItem,
        title: newTitle,
        start_time: new Date(newStartTime).getTime(),
        end_time: new Date(newEndTime).getTime(),
        taskStatus: newTaskStatus,
      };

      MilestoneApi.modifyItem(workspaceId, selectedItem.id, updatedItem).then(
        ({ id, title, start_time, end_time, taskStatus }) => {
          setItems(
            items.map((item) =>
              item.id === id
                ? {
                    ...item,
                    title,
                    start_time,
                    end_time,
                    taskStatus,
                  }
                : item
            )
          );
          console.log(taskStatus);
          setModalOpen(false);
          handleClick();
        }
      );
    } else if (selectedGroup) {
      const updatedGroup = {
        ...selectedGroup,
        title: newTitle,
      };
      MilestoneApi.modifyGroup(
        workspaceId,
        selectedGroup.id,
        updatedGroup
      ).then(({ id, title }) => {
        setGroups(
          groups.map((group) => (group.id === id ? { ...group, title } : group))
        );
        handleClick();
        setModalOpen(false);
      });
    }
  };

  const handleModalDelete = () => {
    if (selectedItem) {
      MilestoneApi.deleteItem(workspaceId, selectedItem.id).then(() => {
        setItems(items.filter((item) => item.id !== selectedItem.id));
        handleClick();
        setModalOpen(false);
      });
    } else if (selectedGroup) {
      MilestoneApi.deleteGroup(workspaceId, selectedGroup.id).then(() => {
        setItems(groups.filter((group) => group.id !== selectedGroup.id));
        handleClick();
        setModalOpen(false);
      });
    }
  };

  const handleOneClick = () => {
    MilestoneApi.getList(workspaceId).then((data) => {
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
          taskStatus : items.taskStatus
        }))
      );
      setItems(updateItem);
    });
  };

  const handleClick = () => {
    handleOneClick();
  };
  return (
    <div
      style={{
        overflowX: "auto",
        overflowY: "auto",
        height: "500px",
      }}
    >
      <div className="milestone_group_add_button">
        <button onClick={handleGroupAdd}>그룹 추가하기</button>
      </div>
      <Timeline
        minZoom={36000000}
        groups={groups}
        items={items}
        lineHeight={100}
        canChangeGroup={false}
        itemHeightRatio={0.6}
        defaultTimeStart={moment().add(0, "day")}
        defaultTimeEnd={moment().add(31, "day")}
        onTimeChange={handleTimeChange}
        onItemMove={handleItemMove}
        onItemResize={handleItemResize}
        stackItems
        groupRenderer={({ group }) => (
          <div
            onDoubleClick={() => handleGroupDoubleClick(group.id)}
            style={{ cursor: "pointer", textAlign: "center" }}
          >
            {group.title}
          </div>
        )}
        itemRenderer={({ item, itemContext, getItemProps, getResizeProps }) => {
          let styles = "#ffffff";
          if (item.taskStatus === "IN_PROGRESS") {
            styles = "#ccc";
          } else if (item.taskStatus === "IN_PROGRESS") {
            styles = "#ff0000";
          } else if (item.taskStatus === "COMPLETED") {
            styles = "#00ff00";
          } else {
            styles = "#0000ff";
          }
          const { left: leftResizeProps, right: rightResizeProps } =
            getResizeProps();
          return (
            <div
              tabIndex={0}
              style={{ outline: "none", overflow: "hidden" }}
              {...getItemProps({
                style: {
                  backgroundColor: itemContext.selected ? "#c692d6" : styles,
                  borderColor: itemContext.selected ? "#a5aca5" : "#66b2f0",
                },
                onDoubleClick: () => handleItemDoubleClick(item.id),
              })}
            >
              {itemContext.title}
              {itemContext.useResizeHandle ? (
                <div>
                  <div {...leftResizeProps} /> <div {...rightResizeProps} />{" "}
                </div>
              ) : null}
            </div>
          );
        }}
        onCanvasDoubleClick={handleCanvasClick}
      >
        <TimelineHeaders minZoom={36000000}>
          <DateHeader unit="primaryHeader" />
          <DateHeader />
        </TimelineHeaders>
      </Timeline>

      <MileStoneModal
        open={modalOpen}
        onClose={handleModalClose}
        title={newTitle}
        startTime={newStartTime}
        endTime={newEndTime}
        taskStatus={newTaskStatus}
        onTaskStatusChange={setNewTaskStatus}
        onTitleChange={setNewTitle}
        onStartTimeChange={setNewStartTime}
        onEndTimeChange={setNewEndTime}
        onSave={handleModalSave}
        onDelete={handleModalDelete}
        mode={mode}
      />
    </div>
  );
};

export default MileStoneComponent;
