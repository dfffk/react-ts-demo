import React, { useEffect, useRef, useState } from 'react'
import {
    Button, Col, Divider, Input, Row, Table,
    DatePicker,
    Form,
    Space,
    Drawer,
    TimePicker, Card, Tree
} from 'antd';
import type { DataNode } from 'antd/es/tree';
import type { ColumnsType } from 'antd/es/table';
import { useSelector } from 'react-redux';
import useRequest from '../../hooks/useRequest'
import { RootState } from '../../store';
import { DownOutlined, EyeOutlined, SettingOutlined } from '@ant-design/icons';
import { addRoleApi, deleteRoleApi, getRoleByIdApi, updateRoleApi } from '../../apis/roles';
import * as ExcelJs from 'exceljs';
import { generateHeaders, saveWorkbook } from "../../components/excel/utils";
import { StudentInfo } from "../../components/excel/types";
import { downloadExcel, downloadFiles2Zip, downloadFiles2ZipWithFolder } from "../../components/excel/excelUtils";
import { getMenusApi } from '../../apis/menus';
import type { DrawerProps } from 'antd/es/drawer';
import { FormInstance } from 'antd/lib/form/Form';
const RolesManage = () => {
    const [update, setUpdate] = useState('')
    const [openDetails, setOpenDetails] = useState('');
    const [openRoleData, setOpenRoleData]: any = useState({})
    const [menus, setMenus] = useState<any>([])
    //控制更多操作显示隐藏
    const [exportExcel, setExportExcel] = useState('none')
    //状态机中的角色数据
    const { getRolesAsync } = useRequest()
    useEffect(() => {
        getRolesAsync({ pageSize: rolesTotal ? rolesTotal : '10' })
    }, [update])
    const rolesData: any = useSelector((state: RootState) => state.roles.rolesData);
    const rolesTotal: any = useSelector((state: RootState) => state.roles.roleTotal)
    // console.log(rolesData, 'roles');

    const { RangePicker } = DatePicker;
    interface DataType {
        key: React.Key;
        name: string;
        age: number;
        address: string;
        modifyTime: string;
        createTime: string
    }

    const columns: ColumnsType<DataType> = [
        {
            title: '角色',
            dataIndex: 'roleName',
            render: (text: string) => <a>{text}</a>,
        },
        {
            title: '描述',
            dataIndex: 'remark',
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            filterDropdownOpen: false,
            sortDirections: ['ascend', 'descend', 'ascend'],
            sorter: (a, b) => Date.parse(a.createTime) - Date.parse(b.createTime),
        },
        {
            title: '修改时间',
            dataIndex: 'modifyTime',
            sortDirections: ['ascend', 'descend', 'ascend'],
            filterDropdownOpen: false,
            sorter: (a, b) => Date.parse(a.modifyTime) - Date.parse(b.modifyTime)
        },
        {
            title: '操作',
            dataIndex: 'action',
            render: (_, record: any): any => {
                return (
                    <Space>
                        <SettingOutlined style={{ color: 'rgb(58, 150, 189)', cursor: 'pointer' }} onClick={() => {
                            setOpenRoleData(record)
                            showDrawerDetails(record, 'update')
                        }} />
                        <EyeOutlined style={{ color: '#00FA9A', cursor: 'pointer' }} onClick={() => {
                            setOpenRoleData(record)
                            showDrawerDetails(record, 'see')
                        }} />
                    </Space>
                )
            }
        },
    ];
    //树控件
    const [expandedKeys, setExpandedKeys] = useState<React.Key[]>(['0-0-0', '0-0-1']);
    const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);
    const [checkedKeys2, setCheckedKeys2] = useState<React.Key[]>([]);
    const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);
    const userInfo = JSON.parse(localStorage.user);
    const formRef = React.useRef<FormInstance>(null)
    //新增角色的数据
    const [addRole, setAddRole]: any = useState({})
    // console.log(userInfo.permissions);
    //获取所有菜单数据
    const getMenus = async () => {
        const res: any = await getMenusApi()
        // console.log('res', res.rows.children);
        setMenus(res.rows.children)
    }
    useEffect(() => {
        getMenus()
    }, [])
    const onExpand = (expandedKeysValue: React.Key[]) => {
        console.log('onExpand', expandedKeysValue);
        // if not set autoExpandParent to false, if children expanded, parent can not collapse.
        // or, you can remove all expanded children keys.
        setExpandedKeys(expandedKeysValue);
        setAutoExpandParent(false);
    };

    const onCheck1: any = (checkedKeysValue: React.Key[]) => {
        console.log('onCheck', checkedKeysValue);
        setCheckedKeys(checkedKeysValue);
    };



    const treeData: DataNode[] =
        menus.map(item => {
            if (!item.children) {
                return {
                    'title': item.title, key: item.key
                }
            }
            if (item.children && !item.children.children) {
                return {
                    'title': item.title, key: item.key, children: item.children.map(obj => {
                        return { 'title': obj.title, key: obj.key, }
                    })
                }
            }
            if (item.children.children) {
                return {
                    'title': item.title, key: item.key, children: item.children.map(obj => {
                        return {
                            'title': obj.title, key: obj.key, children: obj.children.map(icon => {
                                return { 'title': icon.title, key: icon.key }
                            })
                        }
                    })
                }
            }
        })
    const [form] = Form.useForm()
    //查看详情抽屉

    const showDrawerDetails = async (record: any, open: string) => {
        // console.log('record', record);
        const res: any = await getRoleByIdApi(record.roleId)
        setCheckedKeys(res)
        setOpenDetails(open);
        if (open === 'update') {
            form.setFieldsValue(record)
        }
    };
    const onCloseDetails = () => {
        setOpenDetails('');
    };

    //导出为表格
    const rowSelection: any = {
        onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
            console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
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
        worksheet.addRows(rolesData);
        // 导出excel
        saveWorkbook(workbook, 'simple-demo.xlsx');
    }
    //导出

    // const onExportBasicExcelWithStyle = () => {
    //     // 创建工作簿
    //     const workbook = new ExcelJs.Workbook();
    //     // 添加sheet
    //     const worksheet = workbook.addWorksheet('demo sheet');
    //     // 设置 sheet 的默认行高
    //     worksheet.properties.defaultRowHeight = 20;
    //     // 设置列
    //     worksheet.columns = generateHeaders(columns);
    //     // 给表头添加背景色。因为表头是第一行，可以通过 getRow(1) 来获取表头这一行
    //     let headerRow = worksheet.getRow(1);
    //     // 直接给这一行设置背景色
    //     // headerRow.fill = {
    //     //   type: 'pattern',
    //     //   pattern: 'solid',
    //     //   fgColor: {argb: 'dff8ff'},
    //     // }
    //     // 通过 cell 设置样式，更精准
    //     headerRow.eachCell((cell, colNum) => {
    //         // 设置背景色
    //         cell.fill = {
    //             type: 'pattern',
    //             pattern: 'solid',
    //             fgColor: { argb: 'dff8ff' },
    //         }
    //         // 设置字体
    //         cell.font = {
    //             bold: true,
    //             italic: true,
    //             size: 12,
    //             name: '微软雅黑',
    //             color: { argb: 'ff0000' },
    //         };
    //         // 设置对齐方式
    //         cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: false, };
    //     })
    //     // 添加行
    //     let rows = worksheet.addRows(list);
    //     // 设置每行的样式
    //     rows?.forEach(row => {
    //         // 设置字体
    //         row.font = {
    //             size: 11,
    //             name: '微软雅黑',
    //         };
    //         // 设置对齐方式
    //         row.alignment = { vertical: 'middle', horizontal: 'left', wrapText: false, };
    //     })
    //     // 导出excel
    //     saveWorkbook(workbook, 'simple-demo.xlsx');
    // }

    // const onExportExcel = () => {
    //     downloadExcel({
    //         filename: 'test',
    //         sheets: [{
    //             sheetName: 'test',
    //             columns: columns,
    //             dataSource: list
    //         }]
    //     })
    // }

    // const onExportZip = () => {
    //     downloadFiles2Zip({
    //         zipName: '压缩包',
    //         files: [
    //             {
    //                 filename: 'test',
    //                 sheets: [
    //                     {
    //                         sheetName: 'test',
    //                         columns: columns,
    //                         dataSource: list
    //                     },
    //                     {
    //                         sheetName: 'test2',
    //                         columns: columns,
    //                         dataSource: list
    //                     }
    //                 ]
    //             },
    //             {
    //                 filename: 'test2',
    //                 sheets: [{
    //                     sheetName: 'test',
    //                     columns: columns,
    //                     dataSource: list
    //                 }]
    //             },
    //             {
    //                 filename: 'test3',
    //                 sheets: [{
    //                     sheetName: 'test',
    //                     columns: columns,
    //                     dataSource: list
    //                 }]
    //             }
    //         ]
    //     })
    // }

    // const onExportFolderZip = () => {
    //     downloadFiles2ZipWithFolder({
    //         zipName: '压缩包',
    //         folders: [
    //             {
    //                 folderName: '文件夹1',
    //                 files: [
    //                     {
    //                         filename: 'test',
    //                         sheets: [{
    //                             sheetName: 'test',
    //                             columns: columns,
    //                             dataSource: list
    //                         }]
    //                     },
    //                     {
    //                         filename: 'test2',
    //                         sheets: [{
    //                             sheetName: 'test',
    //                             columns: columns,
    //                             dataSource: list
    //                         }]
    //                     },
    //                 ]
    //             },
    //             {
    //                 folderName: '文件夹2',
    //                 files: [
    //                     {
    //                         filename: 'test',
    //                         sheets: [{
    //                             sheetName: 'test',
    //                             columns: columns,
    //                             dataSource: list
    //                         }]
    //                     },
    //                     {
    //                         filename: 'test2',
    //                         sheets: [{
    //                             sheetName: 'test',
    //                             columns: columns,
    //                             dataSource: list
    //                         }]
    //                     },
    //                 ]
    //             },
    //             {
    //                 folderName: '文件夹2/文件夹2-1',
    //                 files: [
    //                     {
    //                         filename: 'test',
    //                         sheets: [{
    //                             sheetName: 'test',
    //                             columns: columns,
    //                             dataSource: list
    //                         }]
    //                     },
    //                     {
    //                         filename: 'test2',
    //                         sheets: [{
    //                             sheetName: 'test',
    //                             columns: columns,
    //                             dataSource: list
    //                         }]
    //                     },
    //                 ]
    //             },
    //             {
    //                 folderName: '文件夹2/文件夹2-1/文件夹2-1-1',
    //                 files: [
    //                     {
    //                         filename: 'test',
    //                         sheets: [{
    //                             sheetName: 'test',
    //                             columns: columns,
    //                             dataSource: list
    //                         }]
    //                     },
    //                     {
    //                         filename: 'test2',
    //                         sheets: [{
    //                             sheetName: 'test',
    //                             columns: columns,
    //                             dataSource: list
    //                         }]
    //                     },
    //                 ]
    //             },
    //             {
    //                 folderName: '',
    //                 files: [
    //                     {
    //                         filename: 'test',
    //                         sheets: [{
    //                             sheetName: 'test',
    //                             columns: columns,
    //                             dataSource: list
    //                         },
    //                         {
    //                             sheetName: 'test2',
    //                             columns: columns,
    //                             dataSource: list
    //                         }
    //                         ]
    //                     },
    //                     {
    //                         filename: 'test2',
    //                         sheets: [{
    //                             sheetName: 'test',
    //                             columns: columns,
    //                             dataSource: list
    //                         }]
    //                     },
    //                 ]
    //             }
    //         ]
    //     })
    // }

    //新增
    const [openAddRole, setOpenAddRole] = useState(false)
    const onClose = () => {
        setOpenAddRole(false);
        formRef.current?.resetFields()
    };
    const onCheck2: any = (checkedKeysValue: React.Key[]) => {
        console.log('onCheck', checkedKeysValue);
        setAddRole({ menuId: checkedKeysValue })
        setCheckedKeys2(checkedKeysValue);
    };
    const onFinish = async (values: any) => {
        setUpdate('')
        console.log('value', values);
        console.log({ roleName: values.roleName, remark: values.remark, menuId: addRole.menuId.toString() });
        const res = await addRoleApi({ roleName: values.roleName, remark: values.remark, menuId: addRole.menuId.toString() })
        console.log('res', res);
        setUpdate('add')
        setOpenAddRole(false);
        // setOpenAddRole(false)
    };
    const closeAddRole = () => {
        setOpenAddRole(false)
        formRef.current?.resetFields()
    }

    //修改
    const onFinishUpdate = async (values: any) => {
        setUpdate('')
        console.log('value', values);
        const res = await updateRoleApi({ roleName: values.roleName, roleId: values.roleId.toString(), remark: values.remark, menuId: checkedKeys.toString() })
        console.log('res', res);
        setOpenAddRole(false);
        setOpenDetails('')
        setUpdate('update')
    }

    //表格
    const deleteRef = useRef([])
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);



    const onSelectChange = (newSelectedRowKeys: []) => {
        setSelectedRowKeys(newSelectedRowKeys);
        deleteRef.current = newSelectedRowKeys
        console.log('addref', deleteRef.current);
    };
    //删除
    const [loading, setLoading] = useState(false);
    const start = async () => {
        setUpdate('')
        setLoading(true);
        for (let item of deleteRef.current) {
            const res = await deleteRoleApi(item)
            console.log('res', res);
        }
        setUpdate('delete')
        // ajax request after empty completing
        setTimeout(() => {
            setSelectedRowKeys([]);
            setLoading(false);
        }, 1000);
    };
    const tableRowSelection: any = {
        selectedRowKeys,
        onChange: onSelectChange,
    };
    const hasSelected = selectedRowKeys.length > 0;

    //按钮样式
    const [style1, setStyle1] = useState({ width: '60px', lineHeight: '25px', color: 'rgb(58, 150, 189)', border: '1px solid rgb(58, 150, 189)', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer' })

    return (
        <div>
            {/* 查看 */}
            <Drawer title="角色信息" placement="right" width='50%' onClose={onCloseDetails} open={openDetails == 'see' ? true : false} style={{ lineHeight: '30px', fontWeight: '300' }}>
                <div>角色名称：{openRoleData.roleName}</div>
                <div>角色描述：{openRoleData.remark}</div>
                <div>创建时间：{openRoleData.createTime}</div>
                <div>修改时间：{openRoleData.modifyTime}</div>
                <div>所拥有的权限：</div>
                <Tree
                    style={{ marginTop: '10px' }}
                    checkable
                    onExpand={onExpand}
                    expandedKeys={expandedKeys}
                    autoExpandParent={autoExpandParent}
                    checkedKeys={checkedKeys}
                    onCheck={onCheck1}
                    treeData={treeData}
                />
            </Drawer>

            {/* /新增 */}
            <Drawer
                extra={
                    <Space style={{ position: 'absolute', bottom: '30px', right: '150px' }}>
                        <Button onClick={onClose}>取消</Button>
                    </Space>
                } title="新增角色" placement="right" width='600px' onClose={closeAddRole} open={openAddRole} style={{ lineHeight: '30px', fontWeight: '300' }}>
                <Form
                    ref={formRef}
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 18 }}
                    name="nest-messages"
                    onFinish={onFinish}
                    style={{ maxWidth: 600 }}
                >
                    <Form.Item name='roleName' label="角色名称" rules={[{ required: true, message: '角色名称不能为空' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name='remark' label="角色描述">
                        <Input.TextArea />
                    </Form.Item>

                    <Form.Item style={{ height: '0' }}>
                        <Button type='primary' htmlType='submit' style={{ position: 'fixed', bottom: '30px', right: '50px', zIndex: '999' }}>提交</Button>
                    </Form.Item>
                </Form>
                <div style={{ display: 'flex' }}>
                    <div>权限选择:</div>
                    <Tree
                        style={{ marginTop: '10px' }}
                        checkable
                        onExpand={onExpand}
                        expandedKeys={expandedKeys}
                        autoExpandParent={autoExpandParent}
                        onCheck={onCheck2}
                        checkedKeys={checkedKeys2}
                        treeData={treeData}

                    />
                </div>
            </Drawer>

            {/* 修改 */}
            <Drawer title="修改角色" placement="right" width='600px' onClose={onCloseDetails} open={openDetails == 'update' ? true : false} style={{ lineHeight: '30px', fontWeight: '300' }}
                extra={
                    <Space style={{ position: 'absolute', bottom: '30px', right: '150px' }}>
                        <Button onClick={onClose}>取消</Button>
                    </Space>
                } >
                <Form
                    ref={formRef}
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 18 }}
                    name="nest-messages"
                    onFinish={onFinishUpdate}
                    style={{ maxWidth: 600 }}
                    form={form}
                >
                    <Form.Item name='roleName' label="角色名称" rules={[{ required: true, message: '角色名称不能为空' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name='remark' label="角色描述">
                        <Input.TextArea />
                    </Form.Item>
                    <Form.Item name='roleId' label="角色Id" style={{ display: 'none' }}>
                        <Input />
                    </Form.Item>
                    <Form.Item style={{ height: '0' }}>
                        <Button type='primary' htmlType='submit' style={{ position: 'fixed', bottom: '30px', right: '50px', zIndex: '999' }}>提交</Button>
                    </Form.Item>
                </Form>
                <div style={{ display: 'flex', marginLeft: '24px' }}>
                    <div>权限选择:</div>
                    <Tree
                        style={{ marginTop: '10px' }}
                        checkable
                        onExpand={onExpand}
                        expandedKeys={expandedKeys}
                        autoExpandParent={autoExpandParent}
                        checkedKeys={checkedKeys}
                        onCheck={onCheck1}
                        treeData={treeData}
                    />
                </div>

            </Drawer>


            <Form

                labelCol={{ span: 4 }}
                wrapperCol={{ span: 18 }}
                layout="horizontal"
                style={{ width: '100%', display: 'flex', alignItems: 'center' }}
            >
                <Form.Item label="角色" style={{ width: '45%' }}>
                    <Input style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item label="创建时间" name='createTime' style={{ width: '45%' }}>
                    <RangePicker style={{ width: '100%' }} placeholder={['开始日期', '结束日期']} />
                </Form.Item>
                <Form.Item style={{}}>
                    <Button type='primary' htmlType='submit' style={{}}>
                        查询
                    </Button>
                </Form.Item>
                <Form.Item style={{ marginLeft: 20 }}>
                    <Button style={{}}>
                        重置
                    </Button>
                </Form.Item>
            </Form>
            <Row gutter={20}>
                <Col>
                    <button style={style1} onClick={() => {
                        setOpenAddRole(true)
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
                        <Button style={{ width: '110px', position: 'absolute', top: '30px', left: '20px', display: exportExcel }} onMouseMove={() => setExportExcel('block')} onMouseLeave={() => setExportExcel('none')} onClick={onExportBasicExcel}>导出Excel</Button>
                    </div>

                </Col>
                <Col>

                </Col>
            </Row>

            <Divider />

            <Table
                rowKey='roleId'
                columns={columns}
                dataSource={rolesData}
                rowSelection={tableRowSelection}
            />
        </div>
    );
}

export default RolesManage