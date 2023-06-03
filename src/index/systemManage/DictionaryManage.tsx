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
import { getDictApi } from '../../apis/dict';
const DictionaryManage = () => {
    const [update, setUpdate] = useState('')
    const [dict, setDict]: any = useState([])
    //控制更多操作显示隐藏
    const [exportExcel, setExportExcel] = useState('none')
    const [checkedKeys2, setCheckedKeys2] = useState([])
    const [userData, setUserData]: any = useState([])
    const formRef = React.useRef<FormInstance>(null)
    const [form] = Form.useForm()
    const [formAdd] = Form.useForm()
    const [messageApi, contextHolder] = message.useMessage();
    useEffect(() => {
        getDict()
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

    //获取字典数据
    const getDict = async () => {
        const res: any = await getDictApi()
        console.log('res', res.rows);
        setDict(res.rows)
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
            title: '键',
            dataIndex: 'keyy',

        },
        {
            title: '值',
            dataIndex: 'valuee',

        },
        {
            title: '表名',
            dataIndex: 'tableName',
        },
        {
            title: '字段',
            dataIndex: 'fieldName',
        },
        {
            title: '操作',
            dataIndex: 'action',
            render: (_, record: any): any => {
                return (
                    <Space>
                        <SettingOutlined style={{ color: 'rgb(58, 150, 189)', cursor: 'pointer' }} onClick={() => openUpdate(record)} />
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
            {/* /新增 */}
            <Drawer
                extra={
                    <Space style={{ position: 'absolute', bottom: '30px', right: '150px' }}>
                        <Button onClick={onClose}>取消</Button>
                    </Space>
                } title="新增字典" placement="right" width='40%' onClose={closeAddRole} open={openAddUser} style={{ lineHeight: '30px', fontWeight: '300' }}>
                <Form
                    form={formAdd}
                    ref={formRef}
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 15 }}
                    name="nest-messages"
                    onFinish={addFinish}
                    style={{ width: '120%' }}
                >
                    <Form.Item name='keyy' label="键" rules={[{ required: true, message: '键不能为空' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name='valuee' label="值" rules={[{ required: true, message: '值不能为空' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name='tableName' label="表名" rules={[{ required: true, message: '表名不能为空' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name='fieldName' label="字段" rules={[{ required: true, message: '字段不能为空' }]}>
                        <Input />
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
                    wrapperCol={{ span: 15 }}
                    name="nest-messages"
                    onFinish={updateFinish}
                    style={{ width: '600px' }}
                    form={form}
                >
                    <Form.Item name='keyy' label="键" rules={[{ required: true, message: '键不能为空' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name='valuee' label="值" rules={[{ required: true, message: '值不能为空' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name='tableName' label="表名" rules={[{ required: true, message: '表名不能为空' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name='fieldName' label="字段" rules={[{ required: true, message: '字段不能为空' }]}>
                        <Input />
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
                <Form.Item label="键" style={{ width: '27%' }}>
                    <Input />
                </Form.Item>
                <Form.Item label="值" style={{ width: '27%' }}>
                    <Input />
                </Form.Item>
                <Form.Item label="表名" style={{ width: '27%' }}>
                    <Input />
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
                <Form.Item label="键" style={{ width: '33%' }}>
                    <Input />
                </Form.Item>
                <Form.Item label="值" style={{ width: '33%' }}>
                    <Input />
                </Form.Item>
                <Form.Item label="表名" style={{ width: '33%' }}>
                    <Input />
                </Form.Item>
                <Form.Item label="字段" style={{ width: '33%' }}>
                    <Input />
                </Form.Item>
                <Form.Item style={{ marginLeft: '45%' }}>
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
                        formAdd.setFieldsValue('')
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
                rowKey='dictId'
                rowSelection={tableRowSelection}
                columns={columns}
                dataSource={dict}
            />
        </div>
    );
}

export default DictionaryManage

