import React, { useState, useRef } from 'react'
import logo from '../assets/logo.png'
import style from './login.module.less'
import { UserOutlined, LockOutlined, MailOutlined, MobileOutlined, PlusOutlined } from '@ant-design/icons'
import { loginApi } from '../apis/login';
import { useNavigate } from 'react-router-dom';
import {
    message,
    Form,
    Input,
    Button,
    Radio,
    Select,
    Cascader,
    DatePicker,
    InputNumber,
    TreeSelect,
    Switch,
    Checkbox,
    Upload,
} from 'antd';

const { RangePicker } = DatePicker;
const { TextArea } = Input;


const LoginPage = () => {
    const [showDom, setShowDom] = useState('one')
    const navigate = useNavigate()
    const onFinish = async (values: any) => {
        const res: any = await loginApi(`username=${values.username}&password=${values.password}`)

        if (res.message == '认证成功') {
            message.open({
                type: 'success',
                content: '登录成功',
            });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data))
            navigate('/home')
        } else {
            message.open({
                type: 'error',
                content: '登录失败',
            });
        }
    };
    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };
    //用于滚动账号登录和手机登录
    const [scrollStyle, setScrollStyle] = useState(style.choose0)
    //账号登录和手机号登录的切换
    const [chooseData, setChooseData] = useState('1')
    const changeLogin = (choose: string) => {
        if (choose == '2' && scrollStyle === style.choose0) {
            setScrollStyle(style.choose1)
        }
        if (choose == '1' && scrollStyle === style.choose1) {
            setScrollStyle(style.choose2)
        }
        if (choose == '2' && scrollStyle === style.choose2) {
            setScrollStyle(style.choose1)
        }
        setChooseData(choose)
    }
    const changeDom = () => {
        switch (showDom) {
            case 'one':
                return (
                    <>
                        <div className={style.choose}>
                            <div style={{ marginRight: '32px' }} className={chooseData == '1' ? style.login1 : style.login2} onClick={() => {
                                changeLogin('1')
                            }}>账户密码登录</div>
                            <div className={chooseData == '2' ? style.login1 : style.login2} onClick={() => {
                                changeLogin('2')
                            }}>手机号登录</div>
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <div className={scrollStyle}>
                                <UserOutlined style={{ position: 'absolute', width: '20px', height: '20px', top: '10px', left: '8px', zIndex: '999' }} />
                                <LockOutlined style={{ position: 'absolute', width: '20px', height: '20px', top: '76px', left: '8px', zIndex: '999' }} />
                                <MobileOutlined style={{ position: 'absolute', width: '20px', height: '20px', top: '10px', left: '372px', zIndex: '999' }} />
                                <MailOutlined style={{ position: 'absolute', width: '20px', height: '20px', top: '76px', left: '372px', zIndex: '999' }} />
                                <Form
                                    name="basic1"
                                    labelCol={{ span: 8 }}
                                    wrapperCol={{ span: 16 }}
                                    style={{ width: '364px', boxSizing: 'border-box', zIndex: '1', position: 'relative' }}
                                    onFinish={onFinish}
                                    onFinishFailed={onFinishFailed}
                                    autoComplete="off"
                                    initialValues={{ username: 'bobo', password: '1234qwer' }}
                                >

                                    <Form.Item
                                        label=""
                                        name="username"
                                        rules={[{ required: true, message: '请输入您的用户名' }]}
                                        style={{ position: 'relative' }}
                                    >

                                        <Input style={{ width: '364px', height: '40px', borderRadius: 0, paddingLeft: '30px' }} />
                                    </Form.Item>

                                    <Form.Item
                                        label=""
                                        name="password"
                                        rules={[{ required: true, message: '请输入您的密码' }]}

                                    >
                                        <Input.Password style={{ width: '364px', height: '40px', borderRadius: 0, paddingLeft: '30px' }} />
                                    </Form.Item>
                                    <Form.Item>
                                        <Button type="primary" htmlType='submit'
                                            style={{ width: '364px', color: '#fff', height: '40px', borderRadius: 0 }}
                                        >
                                            登录
                                        </Button>
                                    </Form.Item>
                                </Form>
                                <Form
                                    name="basic2"
                                    labelCol={{ span: 8 }}
                                    wrapperCol={{ span: 16 }}
                                    style={{ width: '364px', boxSizing: 'border-box', zIndex: '1', position: 'relative' }}
                                    onFinish={onFinish}
                                    onFinishFailed={onFinishFailed}
                                    autoComplete="off"
                                >

                                    <Form.Item
                                        label=""
                                        name="username"
                                        rules={[{ required: false, message: '请输入您的用户名' }]}
                                        style={{ position: 'relative' }}
                                    >

                                        <Input style={{ width: '364px', height: '40px', borderRadius: 0, paddingLeft: '30px' }} />
                                    </Form.Item>

                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Form.Item
                                            label=""
                                            name="phone"
                                            rules={[{ required: false, message: '请输入您的密码' }]}

                                        >
                                            <Input style={{ width: '240px', height: '40px', borderRadius: 0, paddingLeft: '30px' }} />
                                        </Form.Item>
                                        <Button style={{ width: '116px', height: '40px', borderRadius: 0 }}>
                                            获取验证码
                                        </Button>
                                    </div>
                                    <Form.Item>
                                        <Button type="primary" htmlType='submit'
                                            style={{ width: '364px', color: '#fff', height: '40px', borderRadius: 0 }}
                                        >
                                            登录
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </div>
                        </div>


                        <div style={{ width: '100%', fontSize: '13px', lineHeight: '20px', display: 'flex', justifyContent: 'space-between', color: 'rgb(58, 150, 189)', cursor: 'pointer' }}>
                            <span onClick={() => setShowDom('two')}>注册账户</span>
                            <span onClick={() => setShowDom('three')}>商家入驻</span>
                        </div>
                    </>
                )
            case 'two':
                return (
                    <>
                        <Form
                            name="basic2"
                            labelCol={{ span: 8 }}
                            wrapperCol={{ span: 16 }}
                            style={{ width: '364px', boxSizing: 'border-box', zIndex: '1', position: 'relative' }}
                            autoComplete="off"
                        >

                            <Form.Item
                                label=""
                                name="username"
                                rules={[{ required: true, message: '请输入您的用户名' }]}
                                style={{ position: 'relative' }}
                            >

                                <Input style={{ width: '364px', height: '40px', borderRadius: 0, paddingLeft: '30px' }} placeholder='账号' />
                            </Form.Item>

                            <Form.Item
                                label=""
                                name="password"
                                rules={[{ required: true, message: '请输入您的密码' }]}

                            >
                                <Input.Password style={{ width: '364px', height: '40px', borderRadius: 0, paddingLeft: '30px' }} placeholder='至少6位密码' />
                            </Form.Item>
                            <Form.Item
                                label=""
                                name="password"
                                rules={[{ required: true, message: '请输入您的密码' }]}

                            >
                                <Input.Password style={{ width: '364px', height: '40px', borderRadius: 0, paddingLeft: '30px' }} placeholder='确认密码' />
                            </Form.Item>
                        </Form>
                        <div style={{ width: '100%', fontSize: '13px', lineHeight: '20px', display: 'flex', justifyContent: 'space-between', color: 'rgb(58, 150, 189)', alignItems: 'center', cursor: 'pointer' }}>
                            <Button type='primary' style={{ width: '184px', borderRadius: '0', height: '40px' }}>立即注册</Button>
                            <span onClick={() => setShowDom('one')}>使用已登录账户</span>
                        </div>
                    </>
                )
            case 'three':
                return (
                    <>
                        <Form
                            labelCol={{ span: 40 }}
                            wrapperCol={{ span: 40 }}
                            layout="vertical"
                            style={{ maxWidth: 600 }}

                        >
                            <Form.Item label="商铺类型" name='shopType' rules={[{ required: true, message: '请选择商铺类型' }]}>
                                <Radio.Group>
                                    <Radio value="apple"> 充电桩 </Radio>
                                    <Radio value="pear"> 其它 </Radio>
                                </Radio.Group>
                            </Form.Item >
                            <Form.Item label="店铺名" name='shopName' rules={[{ required: true, message: '店铺名不能为空' }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item label="手机号" name='phoneNumber' rules={[{ required: true, message: '请输入正确的手机号' }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item label="店铺地址" name='shopPosition' rules={[{ required: true, message: '店铺地址不能为空' }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item label="注册人" name='regiester' rules={[{ required: true, message: '注册人不能为空' }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item label="身份证号" name='shenfenzhengnumber' rules={[{ required: true, message: '请输入正确的身份证号' }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item label="身份证照片" valuePropName="fileList" name='shenImage' rules={[{ required: true, message: '请上传身份证照片' }]}>
                                <Upload action="/upload.do" listType="picture-card">
                                    <div>
                                        <PlusOutlined />
                                        <div style={{ marginTop: 8 }}>请上传图片</div>
                                    </div>
                                </Upload>
                            </Form.Item>
                            <Form.Item label="营业执照编号" name='licenseNumber' rules={[{ required: true, message: '营业执照编号不能为空' }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item label="营业执照照片" valuePropName="fileList" name='licenseImage' rules={[{ required: true, message: '请上传营业执照照片' }]}>
                                <Upload action="/upload.do" listType="picture-card">
                                    <div>
                                        <PlusOutlined />
                                        <div style={{ marginTop: 8 }}>请上传图片</div>
                                    </div>
                                </Upload>
                            </Form.Item>
                            <div style={{ width: '100%', fontSize: '13px', display: 'flex', justifyContent: 'space-between', color: 'rgb(58, 150, 189)', cursor: 'pointer', paddingBottom: '50px' }}>
                                <Form.Item >
                                    <Button type='primary' htmlType='submit' style={{ width: '184px', borderRadius: '0', height: '40px' }}>立即申请</Button>
                                </Form.Item>
                                <span onClick={() => setShowDom('one')} style={{ marginTop: '10px' }}>使用已登录账户</span>
                            </div>
                        </Form>
                    </>
                )
            default:
                return <p>代码出错</p>
        }
    }
    return (
        <div className={style.outBox}>
            <div className={style.bigBox}>
                <div className={style.title}>
                    <img src={logo} className={style.img} />
                    <span>赤兔养车</span>
                </div>
                {
                    changeDom()
                }
            </div>
        </div>
    )
}

export default LoginPage