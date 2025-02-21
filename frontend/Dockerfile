# Sử dụng phiên bản nhẹ của Node.js
FROM node:18-slim

# Thiết lập thư mục làm việc
WORKDIR /app 

# Sao chép và cài đặt dependencies
COPY package.json package-lock.json ./ 
RUN npm ci 

# Sao chép toàn bộ mã nguồn
COPY . . 

# Expose port của Vite
EXPOSE 5173 

# Chạy ứng dụng
CMD ["npm", "run", "dev"]
