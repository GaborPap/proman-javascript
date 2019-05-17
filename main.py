from flask import Flask, render_template, url_for, request
# from util import json_response
import util
import json

import data_handler

app = Flask(__name__)


@app.route("/", methods=["GET", "POST"])
def index():
    """
    This is a one-pager which shows all the boards and cards
    """
    return render_template('index.html')


@app.route("/get-boards")
@util.json_response
def get_boards():
    """
    All the boards
    """
    return data_handler.get_boards()


@app.route("/get-cards/<int:board_id>")
@util.json_response
def get_cards_for_board(board_id: int):
    """
    All cards that belongs to a board
    :param board_id: id of the parent board
    """
    return data_handler.get_cards_for_board(board_id)


@app.route('/login', methods=["GET", "POST"])
def login():
    users = data_handler.get_users()
    user_data = util.get_user_data_from_form(request.form)

    if util.check_user_login(user_data, users):
        userid = util.get_usr_id(user_data["username"], users)
        dic = {"userid": userid,
               "success": True}

        return json.dumps(dic), 200, {'ContentType': 'application/json'}
    return json.dumps({'success': False}), 500, {'ContentType': 'application/json'}


@app.route('/register', methods=["POST"])
def register():
    user_data = util.get_user_data_from_form(request.form)
    users = data_handler.get_users()
    if not util.check_user_exists(user_data["username"], users):
        user_data["password"] = util.hash_password(user_data["password"])
        user_data["id"] = util.get_max_id(data_handler.get_users()) + 1
        if users:
            users.append(user_data)
        else:
            users = [user_data]
        print(users)
        data_handler.write_users(users)

        userid = util.get_usr_id(user_data["username"], users)
        dic = {"userid": userid,
               "success": True}

        return json.dumps(dic), 200, {'ContentType': 'application/json'}

    return json.dumps({'success': False}), 500, {'ContentType': 'application/json'}


def main():
    app.run(debug=True)

    # Serving the favicon
    with app.app_context():
        app.add_url_rule('/favicon.ico', redirect_to=url_for('static', filename='favicon/favicon.ico'))


if __name__ == '__main__':
    main()
