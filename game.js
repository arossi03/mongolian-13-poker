let deck = [];
let players = [];
let selectedCards = [];
let currentPlayerIndex = null;
let playerNames = ['Andrea', 'Anda'];
let currentPlayer = null;
let headPlayerIndex = null;
let numGames = 0;
let totalRemainingCards = Array.from({ length: playerNames.length }, () => 0);

function startGame() {
    // Show the "Submit Cards" and "Pass" buttons after starting the game
    document.getElementById("submitButton").style.display = "block";
    document.getElementById("passButton").style.display = "block";
    document.getElementById("table-cards").style.display = "flex";

    clearTable();
    createDeck();
    dealCards();
    determineStartingPlayer();
    currentPlayerIndex = -1;
    displayPlayerHands();
    nextTurn();
}

function createDeck() {
    const suits = ['spades', 'hearts', 'clubs', 'diamonds'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ value: value, suit: suit });
        }
    }
    shuffle(deck);
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function dealCards() {
    players = Array.from({ length: playerNames.length }, () => []);
    for (let i = 0; i < 13; i++) {
        for (let j = 0; j < playerNames.length; j++) {
            players[j].push(deck.pop());
        }
    }
}

function determineStartingPlayer() {
    // Find the player with the 3 of diamonds
    for (let i = 0; i < playerNames.length; i++) {
        if (players[i].some(card => card.value === '3' && card.suit === 'diamonds')) {
            currentPlayerIndex = i;
            headPlayerIndex = currentPlayerIndex;
            currentPlayer = playerNames[currentPlayerIndex];
            break;
        }
    }
    if (headPlayerIndex === null) {
        currentPlayerIndex = 0;
        headPlayerIndex = currentPlayerIndex;
        currentPlayer = playerNames[currentPlayerIndex];
    }
}

function displayPlayerHands() {
    const playerHandsElement = document.getElementById("playerHands");
    playerHandsElement.style.display = "block";
    playerHandsElement.innerHTML = "";

    players.slice(0,playerNames.length).forEach((playerHand, playerIndex) => {
        const playerHandElement = document.createElement("div");
        playerHandElement.classList.add("player-hand");
        playerHandElement.innerHTML = `<h2>${playerNames[playerIndex]}'s Hand:</h2>`;

        // Sort player's hand
        playerHand.sort((card1, card2) => {
            const valueOrder = ['2', 'A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3'];
            const suitOrder = ['spades', 'hearts', 'clubs', 'diamonds'];

            const valueIndex1 = valueOrder.indexOf(card1.value);
            const valueIndex2 = valueOrder.indexOf(card2.value);
            if (valueIndex1 !== valueIndex2) {
                return valueIndex1 - valueIndex2;
            }

            const suitIndex1 = suitOrder.indexOf(card1.suit);
            const suitIndex2 = suitOrder.indexOf(card2.suit);
            return suitIndex1 - suitIndex2;
        });

        playerHand.forEach((card, index) => {
            const cardDiv = document.createElement("div");
            cardDiv.classList.add("card");
            if (playerIndex === currentPlayerIndex) {
                cardDiv.style.backgroundImage = `url('images/${card.suit}_${card.value}.png')`;
            } else {
                cardDiv.style.backgroundImage = `url('images/flipped_black.png')`;
            }
            cardDiv.setAttribute("data-player", playerIndex);
            cardDiv.setAttribute("data-index", index);
            cardDiv.addEventListener("click", selectCard);
            playerHandElement.appendChild(cardDiv);
        });

        playerHandsElement.appendChild(playerHandElement);
    });
}


function selectCard(event) {
    const playerIndex = parseInt(event.target.getAttribute("data-player"));
    const index = parseInt(event.target.getAttribute("data-index"));
    if (playerIndex === currentPlayerIndex) {
        if (selectedCards.some(card => card.playerIndex === playerIndex && card.index === index)) {
            event.target.style.border = "none";
            selectedCards = selectedCards.filter(card => !(card.playerIndex === playerIndex && card.index === index));
        } else {
            event.target.style.border = "2px solid blue";
            selectedCards.push({ playerIndex: playerIndex, index: index });
        }
    }
}

