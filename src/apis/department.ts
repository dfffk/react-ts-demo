import request from "../utils/request";

//获取部门数据
export const getDpartmentApi=()=>request.get('/dept')