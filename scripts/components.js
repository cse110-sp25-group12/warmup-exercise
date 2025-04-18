// COMPONENT IMPLEMENTATION INSTRUCTIONS

// 1. PlayingCard Component
// - Create a PlayingCard class extending HTMLElement
// - Implement constructor that sets:
//   * suit property (from attribute or default)
//   * value property (from attribute or default)
//   * isFaceUp property (default to false)
// - Add connectedCallback method that:
//   * Creates card HTML structure
//   * Adds click event listener for flipping
// - Create flip() method that:
//   * Toggles isFaceUp state
//   * Adds/removes CSS class for animation
// - Implement render() method that:
//   * Creates front/back of card with suit symbol and value
//   * Shows appropriate side based on isFaceUp

// 2. CardShoe Component
// - Create CardShoe class extending HTMLElement
// - Implement constructor initializing multiple decks
// - Add connectedCallback method that renders the shoe
// - Add draw() method that returns the top card
// - Implement remaining() method to count remaining cards
// - Add render() method showing shoe with cards and draw button

// 3. CardDeck Component
// - Create CardDeck class extending HTMLElement
// - Implement constructor initializing cards array
// - Add connectedCallback method that:
//   * Calls createDeck()
//   * Renders the deck
// - Implement createDeck() method that:
//   * Creates standard 52-card deck with suits and values
// - Add shuffle() method that:
//   * Randomizes card order using Fisher-Yates algorithm
//   * Triggers animation effects
//   * Re-renders deck after shuffle
// - Create render() method that:
//   * Creates deck container with shuffle button
//   * Renders all cards using PlayingCard component
//   * Attaches event listener to shuffle button
// - Add drawToHand() method:
//   * Draws top card from the deck
//   * Adds card to specified hand or area

// 4. CardHand Component
// - Create CardHand class extending HTMLElement
// - Implement constructor for a hand of cards
// - Add connectedCallback method to render the hand
// - Create addCard() method to add a card to the hand
// - Implement removeCard() method to discard a card
// - Add render() method to display cards in hand formation

// 5. Component Registration

// - Register all components with customElements.define()

// Card Deck Web Components with API Integration

// PlayingCard Component
class PlayingCard extends HTMLElement {
    constructor() {
        super();
        this.suit = this.getAttribute('suit') || 'HEARTS';
        this.value = this.getAttribute('value') || 'A';
        this.code = this.getAttribute('code') || 'AH';
        this.image = this.getAttribute('image') || '';
        this.isFaceUp = false;
    }

    connectedCallback() {
        this.render();
        this.addEventListener('click', () => this.flip());
    }

    flip() {
        this.isFaceUp = !this.isFaceUp;
        this.querySelector('.card').classList.toggle('flipped');
    }

    render() {
        // If we have an image from the API, use it
        if (this.image) {
            this.innerHTML = `
                <div class="card">
                    <div class="card face" style="--card-face:url('${this.image}');"></div>
                    <div class="card-back"></div>
                </div>
            `;
            return;
        }

        // Otherwise fall back to generating the card
        const suitSymbol = {
            'HEARTS': '♥',
            'DIAMONDS': '♦',
            'CLUBS': '♣',
            'SPADES': '♠'
        }[this.suit] || '♥';

        const color = (this.suit === 'HEARTS' || this.suit === 'DIAMONDS') ? 'red' : 'black';

        this.innerHTML = `
            <div class="card">
                <div class="card face" style="--card-face:url('https://deckofcardsapi.com/static/img/${this.code}.svg');">
                </div>
                <div class="card-back"></div>
            </div>
        `;
    }
}

// CardDeck Component using Deck of Cards API
class CardDeck extends HTMLElement {
    constructor() {
        super();
        this.deckId = null;
        this.remaining = 0;
    }

    async connectedCallback() {
        await this.createDeck();
        this.render();
    }

    async createDeck() {
        try {
            // Create a new shuffled deck using the API
            const response = await fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1');
            const data = await response.json();
            
            if (data.success) {
                this.deckId = data.deck_id;
                this.remaining = data.remaining;
                console.log(`New deck created with ID: ${this.deckId}`);
            } else {
                console.error('Failed to create deck');
            }
        } catch (error) {
            console.error('Error creating deck:', error);
        }
    }

