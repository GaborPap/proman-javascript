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
        dataHandler.getCardsByBoardId(boardId, function () {
            dom.showCards()
        })

            // dom.showCards(board_id);
            // })
    },
    showCards: function (cards) {
        // shows the cards of a board
        // it adds necessary event listeners also
        console.log(cards)
        const section = document.querySelector(`board${id}`);

        for (let card of cards){
            let template_column= document.querySelector('#board_columns');
            let clone_template = document.importNode(template_column.content, true);
            clone_template.querySelector('.board-column-title').innerHTML = card.title;
            section.appendChild(clone_template)
        }

    },
    // here comes more features
};
