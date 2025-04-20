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
// PlayingCard Component - Handles individual cards and flip animation
class PlayingCard extends HTMLElement {
    constructor() {
        super();
        this.suit = this.getAttribute('suit') || 'HEARTS';
        this.value = this.getAttribute('value') || 'A';
        this.code = this.getAttribute('code') || 'AH';
        this.image = this.getAttribute('image') || '';
        this.isFaceUp = !this.hasAttribute('face-down');
    }

    connectedCallback() {
        this.render();
        this.addEventListener('click', () => this.flip());
    }

    flip() {
        this.isFaceUp = !this.isFaceUp;
        this.querySelector('.card').classList.toggle('flipped');
    }
    
    reveal() {
        if (!this.isFaceUp) {
            this.isFaceUp = true;
            this.querySelector('.card').classList.add('flipped');
        }
    }

    render() {
        // Create enhanced card back design with pattern and logo
        const cardBackHTML = `
            <div class="card-back" style="
                background: repeating-linear-gradient(
                    45deg,
                    #1a237e,
                    #1a237e 10px,
                    #283593 10px,
                    #283593 20px
                );
                border-radius: var(--card-border-radius);
                display: flex;
                justify-content: center;
                align-items: center;
                width: 100%;
                height: 100%;
                box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
                border: 2px solid #fff;
                position: absolute;
                backface-visibility: hidden;
            ">
                <div style="
                    background-color: rgba(255,255,255,0.9);
                    width: 70%;
                    height: 70%;
                    border-radius: calc(var(--card-border-radius) - 5px);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    position: relative;
                    box-shadow: 0 0 10px rgba(0,0,0,0.3);
                ">
                    <div style="
                        font-family: 'Casino', sans-serif;
                        font-size: 1.5rem;
                        color: #1a237e;
                        text-align: center;
                        position: relative;
                    ">
                        <div style="transform: rotate(-5deg);">B</div>
                        <div style="transform: rotate(5deg); margin-top: -0.4em;">J</div>
                    </div>
                    <div style="
                        position: absolute;
                        width: 90%;
                        height: 90%;
                        border: 2px solid #1a237e;
                        border-radius: calc(var(--card-border-radius) - 8px);
                        pointer-events: none;
                    "></div>
                </div>
            </div>
        `;

        // If we have an image from the API, use it
        if (this.image) {
            this.innerHTML = `
                <div class="card ${this.isFaceUp ? 'flipped' : ''}">
                    ${cardBackHTML}
                    <div class="card-face" style="--card-face:url('${this.image}');"></div>
                </div>
            `;
            return;
        }

        // Otherwise fall back to generating the card with API images
        this.innerHTML = `
            <div class="card ${this.isFaceUp ? 'flipped' : ''}">
                ${cardBackHTML}
                <div class="card-face" style="--card-face:url('https://deckofcardsapi.com/static/img/${this.code}.svg');">
                </div>
            </div>
        `;
    }
}

// CardDeck Component - Handles deck creation and shuffle animation
class CardDeck extends HTMLElement {
    constructor() {
        super();
        this.deckId = null;
        this.remaining = 0;
    }

