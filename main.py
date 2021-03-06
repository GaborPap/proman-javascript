from flask import Flask, render_template, url_for, request
from util import json_response
import util

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
@util.json_response
def login():
    return util.user_login(request)


@app.route('/register', methods=["POST"])
@util.json_response
def register():
    return util.user_register(request)


@app.route('/add-new-board', methods=['GET', 'POST'])
@util.json_response
def add_new_board():
    return util.add_new_board(request)


@app.route('/dragdrop', methods=['POST'])
@util.json_response
def dragdrop():
    return util.move_card(request)


@app.route('/delete-board', methods=['GET', 'POST'])
@util.json_response
def delete_board():
    return util.delete_board(request)


@app.route('/add-card', methods=['GET', 'POST'])
@util.json_response
def add_card():
    return util.add_new_card(request)


@app.route('/rename-card', methods=['GET', 'POST'])
@util.json_response
def rename_card():
    return util.rename_card(request)


@app.route('/rename-board', methods=['GET', 'POST'])
@util.json_response
def rename_board():
    return util.rename_board(request)


@app.route('/delete-card', methods=['GET', 'POST'])
@util.json_response
def delete_card():
    return util.delete_card(request)


def main():
    app.run(debug=True)

    # Serving the favicon
    with app.app_context():
        app.add_url_rule('/favicon.ico', redirect_to=url_for('static', filename='favicon/favicon.ico'))


if __name__ == '__main__':
    main()
