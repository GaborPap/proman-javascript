// this object contains the functions which handle the data and its reading/writing
// feel free to extend and change to fit your needs

// (watch out: when you would like to use a property/function of an object from the
// object itself then you must use the 'this' keyword before. For example: 'this._data' below)
export let dataHandler = {
    _data: {}, // it contains the boards and their cards and statuses. It is not called from outside.
    _api_get: function (url, callback) {
        // it is not called from outside
        // loads data from API, parses it and calls the callback with it

        fetch(url, {
            method: 'GET',
            credentials: 'same-origin'
        })
            .then(response => response.json())  // parse the response as JSON
            .then(json_response => callback(json_response));  // Call the `callback` with the returned object
    },
    _api_post: function (url, data, callback) {
        // it is not called from outside
        // sends the data to the API, and calls callback function

        fetch(url, {
            method: 'POST',
            dataType: 'json',
            credentials: 'same-origin',
            body: JSON.stringify(data)
        })
            .then(response => response.json())  // parse the response as JSON
            .then(json_response => callback(json_response));  // Call the `callback` with the returned
    },
    init: function () {
    },
    getBoards: function (callback) {
        // the boards are retrieved and then the callback function is called with the boards
        if (this._data.hasOwnProperty('boards')) {
            callback(this._data.boards);
        }

        // Here we use an arrow function to keep the value of 'this' on dataHandler.
        //    if we would use function(){...} here, the value of 'this' would change.
        this._api_get('/get-boards', (response) => {
            this._data = response;
            callback(response);
        });
    },
    getBoard: function (boardId,boardTitle, callback) {
        // the board is retrieved and then the callback function is called with the board
        let data = {
            'boardId': boardId,
            'boardTitle': boardTitle
        };
        this._api_post('/rename-board',data,(response) => {
            this._data = response;
            callback(response);
        })
    },
    getStatuses: function (callback) {
        // the statuses are retrieved and then the callback function is called with the statuses
    },
    getStatus: function (statusId, callback) {
        // the status is retrieved and then the callback function is called with the status
    },
    getCardsByBoardId: function (boardId, callback) {
        // the cards are retrieved and then the callback function is called with the cards
        if (this._data.hasOwnProperty('cards')) {
            callback(this._data.cards);
        }
        this._api_get(`/get-cards/${boardId}`, (response) => {
            this._data = response;
            callback(response)
        });
    },
    getCard: function (cardId, cardTitle, callback) {
        // the card is retrieved and then the callback function is called with the card
        let data = {
            'cardId': cardId,
            'cardTitle': cardTitle
        };
        this._api_post('/rename-card', data, (response) => {
            this._data = response;
            callback(response);
        })
    },
    createNewBoard: function (newBoard, callback) {
        // creates new board, saves it and calls the callback function with its data
        this._api_post('/add-new-board', newBoard, (response) => {
            this._data = response;
            callback(response);
        });
    },
    createNewCard: function (cardTitle, callback) {
        this._api_post('/add-card', cardTitle, (response) => {
            this._data = response;
            callback(response);
        });
        // creates new card, saves it and calls the callback function with its data
    },
    // here comes more features

    handleUserAuthentication: function (url, data, callback) {
        this._api_post(url, data, (response) => {
            this._data = response;
            callback(response);
        });
    },
    moveCard: function(url, data, callback){
        this._api_post(url, data, callback);
    },
    deleteBoard: function (boardId, callback) {
        let board = {
            id: boardId
        };
        this._api_post('/delete-board', board, (response) => {
            this._data = response;
            callback(response);
        })
    },
    deleteCard: function (cardId, callback) {
        let card = {
            id: cardId
        };
        this._api_post('/delete-card', card, callback);
    }
};

