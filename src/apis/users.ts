import request from "../utils/request";
//获取用户数据
export const getUsersApi=(data:any)=>request.get('/user',{params:data})
//根据id删除用户
export const deleteUserApi=(id:string)=>request.delete(`/user/${id}`)

//新增用户
export const addUserApi=(data:any)=>{
    // console.log('redata',data);
    return request.post('/user',data)
}

//获取用户类型和状态
export const getUserTypeApi=(data:any)=>request.get(`/tUser/shop/getUserTypeAndStatus/${data.username}/${data.password}`)

//修改用户
export const updateUserApi=(data:any)=>{
    console.log('data',data);
    return request.put('/user',data)
}