    async shuffle() {
        if (!this.deckId) {
            await this.createDeck();
            return;
        }
        
        // Show shuffle animation
        const shuffleContainer = document.querySelector('.shuffling-container');
        if (shuffleContainer) {
            shuffleContainer.innerHTML = `
                <div class="shuffling-card" style="transform: rotate(5deg) translate(-30px, -20px);"></div>
                <div class="shuffling-card" style="transform: rotate(-8deg) translate(10px, 0px);"></div>
                <div class="shuffling-card" style="transform: rotate(12deg) translate(25px, -15px);"></div>
            `;
            shuffleContainer.style.display = 'block';
        }
        
        try {
            // Call the API to shuffle the existing deck
            const response = await fetch(`https://deckofcardsapi.com/api/deck/${this.deckId}/shuffle/`);
            const data = await response.json();
            
            if (data.success) {
                this.remaining = data.remaining;
                console.log(`Deck shuffled. Remaining cards: ${this.remaining}`);
                
                // Hide animation after delay
                setTimeout(() => {
                    if (shuffleContainer) {
                        shuffleContainer.style.display = 'none';
                    }
                    this.render();
                }, 1500);
            } else {
                console.error('Failed to shuffle deck');
                if (shuffleContainer) {
                    shuffleContainer.style.display = 'none';
                }
            }
        } catch (error) {
            console.error('Error shuffling deck:', error);
            if (shuffleContainer) {
                shuffleContainer.style.display = 'none';
            }
        }
    }

    async drawCards(count = 1) {
        if (!this.deckId || this.remaining < count) {
            console.error('Not enough cards remaining');
            return [];
        }
        
        try {
            // Call the API to draw cards
            const response = await fetch(`https://deckofcardsapi.com/api/deck/${this.deckId}/draw/?count=${count}`);
            const data = await response.json();
            
            if (data.success) {
                this.remaining = data.remaining;
                console.log(`Drew ${count} cards. Remaining: ${this.remaining}`);
                this.render(); // Update card count display
                return data.cards;
            } else {
                console.error('Failed to draw cards');
                return [];
            }
        } catch (error) {
            console.error('Error drawing cards:', error);
            return [];
        }
    }

    async drawToHand(handElement, count = 1) {
        const cards = await this.drawCards(count);
        
        if (cards.length > 0 && handElement) {
            cards.forEach(card => {
                // Create card element and add to hand
                const cardElement = document.createElement('div');
                cardElement.classList.add('card', 'face', 'card-drawn');
                cardElement.style.setProperty('--card-face', `url('${card.images.svg}')`);
                
                // Add to hand
                handElement.appendChild(cardElement);
                
                // If hand has an addCard method, call it
                if (typeof handElement.addCard === 'function') {
                    handElement.addCard(card);
                }
            });
        }
    }

    render() {
        this.innerHTML = `
            <div class="deck">
                <div class="card-count">Remaining: ${this.remaining}</div>
            </div>
        `;
    }
}

// CardHand Component
class CardHand extends HTMLElement {
    constructor() {
        super();
        this.cards = [];
    }

    connectedCallback() {
        this.render();
    }

    addCard(card) {
        this.cards.push(card);
    }

    removeCard(index) {
        if (index >= 0 && index < this.cards.length) {
            this.cards.splice(index, 1);
            this.render();
        }
    }

    render() {
        // Empty hand is handled by the parent HTML
    }
}

// CardShoe Component (for multiple decks)
class CardShoe extends HTMLElement {
    constructor() {
        super();
        this.deckCount = parseInt(this.getAttribute('deck-count') || '6');
        this.deckId = null;
        this.remaining = 0;
    }

    async connectedCallback() {
        await this.createShoe();
        this.render();
    }

    async createShoe() {
        try {
            // Create a new shuffled shoe with multiple decks
            const response = await fetch(`https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=${this.deckCount}`);
            const data = await response.json();
            
            if (data.success) {
                this.deckId = data.deck_id;
                this.remaining = data.remaining;
                console.log(`New shoe created with ${this.deckCount} decks. ID: ${this.deckId}`);
            } else {
                console.error('Failed to create shoe');
            }
        } catch (error) {
            console.error('Error creating shoe:', error);
        }
    }

    async draw() {
        if (!this.deckId || this.remaining < 1) {
            console.error('No cards remaining in shoe');
            return null;
        }
        
        try {
            const response = await fetch(`https://deckofcardsapi.com/api/deck/${this.deckId}/draw/?count=1`);
            const data = await response.json();
            
            if (data.success && data.cards.length > 0) {
                this.remaining = data.remaining;
                this.render();
                return data.cards[0];
            } else {
                console.error('Failed to draw card');
                return null;
            }
        } catch (error) {
            console.error('Error drawing card:', error);
            return null;
        }
    }

    remaining() {
        return this.remaining;
    }

    render() {
        this.innerHTML = `
            <div class="deck">
                <div class="shoe-count">Cards: ${this.remaining}</div>
            </div>
        `;
    }
}

// Register custom elements
customElements.define('playing-card', PlayingCard);
customElements.define('card-deck', CardDeck);
customElements.define('card-hand', CardHand);
customElements.define('card-shoe', CardShoe);
