from flask import Flask, render_template

app = Flask(__name__)


@app.route("/")
def hello_world():
    return "Hello, World!"


@app.route("/send", methods=["GET"])
def submodule_index():
    print("getting page")
    return render_template("send-to-anyone.html")


@app.route("/send/<nav>", methods=["GET"])
def streamer_obs(nav):
    return render_template("send-to-anyone.html")


if __name__ == "__main__":
    app.run(debug=True)
