#!/usr/bin/env python
# @FileName : sendfile
# @Time : 2023/2/22 11:40
# @Anthor : Administrator
# @SofeWare : pythonProject1
from com.common.model import db,sendfile


class OperateSendFile:
    def get_all(self):
        return sendfile.query.all()