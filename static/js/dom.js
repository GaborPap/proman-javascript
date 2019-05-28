// It uses data_handler.js to visualize elements
import {dataHandler} from "./data_handler.js";

export let dom = {
    _appendToElement: function (elementToExtend, textToAppend, prepend = false) {
        // function to append new DOM elements (represented by a string) to an existing DOM element
        let fakeDiv = document.createElement('div');
        fakeDiv.innerHTML = textToAppend.trim();

        for (let childNode of fakeDiv.childNodes) {
            if (prepend) {
                elementToExtend.prependChild(childNode);
            } else {
                elementToExtend.appendChild(childNode);
            }
        }

        return elementToExtend.lastChild;
    },
    init: function () {
        // This function should run once, when the page is loaded.
        document.querySelector('#new_board button').addEventListener('click', dom.addNewBoard);
        document.querySelector('#logout').addEventListener('click', dom.logout);
        document.querySelector('#login').addEventListener('click', dom.login);
        document.querySelector('#register').addEventListener('click', dom.register);
        dom.showLoggedIn();
    },
    loadBoards: function () {
        // retrieves boards and makes showBoards called
        dataHandler.getBoards(function (boards) {
            dom.showBoards(boards);
        });
    },

    showBoards: function (boards) {
        // shows boards appending them to #boards div
        // it adds necessary event listeners also
        const boardContainer = document.querySelector('.board-container');
        boardContainer.innerHTML = '';

        let userid = dom.getUserIdFromSession();

        for (let board of boards) {
            if ((board['userid'] === '0' && !board['userid']) || board['userid'] === userid) {
                let boardElement = dom.createBoard(board);
                boardContainer.appendChild(boardElement);
                dom.loadCards(board.id);
            }
        }
    },

    loadCards: function (boardId) {
        dataHandler.getCardsByBoardId(boardId, function (cards) {
            dom.showCards(boardId, cards)
        })
    },
    showCards: function (boardId, cards) {
        // shows the cards of a board
        // it adds necessary event listeners also
        const board = document.querySelector(`#board${boardId}`);
        const columns = board.querySelector('.board-columns');

        for (let card of cards) {
            let cardElement = dom.createCard(card);
            let column = columns.querySelector(`.${card.status_id}`);
            column.querySelector('.board-column-content').appendChild(cardElement);
        }
        board.appendChild(columns);
    },
    slide: function () {
        $(document).ready(function () {
            $('.board-toggle').click(function () {
                $('#box' + $(this).attr('target')).slideToggle(400);
            });
        });
    },
    // here comes more features

    openModal: function (title, button_text, callback) {
        let form_values = {};

        $('#inputLabel').text(title);
        $('#inputModal').modal({show: true});
        $('#submit-button').text(button_text);
        $('#submit-button').click(function () {
            let $inputs = $('#inputForm :input');
            $inputs.each(function () {
                form_values[this.name] = $(this).val();
            });
            callback(form_values)
        })


    },

    setLoginData: function (results) {
        if (results["success"] === true) {
            sessionStorage.setItem('username', results["username"]);
            sessionStorage.setItem('userid', results["userid"]);
            dom.showLoggedIn(results["user-name"], true);
            location.reload();
        } else

            alert(`${results["type"]} failed`);
    },


    login: function () {

        dom.openModal('Login', 'Login', function (form_values) {
            dataHandler.handleUserAuthentication('/login', form_values, function (results) {
                dom.setLoginData(results);
            });
        });
    },

    register: function () {
        dom.openModal('Register', 'Register', function (form_values) {
            dataHandler.handleUserAuthentication('/register', form_values, function (results) {
                dom.setLoginData(results);
            });
        });
    },


    showLoggedIn: function () {
        let username = sessionStorage.getItem("username");
        let register = document.querySelector("#register");
        let login = document.querySelector("#login");
        let logout = document.querySelector("#logout");
        let navbar = document.querySelector("#navbar-text");
        if (username) {
            navbar.style.display = 'block';
            navbar.innerText = `Signed in as ${username}`;
            register.style.display = 'none';
            login.style.display = 'none';
            logout.style.display = 'block';
        } else {
            navbar.style.display = 'none';
            register.style.display = 'block';
            login.style.display = 'block';
            logout.style.display = 'none';
        }
    }
    ,

    logout: function () {
        if (sessionStorage.getItem("username"))
            sessionStorage.removeItem("username");
        sessionStorage.removeItem("userid");
        location.reload();
    }
    ,

    getUserIdFromSession: function () {
        return sessionStorage.getItem("userid") ? sessionStorage.getItem("userid") : '0'
    },
    createBoard: function (board) {
        let template = document.querySelector('#board_header');
        let clone = document.importNode(template.content, true);
        let section = document.createElement(`section`);
        section.id = `board${board.id}`;
        section.classList.add(`board`);
        clone.querySelector('.board-toggle').setAttribute('target', board.id);
        clone.querySelector('.board-title').innerHTML = board.title;
        section.appendChild(clone);
        section.appendChild(dom.getColumns(board.id));
        dom.addEventToDeleteBtn(section, board.id);
        return section;
    },
    getColumns: function (boardId) {
        let template_column = document.querySelector('#board_columns');
        let clone_columns = document.importNode(template_column.content, true);
        clone_columns.querySelector('.board-columns').id = `box${boardId}`;
        return clone_columns;
    },
    createCard: function (card) {
        let card_template = document.querySelector('#card_sample');
        let clone_card = document.importNode(card_template.content, true);
        clone_card.querySelector('.card-title').innerHTML = card.title;
        clone_card.querySelector('.card').setAttribute('data-order', card.order);
        clone_card.querySelector('.card').setAttribute('data-cardId', card.id);
        return clone_card;
    },
    addNewBoard: function () {
        let newBoardData = {
            boardTitle: 'New Board',
            userId: dom.getUserIdFromSession(),
        };
        dataHandler.createNewBoard(newBoardData, function (response) {
            let boarContainer = document.querySelector('.board-container');
            let newBoard = dom.createBoard(response);
            boarContainer.appendChild(newBoard);
        })
    },
    addEventToDeleteBtn: function (board, boardId) {
        let button = board.querySelector('.board-delete');
        button.setAttribute('data-board-id', boardId);
        button.addEventListener('click', dom.deleteBoard);
    },
    deleteBoard: function (event) {
        let button = event.currentTarget;
        let boardId = button.dataset.boardId;
        dataHandler.deleteBoard(boardId, function (response) {
            document.querySelector(`#board${response.id}`).remove();
        });

    }
};