function submitCards() {
    // Check if the current player has selected at least one card
    if (selectedCards.length === 0) {
        alert("Please select at least one card to submit.");
        return;
    }

    // Clear table and update the display
    const tableCardsElement = document.getElementById("table-cards");
    tableCardsElement.innerHTML = "";

    // Sort selected cards by index
    selectedCards.sort((a, b) => b.index - a.index);

    // Display selected cards on the table
    selectedCards.forEach(card => {
        const { playerIndex, index } = card;
        const cardData = players[playerIndex][index];
        if (cardData) {
            const cardDiv = document.createElement("div");
            cardDiv.classList.add("table-card");
            cardDiv.style.backgroundImage = `url('images/${cardData.suit}_${cardData.value}.png')`; // Using value_suit.png format
            tableCardsElement.appendChild(cardDiv);

            // Remove selected cards from playerHand
            players[playerIndex].splice(index, 1);
        }
    });

    // Update the display of player's hand
    headPlayerIndex = currentPlayerIndex;
    currentPlayerIndex = -1;
    displayPlayerHands();
    // Pass the turn to the next player
    nextTurn()
}

function passHand() {
    // Clear selected cards array
    selectedCards = [];

    // Update the current player index for the next turn
    currentPlayerIndex = (currentPlayerIndex + 1) % playerNames.length;

    if (currentPlayerIndex > playerNames.length - 1) {
        currentPlayerIndex = 0;
    }   

    // Display the updated player hands
    displayPlayerHands();
    
    // Clear table and update the display
    if (headPlayerIndex === currentPlayerIndex) {
        const tableCardsElement = document.getElementById("table-cards");
        tableCardsElement.innerHTML = "";
    }
}

function clearTable() {
    // Clear table and update the display
    const tableCardsElement = document.getElementById("table-cards");
    tableCardsElement.innerHTML = "";

    // Clear selected cards array
    selectedCards = [];

    // Display the updated player hands
    displayPlayerHands();
}

// Define a function to update the scoreboard
function updateScoreboard() {
    // Get the scoreboard element
    const scoreboard = document.getElementById("scoreboard");

    // Create the table element
    const table = document.createElement("table");

    // Create the table header row
    const headerRow = table.insertRow();
    const playerNameHeader = document.createElement("th");
    playerNameHeader.textContent = "Player";
    headerRow.appendChild(playerNameHeader);
    const gameNumHeader = document.createElement("th");
    gameNumHeader.textContent = "Score";
    headerRow.appendChild(gameNumHeader);

    // Create a row for each player
    playerNames.forEach((playerName, index) => {
        const playerRow = table.insertRow();
        const playerNameCell = playerRow.insertCell();
        playerNameCell.textContent = playerName;
        const totalRemainingCardsCell = playerRow.insertCell();
        // Calculate the total remaining cards for the player
        if (players[index].length > 9) {
            totalRemainingCards[index] += 2*players[index].length;
        } else {
            totalRemainingCards[index] += players[index].length;
        }
        totalRemainingCardsCell.textContent = totalRemainingCards[index];
        if (totalRemainingCards[index] > 29) {
            const row = table.rows[index]
            row.classList.add("highlighted-row");
        }
    });

    // Append the table to the scoreboard element
    scoreboard.innerHTML = "";
    scoreboard.appendChild(table);
}

function nextTurn() {
    currentPlayerIndex = (headPlayerIndex + 1) % playerNames.length;

    // Check if the current player has won
    if (players[headPlayerIndex].length === 0) {
        // Increment the number of games played
        numGames++;

        // Update the scoreboard
        updateScoreboard();

        // Create a dark overlay indicating the winner
        const overlay = document.createElement("div");
        overlay.classList.add("overlay");
        overlay.innerHTML = `<div class="player-turn-screen">${playerNames[headPlayerIndex]} wins!</div>`;
        document.body.appendChild(overlay);
        setTimeout(() => {
            document.body.removeChild(overlay);
            startGame();
        }, 3000);
        return; // End the function if a winner is found
    }

    // Create a dark overlay
    const overlay = document.createElement("div");
    overlay.classList.add("overlay");
    overlay.innerHTML = `<div class="player-turn-screen">${playerNames[currentPlayerIndex]}'s turn...</div>`;
    document.body.appendChild(overlay);

    // Wait for 3 seconds before removing the overlay
    setTimeout(() => {
        // Remove the overlay
        if (overlay.parentNode === document.body) {
            // Remove the overlay
            document.body.removeChild(overlay);
            if (currentPlayerIndex > playerNames.length - 1) {
                currentPlayerIndex = 0;
            }    
            currentPlayer = playerNames[currentPlayerIndex];
            selectedCards = []; // Clear selected cards
            // Update the display of player's hand
            displayPlayerHands();
        }
    }, 3000);
}


