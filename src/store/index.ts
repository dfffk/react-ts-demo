import { configureStore } from '@reduxjs/toolkit'
import rolesReducer from './modules/rolesSlice'
import loginUserReducer from './modules/loginUserSlice'
import usersReducer from './modules/usersSlice'
// 创建仓库对象
export const store = configureStore({
    reducer: {
        roles: rolesReducer,
        loginUser:loginUserReducer,
        users:usersReducer
    },
})
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch


