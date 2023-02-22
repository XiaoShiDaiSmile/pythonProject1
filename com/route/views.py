#!/usr/bin/env python
# @FileName : views
# @Time : 2023/2/22 9:11
# @Anthor : Administrator
# @SofeWare : pythonProject1
from flask import Blueprint,render_template,request


views = Blueprint('views',__name__)


@views.route("/")
def index():
    return render_template("admin/index.html")

