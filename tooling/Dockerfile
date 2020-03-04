FROM centos:7
ENV container docker
RUN (cd /lib/systemd/system/sysinit.target.wants/; for i in *; do [ $i == \
systemd-tmpfiles-setup.service ] || rm -f $i; done); \
rm -f /lib/systemd/system/multi-user.target.wants/*;\
rm -f /etc/systemd/system/*.wants/*;\
rm -f /lib/systemd/system/local-fs.target.wants/*; \
rm -f /lib/systemd/system/sockets.target.wants/*udev*; \
rm -f /lib/systemd/system/sockets.target.wants/*initctl*; \
rm -f /lib/systemd/system/basic.target.wants/*;\
rm -f /lib/systemd/system/anaconda.target.wants/*;

# MongoDB client tools
ADD ./tooling/mongodb.repo /etc/yum.repos.d/mongodb.repo

#RUN yum -y update && yum -y install epel-release
RUN yum -y install epel-release
RUN yum -y install \
  gcc \
  python36-devel \
  python36-setuptools \
  python-pip \
  gcc-c++ \
  make \
  mongodb-org-shell

RUN pip install "virtualenv<20"

# Tools / parser / data init
RUN mkdir /venv /tmp/parser
RUN virtualenv /venv/parser --python=/usr/bin/python3
ADD ./parser/requirements.txt /tmp/parser_requirements/
RUN /venv/parser/bin/pip install -r /tmp/parser_requirements/requirements.txt

# API Server
RUN virtualenv /venv/server --python=/usr/bin/python3
ADD ./server/api/requirements.txt /tmp/server_requirements/
RUN /venv/server/bin/pip install -r /tmp/server_requirements/requirements.txt

ENV LANG en_US.UTF-8

VOLUME [ "/sys/fs/cgroup" ]
CMD ["/usr/sbin/init"]
