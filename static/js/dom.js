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

        for (let board of boards) {

            let template = document.querySelector('#board_header');
            let clone = document.importNode(template.content, true);
            let section = document.createElement(`section`);
            section.id = `board${board.id}`;
            section.classList.add(`board`);
            clone.querySelector('.board-title').innerHTML = board.title;
            section.appendChild(clone);
            boardContainer.appendChild(section);
            dom.loadCards(board.id);
        }
    },

    loadCards: function (boardId) {
        dataHandler.getCardsByBoardId(boardId, function (cards) {
            dom.showCards(boardId,cards)
        })
    },
    showCards: function (boardId,cards) {
        // shows the cards of a board
        // it adds necessary event listeners also
        const board = document.querySelector(`#board${boardId}`);
        let template_column= document.querySelector('#board_columns');
        let clone_columns = document.importNode(template_column.content, true);
        for (let card of cards){
            let card_template = document.querySelector('#card_sample');
            let clone_card = document.importNode(card_template.content,true);
            clone_card.querySelector('.card-title').innerHTML = card.title;
            let column = clone_columns.querySelector(`.${card.status_id}`);
            column.querySelector('.board-column-content').appendChild(clone_card);
        }
        board.appendChild(clone_columns);
    },
    // here comes more features
};
