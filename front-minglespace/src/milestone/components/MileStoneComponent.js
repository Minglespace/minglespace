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
  },
];

const MileStoneComponent = ({ refresh }) => {
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
        }))
      );
      setItems(updateItem);
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
    setItems(updatedItems);
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
    setItems(updatedItems);
  };

  //캔버스 클릭 핸들러(아이템 추가)
  const handleCanvasClick = (groupId, time) => {
    const startOfDay = new Date(new Date(time).setHours(0, 0, 0, 0)).getTime();
    const endOfDay = startOfDay + 86400000;
    const newItem = {
      groupid: groupId,
      title: "New item",
      start_time: startOfDay,
      end_time: endOfDay,
    };

    MilestoneApi.postAddItem(workspaceId, groupId, newItem).then(
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
      };

      MilestoneApi.modifyItem(workspaceId, selectedItem.id, updatedItem).then(
        ({ id, title, start_time, end_time }) => {
          setItems(
            items.map((item) =>
              item.id === id
                ? {
                    ...item,
                    title,
                    start_time,
                    end_time,
                    selected: false,
                  }
                : item
            )
          );
          refresh();
          setModalOpen(false);
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
        refresh();
        setModalOpen(false);
      });
    }
  };

  const handleModalDelete = () => {
    if (selectedItem) {
      MilestoneApi.deleteItem(workspaceId, selectedItem.id).then(() => {
        setItems(items.filter((item) => item.id !== selectedItem.id));
        refresh();
        setModalOpen(false);
      });
    } else if (selectedGroup) {
      MilestoneApi.deleteGroup(workspaceId, selectedGroup.id).then(() => {
        setItems(groups.filter((group) => group.id !== selectedGroup.id));
        refresh();
        setModalOpen(false);
      });
    }
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
        groups={groups}
        items={items}
        defaultTimeStart={moment().add(0, "day")}
        defaultTimeEnd={moment().add(31, "day")}
        onTimeChange={handleTimeChange}
        onItemMove={handleItemMove}
        onItemResize={handleItemResize}
        groupRenderer={({ group }) => (
          <div
            onDoubleClick={() => handleGroupDoubleClick(group.id)}
            style={{ cursor: "pointer", textAlign: "center" }}
          >
            {group.title}
          </div>
        )}
        itemRenderer={({ item, itemContext, getItemProps, getResizeProps }) => {
          const { left: leftResizeProps, right: rightResizeProps } =
            getResizeProps();
          return (
            <div
              tabIndex={0}
              style={{ outline: "none", overflow: "hidden" }}
              className={`timeline-item ${
                itemContext.selected ? "timeline-item-selected" : ""
              }`}
              {...getItemProps({
                style: {
                  backgroundColor: itemContext.selected ? "#ff88ff" : "#66b2f0",
                  borderColor: itemContext.selected ? "#ff0000" : "#66b2f0",
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
        onCanvasClick={handleCanvasClick}
      >
        <TimelineHeaders>
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
