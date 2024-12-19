import React, { useCallback, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useState, useContext } from "react";
import CalendarApi from "../api/CalendarApi";
import { useParams } from "react-router-dom";
import Modal from "../common/Layouts/components/Modal";
import { formatDateToKST } from "../common/DateFormat/dateUtils";
import { WSMemberRoleContext } from "../workspace/context/WSMemberRoleContext";
import { getErrorMessage } from "../common/Exception/errorUtils";
import Tooltip from "tooltip.js";

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
  const [calendarType, setCalendarType] = useState("NOTICE");
  const [formData, setFormData] = useState({});
  const {
    wsMemberData: { role },
  } = useContext(WSMemberRoleContext);
  //캘린더 NOTICE 조회

  console.log("cale: ", calendarData);
  const getCalendarNotice = useCallback(async () => {
    try {
      const result = await CalendarApi.getCalendarNotice(workspaceId);
      setCalendarData(result);
    } catch (error) {
      alert(
        `캘린더 조회 중 에러가 발생했습니다.\n원인:${getErrorMessage(error)}`
      );
    }
  }, [workspaceId]);

  //캘린더 PRIVATE 조회
  const getCalendarPrivate = useCallback(async () => {
    try {
      const result = await CalendarApi.getCalendarPrivate(workspaceId);
      setCalendarData(result);
    } catch (error) {
      alert(
        `캘린더 조회 중 에러가 발생했습니다.\n원인:${getErrorMessage(error)}`
      );
    }
  }, [workspaceId]);

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
    calendarType === "NOTICE" ? getCalendarNotice() : getCalendarPrivate();
  }, [workspaceId, calendarType, getCalendarNotice, getCalendarPrivate]);

  //캘린더에 추가되는 내용을 formData에 저장
  const handleChangeData = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  //캘린더에 날짜 클릭 시 Add모달을 통해 데이터 추가
  const handleDateClick = (arg) => {
    const formattedStart = formatDateToKST(arg.dateStr);
    setFormData({ title: "", description: "", start: formattedStart });
    setModalOpen(true);
  };

  //모달 On, Off 핸들러
  const handleModalClose = () => {
    setModalOpen(false);
    setFormData([]); //모달창 Close 시 입력중이던 내용 초기화
  };

  //캘린더에 항목 추가하여 DB에 저장
  const handleAddCalendar = async () => {
    //dateUtils.js에 KST 데이터를 받아올수 있는 Formatter 생성
    const formattedStart = formatDateToKST(formData.start);
    const newCalendar = {
      ...formData,
      start: formattedStart,
      type: calendarType,
    };
    await addCalendar(newCalendar);
    setModalOpen(false);
    setFormData([]); //추가 후 formData내용 초기화
    calendarType === "NOTICE" ? getCalendarNotice() : getCalendarPrivate();
  };

  //캘린더 내부 event 하나 클릭했을 때 해당 값을 가져와서 formData에 저장
  const handleEventClick = (evt) => {
    if (evt.event.extendedProps.type !== "TODO") {
      setFormData({
        id: evt.event.id,
        title: evt.event.title,
        description: evt.event.extendedProps.description,
        start: formatDateToKST(evt.event.start),
      });
      setModalOpen(true);
    }
  };

  //handleEventClick으로 받아온 formData를 가지고 수정작업
  const handleModifyCalendar = async () => {
    const updatedCalendar = { ...formData };
    await modifyCalendar(updatedCalendar);
    setModalOpen(false);
    setFormData([]);
    calendarType === "NOTICE" ? getCalendarNotice() : getCalendarPrivate();
  };

  //handleEventClick으로 받아온 formData를 가지고 삭제 작업
  const handleDeleteCalendar = async () => {
    const updatedCalendar = { ...formData };
    await deleteCalendar(updatedCalendar);
    setModalOpen(false);
    setFormData([]);
    calendarType === "NOTICE" ? getCalendarNotice() : getCalendarPrivate();
  };

  const fullcalendarRender = () => {
    if (
      role === "LEADER" ||
      role === "SUB_LEADER" ||
      calendarType === "PRIVATE"
    ) {
      return (
        <FullCalendar
          key={calendarData.length + new Date().getTime()}
          plugins={[dayGridPlugin, interactionPlugin]}
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
            if (info.event.extendedProps.type === "TODO") {
              info.el.style.backgroundColor = "green";
              info.el.style.cursor = "default";
              console.log("info : ", info);
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
    } else {
      return (
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={calendarData}
          eventDidMount={(info) => {
            new Tooltip(info.el, {
              title: "제목" + info.event.extendedProps.description,
              placement: "top",
              trigger: "hover",
            });
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
      <button onClick={() => setCalendarType("NOTICE")}>공지</button>
      <button onClick={() => setCalendarType("PRIVATE")}>개인</button>
      {fullcalendarRender()}
      <Modal open={modalOpen} onClose={handleModalClose}>
        <input
          name="title"
          type="text"
          onChange={handleChangeData}
          value={formData.title}
        />
        <input
          name="description"
          type="text"
          onChange={handleChangeData}
          value={formData.description}
        />
        <input
          name="start"
          type="datetime-local"
          onChange={handleChangeData}
          value={formData.start}
        />
        <input
          name="end"
          type="datetime-local"
          onChange={handleChangeData}
          value={formData.end}
        />
        <br />

        {formData.id ? (
          <>
            <button onClick={handleModifyCalendar}>수정</button>
            <button onClick={handleDeleteCalendar}>삭제</button>
          </>
        ) : (
          <button onClick={handleAddCalendar}>추가</button>
        )}
        <button onClick={handleModalClose}>닫기</button>
      </Modal>
    </div>
  );
};

export default Calendar;
