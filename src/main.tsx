import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import 'antd/dist/reset.css'
import { store } from './store';
import { Provider } from 'react-redux'
import zhCN from 'antd/locale/zh_CN';
import { ConfigProvider } from 'antd';



ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <ConfigProvider locale={zhCN}>
        <Provider store={store}>
            <App />
        </Provider>
    </ConfigProvider>

)

