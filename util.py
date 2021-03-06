from functools import wraps
from flask import jsonify
import bcrypt
import json
import data_handler


def json_response(func):
    """
    Converts the returned dictionary into a JSON response
    :param func:
    :return:
    """

    @wraps(func)
    def decorated_function(*args, **kwargs):
        return jsonify(func(*args, **kwargs))

    return decorated_function


def hash_password(plain_text_password):
    hashed_bytes = bcrypt.hashpw(plain_text_password.encode('utf-8'), bcrypt.gensalt())
    return hashed_bytes.decode('utf-8')


def verify_password(plain_text_password, hashed_password):
    hashed_bytes_password = hashed_password.encode('utf-8')
    return bcrypt.checkpw(plain_text_password.encode('utf-8'), hashed_bytes_password)


def check_user_exists(username, users):
    if len(users) < 1:
        return False
    for user in users:
        if user["username"] == username:
            return user["password"]
    return False


def check_user_login(user_data, users):
    user_password = check_user_exists(user_data["user-name"], users)
    if not user_password:
        return False

    if not verify_password(user_data["password"], user_password):
        return False
    return True


def get_max_id(data):
    return max(int(row["id"]) for row in data) if len(data) > 0 else 0


def get_usr_id(username, users):
    for user in users:
        if user["username"] == username:
            return user["id"]


def add_new_card(request):
    cards = data_handler.get_all_cards()
    new_card_data = json.loads(request.data)
    new_card = {
        'id': get_max_id(cards) + 1,
        'board_id': new_card_data['board_id'],
        'title': new_card_data['title'],
        'status_id': new_card_data['status_id'],
        'order': new_card_data['order'],
    }
    cards = change_card_order(cards, new_card_data['board_id'])
    cards.append(new_card)
    data_handler.write_cards(cards)
    return new_card


def change_card_order(cards, board_id):
    for card in cards:
        if card['board_id'] == board_id and card['status_id'] == '0':
            card['order'] = int(card['order']) + 1
    return cards


def add_new_board(request):
    boards = data_handler.get_boards()
    new_board_data = json.loads(request.data)
    new_board = {
        'id': get_max_id(boards) + 1,
        'title': new_board_data['boardTitle'],
        'userid': new_board_data['userId'],
    }
    boards.append(new_board)
    data_handler.write_boards(boards)
    return new_board


def user_login(request):
    users = data_handler.get_users()
    data_from_request = json.loads(request.data)
    if check_user_login(data_from_request, users):
        userid = get_usr_id(data_from_request["user-name"], users)
        result = {"userid": userid,
                  "username": data_from_request["user-name"],
                  "success": True}
        return result
    return {"success": False, "type": "Login"}


def user_register(request):
    users = data_handler.get_users()
    data_from_request = json.loads(request.data)
    if not check_user_exists(data_from_request["user-name"], users):
        user_data = {
            "username": data_from_request["user-name"],
            "password": hash_password(data_from_request["password"]),
            "id": get_max_id(users) + 1}
        if users:
            users.append(user_data)
        else:
            users = [user_data]

        data_handler.write_users(users)
        userid = get_usr_id(data_from_request["user-name"], users)

        dic = {"userid": userid,
               "username": data_from_request["user-name"],
               "success": True}

        return dic
    return {"success": False, "type": "Register"}


def get_status_id_by_name(status):
    statuses = data_handler.get_statuses()
    return [item["id"] for item in statuses if item["title"] == status][0]


def update_card_data(cards, data_from_request, status_id):
    for index in range(len(cards)):
        if cards[index]['id'] == data_from_request['cardid']:
            cards[index]['status_id'] = status_id
            cards[index]['board_id'] = data_from_request['boardid']
            return cards


def set_new_card_order(cards, order_dict):
    for index in range(len(cards)):
        if cards[index]["id"] in order_dict:
            cards[index]["order"] = order_dict[cards[index]["id"]]


def move_card(request):
    data_from_request = json.loads(request.data)
    cards = data_handler.get_all_cards()
    set_new_card_order(cards, data_from_request["order"])
    status_id = get_status_id_by_name(data_from_request["status"])
    update_card_data(cards, data_from_request, status_id)
    data_handler.write_cards(cards)

    return {"success": True}


def remove_board_by_id(boards, board_id):
    for board in boards:
        if board['id'] == board_id:
            boards.remove(board)
            return boards


def delete_cards_by_board_id(board_id):
    cards = data_handler.get_all_cards()
    for card in cards.copy():
        if card['board_id'] == board_id:
            cards.remove(card)
    data_handler.write_cards(cards)


def delete_board(request):
    boards = data_handler.get_boards()
    request_data = json.loads(request.data)
    board_id = request_data['id']
    delete_cards_by_board_id(board_id)
    boards = remove_board_by_id(boards, board_id)
    data_handler.write_boards(boards)
    return request_data


def delete_card(request):
    cards = data_handler.get_all_cards()
    card_id = json.loads(request.data)['id']
    for card in cards:
        if card['id'] == card_id:
            cards.remove(card)
            data_handler.write_cards(cards)
            return {'success': True}


def rename_card(request):
    updated_card = json.loads(request.data)
    cards = data_handler.get_all_cards()
    for card in cards:
        if card['id'] == updated_card['cardId']:
            card['title'] = updated_card['cardTitle']
    data_handler.write_cards(cards)
    return updated_card


def rename_board(request):
    updated_board = json.loads(request.data)
    boards = data_handler.get_boards()
    for board in boards:
        if board['id'] == updated_board['boardId']:
            board['title'] = updated_board['boardTitle']
    data_handler.write_boards(boards)
    return updated_board
