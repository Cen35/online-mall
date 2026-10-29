import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())

const products = [
  ['白瓷咖啡杯','家居',49,'https://picsum.photos/id/1060/500/500'],['山雾香氛蜡烛','生活',68,'https://picsum.photos/id/225/500/500'],
  ['蓝灰手账本','文具',32,'https://picsum.photos/id/24/500/500'],['原木书签','文具',18,'https://picsum.photos/id/175/500/500'],
  ['晨光布袋','生活',39,'https://picsum.photos/id/1074/500/500'],['小枝花瓶','家居',58,'https://picsum.photos/id/292/500/500'],
  ['阅读台灯','家居',129,'https://picsum.photos/id/250/500/500'],['棉麻餐垫','生活',26,'https://picsum.photos/id/1080/500/500'],
].map((item, index) => ({ id:index + 1, name:item[0], category:item[1], price:item[2], image:item[3], stock:20, description:`${item[0]}，适合安静日常的一件小物。` }))
const carts = new Map([[1, []]])
const addresses = new Map([[1, []]])
const orders = new Map([[1, []]])
const userId = (req) => Number(req.header('x-demo-user') || 1)
const cartTotal = (items) => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
const hydrateCart = (id) => (carts.get(id) || []).map((item) => ({ ...item, product: products.find((product) => product.id === item.productId) })).filter((item) => item.product)

app.get('/api/health', (_req, res) => res.json({ ok:true, service:'online-mall-api', time:new Date().toISOString() }))
app.get('/api/products', (req, res) => {
  const keyword = String(req.query.keyword || '').toLowerCase(), category = String(req.query.category || '')
  res.json(products.filter((item) => (!keyword || `${item.name}${item.description}`.toLowerCase().includes(keyword)) && (!category || item.category === category)))
})
app.get('/api/products/:id', (req, res) => { const item = products.find((product) => product.id === Number(req.params.id)); item ? res.json(item) : res.status(404).json({ message:'商品不存在。' }) })
app.get('/api/cart', (req, res) => { const items = hydrateCart(userId(req)); res.json({ items, total:cartTotal(items) }) })
app.post('/api/cart', (req, res) => {
  const id = userId(req), product = products.find((item) => item.id === Number(req.body.productId)), quantity = Math.max(1, Number(req.body.quantity || 1))
  if (!product) return res.status(404).json({ message:'商品不存在。' })
  const list = carts.get(id) || [], existing = list.find((item) => item.productId === product.id), next = (existing?.quantity || 0) + quantity
  if (next > product.stock) return res.status(400).json({ message:'库存不足，不能加入购物车。' })
  if (existing) existing.quantity = next; else list.push({ productId:product.id, quantity })
  carts.set(id, list); res.status(201).json({ ok:true })
})
app.put('/api/cart/:productId', (req, res) => {
  const id = userId(req), list = carts.get(id) || [], item = list.find((row) => row.productId === Number(req.params.productId)), product = products.find((row) => row.id === Number(req.params.productId)), quantity = Number(req.body.quantity)
  if (!item || !product) return res.status(404).json({ message:'购物车商品不存在。' })
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > product.stock) return res.status(400).json({ message:'数量无效或超过库存。' })
  item.quantity = quantity; res.json({ ok:true })
})
app.delete('/api/cart/:productId', (req, res) => { const id=userId(req); carts.set(id, (carts.get(id)||[]).filter((item)=>item.productId !== Number(req.params.productId))); res.status(204).end() })
app.get('/api/addresses', (req, res) => res.json(addresses.get(userId(req)) || []))
app.post('/api/addresses', (req, res) => {
  const id=userId(req), { name, phone, detail }=req.body
  if (!name || !phone || !detail) return res.status(400).json({ message:'请完整填写收货地址。' })
  const list=addresses.get(id)||[], address={ id:Date.now(), name, phone, detail, isDefault:list.length===0 }
  list.push(address); addresses.set(id,list); res.status(201).json(address)
})
app.put('/api/addresses/:id/default', (req,res)=>{ const list=addresses.get(userId(req))||[], found=list.find((item)=>item.id===Number(req.params.id)); if(!found)return res.status(404).json({message:'地址不存在。'}); list.forEach((item)=>item.isDefault=item.id===found.id);res.json(found) })
app.delete('/api/addresses/:id', (req,res)=>{const id=userId(req), list=(addresses.get(id)||[]).filter((item)=>item.id!==Number(req.params.id)); if(list.length)list[0].isDefault=true;addresses.set(id,list);res.status(204).end()})
app.get('/api/orders', (req,res)=>res.json(orders.get(userId(req))||[]))
app.post('/api/orders', (req,res)=>{
  const id=userId(req), list=hydrateCart(id), address=(addresses.get(id)||[]).find((item)=>item.isDefault)
  if(!list.length)return res.status(400).json({message:'购物车为空。'});if(!address)return res.status(400).json({message:'请先添加默认收货地址。'})
  for(const item of list)if(item.quantity>item.product.stock)return res.status(400).json({message:`${item.product.name} 库存不足。`})
  list.forEach((item)=>item.product.stock-=item.quantity)
  const order={id:Date.now(),orderNo:`ORD${Date.now()}`,status:'pending',createdAt:new Date().toISOString(),address,items:list,total:cartTotal(list)}
  orders.set(id,[order,...(orders.get(id)||[])]);carts.set(id,[]);res.status(201).json(order)
})
app.post('/api/orders/:id/cancel',(req,res)=>{const list=orders.get(userId(req))||[],order=list.find((item)=>item.id===Number(req.params.id));if(!order)return res.status(404).json({message:'订单不存在。'});if(order.status!=='pending')return res.status(400).json({message:'只有待支付订单可以取消。'});order.status='cancelled';order.items.forEach((item)=>item.product.stock+=item.quantity);res.json(order)})
if (!process.env.NETLIFY && !process.env.VERCEL) app.listen(process.env.PORT || 3003,()=>console.log('Online mall API started'))
export { app }
