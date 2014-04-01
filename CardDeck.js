var CardDeck = function (settings) {
	// constructor

	// defaults
	var defaults = {
		decks: 1,
		handSize: 5,
		ranks: "2,3,4,5,6,7,8,9,10,Jack,Queen,King,Ace".split(","),
		suits: "Clubs,Diamonds,Hearts,Spades".split(","),
		jokers: ["Black","Red"],
		shuffle: true
	};

	this.theDeck = [];

	this.settings = this.extend({}, defaults, settings);

	return this.initialize();
};

CardDeck.prototype.initialize = function () {
	this.populateDeck();
	if (this.settings.shuffle) {
		this.shuffle();
	} else {
		this.sort();
	}
	return this;
};

CardDeck.prototype.populateDeck = function() {
	this.theDeck = [];
	for (var i = 0; i < this.settings.decks; i++) {
		var deck = this.createDeck(i);
		this.theDeck = this.theDeck.concat(deck);
	}
};

CardDeck.prototype.createDeck = function (deckID) {
	deckID = deckID || 0;
	var i;
	var deck = [];
	var decklength = this.settings.ranks.length * this.settings.suits.length;
	for (i = 0; i < decklength; i += 1) {
		var rank = i % this.settings.ranks.length;
		var suit = i % this.settings.suits.length;
		var card = new CardDeck.Card(rank, suit, this, deckID);

		deck.push(card);
	}
	for (i = 0; i < this.settings.jokers.length; i++) {
		deck.push(new CardDeck.Card(i, this.settings.suits.length, this, deckID));
	}

	return deck;
};

CardDeck.prototype.shuffle = function() {
	// based on http://bost.ocks.org/mike/shuffle/
	var m = this.theDeck.length;
	var t, i;

	// While there remain elements to shuffle
	while (m) {

		// Pick a remaining element
		i = Math.floor(Math.random() * m--);

		// And swap it with the current element.
		t = this.theDeck[m];
		this.theDeck[m] = this.theDeck[i];
		this.theDeck[i] = t;
	}

	return this;
};

CardDeck.prototype.sort = function () {
	this.theDeck.sort(function deckSort(a, b) {
		if (a.suitIndex !== b.suitIndex) {
			return a.suitIndex - b.suitIndex; // > is T/F, T = 1, F = 0
		} else {
			// suits do match, so sort by rank
			return a.rankIndex - b.rankIndex;
		}
	});
};


CardDeck.prototype.dealHand = function (size) {
	size = size || this.settings.handSize;
	var hand = [];
	for (var i = 0; i < size; i += 1) {
		var card = this.theDeck.pop();
		hand.push(card);
	}
	return hand;
};

CardDeck.prototype.extend = function () {
	for(var i=1; i<arguments.length; i++) {
		for(var key in arguments[i]) {
			if(arguments[i].hasOwnProperty(key)) {
				arguments[0][key] = arguments[i][key];
			}
		}
	}
	return arguments[0];
};

CardDeck.Card = function (rankIndex, suitIndex, deck, deckID) {
	var joker = suitIndex == deck.settings.suits.length;
	this.rankIndex = rankIndex;
	this.rank = (joker ? deck.settings.jokers[rankIndex] : deck.settings.ranks[rankIndex]) || "Blank";
	this.suitIndex = suitIndex;
	this.suit = deck.settings.suits[suitIndex] || (joker ? "Joker" : "");
	this.deckID = deckID;
};