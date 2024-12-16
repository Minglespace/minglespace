import React, { useContext, useCallback } from "react";
import { useEffect, useState, useRef } from "react";
import TodoApi from "../../api/TodoApi";
import { useParams } from "react-router-dom";
import TodoItem from "./TodoItem";
import TodoModal from "./TodoModal";
import MembersApi from "../../api/membersApi";
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
  const [members, setMembers] = useState([]);
  const [selecetedTodo, setSelectedTodo] = useState(null);

  const [searchType, setSearchType] = useState("title");
  const { workspaceId } = useParams("workspaceId");
  const {
    wsMemberData: { role },
  } = useContext(WSMemberRoleContext);

  const observer = useRef();

  const fetchData = useCallback(
    async (searchKeyword, sortType, searchType, page) => {
      setLoading(true);
      let data;
      try {
        if (role === "LEADER" || role === "SUB_LEADER") {
          data = await TodoApi.getAllList(
            workspaceId,
            searchKeyword,
            sortType,
            searchType,
            page
          );
        } else {
          data = await TodoApi.getList(
            workspaceId,
            searchKeyword,
            sortType,
            searchType,
            page
          );
        }
        if (page === 0) {
          setTodoItem(data.content);
        } else {
          setTodoItem((prevTodo) => [...prevTodo, ...data.content]);
        }
        setHasMore(!data.last);
        setLoading(false);
      } finally {
        setRendering(false);
        setLoading(false);
      }
    },
    [workspaceId, role]
  );

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const membersList = await MembersApi.getMemberList(workspaceId);
        setMembers(membersList);
      } catch (error) {
        console.error("Failed", error);
      }
    };
    fetchMembers();
  }, [workspaceId]);

  useEffect(() => {
    fetchData(searchKeyword, sortType, searchType, page);
  }, [workspaceId, role, fetchData, sortType, searchType, page]);

  //아이템 목록 렌더링 핸들러
  const handleRendering = useCallback(() => {
    setRendering(true);
  }, []);
  //Modal창 켜고 닫는 핸들러
  const handleModalOpen = useCallback((todo) => {
    setSelectedTodo(todo);
    setModalOpen(true);
  }, []);
  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setSelectedTodo(null);
  }, []);

  //현재 컴포넌트에서 ADD버튼 클릭 시 실행되는 핸들러
  const handleAddTodo = useCallback(
    (newTodo) => {
      TodoApi.postAddTodo(workspaceId, newTodo).then((addedTodo) => {
        setTodoItem((prevTodo) => [...prevTodo, addedTodo]);
        setModalOpen(false);
        setSortType(sortType);
        setPage(0);
      });
    },
    [workspaceId, sortType]
  );

  const handleModifyTodo = useCallback(
    (updatedTodo) => {
      // 문자열을 배열로 변경 또는 빈배열로 초기화
      const modifiedTodo = {
        ...updatedTodo,
        wsMember_id: Array.isArray(updatedTodo.wsMember_id)
          ? updatedTodo.wsMember_id
          : [],
      };

      // API 호출로 Todo를 수정
      TodoApi.modifyTodo(updatedTodo.id, workspaceId, updatedTodo).then(
        (result) => {
          setTodoItem((prevTodos) =>
            prevTodos.map((todo) =>
              todo.id === result.id ? { ...todo, ...result } : todo
            )
          );
          setModalOpen(false);
        }
      );
    },
    [workspaceId]
  );

  //Delete할 Todo의 ID를 자식에게 Props로 넘겨 이벤트로 받는 핸들러
  const handleDeleteTodo = useCallback((id) => {
    setTodoItem((prevTodoItems) =>
      prevTodoItems.filter((todo) => todo.id !== id)
    );
    setModalOpen(false);
  }, []);

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

  const handleChangeType = useCallback(
    (e) => {
      const { name, value } = e.target;
      if (name === "search_type") {
        setSearchType(value);
      } else if (name === "sort_type") {
        setSortType(value);
        setPage(0);
        fetchData(searchKeyword, value, searchType, 0);
        handleRendering();
      }
    },
    [fetchData, searchKeyword, searchType]
  );

  const lastTodoElementRef = useCallback(
    (node) => {
      if (loading || !hasMore || modalOpen) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          console.log("loading more");
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore, modalOpen]
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
          {todoItem.length <= 0 ? (
            <div>검색결과 없음</div>
          ) : (
            todoItem.map((todo, index) => (
              <div
                key={todo.id}
                className="todo_item_contents"
                ref={todoItem.length === index + 1 ? lastTodoElementRef : null}
              >
                <TodoItem
                  todo={todo}
                  members={members}
                  onDelete={handleDeleteTodo}
                  onModify={handleModifyTodo}
                  onModalOpen={handleModalOpen}
                  onRendering={handleRendering}
                  role={role}
                />
              </div>
            ))
          )}
        </div>
        {modalOpen && (
          <TodoModal
            open={modalOpen}
            members={members}
            onClose={handleModalClose}
            onAdd={handleAddTodo}
            onModify={handleModifyTodo}
            onRendering={handleRendering}
            role={role}
          />
        )}
      </div>
    </div>
  );
};

export default TodoComponent;
