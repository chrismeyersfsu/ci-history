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

# Node and NPM repos
RUN curl -sL https://rpm.nodesource.com/setup_10.x | bash -

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
  nodejs \
  mongodb-org-shell

RUN pip install virtualenv

RUN mkdir /venv /tmp/parser
RUN virtualenv /venv/parser --python=/usr/bin/python3
ADD ./parser/requirements.txt /tmp/parser_requirements/

RUN /venv/parser/bin/pip install -r /tmp/parser_requirements/requirements.txt

VOLUME [ "/sys/fs/cgroup" ]
CMD ["/usr/sbin/init"]
