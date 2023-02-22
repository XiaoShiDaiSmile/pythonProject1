from flask import Flask
from datetime import timedelta
from flask_assets import Environment,Bundle
from livereload import Server
from com.route.views import views
from com.route.apis import apis
from com.common.model import db

app = Flask(__name__)


class Main:
    def __init__(self):
        self.app = app
        self.app.config['DEBUG'] = True
        self.app.config['ASSETS_DEBUG'] = True
        self.app.jinja_env.auto_reload = True
        self.app.config['TEMPLATES_AUTO_RELOAD'] = True
        self.app.config['SEND_FILE_MAX_AGE_DEFAULT'] = timedelta(seconds=1)
        self.app.config['SQLALCHEMY_DATABASE_URI'] = "mysql+pymysql://root:2069079840@localhost:3306/manage?charset=utf8"
        self.app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
        self.app.config['SQLALCHEMY_COMMIT_TEARDOWN'] = True
        db.init_app(self.app)
        self.setAssets()

    def setAssets(self):
        assets = Environment(self.app)
        assets.url = self.app.static_url_path
        common_css = Bundle(
            'css/icon.scss',
            'css/index.scss',
            filters="pyscss",
            output="all.css"
        )
        common_js = Bundle(
            'js/index.js',
            filters="jsmin",
            output="all.js"
        )
        assets.register("all_css",common_css)
        assets.register("all_js",common_js)


    def get_app(self):
        return self.app

main = Main()
main.get_app().register_blueprint(views)
main.get_app().register_blueprint(apis)

if __name__ == "__main__":
    #  app.run(debug=True)
    server = Server(app.wsgi_app)
    server.serve(port=5000)