# Stage 1: Build
FROM node:lts AS builder

# ตั้งค่า Working Directory
WORKDIR /usr/src/app

# คัดลอก package.json และ package-lock.json
COPY package*.json ./

# ติดตั้ง dependencies
RUN npm install --production

# คัดลอกโค้ดแอปพลิเคชัน
COPY . .

# Stage 2: Production Image
FROM node:lts

# ตั้งค่า Working Directory
WORKDIR /usr/src/app

# คัดลอก dependencies จาก builder stage
COPY --from=builder /usr/src/app/node_modules ./node_modules

# คัดลอกโค้ดแอปพลิเคชันจาก builder stage
COPY --from=builder /usr/src/app ./

# Expose port ที่แอปพลิเคชันใช้งาน
EXPOSE 3000

# รันแอปพลิเคชัน
CMD [ "node", "app.js" ]
