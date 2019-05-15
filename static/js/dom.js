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
        document.getElementById('login_button').addEventListener('click', dom.login)
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
            "message": "Wrong user name or password"
        };

        dom.getAjax(data);
    },



    getAjax: function(data) {
    let form_values = {};
    $('#inputModal').modal({show: true});
    $('#inputForm').submit(function () {
        let $inputs = $('#inputForm :input');
        $inputs.each(function () {
            form_values[this.name] = $(this).val();
        });

        $.ajax({
            type: 'POST',
            url: '/login',
            dataType: 'json',
            data: form_values
        })
            .then(

                function success() {
                    alert("Logged in");
                    location.reload()
                },
                function fail() {
                    alert(data["message"]);
                     location.reload();
                }
            );


    });
}

};