FROM quay.io/lyfe00011/md:beta
RUN git clone https://github.com/macksyn/levanter.git /root/Macksyn/
WORKDIR /root/Macksyn/
RUN yarn install
CMD ["npm", "start"]
