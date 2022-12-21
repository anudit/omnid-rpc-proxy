FROM python:3.9-alpine
ARG PORT

WORKDIR /app
COPY . .

RUN apk update && apk upgrade
RUN apk add gcc make g++

RUN pip3 install -r requirements.txt
RUN solc-select install all

RUN apk add --update nodejs npm
RUN npm install -g pnpm
RUN pnpm install
RUN pnpm build

RUN echo '@edge https://dl-cdn.alpinelinux.org/alpine/edge/community' >> /etc/apk/repositories && \
    apk -U upgrade && \
    apk -v add tor@edge curl && \
    chmod 700 /var/lib/tor && \
    rm -rf /var/cache/apk/* && \
    tor --version

RUN mkdir /var/lib/tor/hidden_service
RUN cat torrc
COPY torrc /etc/tor/
RUN chown -R tor:root /var/lib/tor
RUN chmod -R 700 /var/lib/tor
RUN chmod 755 setup_tor.sh
RUN chmod 755 helios 
RUN chmod 755 run_helios.sh 

# RUN wget https://github.com/a16z/helios/releases/download/0.1.0/helios_linux_amd64.tar.gz
# RUN tar -xvf helios_linux_amd64.tar.gz --directory /app
# RUN rm -rf helios_linux_amd64.tar.gz

USER tor
EXPOSE 8853/udp 9150/tcp 80/tcp

CMD ["pnpm", "startwithtor"]
