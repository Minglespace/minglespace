import React, { useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useState, useContext } from "react";
import CalendarApi from "../api/CalendarApi";
import { useParams } from "react-router-dom";
import Modal from "../common/Layouts/components/Modal";
import { formatDateToKST } from "../common/DateFormat/dateUtils";
import { WSMemberRoleContext } from "../workspace/context/WSMemberRoleContext";

const Calendar = () => {
  const { workspaceId } = useParams();
  const [calendarData, setCalendarData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState([]);
  const {
    wsMemberData: { role },
  } = useContext(WSMemberRoleContext);

  //캘린더 목록 조회
  useEffect(() => {
    CalendarApi.getList(workspaceId)
      .then((data) => {
        setCalendarData(data);
      })
      .catch((error) => {
        alert("캘린더 조회중 에러 발생", error);
      });
  }, [workspaceId]);

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
  const handleModalOpen = () => {
    setModalOpen(true);
  };
  const handleModalClose = () => {
    setModalOpen(false);
    setFormData([]); //모달창 Close 시 입력중이던 내용 초기화
  };

  //캘린더에 항목 추가하여 DB에 저장
  const addCalendar = () => {
    //dateUtils.js에 KST 데이터를 받아올수 있는 Formatter 생성
    const formattedStart = formatDateToKST(formData.start);
    const newCalendar = { ...formData, start: formattedStart };
    CalendarApi.addCalendar(workspaceId, newCalendar).then((result) => {
      setCalendarData((prevData) => [...prevData, result]);
    });
    setModalOpen(false);
    setFormData([]); //추가 후 formData내용 초기화
  };

  //캘린더 내부 event 하나 클릭했을 때 해당 값을 가져와서 formData에 저장
  const handleEventClick = (evt) => {
    setFormData({
      id: evt.event.id,
      title: evt.event.title,
      description: evt.event.extendedProps.description,
      start: formatDateToKST(evt.event.start),
    });
    setModalOpen(true);
  };

  //handleEventClick으로 받아온 formData를 가지고 수정작업
  const modifyCalendar = () => {
    const updatedCalendar = { ...formData };
    CalendarApi.modifyCalendar(
      workspaceId,
      updatedCalendar.id,
      updatedCalendar
    ).then((result) => {
      setCalendarData((prevData) =>
        prevData.map((event) => (event.id === result.id ? result : event))
      );
    });
    setModalOpen(false);
    setFormData([]);
  };

  //handleEventClick으로 받아온 formData를 가지고 삭제 작업
  const deleteCalendar = () => {
    const updatedCalendar = { ...formData };
    CalendarApi.deleteCalendar(workspaceId, updatedCalendar.id).then(() => {
      setCalendarData((prevData) => {
        return prevData.filter((event) => event.id !== updatedCalendar.id);
      });
    });

    setModalOpen(false);
    setFormData([]);
  };

  return (
    <div className="calendar_container" style={{ width: "700px" }}>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={calendarData}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
      />
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
        {role === "LEADER" || role === "SUB_LEADER" ? (
          <>
            {" "}
            {formData.id ? (
              <>
                {" "}
                <button onClick={modifyCalendar}>수정</button>{" "}
                <button onClick={deleteCalendar}>삭제</button>{" "}
              </>
            ) : (
              <button onClick={addCalendar}>추가</button>
            )}{" "}
            <button onClick={handleModalClose}>닫기</button>{" "}
          </>
        ) : (
          <button onClick={handleModalClose}>닫기</button>
        )}
      </Modal>
    </div>
  );
};

export default Calendar;
