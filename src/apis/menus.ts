import request from "../utils/request";

//获取所有菜单数据
export const getMenusApi=()=>request.get('/menu')


//新增菜单
export const addMenuApi=(data:any)=>request.post('/menu',data)