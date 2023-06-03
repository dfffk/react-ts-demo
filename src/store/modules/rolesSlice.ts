import { createSlice } from '@reduxjs/toolkit'
// 约束state的类型
export interface RoleState {
    rolesData: any[];
    roleTotal:string
}
const initialState: RoleState = {
    rolesData: [],
    roleTotal:''
}
export const rolesSlice = createSlice({
    name: 'roles', // 模块名称
    initialState,  // 模块内的初始数据
    // 修改模块数据的方法
    reducers: {
        setRoles(state, action) {
            // 接收外部的最新数据，重新赋值给 rolesData
            state.rolesData = action.payload.rows;
            state.roleTotal=action.payload.total.toString()
            // console.log('roleDataIN', state.rolesData,state.roleTotal);
        },
    },
})
export const { setRoles } = rolesSlice.actions
export default rolesSlice.reducer