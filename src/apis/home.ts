import request from "../utils/request";

//获取图标数据

export const getChartsApi=(name:string)=>request.get(`/index/${name}`)
