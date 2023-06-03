import { message } from "antd";
import axios from "axios";

const request=axios.create({
    baseURL:'http://xawn.f3322.net:8012',
    timeout:5000,
})
if(localStorage.token){
  request.defaults.headers['Authentication']=localStorage.token
  // console.log('请求头添加成功');
}
request.defaults.headers['Content-Type']='application/x-www-form-urlencoded'
request.interceptors.response.use(
    (res) => {
      // console.log(res.data);
      // console.log('请求成功',res);
      
          return res.data;
          
      },
    (err)=>{
        message.open({
            type: 'error',
            content: '请求失败',
          });
          console.log('请求错误',err);
          return err
    }
)

export default request