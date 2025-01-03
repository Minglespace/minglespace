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
  return (
    <div className="calendar_modal_container">
      <div className="calendar_type_buttons">
        {formData.id === null ||
        formData.id === undefined ||
        addType === "TIME" ? (
          <button
            className={addType === "TIME" ? "checked" : ""}
            onClick={() => handleAddTypeChange("TIME")}
          >
            시간
          </button>
        ) : (
          <></>
        )}
        {formData.id === null ||
        formData.id === undefined ||
        addType === "DAY" ? (
          <button
            className={addType === "DAY" ? "checked" : ""}
            onClick={() => handleAddTypeChange("DAY")}
          >
            2일이상
          </button>
        ) : (
          <></>
        )}
        {addType === "TIME" ? (
          <div className="calendar_modal_inputbox">
            <p>제목 : </p>
            <input
              name="title"
              ref={focusTitle}
              type="text"
              onChange={handleChangeData}
              value={formData.title}
            />
            <p>세부내용 : </p>
            <input
              name="description"
              type="text"
              ref={focusDescription}
              onChange={handleChangeData}
              value={formData.description}
            />
            <p>시간 : </p>
            <input
              name="start"
              type="datetime-local"
              onChange={handleChangeData}
              value={formData.start}
            />
            <br />
          </div>
        ) : (
          <div className="calendar_modal_inputbox">
            <p>제목 : </p>
            <input
              name="title"
              ref={focusTitle}
              type="text"
              onChange={handleChangeData}
              value={formData.title}
            />
            <p>세부내용 : </p>
            <input
              name="description"
              type="text"
              ref={focusDescription}
              onChange={handleChangeData}
              value={formData.description}
            />
            <p>시작일 : </p>
            <input
              name="start"
              type="date"
              onChange={handleChangeData}
              value={formData.start.split("T")[0]}
            />
            <p>마감일 : </p>
            <input
              name="end"
              type="date"
              onChange={handleChangeData}
              value={formData.end.split("T")[0]}
            />
            <br />
          </div>
        )}
        <div className="calendar_modal_editbuttons">
          {formData.id ? (
            <>
              <button className="calendar_edit" onClick={handleModifyCalendar}>
                수정
              </button>
              <button
                className="calendar_delete"
                onClick={handleDeleteCalendar}
              >
                삭제
              </button>
            </>
          ) : (
            <button className="calendar_add" onClick={handleAddCalendar}>
              추가
            </button>
          )}
          <button className="calendar_cancel" onClick={handleModalClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarFormModal;
