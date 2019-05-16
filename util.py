from functools import wraps
from flask import jsonify
import bcrypt


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
    if len(users)<1:
        return False
    for user in users:
        if user["username"] == username:
            return user["password"]
    return False


def check_user_login(user_data, users):
    user_password = check_user_exists(user_data["username"], users)
    if not user_password:
        return False

    if not verify_password(user_data["password"], user_password):
        return False
    return True


def get_user_data_from_form(request):
    data = {
        "username": request.get('user-name'),
        "password": request.get('password')
    }
    return data


def get_max_id(data):
    print(len(data))
    return int(max(row["id"] for row in data)) if len(data) > 0 else 0

def get_usr_id(username, users):
    for user in users:
        if user["username"] == username:
            return user["id"]
