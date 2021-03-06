// It uses data_handler.js to visualize elements
import {dataHandler} from "./data_handler.js";

export let dom = {
    drake: window.dragula(),

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
        dom.drag();
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
        cards = dom.sortCards(cards);
        for (let card of cards) {
            let cardElement = dom.createCard(card);
            let column = columns.querySelector(`.${card.status_id}`);
            column.querySelector('.board-column-content').appendChild(cardElement);
        }
        board.appendChild(columns);
    },
    slide: function (board) {
        let boardToggle = board.querySelector('.board-toggle');
        $(document).ready(function () {
            $(boardToggle).click(function () {
                $('#box' + $(this).attr('target')).slideToggle(400);
            });
        })
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
    },
    logout: function () {
        if (sessionStorage.getItem("username"))
            sessionStorage.removeItem("username");
        sessionStorage.removeItem("userid");
        location.reload();
    },
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
        let boardTitle = clone.querySelector('.board-title');
        boardTitle.addEventListener('click',dom.boardRenameEvent);
        section.appendChild(clone);
        section.appendChild(dom.getColumns(board.id));
        dom.addEventToBoardDeleteBtn(section, board.id);
        dom.slide(section);
        dom.addEventNewCard(section, board.id);
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
        dom.addEventToCardRemoveBtn(clone_card, card.id);
        let cardTitle = clone_card.querySelector(".card-title");
        // cardTitle.setAttribute('data-cardid', card.id);
        cardTitle.addEventListener('click', dom.cardRenameEvent);
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
            dom.dragNewBoard(newBoard);
        })
    },
    getNumFromString: function (str) {
        return str.replace(/\D/g, "");
    },
    getStatus: function (str) {
        return str.substring(str.lastIndexOf(" ") + 1, str.length)
    },
    getOrderList: function (childrenList) {
        let orderList = {};
        let index = 0;
        for (let item of childrenList) {
            orderList[item.dataset["cardid"]] = index;
            index += 1;
        }
        return orderList;
    },
    dragNewBoard: function (board) {

        for (let ndex of board.querySelectorAll(".board-column-content"))
            dom.drake.containers.push(ndex);

    },
    drag: function () {

        let cards = document.querySelectorAll(".board-column-content");
        for (let index = 0; index < cards.length; index++)
            dom.drake.containers.push(cards[index]);

        dom.drake.on('drop', function (el) {
            let boardid = dom.getNumFromString(el.closest('section').id);
            let cardid = el.dataset.cardid;
            let status = dom.getStatus(el.closest('.board-column').className);
            let cardOrder = dom.getOrderList(el.closest('.board-column-content').children);

            let data = {
                'boardid': boardid,
                'cardid': cardid,
                'status': status,
                'order': cardOrder
            };

            dataHandler.moveCard('/dragdrop', data, function () {

            })
        })
    },
    addEventToBoardDeleteBtn: function (board, boardId) {
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
    },
    addEventNewCard: function (board, boardId) {
        let btn = board.querySelector('.card-add');
        btn.setAttribute('data-board-id', boardId);
        btn.addEventListener('click', dom.addNewCard);
    },
    addNewCard: function (event) {
        let button = event.currentTarget;
        let boardId = button.dataset.boardId;
        let newCard = {board_id: boardId, title: 'New Card', status_id: 0, order: 0};
        dataHandler.createNewCard(newCard, function (response) {
            let board = document.querySelector(`#board${boardId}`);
            let newColumn = board.querySelector('.new');
            let columnContainer = newColumn.querySelector('.board-column-content');
            let newCard = dom.createCard(response);
            columnContainer.insertBefore(newCard, columnContainer.firstElementChild)
        })
    },
    sortCards: function (cards) {
        return cards.sort((a, b) => (Number(a.order) > Number(b.order)) ? 1 : -1)
    },
    addEventToCardRemoveBtn: function (card, cardId) {
        let btn = card.querySelector('.card-remove');
        btn.setAttribute('data-card-id', cardId);
        btn.addEventListener('click', dom.deleteCard);
    },
    deleteCard: function (event) {
        let btn = event.currentTarget;
        let cardId = btn.dataset.cardId;
        dataHandler.deleteCard(cardId, function () {
            btn.parentNode.remove();
        });
    },
    boardRenameEvent: function(){
        let boardTitleDiv = event.target;
        let input = document.createElement('input');
        input.setAttribute('type', 'text');
        input.setAttribute('value', `${boardTitleDiv.innerHTML}`);
        input.classList.add('rename-board');
        boardTitleDiv.innerHTML = '';
        input.addEventListener('keyup',dom.postBoardTitle);
        boardTitleDiv.appendChild(input);
        let inputValueLength = boardTitleDiv.innerHTML.length;
        input.focus();
        input.setSelectionRange(inputValueLength, inputValueLength);
    },
    postBoardTitle: function(e){
      let input = event.target;
      let boardTitle = input.parentNode;
      if (e.key === 'Enter') {
          let newName = this.value;
          let boardId = boardTitle.parentNode.lastElementChild.dataset.boardId;
          dataHandler.getBoard(boardId, newName, function () {
              boardTitle.innerHTML = newName;
          })
      }
    },
    cardRenameEvent: function () {
        let cardTitleDiv = event.target;
        let input = document.createElement('input');
        input.setAttribute('type', 'text');
        input.setAttribute('value', `${cardTitleDiv.innerHTML}`);
        input.classList.add('rename-card');
        cardTitleDiv.innerHTML = '';
        input.addEventListener('keyup', dom.postCardTitle);
        cardTitleDiv.appendChild(input);
        let inputValueLength = cardTitleDiv.innerHTML.length;
        input.focus();
        input.setSelectionRange(inputValueLength, inputValueLength);
    },
    postCardTitle: function (e) {
        let input = event.target;
        let cardTitle = input.parentNode;
        if (e.key === 'Enter') {
            let newName = this.value;
            let cardId = cardTitle.parentNode.dataset.cardid;
            dataHandler.getCard(cardId, newName, function () {

                cardTitle.innerHTML = newName;

            })

        }
    }
};




