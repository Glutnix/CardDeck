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
	var hand = new CardDeck.Hand(this);
	for (var i = 0; i < size; i += 1) {
		hand.addCard( this.theDeck.pop() );
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

CardDeck.Card.prototype.toString = function() {
	return this.rank + " " + this.suit;
};

CardDeck.Hand = function (deck) {
	this.deck = deck;
	this.theHand = [];
};

CardDeck.Hand.prototype.toString = function () {
	return this.theHand.toString();
};

CardDeck.Hand.prototype.addCard = function (card) {
	this.theHand.push(card);
};

CardDeck.Hand.prototype.isOfAKind = function (exactCount, excludeRankIndexes) {
	// returns highest rankIndex when it finds exactCount;
	excludeRankIndexes = excludeRankIndexes || [];
	var i;
	var tally = {};
	for (i = 0; i < this.deck.settings.ranks.length; i += 1) {
		tally[i] = 0;
	}

	for (i = 0; i < this.theHand.length; i += 1) {
		var theCard = this.theHand[i];
		if (excludeRankIndexes.indexOf(theCard.rankIndex)) {
			tally[ this.deck.settings.ranks[ theCard.rankIndex ] ] += 1;
		}
	}

	for (i = this.deck.settings.ranks.length-1; i >= 0 ; i -= 1) {
		if (tally[ this.deck.settings.ranks[i] ] === exactCount) {
			return i;
		}
	}
	return false;
};

CardDeck.Hand.prototype.isAPair = function () {
	return this.isOfAKind(2);
}

CardDeck.Hand.prototype.isAFlush = function () {
	// all five cards must share the same suit.

	var firstCard = this.theHand[0]
	var firstSuit = firstCard.suitIndex;
	for (var i = 1; i < this.theHand.length; i += 1) {
		var card = this.theHand[i];
		if (card.suitIndex !== firstSuit) return false;
	}
	return true;
}

CardDeck.Hand.prototype.isAFullHouse = function () {
	if (this.theHand.length !== 5) throw new Error("isAFullHouse currently only supports hands with 5 cards.");
	var three = this.isOfAKind(3);
	if (three) {
		return this.isOfAKind(2, [three]);
	}
	return false;
}

CardDeck.Hand.prototype.isAStraight = function () {
	if (this.theHand.length !== 5) throw new Error("isAStraight currently only supports hands with 5 cards.");
	var count = [];
	for (var i = 0; i < this.deck.settings.ranks.length; i += 1) {
		count[i] = 0;
	}
	// count suits
	for (var i = 0; i < this.theHand.length; i += 1) {
		var rank = this.theHand[i].rankIndex;
		if ( count[rank] > 0) {
			// found a pair, can't be a straight
			return false;
		}
		count[rank] += 1;
	}
	for (var i = this.deck.settings.ranks.length; i >= 4; i -= 1) {
		if (count[i] === 1 && count[i-1] === 1 && count[i-2] === 1 && count[i-3] === 1 && count[i-4] === 1) {
			return i;
		}
	}
	return false;
}

CardDeck.Hand.prototype.isAStraightFlush = function () {
	if (this.isAFlush()) {
		return this.isAStraight();
	}
	return false;
}

CardDeck.Hand.prototype.isARoyalFlush = function () {
	return this.isAStraightFlush() === this.deck.settings.ranks.length-1;
}
