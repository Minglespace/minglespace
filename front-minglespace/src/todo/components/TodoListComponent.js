import React, { useContext, useCallback } from "react";
import { useEffect, useState, useRef } from "react";
import TodoApi from "../../api/TodoApi";
import { useParams } from "react-router-dom";
import TodoItem from "./TodoItem";
import TodoModal from "./TodoModal";
import { WSMemberRoleContext } from "../../workspace/context/WSMemberRoleContext";

const TodoComponent = () => {
  const [todoItem, setTodoItem] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [sortType, setSortType] = useState("title");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState("title");
  const { workspaceId } = useParams("workspaceId");
  const {
    wsMemberData: { role },
  } = useContext(WSMemberRoleContext);

  const observer = useRef();

  const fetchData = useCallback(
    async (searchKeyword, sortType, searchType, page) => {
      let data;
      setLoading(true);
      const limit = page === 0 ? 12 : 8;
      if (role === "LEADER" || role === "SUB_LEADER") {
        data = await TodoApi.getAllList(
          workspaceId,
          searchKeyword,
          sortType,
          searchType,
          page,
          limit
        );
      } else {
        data = await TodoApi.getList(
          workspaceId,
          searchKeyword,
          sortType,
          searchType,
          page,
          limit
        );
      }
      if (data.length === 0) {
        setHasMore(false);
      } else {
        setTodoItem((prevItems) =>
          page === 0 ? data : [...prevItems, ...data]
        );
        setHasMore(true);
      }
      setRendering(false);
      setLoading(false);
    },
    [workspaceId, role]
  );

  useEffect(() => {
    fetchData(searchKeyword, sortType, searchType, page);
  }, [workspaceId, role, rendering, fetchData, sortType, searchType, page]);

  useEffect(() => {
    if (page === 0) {
      setTodoItem([]);
    }
  }, [page]);

  //아이템 목록 렌더링 핸들러
  const handleRendering = () => {
    setRendering(true);
  };
  //Modal창 켜고 닫는 핸들러
  const handleModalOpen = () => {
    setModalOpen(true);
  };
  const handleModalClose = () => {
    setModalOpen(false);
  };

  //현재 컴포넌트에서 ADD버튼 클릭 시 실행되는 핸들러
  const handleAddTodo = (newTodo) => {
    TodoApi.postAddTodo(workspaceId, newTodo).then((addedTodo) => {
      setTodoItem((prevTodo) => [...prevTodo, newTodo]);
      setModalOpen(false);
      handleRendering();
      setPage(0);
    });
  };

  //Delete할 Todo의 ID를 자식에게 Props로 넘겨 이벤트로 받는 핸들러
  const handleDeleteTodo = (id) => {
    setTodoItem((prevTodoItems) =>
      prevTodoItems.filter((todo) => todo.id !== id)
    );
    setModalOpen(false);
  };

  //엔터 눌러서 검색하는 핸들러
  const handleSearch = useCallback(
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const changeTrim = e.target.value.trim().toLowerCase();
        setSearchKeyword(changeTrim);
        setPage(0);
        fetchData(changeTrim, sortType, searchType, 0);
      }
    },
    [fetchData, sortType, searchType]
  );

  const handleChangeType = (e) => {
    const { name, value } = e.target;
    if (name === "search_type") {
      setSearchType(value);
    } else if (name === "sort_type") {
      setSortType(value);
      setPage(0);
      fetchData(searchKeyword, value, searchType, 0);
    }
  };

  const lastTodoElementRef = useCallback(
    (node) => {
      if (loading || !hasMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  return (
    <div>
      <div className="todo_search_and_button">
        {role === "LEADER" || role === "SUB_LEADER" ? (
          <div className="todo_item_add_button_section">
            <button className="todo_item_add_button" onClick={handleModalOpen}>
              할일 추가
            </button>
          </div>
        ) : (
          <></>
        )}
        <div className="todo_item_search">
          <select name="search_type" onChange={handleChangeType}>
            <option value="title">제목 및 내용</option>
            <option value="assignee">작업자</option>
          </select>
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            onKeyDown={handleSearch}
          />
          <select name="sort_type" onChange={handleChangeType}>
            <option value="title_asc">제목순</option>
            <option value="content_asc">내용순</option>
            <option value="start_date_asc">오래된순</option>
            <option value="start_date_desc">최신순</option>
          </select>
        </div>
      </div>
      <div className="todo_list_section">
        <div className="todo_item_container">
          {todoItem.map((todo, index) => (
            <div
              key={todo.id}
              className="todo_item_contents"
              ref={index === todoItem.length - 1 ? lastTodoElementRef : null}
            >
              <TodoItem
                todo={todo}
                onDelete={handleDeleteTodo}
                onRendering={handleRendering}
                role={role}
              />
            </div>
          ))}
        </div>
        {modalOpen && (
          <TodoModal
            open={modalOpen}
            onClose={handleModalClose}
            onAdd={handleAddTodo}
            onRendering={handleRendering}
            role={role}
          />
        )}
      </div>
    </div>
  );
};

export default TodoComponent;
