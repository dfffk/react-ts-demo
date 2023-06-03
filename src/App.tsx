import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import IndexPage from './index/IndexPage';
import LoginPage from './login/LoginPage';
import HomePage from './index/home/HomePage';
import UserManage from './index/systemManage/UserManage';
import UserOnline from './index/systemMonitor/UserOnline';
import RolesManage from './index/systemManage/RolesManage';
import SimpleDemo from './components/excel/simple/simpleDemo';
import MenusManage from './index/systemManage/MenusManage';
import DictionaryManage from './index/systemManage/DictionaryManage';
import RedisMonitor from './index/systemMonitor/RedisMonitor';
const App = () => {
    return (
        <Suspense fallback={<h3>路由加载中...</h3>}>
            <BrowserRouter>
                <Routes>
                    <Route path='/login' element={<LoginPage />}></Route>
                    <Route path='/excel' element={<SimpleDemo />}></Route>
                    <Route path='/' element={localStorage.user ? <IndexPage /> : <LoginPage />} >
                        <Route path='home' element={<HomePage />}></Route>
                        <Route path='system/user' element={<UserManage />}></Route>
                        <Route path='monitor/online' element={<UserOnline />}></Route>
                        <Route path='monitor/redis' element={<RedisMonitor />}></Route>
                        <Route path='system/role' element={<RolesManage />}></Route>
                        <Route path='system/menu' element={<MenusManage />}></Route>
                        <Route path='system/dict' element={<DictionaryManage />}></Route>
                    </Route>
                </Routes>
            </BrowserRouter>
        </Suspense>
    )
}

export default App
