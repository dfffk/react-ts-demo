import { createSlice } from "@reduxjs/toolkit";

export interface LoginUserState{
    loginUserData:any[]
}
const initialState: LoginUserState = {
    loginUserData: []
}

export const loginUserSlice=createSlice({
        name:'loginUser',
        initialState,
        reducers:{
            setLoginUser(state,action){
                state.loginUserData=action.payload
                console.log(action.payload);
                
            }
        }
})

export const {setLoginUser}=loginUserSlice.actions
export default loginUserSlice.reducer