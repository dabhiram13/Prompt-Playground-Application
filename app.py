"""
Prompt Studio — learn, prove, and ship prompts.
Flask backend; free OpenRouter models / local Ollama; SQLite persistence.
"""

import os

from dotenv import load_dotenv
from flask import Flask, render_template

load_dotenv()

import db
import providers
from routes import grade, library, publish, run

app = Flask(__name__)
app.register_blueprint(run.bp)
app.register_blueprint(library.bp)
app.register_blueprint(grade.bp)
app.register_blueprint(publish.bp)

db.init_db()


@app.route("/")
def index():
    return render_template("index.html",
                           models=providers.get_models(),
                           default_model=providers.DEFAULT_MODEL)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3000))
    debug = os.environ.get("FLASK_DEBUG", "1") == "1"
    app.run(debug=debug, port=port)