    async connectedCallback() {
        await this.createDeck();
        this.render();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Connect the shuffle button
        const shuffleBtn = document.getElementById('shuffle-btn');
        if (shuffleBtn) {
            shuffleBtn.addEventListener('click', () => {
                this.shuffle();
            });
        }
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
        
        // Apply shuffle animation to all cards in the dealer and player hands
        this.animateCardShuffle();
        
        // Create or find shuffle animation container and position it on the right side
        let shuffleContainer = document.querySelector('.shuffling-container');
        if (!shuffleContainer) {
            shuffleContainer = document.createElement('div');
            shuffleContainer.className = 'shuffling-container';
            shuffleContainer.style.position = 'fixed';
            shuffleContainer.style.top = '50%';
            shuffleContainer.style.right = '50px'; // Position on the right side
            shuffleContainer.style.transform = 'translateY(-50%)';
            shuffleContainer.style.zIndex = '1000';
            shuffleContainer.style.width = '300px';
            shuffleContainer.style.height = '300px';
            shuffleContainer.style.perspective = '1000px';
            document.body.appendChild(shuffleContainer);
        }
        
        // Create multiple cards for a more dynamic animation
        shuffleContainer.innerHTML = '';
        
        // Create 7 cards with different positions and rotations
        for (let i = 0; i < 7; i++) {
            const card = document.createElement('div');
            card.className = 'shuffling-card';
            card.style.position = 'absolute';
            card.style.width = '100px';
            card.style.height = '140px';
            card.style.backgroundColor = 'white';
            card.style.border = '1px solid #333';
            card.style.borderRadius = '8px';
            card.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
            card.style.transition = 'transform 0.8s ease-in-out';
            card.style.backfaceVisibility = 'hidden';
            
            // Back of card design
            card.innerHTML = `
                <div style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: repeating-linear-gradient(
                        -45deg,
                        #a30000,
                        #a30000 10px,
                        #9a0000 10px,
                        #9a0000 20px
                    );
                    border-radius: 8px;
                "></div>
                <div style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 60px;
                    height: 80px;
                    background-color: white;
                    border-radius: 5px;
                "></div>
            `;
            
            // Set initial position
            const offsetX = Math.random() * 80 - 40;
            const offsetY = Math.random() * 80 - 40;
            const rotation = Math.random() * 20 - 10;
            card.style.transform = `translate(${offsetX}px, ${offsetY}px) rotate(${rotation}deg)`;
            
            shuffleContainer.appendChild(card);
        }
        
        shuffleContainer.style.display = 'block';
        
        // Animated shuffle sequence
        const cards = shuffleContainer.querySelectorAll('.shuffling-card');
        
        // First animation: gather cards
        setTimeout(() => {
            cards.forEach(card => {
                card.style.transform = 'translate(0, 0) rotate(0deg)';
            });
        }, 200);
        
        // Second animation: spread cards in fan
        setTimeout(() => {
            cards.forEach((card, index) => {
                const angle = -30 + (index * 10);
                const distance = 30 + (index * 5);
                card.style.transform = `translate(${distance}px, 0) rotate(${angle}deg)`;
            });
        }, 1000);
        
        // Third animation: shuffle back into deck
        setTimeout(() => {
            cards.forEach((card, index) => {
                const delay = index * 100;
                setTimeout(() => {
                    card.style.transform = 'translate(0, 100px) rotate(0deg)';
                    card.style.opacity = '0';
                }, delay);
            });
        }, 2000);
        
        try {
            // Call the API to shuffle the existing deck
            const response = await fetch(`https://deckofcardsapi.com/api/deck/${this.deckId}/shuffle/`);
            const data = await response.json();
            
            if (data.success) {
                this.remaining = data.remaining;
                console.log(`Deck shuffled. Remaining cards: ${this.remaining}`);
                
                // Hide animation after the full sequence completes
                setTimeout(() => {
                    if (shuffleContainer) {
                        shuffleContainer.style.display = 'none';
                        // Reset opacity for next animation
                        cards.forEach(card => {
                            card.style.opacity = '1';
                        });
                    }
                    this.render();
                    
                    // Stop the individual card shuffle animations
                    this.stopCardShuffleAnimation();
                    
                }, 3000);
            } else {
                console.error('Failed to shuffle deck');
                if (shuffleContainer) {
                    shuffleContainer.style.display = 'none';
                }
                this.stopCardShuffleAnimation();
            }
        } catch (error) {
            console.error('Error shuffling deck:', error);
            if (shuffleContainer) {
                shuffleContainer.style.display = 'none';
            }
            this.stopCardShuffleAnimation();
        }
    }
    
