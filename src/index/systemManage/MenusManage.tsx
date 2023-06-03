import React, { useEffect, useRef, useState } from 'react'
import {
    Button, Col, Divider, Input, Row, Table,
    DatePicker,
    Form,
    Space,
    Drawer,
    Popconfirm,
    Tree, Modal, message
} from 'antd';
import type { TableRowSelection } from 'antd/es/table/interface';
import type { DataNode } from 'antd/es/tree';
import type { ColumnsType } from 'antd/es/table';
import { DownOutlined, EyeOutlined, AppstoreOutlined, SettingOutlined } from '@ant-design/icons';
import { addRoleApi, deleteRoleApi, getRoleByIdApi, updateRoleApi } from '../../apis/roles';
import * as ExcelJs from 'exceljs';
import { generateHeaders, saveWorkbook } from "../../components/excel/utils";
import { StudentInfo } from "../../components/excel/types";
import { downloadExcel, downloadFiles2Zip, downloadFiles2ZipWithFolder } from "../../components/excel/excelUtils";
import { addMenuApi, getMenusApi } from '../../apis/menus';
import { FormInstance } from 'antd/lib/form/Form';
import { QuestionCircleOutlined } from '@ant-design/icons';
import * as AllIcon from '@ant-design/icons'
import './menus.less'
import Iconfont from '../../utils/iconFont';
const RolesManage = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = Form.useForm()
    const [formAddMenu] = Form.useForm()
    const [update, setUpdate] = useState('')
    const [openDetails, setOpenDetails] = useState('');
    const [openRoleData, setOpenRoleData]: any = useState({})
    const [menus, setMenus] = useState<any>([])
    //控制更多操作显示隐藏
    const [exportExcel, setExportExcel] = useState('none')

    const { RangePicker } = DatePicker;
    interface DataType {
        key: React.ReactNode;
        address: string;
        children?: DataType[];
        title: string;
        icon: string;
        type: string;
        path: string;
        component: string;
        permission: string;
        order: number;
        createTime: string;
        modifyTime: string
    }
    const openUpdate = async (record: any) => {
        setOpenDetails('update')
        console.log(record);

        form.setFieldsValue(record)
    }
    const columns: ColumnsType<DataType> = [
        {
            title: '名称',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: '图标',
            dataIndex: 'icon',
            key: 'icon',
            render: (_, record): any => {
                // console.log('record', record);
                if (record.icon) {
                    const strArr = record.icon.split('-')
                    if (strArr.includes('o')) {
                        strArr.length -= 1
                    }
                    const newStr = strArr.map(item => item = item[0].toUpperCase() + item.substr(1)).join('') + 'Outlined'
                    return <>
                        <Iconfont icon={newStr} />
                    </>
                } else {
                    return ''
                }
            }
        },
        {
            title: '类型',
            dataIndex: 'type',
            key: 'type',
            render: (_, record): any => {
                if (record.type === '0') {
                    return <Space><span style={{ color: '#1E90FF', backgroundColor: '#AFEEEE', padding: '3px 5px', fontSize: '12px', border: '1px solid #1E90FF' }}>菜单</span></Space>
                } else {
                    return <Space><span style={{ color: '#FF00FF', backgroundColor: '#FAEBD7', padding: '3px 5px', fontSize: '12px', border: '1px solid #FF00FF' }}>按钮</span></Space>
                }
            }
        },
        {
            title: '地址',
            dataIndex: 'path',
            key: 'path',
        },
        {
            title: 'Vue组件',
            dataIndex: 'component',
            width: '10%',
            key: 'component',
        },
        {
            title: '权限',
            dataIndex: 'permission',
            key: 'permission',
        },
        {
            title: '排序',
            dataIndex: 'order',
            key: 'order',
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            key: 'createTime',
        },
        {
            title: '修改时间',
            dataIndex: 'modifyTime',
            key: 'modifyTime',
        },
        {
            title: '操作',
            dataIndex: 'action',
            key: 'action',
            render: (_, record: any): any => {
                return (
                    <Space>
                        <SettingOutlined style={{ color: 'rgb(58, 150, 189)', cursor: 'pointer' }} onClick={() => openUpdate(record)} />
                    </Space>
                )
            }
        },
    ];
    //图标
    const iconArr = Object.keys(AllIcon).filter(item => item.includes('Outlined'))
    //方向正则
    const directionReg = /Step|Fast|Shrink|Arrow|Down|care|left|rigth|forward|vertical|back|enter|retweet|swap|playcircle|log|menufold|menuunfold|bottom|inner|outer|bordertop|borderverticle|upsquare|upcircle|fullscreen/i
    //提建议性图标正则
    const adviceReg = /question|pluscircle|pause|minus|plussquare|info|exclamation|close|check|warning|clockcircle|stop/i
    //编辑类图标正则
    const editReg = /edit|form|copy|scissor|delete|snippets|diff|hightlight|align|bgcolor|bold|italic|underline|striket|redo|undo|zoom|font|lineheight|dash|smalldash|sort|drag|ordered|radius|column/i
    //数据类图标正则
    const dataReg = /chart|heatmap|fall|rise|stock|boxplot|fund|sliders/i
    //品牌和标识图标正则
    const brandReg = /android|apple|window|ie|chrome|github|aliwangwang|dingding|weibo|taobao|html5|twitter|wechat|youtube|alipay|skype|qq|medium|gitlab|linkedin|google|dropbox|facebook|codepen|codesand|amazon|antdesign|antcloud|aliyun|zhihu|slack|behance|dribbble|instagram|yuque|alibaba|yahoo|reddit|sketch/i
    //网站通用图标正则
    const generalReg = /account|aim|alert|apartment|api|appstore|audio|audit|bank|barcode|bars|bell|block|book|border|branches|bug|build|bulb|calculator|calendar|camera|car|carry|cicircle|cioutline|clear|cloud|cluster|codeoutlined|coffee|comment|compass|compress|console|contact|container|control|copyright|creditcard|crown|customer|dashboard|database|delete|delivered|deployment|desktop|dingtalk|disconnect|dislike|dollar|download|ellipsis|environment|euro|exception|expand|experiment|export|eye|field|^file|^fork|^flag|^folder|^form|^forw|^func|^fund|^funn|gateway|^gif|^glob|^gold|^group|^hdd|^heart|^history|^holder|^home|^hour|^idcard|^import|^in|^key|^laptop|^layout|^like|^line|^link|^load|^lock|^mac|^mail|^man|^medic|^meh|^menuout|^mer|^mess|^mob|^mon|^more|^node|^notifi|^number|^oneto|^paper|^partition|^paycir|^percent|^phone|^pict|^plays|^pound|^power|^printer|^profile|^project|^proper|^pull|^push|^qrco|^read|^recon|^reden|^reload|^rest|^robot|^rock|^rota|^safe|^save|^scan|^sche|^search|^securi|^select|^send|^setting|^shake|^share|^shop|^sister|^skin|^smile|^solution|^sound|^split|^star|^subno|^swit|^sync|^table|^tagout|^tags|^team|^thunder|^totop|^tool|^tradem|^trans|^trophy|^ungroup|^unlock|^unload|^usb|^user|^verified|^video|^wallet|^whats|^wifi|^woman/i

    const data: DataType[] = menus
    // rowSelection objects indicates the need for row selection
    const tableRowSelection: TableRowSelection<DataType> = {
        onChange: (selectedRowKeys, selectedRows) => {
            console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        },
        onSelect: (record, selected, selectedRows) => {
            console.log(record, selected, selectedRows);
        },
        onSelectAll: (selected, selectedRows, changeRows) => {
            console.log(selected, selectedRows, changeRows);
        },
    };


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
        console.log('res', res);
        setMenus(res.rows.children)
    }
    useEffect(() => {
        getMenus()
    }, [update])
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

    const treeData: DataNode[] = menus

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
        getCheckboxProps: (record: any) => ({
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
        worksheet.addRows(menus);
        // 导出excel
        saveWorkbook(workbook, 'simple-demo.xlsx');
    }

    //新增菜单
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
        const res = await addMenuApi({ ...values, type: '0' })
        console.log('res', res);
        setUpdate('add')
        setOpenAddRole(false);
        // setOpenAddRole(false)
    };
    const closeAddRole = () => {
        setOpenAddRole(false)
        formRef.current?.resetFields()
    }



    // 新增按钮
    const [openButton, setOpenButton] = useState(false)
    const closeAddButton = () => {
        setOpenButton(false)
        formRef.current?.resetFields()
    }
    const onFinishButton = () => {

    }

    //打开图标modal框
    const [openModal, setOpenModal] = useState(false)




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


    const onSelectChange = (newSelectedRowKeys: []) => {
        setSelectedRowKeys(newSelectedRowKeys);
        deleteRef.current = newSelectedRowKeys
        console.log('addref', deleteRef.current);
    };
    //删除
    const deleteRef = useRef([])
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
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

    const hasSelected = selectedRowKeys.length > 0;

    //按钮样式
    const [style1, setStyle1] = useState({ width: '60px', lineHeight: '25px', color: 'rgb(58, 150, 189)', border: '1px solid rgb(58, 150, 189)', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer' })


    //用于判断选择的图标类型
    const [iconType, setIconType] = useState('direction')

    //图标数据
    const iconData: any = () => {
        switch (iconType) {
            case 'direction':
                return iconArr.filter(item => {
                    if (directionReg.test(item)) {
                        return item
                    }
                })
            case 'advice':
                return iconArr.filter(item => {
                    if (adviceReg.test(item)) {
                        return item
                    }
                })
            case 'edit':
                return iconArr.filter(item => {
                    if (editReg.test(item)) {
                        return item
                    }
                })
            case 'data':
                return iconArr.filter(item => {
                    if (dataReg.test(item)) {
                        return item
                    }
                })
            case 'general':
                return iconArr.filter(item => {
                    if (generalReg.test(item)) {
                        return item
                    }
                })
            case 'brand':
                return iconArr.filter(item => {
                    if (brandReg.test(item)) {
                        return item
                    }
                })
        }
    }
    //控制详情盒子显示隐藏
    const [showName, setShowName] = useState('')
    //用于储存点击图标的名称
    const [clickIcon, setClickIcon] = useState('')
    //展开关闭树操作
    const [treeDom, setTreeDom] = useState('none')
    return (
        <div>
            {contextHolder}
            {/* /新增菜单 */}

            <Modal
                centered
                open={openModal}
                onOk={() => setOpenModal(false)}
                onCancel={() => setOpenModal(false)}
                width={900}
                style={{ padding: '24px' }}
            >
                <div id='addMenuIcon'>
                    <div className='title'>
                        <div className={iconType === 'direction' ? 'choose' : 'unChoose'} onClick={() => setIconType('direction')}>方向性图标</div>
                        <div className={iconType === 'advice' ? 'choose' : 'unChoose'} onClick={() => setIconType('advice')}>指示性图标</div>
                        <div className={iconType === 'edit' ? 'choose' : 'unChoose'} onClick={() => setIconType('edit')}>编辑类图标</div>
                        <div className={iconType === 'data' ? 'choose' : 'unChoose'} onClick={() => setIconType('data')}>数据类图标</div>
                        <div className={iconType === 'general' ? 'choose' : 'unChoose'} onClick={() => setIconType('general')}>网站通用图标</div>
                        <div className={iconType === 'brand' ? 'choose' : 'unChoose'} onClick={() => setIconType('brand')}>品牌和标识</div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '20px' }}>
                        {
                            iconData().map((item: any, index: any) => <div style={{ padding: '5px', marginTop: '10px', position: 'relative' }}>
                                <div style={{ display: showName == item ? 'block' : 'none', position: 'absolute', top: '35px', left: '35px', border: '1px solid black', backgroundColor: '#fff', zIndex: '666', padding: '5px', fontSize: '10px' }}>{item}</div>
                                <div onMouseEnter={() => {
                                    setShowName(item)
                                }}
                                    onMouseLeave={() => {
                                        setShowName('')
                                    }}
                                    onClick={() => {
                                        setClickIcon(item)
                                        messageApi.open({
                                            type: 'success',
                                            content: '选中' + item,
                                        });
                                        formAddMenu.setFieldsValue({
                                            'icon': item
                                        })
                                        console.log('clickIcon', clickIcon);
                                    }} className={clickIcon == item ? 'iconParentOnClick' : 'iconParent'}>
                                    <Iconfont key={index} icon={item} />
                                </div>
                            </div>)
                        }
                    </div>
                </div>
            </Modal>

            <Drawer
                extra={
                    <Space style={{ position: 'absolute', bottom: '30px', right: '150px' }}>
                        <Button onClick={onClose} style={{ zIndex: '666' }}>取消</Button>
                    </Space>
                } title="新增菜单" placement="right" width='600px' onClose={closeAddRole} open={openAddRole} style={{ lineHeight: '30px', fontWeight: '300' }}>
                <Form
                    ref={formRef}
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 18 }}
                    name="nest-messages"
                    onFinish={onFinish}
                    style={{ maxWidth: 600 }}
                    form={formAddMenu}
                >
                    <Form.Item name='menuName' label="菜单名称" rules={[{ required: true, message: '菜单名称不能为空' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name='path' label="菜单URL" rules={[{ required: true, message: '菜单地址不能为空' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name='component' label="组件地址" rules={[{ required: true, message: '组件地址不能为空' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name='perms' label="相关权限">
                        <Input />
                    </Form.Item>
                    <Form.Item name='icon' label="菜单图标">
                        <Input placeholder='点击右侧按钮选择图标' onChange={(e) => console.log('e', e)
                        } addonAfter={<SettingOutlined onClick={() => {
                            setOpenModal(true)
                        }} />} />
                    </Form.Item>
                    <Form.Item name='orderNum' label="菜单排序">
                        <Input />
                    </Form.Item>

                    <Form.Item style={{ height: '0' }}>
                        <Button type='primary' htmlType='submit' style={{ position: 'fixed', bottom: '30px', right: '50px', zIndex: '999' }}>提交</Button>
                    </Form.Item>
                </Form>
                <div style={{ display: 'flex' }}>
                    <div>上级菜单：</div>
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
                <div style={{ height: '120px', width: '600px', backgroundColor: '#fff', position: 'fixed', right: '0px', bottom: '0', zIndex: '555' }}>
                    <Divider />
                    <Button style={{ position: 'absolute', top: '60px', left: '50px' }} onClick={() => {
                        if (treeDom === 'none') {
                            setTreeDom('block')
                        } else {
                            setTreeDom('none')
                        }
                    }}>
                        树操作
                        <AllIcon.UpOutlined />
                    </Button>
                    <div style={{ position: 'absolute', top: '-5px', left: '50px', display: treeDom }}>
                        <Button style={{ display: 'block', border: '0' }}>展开所有</Button>
                        <Button style={{ display: 'block', border: '0' }}>合并所有</Button>
                    </div>
                </div>
            </Drawer>

            {/* /新增按钮 */}
            <Drawer
                destroyOnClose={true}
                extra={
                    <Space style={{ position: 'absolute', bottom: '30px', right: '150px' }}>
                        <Button style={{ zIndex: '999' }} onClick={onClose}>取消</Button>
                    </Space>
                } title="新增按钮" placement="right" width='600px' onClose={closeAddButton} open={openButton} style={{ lineHeight: '30px', fontWeight: '300' }}>
                <Form
                    ref={formRef}
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 18 }}
                    name="nest-messages"
                    onFinish={onFinishButton}
                    style={{ maxWidth: 600 }}
                >
                    <Form.Item name='roleName' label="按钮名称" rules={[{ required: true, message: '按钮名称不能为空' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name='remark' label="相关权限">
                        <Input />
                    </Form.Item>
                    <Form.Item style={{ height: '0' }}>
                        <Button type='primary' htmlType='submit' style={{ position: 'fixed', bottom: '30px', right: '50px', zIndex: '999' }}>提交</Button>
                    </Form.Item>
                </Form>
                <div style={{ display: 'flex' }}>
                    <div>上级菜单：</div>
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
                <div style={{ height: '120px', width: '600px', backgroundColor: '#fff', position: 'fixed', right: '0px', bottom: '0', zIndex: '555' }}>
                    <Divider />
                    <Button style={{ position: 'absolute', top: '60px', left: '50px' }} onClick={() => {
                        if (treeDom === 'none') {
                            setTreeDom('block')
                        } else {
                            setTreeDom('none')
                        }
                    }}>
                        树操作
                        <AllIcon.UpOutlined />
                    </Button>
                    <div style={{ position: 'absolute', top: '-5px', left: '50px', display: treeDom }}>
                        <Button style={{ display: 'block', border: '0' }}>展开所有</Button>
                        <Button style={{ display: 'block', border: '0' }}>合并所有</Button>
                    </div>
                </div>
            </Drawer>


            {/* 修改 */}
            <Drawer
                extra={
                    <Space style={{ position: 'absolute', bottom: '30px', right: '150px' }}>
                        <Button onClick={onClose} style={{ zIndex: '666' }}>取消</Button>
                    </Space>
                } title="修改菜单" placement="right" width='600px' onClose={onCloseDetails} open={openDetails == 'update' ? true : false} style={{ lineHeight: '30px', fontWeight: '300' }}>
                <Form
                    ref={formRef}
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 18 }}
                    name="nest-messages"
                    onFinish={onFinish}
                    style={{ maxWidth: 600 }}
                    form={form}
                >
                    <Form.Item name='title' label="菜单名称" rules={[{ required: true, message: '菜单名称不能为空' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name='path' label="菜单URL" rules={[{ required: true, message: '菜单地址不能为空' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name='component' label="组件地址" rules={[{ required: true, message: '组件地址不能为空' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name='perms' label="相关权限">
                        <Input />
                    </Form.Item>
                    <Form.Item name='icon' label="菜单图标">
                        <Input placeholder='点击右侧按钮选择图标' onChange={(e) => console.log('e', e)
                        } addonAfter={<SettingOutlined onClick={() => {
                            setOpenModal(true)
                        }} />} />
                    </Form.Item>
                    <Form.Item name='order' label="菜单排序">
                        <Input />
                    </Form.Item>

                    <Form.Item style={{ height: '0' }}>
                        <Button type='primary' htmlType='submit' style={{ position: 'fixed', bottom: '30px', right: '50px', zIndex: '999' }}>提交</Button>
                    </Form.Item>
                </Form>
                <div style={{ display: 'flex' }}>
                    <div>上级菜单：</div>
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
                <div style={{ height: '120px', width: '600px', backgroundColor: '#fff', position: 'fixed', right: '0px', bottom: '0', zIndex: '555' }}>
                    <Divider />
                    <Button style={{ position: 'absolute', top: '60px', left: '50px' }} onClick={() => {
                        if (treeDom === 'none') {
                            setTreeDom('block')
                        } else {
                            setTreeDom('none')
                        }
                    }}>
                        树操作
                        <AllIcon.UpOutlined />
                    </Button>
                    <div style={{ position: 'absolute', top: '-5px', left: '50px', display: treeDom }}>
                        <Button style={{ display: 'block', border: '0' }}>展开所有</Button>
                        <Button style={{ display: 'block', border: '0' }}>合并所有</Button>
                    </div>
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
                    <Popconfirm
                        title="请选择创建类型"
                        icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                        cancelText='菜单'
                        okText='按钮'
                        onCancel={() => {
                            setOpenAddRole(true)
                            formRef.current?.resetFields()
                            setCheckedKeys2([])
                        }}
                        onConfirm={() => {
                            setOpenButton(true)
                            formRef.current?.resetFields()
                            setCheckedKeys2([])
                        }}
                    >
                        <Button style={style1} type='link'>新增</Button>
                    </Popconfirm>

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
                rowKey='id'
                columns={columns}
                rowSelection={tableRowSelection}
                dataSource={data}
            />
        </div>
    );
}

export default RolesManage