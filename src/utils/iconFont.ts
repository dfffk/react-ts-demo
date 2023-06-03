import * as Icons from '@ant-design/icons'
import React from 'react'

const Iconfont = (props:any) => {
  // 过田传入hnrons 是用有td图标的名字计名
  const { icon}=props
  return React.createElement(Icons[icon],{className:'icon'})
}
  
export default Iconfont