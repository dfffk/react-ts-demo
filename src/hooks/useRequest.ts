// 自定义 Hook 本身就是一个函数。
// 语法上和普通函数的区别在于，自定义 Hook 的命名是否以 use 开头。
// 使用上和普通函数的区别在于，自定义 Hook 函数中可以使用其他的 Hook。
import { useDispatch } from 'react-redux'
import { getRolesApi } from "../apis/roles";
import { setRoles } from "./../store/modules/rolesSlice";
const useRequest = () => {
    const dispatch = useDispatch();
    // 公共的异步方法：获取角色数据
    const getRolesAsync = async (data:any) => {
        // console.log('data',data);
        
        // 发送请求
        const res:any = await getRolesApi(data)
        
        // console.log('角色数据',res);
        
        // 调用状态机中方法，来修改状态机中的数据
        dispatch(setRoles(res));
    }
    return { getRolesAsync }
}
export default useRequest;