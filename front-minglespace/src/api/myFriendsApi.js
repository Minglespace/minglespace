import api, { HOST_URL } from "./Api";

const prefix = `${HOST_URL}/myFriends`;

class MyFriendsApi {
    //친구 목록 조회
    static getList = async (searchKeyword) => {
        try {
            const url = searchKeyword ? `${prefix}/${searchKeyword}` : prefix;
            const res = await api.axiosIns.get(url);
            return res.data;
        }catch (error) {
            console.error("친구 목록조회 실패",error);
            throw error;
        }
    };
}

export default MyFriendsApi;