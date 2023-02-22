#!/usr/bin/env python
# @FileName : model
# @Time : 2023/2/22 9:46
# @Anthor : Administrator
# @SofeWare : pythonProject1
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Column,Integer,String,DateTime,Text
from datetime import datetime

app = Flask(__name__)
db = SQLAlchemy(app)
app.config['SQLALCHEMY_DATABASE_URI'] = "mysql+pymysql://root:2069079840@localhost:3306/manage?charset=utf8"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_COMMIT_TEARDOWN'] = True


class sendfile(db.Model):
    __tablename__ = "sendfile"
    id = Column(Integer,primary_key=True,autoincrement=True,comment="编号")
    file_name = Column(String(100),nullable=True,comment="文件名称")
    file_type = Column(String(100),nullable=True,comment="文件类型")
    file_size = Column(String(100),nullable=True,comment="文件大小")
    file_path = Column(String(100),nullable=True,comment="文件路径")
    remarks = Column(Text,nullable=True,comment="文件备注")
    create_time = Column(DateTime,default=datetime.now(),comment="创建时间")

    def to_json(self):
        return{
            "id":self.id,
            "file_name":self.file_name,
            "file_type":self.file_type,
            "file_size":self.file_size,
            "file_path":self.file_path,
            "remarks":self.remarks
        }

    __table_args__ = {
        'mysql_charset':"utf8"
    }

if __name__ == "__main__":
    with app.app_context():
        # db.create_all()
        sendfile = sendfile(file_name="你好",file_type="png",file_size="100")
        db.session.add(sendfile)
        db.session.commit()
        db.session.close()
