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
        document.getElementById('logout').addEventListener('click', dom.logout);
        document.getElementById('login').addEventListener('click', dom.login);
        document.getElementById('register').addEventListener('click', dom.register);
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

        let boardList = '';

        for (let board of boards) {
            boardList += `
                <li>${board.title}</li>
            `;
        }

        const outerHtml = `
            <ul class="board-container">
                ${boardList}
            </ul>
        `;

        //this._appendToElement(document.querySelector('#boards'), outerHtml);

        const boardContainer = document.querySelector('#boards');

        boardContainer.innerHTML = '';
        boardContainer.insertAdjacentHTML('beforeend', outerHtml);
    },
    loadCards: function (boardId) {
        // retrieves cards and makes showCards called
    },
    showCards: function (cards) {
        // shows the cards of a board
        // it adds necessary event listeners also
    },
    // here comes more features
    login: function () {

        let data = {
            "url": "/login",
            "message_success": "Logged in ",
            "message_fail": "Wrong user name or password"
        };

        dom.getAjax(data);
    },


    register: function () {

        let data = {
            "url": "/register",
            "message_success": "Register succesfull",
            "message_fail": "Register failed"
        };

        dom.getAjax(data);
    },

    getAjax: function (data) {
        event.preventDefault();
        let form_values = {};
        $('#inputModal').modal({show: true});
        $('#submit-button').click(function () {
            let $inputs = $('#inputForm :input');
            $inputs.each(function () {
                form_values[this.name] = $(this).val();
            });

            $.ajax({
                type: 'POST',
                url: data['url'],
                dataType: 'json',
                data: form_values
            })
                .then(
                    function success() {
                        sessionStorage.setItem('username', form_values["user-name"]);
                        dom.showLoggedIn(form_values["user-name"], true);
                        location.reload()
                    },
                    function fail() {
                        alert(data["message_fail"]);
                        location.reload();
                    }
                );


        });
    },
    showLoggedIn: function () {
        let username = sessionStorage.getItem("username");
        let register = document.getElementById("register");
        let login = document.getElementById("login");
        let logout = document.getElementById("logout");
        let navbar = document.getElementById("navbar-text");
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

    logout: function(){
        if (sessionStorage.getItem("username"))
            sessionStorage.removeItem("username")
        location.reload();
    }

};