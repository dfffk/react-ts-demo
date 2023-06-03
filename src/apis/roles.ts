import request from "../utils/request";

//获取角色数据
export const getRolesApi=(data:any)=>request.get('/role',data)


//根据id获取角色菜单
export const getRoleByIdApi=(id:string|number)=>request.get(`/role/menu/${id}`)

//新增角色
export const addRoleApi=(data:any)=>{
    console.log('data',data);
    return request.post('/role',data)
}

//根据id删除角色
export const deleteRoleApi=(id:string)=>request.delete(`/role/${id}`)

//修改角色
export const updateRoleApi=(data:any)=>request.put('/role',data)