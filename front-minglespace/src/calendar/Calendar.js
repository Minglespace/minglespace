import React, { useCallback, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useState, useContext, useRef } from "react";
import CalendarApi from "../api/CalendarApi";
import { useParams } from "react-router-dom";
import Modal from "../common/Layouts/components/Modal";
import { formatDateToKST } from "../common/DateFormat/dateUtils";
import { WSMemberRoleContext } from "../workspace/context/WSMemberRoleContext";
import { getErrorMessage } from "../common/Exception/errorUtils";
import Tooltip from "tooltip.js";
import { end, start } from "@popperjs/core";
import CalendarFormModal from "./componenets/CalendarFormModal";
import { all } from "axios";

const initData = [
  {
    id: 0,
    title: "",
    description: "",
    start: "",
    end: "",
    type: "",
  },
];

const Calendar = () => {
  const { workspaceId } = useParams();
  const [calendarData, setCalendarData] = useState([...initData]);
  const [modalOpen, setModalOpen] = useState(false);
  const [calendarType, setCalendarType] = useState("ALL");
  const [formData, setFormData] = useState({});
  const [addType, setAddType] = useState("TIME");
  const {
    wsMemberData: { role },
  } = useContext(WSMemberRoleContext);
  const focusTitle = useRef(null);
  const focusDescription = useRef(null);

  //캘린더 ALL 조회
  const getCalendarAll = async () => {
    try {
      const result = await CalendarApi.getCalendarAll(workspaceId);
      setCalendarData(result);
    } catch (error) {
      alert(
        `캘린더 조회 중 에러가 발생했습니다.\n원인:${getErrorMessage(error)}`
      );
    }
  };

  //캘린더 NOTICE 조회
  const getCalendarNotice = async () => {
    try {
      const result = await CalendarApi.getCalendarNotice(workspaceId);
      setCalendarData(result);
    } catch (error) {
      alert(
        `캘린더 조회 중 에러가 발생했습니다.\n원인:${getErrorMessage(error)}`
      );
    }
  };

  //캘린더 PRIVATE 조회
  const getCalendarPrivate = async () => {
    try {
      const result = await CalendarApi.getCalendarPrivate(workspaceId);
      setCalendarData(result);
    } catch (error) {
      alert(
        `캘린더 조회 중 에러가 발생했습니다.\n원인:${getErrorMessage(error)}`
      );
    }
  };

  //캘린더 추가
  const addCalendar = async (newCalendar) => {
    try {
      const result = await CalendarApi.addCalendar(workspaceId, newCalendar);
    } catch (error) {
      alert(
        `캘린더 추가 중 에러가 발생했습니다.\n원인:${getErrorMessage(error)}`
      );
    }
  };

  //캘린더 수정
  const modifyCalendar = async (updatedCalendar) => {
    try {
      const result = await CalendarApi.modifyCalendar(
        workspaceId,
        updatedCalendar.id,
        updatedCalendar
      );
    } catch (error) {
      alert(
        `캘린더 수정 중 에러가 발생했습니다.\n원인:${getErrorMessage(error)}`
      );
    }
  };

  //캘린더 삭제
  const deleteCalendar = async (updatedCalendar) => {
    try {
      const result = await CalendarApi.deleteCalendar(
        workspaceId,
        updatedCalendar.id
      );
      alert(`${result}`);
    } catch (error) {
      alert(
        `캘린더 삭제 중 에러가 발생했습니다.\n원인:${getErrorMessage(error)}`
      );
    }
  };

  //캘린더 목록 조회
  useEffect(() => {
    if (calendarType === "ALL") {
      getCalendarAll();
    } else if (calendarType === "NOTICE") {
      getCalendarNotice();
    } else if (calendarType === "PRIVATE") {
      getCalendarPrivate();
    }
  }, [workspaceId, calendarType]);
  console.log("data :", calendarData);

  //캘린더에 추가되는 내용을 formData에 저장
  const handleChangeData = (e) => {
    const { name, value } = e.target;
    if (addType === "TIME") {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
        end: prevData.start,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  //캘린더에 날짜 클릭 시 Add모달을 통해 데이터 추가
  const handleDateClick = (arg) => {
    const formattedStart = formatDateToKST(arg.dateStr);
    addType == "TIME"
      ? setFormData({
          title: "",
          description: "",
          start: formattedStart,
          end: formattedStart,
        })
      : setFormData({
          title: "",
          description: "",
          start: formattedStart,
          end: formattedStart,
        });
    setModalOpen(true);
  };

  //모달 On, Off 핸들러
  const handleModalClose = () => {
    setModalOpen(false);
    setAddType("TIME");
    setFormData([]); //모달창 Close 시 입력중이던 내용 초기화
  };

  //캘린더에 항목 추가하여 DB에 저장
  const handleAddCalendar = async () => {
    if (!validation()) return false;

    if (addType === "DAY") {
      formData.start = formatDateToKST(formData.start);
      formData.end = formatDateToKST(formData.end);
    }
    //dateUtils.js에 KST 데이터를 받아올수 있는 Formatter 생성
    const formattedStart = formatDateToKST(formData.start);
    const newCalendar = {
      ...formData,
      start: formattedStart,
      type: calendarType,
    };

    await addCalendar(newCalendar);
    setModalOpen(false);
    setAddType("TIME");
    setFormData([]); //추가 후 formData내용 초기화
    calendarType === "NOTICE" ? getCalendarNotice() : getCalendarPrivate();
  };

  const validation = () => {
    if (formData.title === null || formData.title === "") {
      alert("제목을 입력해 주세요.");
      focusTitle.current.focus();
      return false;
    }
    if (formData.description === null || formData.description === "") {
      alert("세부내용을 입력해 주세요.");
      focusDescription.current.focus();
      return false;
    }
    if (formData.start > formData.end && addType === "DAY") {
      alert("종료일이 시작일보다 먼저일수 없습니다.");
      setFormData((prevDate) => ({
        ...prevDate,
        end: prevDate.start,
      }));
      return false;
    }
    if (formData.start > formData.end && addType === "TIME") {
      setFormData((prevDate) => ({
        ...prevDate,
        end: null,
      }));
      return true;
    }
    if (
      new Date(formData.end).getTime() - new Date(formData.start).getTime() <
      86400000
    ) {
      alert("2일 이상 날짜를 선택해 주세요.");
      return false;
    }
    return true;
  };

  //캘린더 내부 event 하나 클릭했을 때 해당 값을 가져와서 formData에 저장
  const handleEventClick = (evt) => {
    if (evt.event.extendedProps.type !== "TODO") {
      const start =
        evt.event.end === null
          ? formatDateToKST(evt.event.start)
          : formatDateToKST(evt.event.start).split("T")[0];
      setFormData({
        id: evt.event.id,
        title: evt.event.title,
        description: evt.event.extendedProps.description,
        start: start,
        end: formatDateToKST(evt.event.end).split("T")[0],
      });
      if (evt.event.end === null) {
        setAddType("TIME");
      } else {
        setAddType("DAY");
      }
      setModalOpen(true);
    }
  };

  //handleEventClick으로 받아온 formData를 가지고 수정작업
  const handleModifyCalendar = async () => {
    const updatedCalendar = { ...formData };
    await modifyCalendar(updatedCalendar);
    setModalOpen(false);
    setAddType("TIME");
    setFormData([]);
    calendarType === "NOTICE" ? getCalendarNotice() : getCalendarPrivate();
  };

  //handleEventClick으로 받아온 formData를 가지고 삭제 작업
  const handleDeleteCalendar = async () => {
    const updatedCalendar = { ...formData };
    await deleteCalendar(updatedCalendar);
    setModalOpen(false);
    setAddType("TIME");
    setFormData([]);
    calendarType === "NOTICE" ? getCalendarNotice() : getCalendarPrivate();
  };

  const handleAddTypeChange = (type) => {
    setAddType(type);
  };

  const fullcalendarRender = () => {
    if (calendarType === "ALL") {
      console.log("ALL");
      console.log("data : ", calendarData);
      return (
        <FullCalendar
          key={calendarData.length + new Date().getTime()}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale="ko"
          events={calendarData}
          eventDidMount={(info) => {
            new Tooltip(info.el, {
              title: "세부내용 :" + info.event.extendedProps.description,
              placement: "top",
              trigger: "hover",
            });
            const eventDuration = Math.ceil(
              (info.event.end - info.event.start) / (1000 * 60 * 60 * 24)
            );
            if (info.event.extendedProps.type === "TODO") {
              info.el.style.backgroundColor = "#7ADDD1";
              info.el.style.cursor = "default";
            } else if (info.event.extendedProps.type === "MILESTONE") {
              info.el.style.backgroundColor = "#F0CC96";
              info.el.style.cursor = "default";
            } else if (info.event.extendedProps.type === "NOTICE") {
              info.el.style.backgroundColor = "#FFB1B9";
            } else if (info.event.extendedProps.type === "PRIVATE") {
              info.el.style.backgroundColor = "#71A4D9";
            }
            if (eventDuration < 1) {
              info.el.style.backgroundColor = "transparent";
            }
          }}
          dayMaxEventRows={5}
          eventContent={(info) => {
            const { start, end, title } = info.event;
            const date = new Date(start);
            const startTime = date.toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false, // 24시간 형식
            });
            const eventType = info.event.extendedProps.type;
            let typeString = "";
            if (eventType === "NOTICE") {
              typeString = "공지";
            } else if (eventType === "PRIVATE") {
              typeString = "개인";
            } else if (eventType === "TODO") {
              typeString = "할일";
            } else if (eventType === "MILESTONE") {
              typeString = "마일스톤";
            }
            const timeString = end ? "" : `-${startTime}`;
            return (
              <div>
                <p>
                  {typeString}
                  {timeString}
                  <b> {title}</b>
                </p>
              </div>
            );
          }}
        />
      );
    } else if (
      // NOTICE LEADER면 수정가능, PRIVATE 개인이면 수정가능
      role === "LEADER" ||
      role === "SUB_LEADER" ||
      calendarType === "PRIVATE"
    ) {
      console.log("PRIVATE");
      return (
        <FullCalendar
          key={calendarData.length + new Date().getTime()}
          plugins={[dayGridPlugin, interactionPlugin]}
          locale="ko"
          initialView="dayGridMonth"
          events={calendarData}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          eventDidMount={(info) => {
            new Tooltip(info.el, {
              title: `세부내용 : ` + info.event.extendedProps.description,
              placement: "top",
              trigger: "hover",
            });
            const eventDuration = Math.ceil(
              (info.event.end - info.event.start) / (1000 * 60 * 60 * 24)
            );
            if (info.event.extendedProps.type === "TODO") {
              info.el.style.backgroundColor = "#7ADDD1";
              info.el.style.cursor = "default";
            } else if (info.event.extendedProps.type === "PRIVATE") {
              info.el.style.backgroundColor = "#71A4D9";
            } else if (info.event.extendedProps.type === "NOTICE") {
              info.el.style.backgroundColor = "#FFB1B9";
            }
            if (eventDuration < 1) {
              info.el.style.backgroundColor = "transparent";
            }
          }}
          dayMaxEventRows={5}
          eventContent={(info) => {
            const { start, end, title } = info.event;
            const date = new Date(start);
            const startTime = date.toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false, // 24시간 형식
            });
            const eventType = info.event.extendedProps.type;
            let typeString = "";

            if (eventType === "NOTICE") {
              typeString = "공지";
            } else if (eventType === "PRIVATE") {
              typeString = "개인";
            } else if (eventType === "TODO") {
              typeString = "할일";
            }

            const timeString = end ? "" : `ㆍ${startTime}`;
            return (
              <div>
                <p>
                  {typeString}
                  {timeString}
                  <b> {title}</b>
                </p>
              </div>
            );
          }}
        />
      );
    } else {
      return (
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          locale="ko"
          initialView="dayGridMonth"
          events={calendarData}
          eventDidMount={(info) => {
            new Tooltip(info.el, {
              title: "제목" + info.event.extendedProps.description,
              placement: "top",
              trigger: "hover",
            });
            if (info.event.extendedProps.type === "NOTICE") {
              info.el.style.backgroundColor = "#FFB1B9";
            }
          }}
          dayMaxEventRows={5}
          eventContent={(info) => {
            const { start, end, title } = info.event;
            const date = new Date(start);
            const startTime = date.toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false, // 24시간 형식
            });

            const timeString = end ? "" : `-${startTime}`;
            return (
              <div>
                <p>
                  {timeString}
                  <b> {title}</b>
                </p>
              </div>
            );
          }}
        />
      );
    }
  };

  return (
    <div className="section_container calendar_container">
      <div className="calendar_type_buttons">
        <button
          className={calendarType === "ALL" ? "checked" : ""}
          onClick={() => setCalendarType("ALL")}
        >
          모든일정
        </button>
        <button
          className={calendarType === "NOTICE" ? "checked" : ""}
          onClick={() => setCalendarType("NOTICE")}
        >
          공지
        </button>
        <button
          className={calendarType === "PRIVATE" ? "checked" : ""}
          onClick={() => setCalendarType("PRIVATE")}
        >
          개인
        </button>
      </div>
      {fullcalendarRender()}
      <Modal open={modalOpen} onClose={handleModalClose}>
        <CalendarFormModal
          formData={formData}
          addType={addType}
          handleAddTypeChange={handleAddTypeChange}
          handleChangeData={handleChangeData}
          handleAddCalendar={handleAddCalendar}
          handleModifyCalendar={handleModifyCalendar}
          handleDeleteCalendar={handleDeleteCalendar}
          handleModalClose={handleModalClose}
          focusTitle={focusTitle}
          focusDescription={focusDescription}
        />
      </Modal>
    </div>
  );
};

export default Calendar;
