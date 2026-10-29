# 在线商城

PDF 第三个项目的在线商城。前端在根目录，`server` 是独立 Express API；商品、购物车、地址、订单创建和取消订单都会调用后端，不再使用浏览器 localStorage 模拟。

包含：商品展示筛选、购物车数量和库存校验、地址管理、创建订单、订单取消与库存恢复。

## 部署顺序

1. Railway 新建服务，仓库根目录选择 `server`，部署成功后先访问 `https://你的域名/api/health` 并截图。
2. 在根目录 `config.js` 中，把 `window.MALL_API_ORIGIN` 改成 Railway 域名；然后本地 Git 提交并推送。
3. Netlify 部署本项目根目录：Build command 留空，Publish directory 填 `.`。

> 课堂截图至少保留：Railway 成功日志或 `/api/health`、商品加入购物车、填写地址并成功创建订单。
