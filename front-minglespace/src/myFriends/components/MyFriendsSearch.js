import React from 'react';
import PropTypes from 'prop-types';
import Search from "../../common/Layouts/components/Search";

const MyFriendsSearch = () => {
    return (
        <div className="section_container myFriends_container_item">
        <h1 className="section_container_title">친구를 찾아보세요.</h1>
            <Search placeholder={"Email을 검색하세요."}/>
        </div>
    );
};
export default MyFriendsSearch;