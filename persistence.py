import csv

STATUSES_FILE = './data/statuses.csv'
STATUSES_HEADER = ['id', 'title']
BOARDS_FILE = './data/boards.csv'
BOARDS_HEADER = ['id', 'title', 'userid']
CARDS_FILE = './data/cards.csv'
CARDS_HEADER = ['id', 'board_id', 'title', 'status_id', 'order']
USERS_FILE = './data/users.csv'
USERS_HEADER = ['id', 'username', 'password']

_cache = {}  # We store cached data in this dict to avoid multiple file readings


def _write_csv(file_name, data, header):
    with open(file_name, 'w') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=header, delimiter=',', quotechar='"')
        writer.writeheader()
        writer.writerows(data)


def _read_csv(file_name):
    """
    Reads content of a .csv file
    :param file_name: relative path to data file
    :return: OrderedDict
    """
    with open(file_name) as boards:
        rows = csv.DictReader(boards, delimiter=',', quotechar='"')
        formatted_data = []
        for row in rows:
            formatted_data.append(dict(row))
        return formatted_data


def _get_data(data_type, file, force):
    """
    Reads defined type of data from file or cache
    :param data_type: key where the data is stored in cache
    :param file: relative path to data file
    :param force: if set to True, cache will be ignored
    :return: OrderedDict
    """
    if force or data_type not in _cache:
        _cache[data_type] = _read_csv(file)
    return _cache[data_type]


def clear_cache():
    for k in list(_cache.keys()):
        _cache.pop(k)


def get_statuses(force=False):
    return _get_data('statuses', STATUSES_FILE, force)


def get_boards(force=False):
    return _get_data('boards', BOARDS_FILE, force)


def get_cards(force=False):
    return _get_data('cards', CARDS_FILE, force)


def get_users(force=False):
    return _get_data('users', USERS_FILE, force)


def write_statuses(data):
    return _write_csv(STATUSES_FILE, data, STATUSES_HEADER)


def write_boards(data):
    return _write_csv(BOARDS_FILE, data, BOARDS_HEADER)


def write_cards(data):
    return _write_csv(CARDS_FILE, data, CARDS_HEADER)


def write_users(data):
    return _write_csv(USERS_FILE, data, USERS_HEADER)
