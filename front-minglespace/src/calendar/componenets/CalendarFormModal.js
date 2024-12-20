import React, { useState } from "react";

const CalendarFormModal = ({
  formData,
  handleChangeData,
  handleModifyCalendar,
  handleDeleteCalendar,
  handleAddCalendar,
  handleModalClose,
  focusTitle,
  handleAddTypeChange,
  addType,
  focusDescription,
}) => {
  console.log("form end : ", formData.end);
  return (
    <div>
      <button
        className="add_button_2"
        onClick={() => handleAddTypeChange("TIME")}
      >
        시간
      </button>
      <button
        className="add_button_2"
        onClick={() => handleAddTypeChange("DAY")}
      >
        2일이상
      </button>
      {addType === "TIME" ? (
        <>
          <input
            name="title"
            ref={focusTitle}
            type="text"
            onChange={handleChangeData}
            value={formData.title}
          />
          <input
            name="description"
            type="text"
            ref={focusDescription}
            onChange={handleChangeData}
            value={formData.description}
          />
          <input
            name="start"
            type="datetime-local"
            onChange={handleChangeData}
            value={formData.start}
          />
          <br />
        </>
      ) : (
        <>
          <input
            name="title"
            ref={focusTitle}
            type="text"
            onChange={handleChangeData}
            value={formData.title}
          />
          <input
            name="description"
            type="text"
            ref={focusDescription}
            onChange={handleChangeData}
            value={formData.description}
          />
          <input
            name="start"
            type="date"
            onChange={handleChangeData}
            value={formData.start.split("T")[0]}
          />
          <input
            name="end"
            type="date"
            onChange={handleChangeData}
            value={formData.end.split("T")[0]}
          />
          <br />
        </>
      )}

      {formData.id ? (
        <>
          <button onClick={handleModifyCalendar}>수정</button>
          <button onClick={handleDeleteCalendar}>삭제</button>
        </>
      ) : (
        <button onClick={handleAddCalendar}>추가</button>
      )}
      <button onClick={handleModalClose}>닫기</button>
    </div>
  );
};

export default CalendarFormModal;
