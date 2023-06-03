import React, { useEffect, useRef, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import './index.css'
import SiderComponent from '../components/slider/SiderComponent'
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UploadOutlined,
    UserOutlined,
    LoginOutlined,
    VideoCameraOutlined,
    KeyOutlined,
    SettingOutlined
} from '@ant-design/icons'
import { Layout, theme } from 'antd';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const { Header, Content } = Layout;
const IndexPage = () => {
    //是否显示退出
    const [onMouse, setOnMouse] = useState('none')
    const navigate = useNavigate()
    const [collapsed, setCollapsed] = useState(false);
    const [imgSrc, setImgSrc] = useState('')
    const userInfo = JSON.parse(localStorage.user)
    //退出登录
    const closeWeb = () => {
        localStorage.clear()
        navigate('/login')
    }
    useEffect(() => {
        setImgSrc('http://xawn.f3322.net:8002/distremote/static/avatar/' + userInfo.user.avatar)
    }, [])
    const {
        token: { colorBgContainer },
    } = theme.useToken();
    return (
        <Layout>
            <SiderComponent collapsed={collapsed}></SiderComponent>
            <Layout className="site-layout">
                <Header style={{ background: colorBgContainer, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                        className: 'trigger',
                        onClick: () => setCollapsed(!collapsed),
                    })}
                    <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', position: 'relative' }}
                        onMouseEnter={() => setOnMouse('block')} onMouseLeave={() => setOnMouse('none')}>
                        <img src={imgSrc} alt="" style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: 'red' }} />
                        <div style={{ fontSize: '14px', marginLeft: '10px' }}>{userInfo.user.username}</div>
                        <div style={{ display: onMouse, position: 'absolute', width: '150px', bottom: '-140px', right: '10px', backgroundColor: '#fff', border: '1px solid #ccc', zIndex: '999' }}>
                            <div style={{ height: '35px', lineHeight: '35px', fontSize: '14px', display: 'flex', opacity: '0.7', alignItems: 'center' }}><UserOutlined style={{ marginRight: '10px', marginLeft: '10px', fontSize: '13px' }} />个人中心</div>
                            <div style={{ height: '35px', lineHeight: '35px', fontSize: '14px', display: 'flex', opacity: '0.7', alignItems: 'center' }}><KeyOutlined style={{ marginRight: '10px', marginLeft: '10px', fontSize: '13px' }} />密码修改</div>
                            <div style={{ height: '35px', lineHeight: '35px', fontSize: '14px', display: 'flex', opacity: '0.7', alignItems: 'center', borderTop: '1px solid #aaa', borderBottom: '1px solid #aaa' }}><SettingOutlined style={{ marginRight: '10px', marginLeft: '10px', fontSize: '13px' }} />系统定制</div>
                            <div style={{ height: '35px', lineHeight: '35px', fontSize: '14px', display: 'flex', opacity: '0.7', alignItems: 'center' }} onClick={() => closeWeb()}><LoginOutlined style={{ marginRight: '10px', marginLeft: '10px', fontSize: '13px' }} />退出登录</div>
                        </div>
                    </div>
                </Header>
                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                        background: colorBgContainer,
                    }}
                >
                    <Outlet></Outlet>
                </Content>
            </Layout>
        </Layout>
    );
}

export default IndexPage