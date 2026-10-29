# 在线商城数据库设计（MySQL）

正式数据库使用以下表结构；金额使用 `DECIMAL(10,2)`，订单创建与取消应放进事务。

```sql
CREATE TABLE users (id BIGINT PRIMARY KEY AUTO_INCREMENT, username VARCHAR(50) UNIQUE NOT NULL, email VARCHAR(120) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE products (id BIGINT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(120) NOT NULL, description TEXT, price DECIMAL(10,2) NOT NULL, stock INT NOT NULL DEFAULT 0, images JSON, category VARCHAR(60), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP);
CREATE TABLE cart_items (id BIGINT PRIMARY KEY AUTO_INCREMENT, user_id BIGINT NOT NULL, product_id BIGINT NOT NULL, quantity INT NOT NULL, UNIQUE KEY uk_cart_item(user_id,product_id), FOREIGN KEY(user_id) REFERENCES users(id), FOREIGN KEY(product_id) REFERENCES products(id));
CREATE TABLE addresses (id BIGINT PRIMARY KEY AUTO_INCREMENT, user_id BIGINT NOT NULL, name VARCHAR(50) NOT NULL, phone VARCHAR(30) NOT NULL, province VARCHAR(40), city VARCHAR(40), district VARCHAR(40), detail VARCHAR(255) NOT NULL, is_default BOOLEAN DEFAULT FALSE, FOREIGN KEY(user_id) REFERENCES users(id));
CREATE TABLE orders (id BIGINT PRIMARY KEY AUTO_INCREMENT, order_no VARCHAR(40) UNIQUE NOT NULL, user_id BIGINT NOT NULL, address_id BIGINT, total_amount DECIMAL(10,2) NOT NULL, status ENUM('pending','paid','shipped','completed','cancelled') DEFAULT 'pending', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(user_id) REFERENCES users(id));
CREATE TABLE order_items (id BIGINT PRIMARY KEY AUTO_INCREMENT, order_id BIGINT NOT NULL, product_id BIGINT NOT NULL, quantity INT NOT NULL, price DECIMAL(10,2) NOT NULL, FOREIGN KEY(order_id) REFERENCES orders(id), FOREIGN KEY(product_id) REFERENCES products(id));
```

课程功能：商品列表/详情；购物车添加、修改数量、删除、库存校验；地址增删改查及默认地址；创建订单、订单列表/详情、待支付订单取消并恢复库存。
