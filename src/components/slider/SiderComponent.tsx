import React, { useEffect, useState } from 'react'
// import '../../index/index.css'
import logo from '../../assets/logo.png'
import {
    HomeOutlined,
    AppstoreOutlined,
    DashboardOutlined
} from '@ant-design/icons';
import { Layout, Menu, theme } from 'antd';
import { Link, useLocation } from 'react-router-dom';
const { Sider } = Layout;

const SiderComponent = (props: any) => {
    const { pathname }: any = useLocation()

    const {
        token: { colorBgContainer },
    } = theme.useToken();
    return (
        <Sider trigger={null} collapsible collapsed={props.collapsed} style={{ minHeight: '100vh' }} width={256}>
            <div className="logo" style={{
                height: '32px',
                margin: '16px',
                display: 'flex',
                alignItems: 'center'

            }} >
                <img src={logo} alt="" style={{
                    width: '32px', marginRight: '12px', marginLeft: '15px'
                }} />
                <div style={{
                    color: '#fff',
                    fontSize: '20px',
                    fontWeight: '600'
                }}>
                    {
                        props.collapsed == true ? '' : '赤兔养车'
                    }
                </div>
            </div>
            <Menu
                theme="dark"
                mode="inline"
                defaultSelectedKeys={pathname}
                style={{ fontSize: '14px' }}
                items={[
                    {
                        key: '/home',
                        icon: <HomeOutlined />,
                        label: <Link to={'/home'}>系统主页</Link>
                    },
                    {
                        key: 'system',
                        icon: <AppstoreOutlined />,
                        label: '系统管理',
                        children: [
                            {
                                key: '/system/user',
                                icon: '',
                                label: <Link to={'/system/user'}>用户管理</Link>,
                            },
                            {
                                key: '/system/role',
                                icon: '',
                                label: <Link to={'/system/role'}>角色管理</Link>,
                            },
                            {
                                key: '/system/menu',
                                icon: '',
                                label: <Link to={'/system/menu'}>菜单管理</Link>,
                            },
                            {
                                key: '/system/dict',
                                icon: '',
                                label: <Link to={'/system/dict'}>字典管理</Link>,
                            }
                        ]
                    },
                    {
                        key: 'systemMonitor',
                        icon: <DashboardOutlined />,
                        label: '系统监控',
                        children: [
                            {
                                key: 'monitor/online',

                                label: <Link to={'monitor/online'}>在线用户</Link>
                            },
                            {
                                key: 'monitor/redis',

                                label: <Link to={'monitor/redis'}>redis</Link>
                            }
                        ]
                    },

                ]}
            />
        </Sider>
    )
}

export default SiderComponent