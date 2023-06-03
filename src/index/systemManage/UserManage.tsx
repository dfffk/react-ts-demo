import React, { useEffect, useRef, useState } from 'react'
import {
    Button, Col, Divider, Input, Row, Table,
    DatePicker,
    Form,
    Space,
    Drawer,
    TreeSelect,
    Select,
    Radio,
    TimePicker, Card, Tree, Modal, message
} from 'antd';
import type { DataNode } from 'antd/es/tree';
import type { ColumnsType } from 'antd/es/table';
import { useSelector } from 'react-redux';
import useRequest from '../../hooks/useRequest'
import { RootState } from '../../store';
import { DownOutlined, EyeOutlined, SettingOutlined, UserOutlined, LockOutlined, MailOutlined, MobileOutlined, PlusOutlined, LoginOutlined, MessageOutlined, StarOutlined, PhoneOutlined, HomeOutlined, SmileOutlined, SkinOutlined, ClockCircleOutlined, UpOutlined } from '@ant-design/icons';
import * as ExcelJs from 'exceljs';
import { generateHeaders, saveWorkbook } from "../../components/excel/utils";
import { StudentInfo } from "../../components/excel/types";
import { downloadExcel, downloadFiles2Zip, downloadFiles2ZipWithFolder } from "../../components/excel/excelUtils";
import { getMenusApi } from '../../apis/menus';
import type { DrawerProps } from 'antd/es/drawer';
import { FormInstance } from 'antd/lib/form/Form';
import { addUserApi, deleteUserApi, getUserTypeApi, getUsersApi, updateUserApi } from '../../apis/users';
import { getDpartmentApi } from '../../apis/department';
const UserManage = () => {
    const [update, setUpdate] = useState('')
    const [menus, setMenus] = useState<any>([])
    //控制更多操作显示隐藏
    const [exportExcel, setExportExcel] = useState('none')
    const [checkedKeys2, setCheckedKeys2] = useState([])
    const [userData, setUserData]: any = useState([])
    const [oneUser, setOneUser]: any = useState({})
    const formRef = React.useRef<FormInstance>(null)
    const [form] = Form.useForm()
    const [messageApi, contextHolder] = message.useMessage();
    useEffect(() => {
        getRolesAsync({ pageSize: rolesTotal ? rolesTotal : '10' })
        getDepartments()
        getUsers()
    }, [update])
    const { RangePicker } = DatePicker;
    interface DataType {
        key: React.Key;
        name: string;
        age: number;
        address: string;
        modifyTime: string;
        createTime: string;
    }
    //获取部门数据
    const [dpartments, setDpartments]: any = useState([])
    const getDepartments = async () => {
        const res: any = await getDpartmentApi()
        setDpartments(res.rows.children)
    }
    // console.log('dpartments', dpartments);
    //获取用户数据
    const getAllusers = async (total: string) => {
        const res: any = await getUsersApi({ pageSize: total })
        setUserData(res.rows)
    }
    const getUsers = async () => {
        const res: any = await getUsersApi({})
        // console.log('res', res);
        getAllusers(res.total)
    }
    //获取角色数据
    const { getRolesAsync } = useRequest()
    const rolesData = useSelector((state: RootState) => state.roles.rolesData)
    const rolesTotal: any = useSelector((state: RootState) => state.roles.roleTotal)
    // console.log('rolesData', rolesData);

    //查看详情
    const userStatus = (record: any) => {
        if (record.status == '1') {
            return <span style={{ backgroundColor: '#98F5FF', padding: '4px 6px', color: '#00BFFF', fontSize: '12px' }}>有效</span>
        } else {
            return <span style={{ backgroundColor: 'red', padding: '4px 6px', color: '#fff', fontSize: '12px' }}>无效</span>
        }
    }
    const seeDetails = (record: any) => {
        setOpenDetails(true)
        setOneUser(record)
    }
    //修改用户
    const [userId, setUserId] = useState('')
    const [openUpdateUser, setOpenUpdateUser] = useState(false)
    const onUpdateClose = () => {
        setOpenUpdateUser(false)
    }
    const openUpdate = async (record: any) => {
        setOpenUpdateUser(true)
        form.setFieldsValue(record)
        setUserId(record.userId)
    }
    const updateFinish = async (values: any) => {
        console.log('values', values);
        const res = await updateUserApi({
            ...values,
            deptId: values.deptId.toString(),
            userId: userId
        })
        setUpdate('update')
        setOpenUpdateUser(false)
        messageApi.open({
            type: 'success',
            content: '修改成功',
        });
    }
    // console.log('oneUser', oneUser);
    const columns: ColumnsType<DataType> = [
        {
            title: '姓名',
            dataIndex: 'username',
            render: (text: string) => <a>{text}</a>,
            sorter: (a: any, b: any) => a.username.length - b.username.length,
        },
        {
            title: '性别',
            dataIndex: 'ssex',
            render: (_, record: any): any => {
                if (record.ssex == '0') {
                    return '男'
                } else if (record.ssex == '1') {
                    return '女'
                } else {
                    return '未知'
                }
            }
        },
        {
            title: '邮箱',
            dataIndex: 'email',
        },
        {
            title: '部门',
            dataIndex: 'deptName',
        },
        {
            title: '电话',
            dataIndex: 'mobile',
        },
        {
            title: '状态',
            dataIndex: 'status',
            render: (_, record: any) => {
                userStatus(record)
            }
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            filterDropdownOpen: false,
            sortDirections: ['ascend', 'descend', 'ascend'],
            sorter: (a, b) => Date.parse(a.createTime) - Date.parse(b.createTime),
        },

        {
            title: '操作',
            dataIndex: 'action',
            render: (_, record: any): any => {
                return (
                    <Space>
                        <SettingOutlined style={{ color: 'rgb(58, 150, 189)', cursor: 'pointer' }} onClick={() => openUpdate(record)} />
                        <EyeOutlined style={{ color: '#00FA9A', cursor: 'pointer' }} onClick={() => seeDetails(record)} />
                    </Space>
                )
            }
        },
    ];


    //查看modal框
    const [openDetails, setOpenDetails] = useState(false);


    //导出为表格
    const rowSelection = {
        onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
            // console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        },
        getCheckboxProps: (record: DataType) => ({
            disabled: record.name === 'Disabled User', // Column configuration not to be checked
            name: record.name,
        }),
    };
    const onExportBasicExcel = () => {
        // 创建工作簿
        const workbook = new ExcelJs.Workbook();
        // 添加sheet
        const worksheet = workbook.addWorksheet('demo sheet');
        // 设置 sheet 的默认行高
        worksheet.properties.defaultRowHeight = 20;
        // 设置列
        worksheet.columns = generateHeaders(columns);
        // 添加行
        worksheet.addRows(userData);
        // 导出excel
        saveWorkbook(workbook, 'simple-demo.xlsx');
        messageApi.open({
            type: 'success',
            content: '导出成功',
        });
    }

    //新增表单
    const [openAddUser, setOpenAddUser] = useState(false)
    const onClose = () => {
        setOpenAddUser(false);
    };

    const addFinish = async (values: any) => {
        console.log('value', values);
        const res = await addUserApi(values.email ? values : {
            ...values,
            email: ''
        })
        setUpdate('add')
        console.log('res', res);
        messageApi.open({
            type: 'success',
            content: '新增成功',
        });

        // setOpenAddUser(false)
    };
    const closeAddRole = () => {
        setOpenAddUser(false)
    }
    //密码重置
    const updatePassword = () => {

    }
    //按钮样式
    const [style1, setStyle1] = useState({ width: '60px', lineHeight: '25px', color: 'rgb(58, 150, 189)', border: '1px solid rgb(58, 150, 189)', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer' })
    //性别显示
    const showUserSex: any = (sex: string) => {
        if (sex === '0') {
            return '男'
        } else if (sex === '1') {
            return '女'
        } else {
            return '未知'
        }
    }
    const showUserSexWord: any = (sex: string) => {
        if (sex === '0') {
            return 'blue'
        } else if (sex === '1') {
            return 'red'
        } else {
            return '#696969'
        }
    }
    const detailsStatus = (ssex: string) => {
        if (ssex == '1') {
            return <span style={{ backgroundColor: '#98F5FF', padding: '4px 6px', color: '#00BFFF', fontSize: '12px' }}>有效</span>
        } else {
            return <span style={{ backgroundColor: 'red', padding: '4px 6px', color: '#fff', fontSize: '12px' }}>无效</span>
        }
    }
    //删除用户
    const deleteRef = useRef([])
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [loading, setLoading]: any = useState(false);
    const onSelectChange = (newSelectedRowKeys: []) => {
        setSelectedRowKeys(newSelectedRowKeys);
        deleteRef.current = newSelectedRowKeys
        // console.log('addref', deleteRef.current);
    };
    const start = async () => {
        setUpdate('')
        setLoading(true);
        for (let item of deleteRef.current) {
            const res = await deleteUserApi(item)
            console.log('res', res);
        }
        setUpdate('delete')
        // ajax request after empty completing
        setTimeout(() => {
            setSelectedRowKeys([]);
            setLoading(false);
            messageApi.open({
                type: 'success',
                content: '删除成功',
            });
        }, 1000);
    };
    const tableRowSelection: any = {
        selectedRowKeys,
        onChange: onSelectChange,
    };
    const hasSelected = selectedRowKeys.length > 0;
    const [displayBox, setDisplayBox] = useState('small')
    return (
        <div>
            {contextHolder}
            {/* 查看详情 */}
            <Modal
                title="用户信息"
                centered
                open={openDetails}
                onOk={() => setOpenDetails(false)}
                onCancel={() => setOpenDetails(false)}
                width={750}
                okButtonProps={{ style: { display: 'none' } }}
                cancelButtonProps={{ style: { display: 'none' } }}
            >
                <div style={{ display: 'flex', padding: '24px' }}>
                    <img src={'http://xawn.f3322.net:8002/distremote/static/avatar/' + oneUser.avatar} style={{ display: 'block', width: '115px', height: '115px', marginRight: '45px' }} />
                    <div style={{ display: 'flex' }}>
                        <div style={{ width: '232px' }}>
                            <p style={{ lineHeight: '20px', fontSize: '14px', color: '#696969' }}><UserOutlined style={{ fontSize: '16px', marginRight: '13px' }} />账户：{oneUser.username}</p>
                            <p style={{ lineHeight: '20px', fontSize: '14px', color: '#696969' }}><StarOutlined style={{ fontSize: '16px', marginRight: '13px' }} />角色：{oneUser.roleName}</p>
                            <p style={{ lineHeight: '20px', fontSize: '14px', color: '#696969' }}><SkinOutlined style={{ fontSize: '16px', marginRight: '13px' }} />性别：<span style={{ color: showUserSexWord(oneUser.ssex) }}>{showUserSex(oneUser.ssex)}</span></p>
                            <p style={{ lineHeight: '20px', fontSize: '14px', color: '#696969' }}><PhoneOutlined style={{ fontSize: '16px', marginRight: '13px' }} />电话：{oneUser.mobile}</p>
                            <p style={{ lineHeight: '20px', fontSize: '14px', color: '#696969' }}><MailOutlined style={{ fontSize: '16px', marginRight: '13px' }} />邮箱：{oneUser.email}</p>
                        </div>
                        <div style={{ paddingRight: '16px', width: '270px' }}>
                            <p style={{ lineHeight: '20px', fontSize: '14px', color: '#696969' }}><HomeOutlined style={{ fontSize: '16px', marginRight: '13px' }} />部门：{oneUser.deptName}</p>
                            <p style={{ lineHeight: '20px', fontSize: '14px', color: '#696969' }}><SmileOutlined style={{ fontSize: '16px', marginRight: '13px' }} />状态：{detailsStatus(oneUser.ssex)}</p>
                            <p style={{ lineHeight: '20px', fontSize: '14px', color: '#696969' }}><ClockCircleOutlined style={{ fontSize: '16px', marginRight: '13px' }} />创建时间：{oneUser.createTime}</p>
                            <p style={{ lineHeight: '20px', fontSize: '14px', color: '#696969' }}><LoginOutlined style={{ fontSize: '16px', marginRight: '13px' }} />最近登录：{oneUser.lastLoginTime}</p>
                            <p style={{ lineHeight: '20px', fontSize: '14px', color: '#696969', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><MessageOutlined style={{ fontSize: '16px', marginRight: '13px' }} />描述：{oneUser.description}</p>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* /新增 */}
            <Drawer
                extra={
                    <Space style={{ position: 'absolute', bottom: '30px', right: '150px' }}>
                        <Button onClick={onClose}>取消</Button>
                    </Space>
                } title="新增用户" placement="right" width='40%' onClose={closeAddRole} open={openAddUser} style={{ lineHeight: '30px', fontWeight: '300' }}>
                <Form
                    ref={formRef}
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 14 }}
                    name="nest-messages"
                    onFinish={addFinish}
                    style={{ width: '120%' }}
                >
                    <Form.Item name='username' label="用户名" rules={[{ required: true, message: '用户名不能为空' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name='password' label="密码" initialValue={'1234qwer'}>
                        <Input.Password disabled={true} visibilityToggle={false} />
                    </Form.Item>

                    <Form.Item name='email' label="邮箱">
                        <Input />
                    </Form.Item>
                    <Form.Item name='mobile' label="手机" rules={[{ required: true, message: '请输入手机号码' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="角色" name='roleId' rules={[{ required: true, message: '请选择角色' }]}>
                        <Select
                            showSearch
                            placeholder=""
                            allowClear
                            optionFilterProp="children"
                            filterOption={(input, option) => (option?.label ?? '').includes(input)}
                            filterSort={(optionA, optionB) =>
                                (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                            }
                            options={rolesData.map(item => {
                                return {
                                    value: item.roleId.toString(),
                                    label: item.roleName
                                }
                            })}
                        />
                    </Form.Item>
                    <Form.Item label="部门" name='deptId' rules={[{ required: true, message: '请选择部门' }]}>
                        <TreeSelect allowClear
                            treeData={dpartments.map(item => {
                                if (!item.children) {
                                    return {
                                        title: item.title,
                                        value: item.id,
                                    }
                                } else {
                                    return {
                                        title: item.title,
                                        value: item.id,
                                        children: item.children.map(obj => {
                                            return {
                                                title: obj.title,
                                                value: obj.id
                                            }
                                        })

                                    }
                                }
                            })}
                        />
                    </Form.Item>
                    <Form.Item label="状态" name='status' rules={[{ required: true, message: '请选择状态' }]}>
                        <Radio.Group>
                            <Radio value="0"> 锁定 </Radio>
                            <Radio value="1"> 有效 </Radio>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item label="性别" name='ssex' rules={[{ required: true, message: '请选择性别' }]}>
                        <Radio.Group>
                            <Radio value="0"> 男 </Radio>
                            <Radio value="1"> 女 </Radio>
                            <Radio value="2"> 保密 </Radio>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item style={{ height: '0' }}>
                        <Button type='primary' htmlType='submit' style={{ position: 'fixed', bottom: '30px', right: '50px', zIndex: '999' }}>提交</Button>
                    </Form.Item>
                </Form>
            </Drawer>

            {/* 修改 */}
            <Drawer
                extra={
                    <Space style={{ position: 'absolute', bottom: '30px', right: '150px' }}>
                        <Button onClick={onUpdateClose}>取消</Button>
                    </Space>
                } title="修改用户" placement="right" width='40%' onClose={onUpdateClose} open={openUpdateUser} style={{ lineHeight: '30px', fontWeight: '300' }}>
                <Form
                    ref={formRef}
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 14 }}
                    name="nest-messages"
                    onFinish={updateFinish}
                    style={{ width: '600px' }}
                    form={form}
                >
                    <Form.Item name='username' label="用户名" rules={[{ required: true, message: '用户名不能为空' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name='email' label="邮箱">
                        <Input />
                    </Form.Item>
                    <Form.Item name='mobile' label="手机" rules={[{ required: true, message: '请输入手机号码' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="角色" name='roleId' rules={[{ required: true, message: '请选择角色' }]}>
                        <Select
                            showSearch
                            placeholder=""
                            allowClear
                            optionFilterProp="children"
                            filterOption={(input, option) => (option?.label ?? '').includes(input)}
                            filterSort={(optionA, optionB) =>
                                (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                            }
                            options={rolesData.map(item => {
                                return {
                                    value: item.roleId.toString(),
                                    label: item.roleName
                                }
                            })}
                        />
                    </Form.Item>
                    <Form.Item label="部门" name='deptId'>
                        <TreeSelect allowClear
                            treeData={dpartments.map(item => {
                                if (!item.children) {
                                    return {
                                        title: item.title,
                                        value: item.id,
                                    }
                                } else {
                                    return {
                                        title: item.title,
                                        value: item.id,
                                        children: item.children.map(obj => {
                                            return {
                                                title: obj.title,
                                                value: obj.id
                                            }
                                        })

                                    }
                                }
                            })}
                        />
                    </Form.Item>
                    <Form.Item label="状态" name='status' rules={[{ required: true, message: '请选择状态' }]}>
                        <Radio.Group>
                            <Radio value="0"> 锁定 </Radio>
                            <Radio value="1"> 有效 </Radio>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item label="性别" name='ssex' rules={[{ required: true, message: '请选择性别' }]}>
                        <Radio.Group>
                            <Radio value="0"> 男 </Radio>
                            <Radio value="1"> 女 </Radio>
                            <Radio value="2"> 保密 </Radio>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item style={{ height: '0' }}>
                        <Button type='primary' htmlType='submit' style={{ position: 'fixed', bottom: '30px', right: '50px', zIndex: '999' }}>提交</Button>
                    </Form.Item>
                </Form>
            </Drawer>

            <Form
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 18 }}
                layout="horizontal"
                style={{ width: '100%', display: displayBox == 'small' ? 'flex' : 'none', alignItems: 'center' }}
            >
                <Form.Item label="角色" style={{ width: '40%' }}>
                    <Input />
                </Form.Item>

                <Form.Item label="创建时间" name='createTime' style={{ width: '40%' }}>
                    <RangePicker style={{ width: '100%' }} placeholder={['开始日期', '结束日期']} />
                </Form.Item>
                <Form.Item style={{}}>
                    <Button type='primary' htmlType='submit' style={{}}>
                        查询
                    </Button>
                </Form.Item>
                <Form.Item style={{ marginLeft: 10 }}>
                    <Button style={{}}>
                        重置
                    </Button>
                </Form.Item>
                <div style={{ color: 'rgb(58, 150, 189)', cursor: 'pointer', marginLeft: '10px', marginBottom: '20px' }} onClick={() => setDisplayBox('big')}>展开<DownOutlined /></div>
            </Form>

            <Form
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 18 }}
                layout="horizontal"
                style={{ width: '100%', display: displayBox == 'big' ? 'flex' : 'none', alignItems: 'center', flexWrap: 'wrap' }}
            >
                <Form.Item label="角色" style={{ width: '45%', flexShrink: '0' }}>
                    <Input />
                </Form.Item>
                <Form.Item label="部门" name='deptId' style={{ width: '45%', flexShrink: '0' }}>
                    <TreeSelect allowClear
                        treeData={dpartments.map(item => {
                            if (!item.children) {
                                return {
                                    title: item.title,
                                    value: item.id,
                                }
                            } else {
                                return {
                                    title: item.title,
                                    value: item.id,
                                    children: item.children.map(obj => {
                                        return {
                                            title: obj.title,
                                            value: obj.id
                                        }
                                    })

                                }
                            }
                        })}
                    />
                </Form.Item>
                <Form.Item label="创建时间" name='createTime' style={{ width: '45%', flexShrink: '0' }}>
                    <RangePicker style={{ width: '100%' }} placeholder={['开始日期', '结束日期']} />
                </Form.Item>
                <Form.Item style={{ marginLeft: '25%' }}>
                    <Button type='primary' htmlType='submit' style={{}}>
                        查询
                    </Button>
                </Form.Item>
                <Form.Item style={{ marginLeft: 10 }}>
                    <Button style={{}}>
                        重置
                    </Button>
                </Form.Item>
                <div style={{ color: 'rgb(58, 150, 189)', cursor: 'pointer', marginLeft: '10px', marginBottom: '20px' }} onClick={() => setDisplayBox('small')}>收起<UpOutlined /></div>
            </Form>
            <Row gutter={20}>
                <Col>
                    <button style={style1} onClick={() => {
                        setOpenAddUser(true)
                        formRef.current?.resetFields()
                        setCheckedKeys2([])
                    }}
                    >新增</button>
                </Col>
                <Col>
                    <Button
                        onClick={start} disabled={!hasSelected} loading={loading}
                    >删除</Button>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <Button style={{ marginLeft: '20px', height: '30px' }} onMouseMove={() => setExportExcel('block')} onMouseLeave={() => setExportExcel('none')}>更多操作<DownOutlined />
                        </Button>
                        <Button style={{ width: '110px', position: 'absolute', top: '30px', left: '20px', display: exportExcel }} onMouseMove={() => setExportExcel('block')} onMouseLeave={() => setExportExcel('none')} onClick={updatePassword}>密码重置</Button>
                        <Button style={{ width: '110px', position: 'absolute', top: '60px', left: '20px', display: exportExcel, zIndex: '9999' }} onMouseMove={() => setExportExcel('block')} onMouseLeave={() => setExportExcel('none')} onClick={onExportBasicExcel}>导出Excel</Button>
                    </div>

                </Col>
                <Col>

                </Col>
            </Row>

            <Divider />

            <Table
                rowKey='userId'
                rowSelection={tableRowSelection}
                columns={columns}
                dataSource={userData}
            />
        </div>
    );
}

export default UserManage