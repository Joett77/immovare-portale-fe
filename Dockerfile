FROM nginx:1.25.3-alpine3.18-slim

RUN apk add --update curl wget

COPY /dist/pwb_frontend/browser /usr/share/nginx/html

COPY ./docker/nginx.conf /etc/nginx/conf.d/default.conf

RUN chown -R nginx:nginx /usr/share/nginx/html

RUN mv /usr/share/nginx/html/index.csr.html /usr/share/nginx/html/index.html
