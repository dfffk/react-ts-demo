import { createSlice } from '@reduxjs/toolkit'
// 约束state的类型
export interface UserState {
    usersData: any[]
}
const initialState: UserState = {
    usersData: []
}
export const usersSlice = createSlice({
    name: 'roles', // 模块名称
    initialState,  // 模块内的初始数据
    // 修改模块数据的方法
    reducers: {
        setUsers(state, action) {
            // 接收外部的最新数据，重新赋值给 rolesData
            state.usersData = action.payload;
        },
    },
})
export const { setUsers } = usersSlice.actions
export default usersSlice.reducer