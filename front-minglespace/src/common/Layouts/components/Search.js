import React from 'react';
import { IoSearchOutline } from "react-icons/io5";

const Search = ({placeholder, onSearch, onKeyDown}) => {
    return (
        <div className="search_box">
         <input type="text" maxLength='30' placeholder={placeholder}
                onChange={onSearch}
                onKeyDown={onKeyDown}/>
         <IoSearchOutline />
        </div>
    );
};


export default Search;