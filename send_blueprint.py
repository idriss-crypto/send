from flask import Blueprint, render_template

streamer_blueprint = Blueprint('streamer', __name__,
                               template_folder='templates',
                               static_folder='static',
                               static_url_path='/frontend/send-to-anyone-page/static')


@streamer_blueprint.route('/send', methods=["GET"])
def send_index():
    return render_template('send-to-anyone.html')

@streamer_blueprint.route('/send/<nav>', methods=["GET"])
def send_nav():
    return render_template('send-to-anyone.html')
