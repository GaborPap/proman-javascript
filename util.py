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


def get_user_data_from_request(request):
    request_data = request.data
    data_from_request = json.loads(request_data)
    return data_from_request


def get_max_id(data):
    return max(int(row["id"]) for row in data) if len(data) > 0 else 0


def get_usr_id(username, users):
    for user in users:
        if user["username"] == username:
            return user["id"]


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
    data_from_request = get_user_data_from_request(request)
    if check_user_login(data_from_request, users):
        userid = get_usr_id(data_from_request["user-name"], users)
        result = {"userid": userid,
                  "username": data_from_request["user-name"],
                  "success": True}
        return result
    return {"success": False, "type": "Login"}


def user_register(request):
    users = data_handler.get_users()
    data_from_request = get_user_data_from_request(request)
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
