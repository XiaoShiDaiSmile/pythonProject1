#!/usr/bin/env python
# @FileName : apis
# @Time : 2023/2/22 9:38
# @Anthor : Administrator
# @SofeWare : pythonProject1
from  flask import Blueprint
from flask_restful import Api,Resource,reqparse
from com.service.sendfile import OperateSendFile

apis = Blueprint("apis",__name__)
api = Api(apis)


class file(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument("file_name")
        self.args = self.parser.parse_args()

    def get(self):
        data = OperateSendFile().get_all()
        print(data)
        pass
        return {"code":200,"msg":"success","data":[item.to_json() for item in data]}

    def post(self):
        print("post")
        pass


api.add_resource(file,'/file')

