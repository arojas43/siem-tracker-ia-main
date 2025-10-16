# Build app stage
FROM node:latest AS appbuild

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# ARG ENV=dev
ARG stage
ENV STAGE=$stage
RUN echo "My environment STAGE: $STAGE"
RUN npm run build:$STAGE



# Nginx stage
FROM nginx:latest AS ngnix

#Copy the html files to /usr/share/nginx/html/
COPY --from=appbuild /app/dist /usr/share/nginx/html

#Copy conf file to default
COPY cicd/default.conf /etc/nginx/conf.d/default.conf 