    // Apply the shuffle animation to all visible cards
    animateCardShuffle() {
        // Create or find shuffle animation container
        let shuffleContainer = document.querySelector('.shuffling-container');
        if (!shuffleContainer) {
            shuffleContainer = document.createElement('div');
            shuffleContainer.className = 'shuffling-container';
            document.body.appendChild(shuffleContainer);
        }
        
        // Clear and create the animation cards
        shuffleContainer.innerHTML = '';
        
        // Create 7 cards with different positions and animations
        for (let i = 0; i < 7; i++) {
            const card = document.createElement('div');
            card.className = 'shuffling-card';
            
            // Back of card design
            card.innerHTML = `
                <div style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: repeating-linear-gradient(
                        -45deg,
                        #1a237e,
                        #1a237e 10px,
                        #283593 10px,
                        #283593 20px
                    );
                    border-radius: 8px;
                "></div>
                <div style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 60px;
                    height: 80px;
                    background-color: white;
                    border-radius: 5px;
                "></div>
            `;
            
            // Set initial position with random offsets
            const offsetX = Math.random() * 80 - 40;
            const offsetY = Math.random() * 80 - 40;
            const rotation = Math.random() * 20 - 10;
            card.style.transform = `translate(${offsetX}px, ${offsetY}px) rotate(${rotation}deg)`;
            
            // Add variable delay to each card's animation
            card.style.animationDelay = `${i * 0.1}s`;
            
            shuffleContainer.appendChild(card);
        }
        
        shuffleContainer.style.display = 'block';
        
        // Animated shuffle sequence
        const cards = shuffleContainer.querySelectorAll('.shuffling-card');
        
        // First animation: gather cards
        setTimeout(() => {
            cards.forEach(card => {
                card.style.transform = 'translate(0, 0) rotate(0deg)';
            });
        }, 200);
        
        // Second animation: spread cards in fan
        setTimeout(() => {
            cards.forEach((card, index) => {
                const angle = -30 + (index * 10);
                const distance = 30 + (index * 5);
                card.style.transform = `translate(${distance}px, 0) rotate(${angle}deg)`;
            });
        }, 1000);
        
        // Third animation: shuffle back into deck
        setTimeout(() => {
            cards.forEach((card, index) => {
                const delay = index * 100;
                setTimeout(() => {
                    card.style.transform = 'translate(0, 100px) rotate(0deg)';
                    card.style.opacity = '0';
                }, delay);
            });
        }, 2000);
    }

    async drawCard(targetElement) {
        if (!this.deckId || this.remaining < 1) {
            console.error('Not enough cards remaining');
            return null;
        }
        
        try {
            // Call the API to draw a card
            const response = await fetch(`https://deckofcardsapi.com/api/deck/${this.deckId}/draw/?count=1`);
            const data = await response.json();
            
            if (data.success && data.cards.length > 0) {
                this.remaining = data.remaining;
                this.render(); // Update card count display
                
                const card = data.cards[0];
                
                // If target element provided, add the card to it
                if (targetElement) {
                    const cardElement = document.createElement('div');
                    cardElement.classList.add('card', 'face', 'card-drawn');
                    cardElement.style.setProperty('--card-face', `url('${card.images.svg}')`);
                    targetElement.appendChild(cardElement);
                }
                
                return card;
            } else {
                console.error('Failed to draw card');
                return null;
            }
        } catch (error) {
            console.error('Error drawing card:', error);
            return null;
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

// Register components
customElements.define('playing-card', PlayingCard);
customElements.define('card-deck', CardDeck);

// JStester implementation
const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
const numbers = ['Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King'];
const deck = [];

// Initializes deck with 52 cards
function initializeDeck() {
  for (const n of numbers) {
    for (const s of suits) {
      const cardObject = {
        number: n,
        suit: s,
        string: `${n} of ${s}`,
        url: n === '10' ? `https://deckofcardsapi.com/static/img/${n[1]}${s[0]}.svg` : `https://deckofcardsapi.com/static/img/${n[0]}${s[0]}.svg`
      };
      deck.push(cardObject);
    }
  }
}

// Shuffles a deck if deck already initialized
function shuffleDeck() {
    if (deck.length != 52) {
      console.log('Error: deck has not been initialized yet');
    }
    else {
      for (let i = deck.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
    }
  }

  function addCardToDOM() {
    const cardDrawn = deck.pop();
  
    const handElem = document.querySelector(".hand");
  
    const cardElemString = `<div class="card face" style="--card-face:url('${cardDrawn.url}');"></div>`
    const temp = document.createElement("div");
    temp.innerHTML = cardElemString
    const cardElem = temp.firstElementChild;
    handElem.appendChild(cardElem);
  }
  
  const shuffleSound = document.getElementById('shuffle-sound');
  const drawSound = document.getElementById('draw-sound');
  const palm = document.getElementById('palm');
  
  const startButton = document.getElementById('start-button');
  const hitButton = document.getElementById('hit-button');
  const standButton = document.getElementById('stand-button');
  
  
  startButton.addEventListener('click', () => {
    shuffleSound.currentTime = 0;
    shuffleSound.play();
  });
  
  hitButton.addEventListener('click', () => {
    drawSound.currentTime = 0;
    drawSound.play();
  });
  
  standButton.addEventListener('click', () => {
    console.log('Player chose to Stand');
    palm.classList.add('palm-visible');
  
    setTimeout(() => {
      palm.classList.remove('palm-visible');
    }, 2000);
  });