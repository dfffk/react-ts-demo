import request from "../utils/request";

//获取字典数据

export const getDictApi=()=>request.get('/dict?pageSize=10&pageNum=1')