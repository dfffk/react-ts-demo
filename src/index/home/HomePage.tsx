import React, { useEffect, useMemo, useState } from 'react'
import './home.less'
import ReactEcharts from 'echarts-for-react'
import { getChartsApi } from '../../apis/home'
const HomePage = () => {
    const [imgSrc, setImgSrc] = useState('')
    const userInfo = JSON.parse(localStorage.user)
    const [chartsData, setChartsData]: any = useState({})
    const [xAxisData, setXAxisData]: any = useState([])
    const [seriesData, setSeriesData]: any = useState([])
    const [seriesData2, setSeriesData2]: any = useState([])
    const getCharts = async () => {
        const res = await getChartsApi(userInfo.user.username)
        setChartsData(res.data)
        setXAxisData(['', '', '', '', '', res.data.lastSevenUserVisitCount[0].days, res.data.lastSevenUserVisitCount[1].days])
        setSeriesData(['', '', '', '', '', res.data.lastSevenUserVisitCount[0].count, res.data.lastSevenUserVisitCount[1].count])
        setSeriesData2(['', '', '', '', '', res.data.lastSevenVisitCount[0].count, res.data.lastSevenVisitCount[1].count])
        console.log('res', res.data);
    }

    const option = useMemo(() => {
        return {
            title: {
                text: '近七日系统访问记录',
                textStyle: {
                    fontSize: '12px'
                }
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: ['您', '总数']
            },

            calculable: true,
            xAxis: [
                {
                    type: 'category',
                    // prettier-ignore
                    data: xAxisData
                }
            ],
            yAxis: [
                {
                    type: 'value'
                }
            ],
            series: [
                {
                    name: '您',
                    type: 'bar',
                    data: seriesData,

                },
                {
                    name: '总数',
                    type: 'bar',
                    data: seriesData2,

                }
            ]
        }
    }, [xAxisData, seriesData, seriesData2])
    useEffect(() => {
        getCharts()
        setImgSrc('http://xawn.f3322.net:8002/distremote/static/avatar/' + userInfo.user.avatar)
    }, [])
    const loginTime = userInfo.exipreTime.slice(0, 4) + '-' + userInfo.exipreTime.slice(4, 6) + '-' + userInfo.exipreTime.slice(6, 8) + ' ' +
        userInfo.exipreTime.slice(8, 10) + ':' + userInfo.exipreTime.slice(10, 12) + ':' + userInfo.exipreTime.slice(12, 14);
    return (
        <>
            <div id='homePage'>
                <div className='top'>
                    <div className='inner'>
                        <div className='left'>
                            <img src={imgSrc} alt="" />
                            <div>
                                <h4 style={{ fontSize: '18px', color: '#000' }}>晚上好,{userInfo.user.username},今天帮助别人解决问题了吗</h4>
                                <p style={{ fontSize: '13px', color: '#aaa' }}>{userInfo.user.deptName}   |   {userInfo.roles[0]}  </p>
                                <p style={{ color: '#aaa' }}>上次登录时间：{loginTime}</p>
                            </div>
                        </div>
                        <div>
                            <div style={{
                                display: 'flex', width: '250px', justifyContent: 'space-between', alignItems: 'center', lineHeight: '38px', color: '#aaa'
                            }}>
                                <div>今日IP</div>
                                <div>今日访问量</div>
                                <div>总访问量</div>
                            </div>
                            <div style={{ display: 'flex', width: '250px', justifyContent: 'space-between', alignItems: 'center', lineHeight: '38px', color: 'rgb(58, 150, 189)' }}>
                                <div style={{ cursor: 'pointer' }}>{chartsData.todayIp}</div>
                                <div style={{ cursor: 'pointer' }}>{chartsData.todayVisitCount}</div>
                                <div style={{ cursor: 'pointer' }}>{chartsData.totalVisitCount}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='bottom'>
                    <div className='bottom_left'>
                        <ReactEcharts option={option} style={{ width: '100%', height: 300, marginTop: '50px' }}></ReactEcharts>
                    </div>
                    <div className='bottom_right'>
                        <div className='bottom_right_title' style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ padding: '20px 30px' }}>进行中的项目</span> <a href='http://www.egz234.cn:666' style={{ padding: '20px 30px' }}>所有项目</a></div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default HomePage