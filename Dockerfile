FROM quay.io/lyfe00011/md:beta
RUN git clone https://github.com/macksyn/levanter.git /root/macksyn/
WORKDIR /root/macksyn/
RUN yarn install
CMD ["npm", "start"]
