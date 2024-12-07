import React, {useState} from 'react';
import Userinfo from "../../common/Layouts/components/Userinfo";
import Search from "../../common/Layouts/components/Search";

const userInitData = [
    {
        id : 1,
        email : "abc@abc.abc",
        name : "홍길동",
        phone : "123-123-123",
        introduction : "소개",
        position : "사장",
        img : "",
    },
    {
        id : 2,
        email : "2abc@abc.abc",
        name : "2홍길동",
        phone : "2123-123-123",
        introduction : "소개",
        position : "2사장",
        img : "",
    },
    {
        id : 3,
        email : "3abc@abc.abc",
        name : "3홍길동",
        phone : "3123-123-123",
        introduction : "소개",
        position : "사장",
        img : "",
    },
    {
        id : 4,
        email : "4abc@abc.abc",
        name : "4홍길동",
        phone : "4123-123-123",
        introduction : "소개",
        position : "사장",
        img : "",
    },
    {
        id : 5,
        email : "5abc@abc.abc",
        name : "5홍길동",
        phone : "5123-123-123",
        introduction : "소개",
        position : "사장",
        img : "",
    },
    {
        id : 6,
        email : "6abc@abc.abc",
        name : "6홍길동",
        phone : "6123-123-123",
        introduction : "소개",
        position : "사장",
        img : "",
    },
]
const MyFriendsList = () => {
    const [user, setUser] = useState([...userInitData]);
    return (
        <div className="section_container myFriends_container_item">
            <h1 className="section_container_title">My Friends</h1>
            <Search placeholder={"이름을 검색하세요"}/>
            {
                user.map((userInfo) => (
                    <Userinfo
                        key={userInfo.id}
                        name={userInfo.name}
                        role={userInfo.position}
                        email={userInfo.email}
                        src={userInfo.img}/>
                ))
            }
        </div>
    );
};

export default MyFriendsList;