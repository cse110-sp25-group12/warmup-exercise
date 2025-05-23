class DeckOfCardsAPI {
  constructor() {
    this.baseUrl = 'https://deckofcardsapi.com/api/deck';
    this.deckId = null;
    this.remaining = 0;
  }

  async createNewDeck(shuffled = true, deckCount = 6) {
    try {
      const endpoint = shuffled ? 
        `${this.baseUrl}/new/shuffle/?deck_count=${deckCount}` : 
        `${this.baseUrl}/new/?deck_count=${deckCount}`;
      
      const response = await fetch(endpoint);
      const data = await response.json();
      
      if (data.success) {
        this.deckId = data.deck_id;
        this.remaining = data.remaining;
        return {
          deckId: data.deck_id,
          remaining: data.remaining
        };
      } else {
        throw new Error('Failed to create a new deck');
      }
    } catch (error) {
      console.error('Error creating deck:', error);
      throw error;
    }
  }

  async shuffleDeck(remainingOnly = true) {
    console.log('DeckOfCardsAPI.shuffleDeck called with remainingOnly =', remainingOnly);
    console.log('Current deck ID:', this.deckId);
    
    if (!this.deckId) {
      console.error('No deck available to shuffle');
      throw new Error('No deck available to shuffle');
    }

    try {
      const endpoint = remainingOnly ? 
        `${this.baseUrl}/${this.deckId}/shuffle/?remaining=true` : 
        `${this.baseUrl}/${this.deckId}/shuffle/`;
      
      console.log('Making API request to:', endpoint);
      const response = await fetch(endpoint);
      const data = await response.json();
      console.log('API shuffle response:', data);
      
      if (data.success) {
        this.remaining = data.remaining;
        console.log('Shuffle successful, remaining cards:', this.remaining);
        return {
          deckId: data.deck_id,
          remaining: data.remaining
        };
      } else {
        console.error('API returned error on shuffle:', data);
        throw new Error('Failed to shuffle the deck');
      }
    } catch (error) {
      console.error('Error shuffling deck:', error);
      throw error;
    }
  }

  async drawCards(count = 1) {
    if (!this.deckId) {
      throw new Error('No deck available to draw cards from');
    }

    try {
      const response = await fetch(`${this.baseUrl}/${this.deckId}/draw/?count=${count}`);
      const data = await response.json();
      
      if (data.success) {
        this.remaining = data.remaining;
        
        // Make sure the response includes cards
        if (!data.cards || data.cards.length === 0) {
          console.warn('API returned success but no cards');
          // If we've run out of cards, create a new deck
          if (data.remaining === 0) {
            console.log('Deck is empty, creating a new shuffled deck');
            await this.createNewDeck(true);
            return this.drawCards(count);
          }
        }
        
        return {
          cards: data.cards || [],
          remaining: data.remaining
        };
      } else {
        console.error('API returned error:', data);
        throw new Error('Failed to draw cards: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error drawing cards:', error);
      throw error;
    }
  }
}

// Animation State Manager
class AnimationStateManager {
  constructor() {
    this.isAnimating = false;
  }
  
  startAnimation() {
    this.isAnimating = true;
  }
  
  endAnimation() {
    this.isAnimating = false;
  }
  
  isInAnimation() {
    return this.isAnimating;
  }
}

// 1. PlayingCard Component
class PlayingCard extends HTMLElement {
  static get observedAttributes() {
    return ['suit', 'value', 'code', 'image', 'face-up'];
  }

  constructor() {
    super();
    
    // Set properties from attributes or defaults
    this.suit = this.getAttribute('suit') || 'Hearts';
    this.value = this.getAttribute('value') || 'A';
    this.code = this.getAttribute('code') || 'AH';
    this.imageUrl = this.getAttribute('image') || 
                    `https://deckofcardsapi.com/static/img/${this.code}.png`;
    this.isFaceUp = this.hasAttribute('face-up') || false;
    
    // Create shadow DOM
    this.attachShadow({ mode: 'open' });
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    
    if (name === 'suit') this.suit = newValue;
    if (name === 'value') this.value = newValue;
    if (name === 'code') this.code = newValue;
    if (name === 'image') {
      this.imageUrl = newValue || `https://deckofcardsapi.com/static/img/${this.code}.png`;
      // Update card face if already rendered
      const cardFace = this.shadowRoot?.querySelector('.card-face');
      if (cardFace) {
        cardFace.style.backgroundImage = `url('${this.imageUrl}')`;
      }
    }
    if (name === 'face-up') {
      const wasFlipped = this.isFaceUp;
      this.isFaceUp = newValue !== null;
      if (wasFlipped !== this.isFaceUp) {
        const card = this.shadowRoot?.querySelector('.card');
        if (card) {
          if (this.isFaceUp) {
            card.classList.add('flipped');
          } else {
            card.classList.remove('flipped');
          }
        }
      }
    }
  }
  
  connectedCallback() {
    this.render();
    this.addEventListener('click', () => this.flip());
  }
  
  flip() {
    this.isFaceUp = !this.isFaceUp;
    const card = this.shadowRoot.querySelector('.card');
    
    if (this.isFaceUp) {
      card.classList.add('flipped');
      this.dispatchEvent(new CustomEvent('card-flipped', { 
        detail: { card: this, faceUp: true },
        bubbles: true 
      }));
    } else {
      card.classList.remove('flipped');
      this.dispatchEvent(new CustomEvent('card-flipped', { 
        detail: { card: this, faceUp: false },
        bubbles: true 
      }));
    }
  }
  
  setFaceUp(faceUp) {
    if (this.isFaceUp !== faceUp) {
      if (faceUp) {
        this.setAttribute('face-up', '');
      } else {
        this.removeAttribute('face-up');
      }
      this.flip();
    }
  }
  
  render() {
    // Card styles
    const styles = `
      .card {
        width: var(--card-width, 12vw);
        height: var(--card-height, calc(12vw * 1.4));
        position: relative;
        transform-style: preserve-3d;
        transition: transform 0.6s ease;
      }
      
      .card.flipped {
        transform: rotateY(180deg);
      }
      
      .card-face, .card-back {
        position: absolute;
        width: 100%;
        height: 100%;
        backface-visibility: hidden;
        border-radius: var(--card-border-radius, 1vw);
        box-shadow: 0.3vw 0.3vh 0.25vw rgba(0,0,0,0.3);
        overflow: hidden;
        border: var(--card-border, 0.25vw solid #000000);
      }
      
      .card-back {
        background: url('card_design_images/card_back.jpg') center/cover;
        transform: rotateY(0deg);
      }
      
      .card-face {
        background: white url('${this.imageUrl}') center/cover;
        transform: rotateY(180deg);
      }
      
      .card.drawing {
        animation: drawCard 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      }
      
      .card.shuffling {
        animation: shuffleCard 0.8s ease-in-out;
      }
      
      @keyframes drawCard {
        0% {
          transform: translate(-15vw, -10vw) rotate(-15deg) scale(0.8);
          opacity: 0;
        }
        50% {
          transform: translate(0, -2vw) rotate(5deg) scale(1.05);
          opacity: 1;
        }
        100% {
          transform: translate(0, 0) rotate(0) scale(1);
        }
      }
      
      @keyframes shuffleCard {
        0% { transform: translate(0, 0) rotate(0deg) scale(1); }
        25% { transform: translate(1vw, -1.5vw) rotate(15deg) scale(1.05); }
        50% { transform: translate(-1vw, 1vw) rotate(-15deg) scale(1.1); }
        75% { transform: translate(0.5vw, -0.5vw) rotate(5deg) scale(1.05); }
        100% { transform: translate(0, 0) rotate(0deg) scale(1); }
      }
    `;
    
    // Create card HTML structure
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <div class="card ${this.isFaceUp ? 'flipped' : ''}">
        <div class="card-back"></div>
        <div class="card-face"></div>
      </div>
    `;
  }
  
  addDrawingClass() {
    const card = this.shadowRoot.querySelector('.card');
    card.classList.add('drawing');
    card.addEventListener('animationend', () => {
      card.classList.remove('drawing');
    }, { once: true });
  }
  
  addShufflingClass() {
    const card = this.shadowRoot.querySelector('.card');
    card.classList.add('shuffling');
    card.addEventListener('animationend', () => {
      card.classList.remove('shuffling');
    }, { once: true });
  }
}

// 2. CardShoe Component
class CardShoe extends HTMLElement {
  constructor() {
    super();
    this.deckCount = parseInt(this.getAttribute('deck-count') || '6', 10);
    this.api = new DeckOfCardsAPI();
    this.cards = [];
    this.animationState = new AnimationStateManager();
    
    // Create shadow DOM
    this.attachShadow({ mode: 'open' });
  }
  
  async connectedCallback() {
    await this.initialize();
    this.render();
    
    // Add event listener for draw button
    this.shadowRoot.querySelector('.draw-button')
      .addEventListener('click', () => this.handleDrawRequest());
  }
  
  async initialize() {
    try {
      const result = await this.api.createNewDeck(true, this.deckCount);
      this.deckId = result.deckId;
      this.remaining = result.remaining;
    } catch (error) {
      console.error('Failed to initialize card shoe:', error);
    }
  }
  
  async handleDrawRequest() {
    if (this.animationState.isInAnimation()) {
      return; // Don't allow drawing while animation is in progress
    }
    
    try {
      this.animationState.startAnimation();
      
      // Play draw sound
      const drawSound = document.getElementById('draw-sound');
      if (drawSound) {
        drawSound.currentTime = 0;
        drawSound.play();
      }
      
      const result = await this.api.drawCards(1);
      if (result.cards && result.cards.length > 0) {
        const cardData = result.cards[0];
        
        // Dispatch event with card data
        this.dispatchEvent(new CustomEvent('card-drawn', {
          detail: { card: cardData },
          bubbles: true
        }));
        
        this.remaining = result.remaining;
        this.render();
      }
      
      // Wait for the animation to complete
      setTimeout(() => {
        this.animationState.endAnimation();
      }, 700); // Match the animation duration
      
    } catch (error) {
      console.error('Error drawing card:', error);
      this.animationState.endAnimation();
    }
  }
  
  remaining() {
    return this.api.remaining;
  }
  
  render() {
    const styles = `
      .card-shoe {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
      }
      
      .deck {
        width: var(--card-width, 12vw);
        height: var(--card-height, calc(12vw * 1.4));
        background: url('card_design_images/card_back.jpg') center/cover;
        border-radius: var(--card-border-radius, 1vw);
        border: var(--card-border, 0.25vw solid #000000);
        box-shadow: 0 0.5vw 0.5vw rgba(0,0,0,0.3);
        position: relative;
      }
      
      .deck::after {
        content: "${this.remaining}";
        position: absolute;
        top: -10px;
        right: -10px;
        background: red;
        color: white;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: bold;
        font-family: var(--system-ui);
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      }
      
      .draw-button {
        padding: 1vh 2vw;
        background-color: #085c25; 
        color: rgb(255, 217, 0); 
        font-family: "Casino", sans-serif;
        font-size: 1.2rem;
        border: 0.15vw solid rgb(255, 217, 0);
        border-radius: 0.75rem;
        cursor: pointer;
        box-shadow: 0px 4px 10px rgba(0,0,0,0.5);
        transition: background-color 0.3s, transform 0.2s;
      }
      
      .draw-button:hover {
        background-color: #0a7c30;
        transform: scale(1.05);
      }
      
      .draw-button:active {
        background-color: #064d1a;
        transform: scale(0.98);
      }
    `;
    
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <div class="card-shoe">
        <div class="deck"></div>
        <button class="draw-button">Draw Card</button>
      </div>
    `;
  }
}

// 3. CardDeck Component
class CardDeck extends HTMLElement {
  constructor() {
    super();
    this.cards = [];
    this.api = new DeckOfCardsAPI();
    this.animationState = new AnimationStateManager();
    this.deckId = null;
    this.remaining = 0;
    
    // Create shadow DOM
    this.attachShadow({ mode: 'open' });
  }
  
  async connectedCallback() {
    console.log('CardDeck connected to DOM');
    await this.createDeck();
    this.render();
    
    // Add event listener for shuffle button
    const shuffleButton = this.shadowRoot.querySelector('.shuffle-button');
    console.log('Found shuffle button?', !!shuffleButton);
    
    if (shuffleButton) {
      console.log('Adding click event listener to shuffle button');
      shuffleButton.addEventListener('click', (e) => {
        console.log('Shuffle button clicked');
        this.handleShuffleRequest();
      });
    } else {
      console.error('Shuffle button not found in shadowRoot');
    }
  }
  
  async createDeck() {
    try {
      console.log('CardDeck.createDeck called');
      console.log('Creating new deck...');
      const result = await this.api.createNewDeck(true); // Create shuffled deck
      console.log('Deck creation result:', result);
      this.deckId = result.deckId;
      this.remaining = result.remaining;
      console.log('Deck created:', { deckId: this.deckId, remaining: this.remaining });
      
      // Update the UI counter
      this.updateDeckCounter();
      
      return result;
    } catch (error) {
      console.error('Failed to create deck:', error);
      throw error;
    }
  }
  
  async handleShuffleRequest() {
    console.log('handleShuffleRequest called');
    
    if (this.animationState.isInAnimation()) {
      console.log('Animation in progress, ignoring shuffle request');
      return; // Don't allow shuffling while animation is in progress
    }
    
    try {
      console.log('Starting shuffle animation');
      this.animationState.startAnimation();
      this.showShufflingAnimation();
      
      // Play shuffle sound
      const shuffleSound = document.getElementById('shuffle-sound');
      console.log('Found shuffle sound element?', !!shuffleSound);
      if (shuffleSound) {
        shuffleSound.currentTime = 0;
        shuffleSound.play().catch(e => console.error('Error playing shuffle sound:', e));
      }
      
      // Add shuffling class to deck
      const deck = this.shadowRoot.querySelector('.deck');
      deck.classList.add('shuffling');
      
      // Create some flying cards for a more dramatic effect
      this.createFlyingCards();
      
      // Wait for animation, then create a new deck instead of shuffling
      setTimeout(async () => {
        await this.createDeck(); // Create a completely new deck instead of shuffling
        
        // Update the UI counter
        this.updateDeckCounter();
        
        // Dispatch event
        this.dispatchEvent(new CustomEvent('deck-shuffled', {
          bubbles: true
        }));
        
        deck.classList.remove('shuffling');
        this.hideShufflingAnimation();
        this.animationState.endAnimation();
      }, 1500); // Match with animation duration
    } catch (error) {
      console.error('Error shuffling deck:', error);
      this.hideShufflingAnimation();
      this.animationState.endAnimation();
    }
  }
  
  createFlyingCards() {
    // Create flying cards that scatter from the deck
    const body = document.body;
    
    for (let i = 0; i < 10; i++) {
      const flyingCard = document.createElement('div');
      flyingCard.className = 'flying-card';
      
      // Random position, rotation and delay
      const randomX = Math.random() * 60 - 30; // -30 to 30
      const randomY = Math.random() * 40 - 20; // -20 to 20
      const randomRotate = Math.random() * 360; // 0 to 360
      const randomDelay = Math.random() * 0.5; // 0 to 0.5
      
      flyingCard.style.setProperty('--fly-x', `${randomX}vw`);
      flyingCard.style.setProperty('--fly-y', `${randomY}vh`);
      flyingCard.style.setProperty('--rotate', `${randomRotate}deg`);
      flyingCard.style.animationDelay = `${randomDelay}s`;
      
      // Add card back image
      flyingCard.style.backgroundImage = "url('card_design_images/card_back.jpg')";
      
      body.appendChild(flyingCard);
      
      // Remove the card after animation
      setTimeout(() => {
        flyingCard.remove();
      }, 2000);
    }
  }
  
  showShufflingAnimation() {
    const shufflingContainer = document.querySelector('.shuffling-container');
    if (shufflingContainer) {
      // Clear any existing cards
      shufflingContainer.innerHTML = '';
      
      // Create 5 shuffling cards with different animation delays
      for (let i = 0; i < 5; i++) {
        const card = document.createElement('div');
        card.className = 'shuffling-card';
        card.style.zIndex = 10 + i;
        card.style.animationDelay = `${i * 0.15}s`;
        card.style.left = `${(i - 2) * 15}px`;
        // Add card back image
        card.style.backgroundImage = "url('card_design_images/card_back.jpg')";
        shufflingContainer.appendChild(card);
      }
      
      shufflingContainer.style.display = 'block';
      
      // Add animation to the deck
      const deck = this.shadowRoot.querySelector('.deck');
      if (deck) {
        deck.classList.add('shuffling-animation');
      }
    }
  }
  
  hideShufflingAnimation() {
    const shufflingContainer = document.querySelector('.shuffling-container');
    if (shufflingContainer) {
      // Fade out animation
      shufflingContainer.style.opacity = '0';
      
      // Wait for fade out and then hide
      setTimeout(() => {
        shufflingContainer.style.display = 'none';
        shufflingContainer.style.opacity = '1';
        shufflingContainer.innerHTML = ''; // Clean up the cards
      }, 300);
    }
    
    // Remove animation from the deck
    const deck = this.shadowRoot.querySelector('.deck');
    if (deck) {
      deck.classList.remove('shuffling-animation');
    }
  }
  
  async drawToHand(handElement, count = 1, faceUp = true) {
    if (!handElement) {
      throw new Error('No hand element provided');
    }
    
    try {
      const result = await this.api.drawCards(count);
      console.log('API response for draw cards:', result);
      
      if (result.cards && result.cards.length > 0) {
        result.cards.forEach(cardData => {
          console.log('Card data from API:', cardData);
          
          const cardElement = document.createElement('playing-card');
          
          // Make sure to convert suit and value correctly
          // API returns uppercase suit, convert to proper case
          const suit = cardData.suit.charAt(0) + cardData.suit.slice(1).toLowerCase();
          
          cardElement.setAttribute('suit', suit);
          cardElement.setAttribute('value', cardData.value);
          cardElement.setAttribute('code', cardData.code);
          cardElement.setAttribute('image', cardData.image);
          
          console.log('Creating card with attributes:', {
            suit,
            value: cardData.value,
            code: cardData.code,
            image: cardData.image
          });
          
          if (faceUp) {
            cardElement.setAttribute('face-up', '');
          }
          
          handElement.appendChild(cardElement);
          
          // Add drawing animation
          setTimeout(() => {
            if (cardElement.addDrawingClass) {
              cardElement.addDrawingClass();
            }
          }, 10);
        });
        
        // Update remaining count
        this.remaining = result.remaining;
        this.render();
        
        // Update any deck counter display in the UI
        this.updateDeckCounter();
        
        return result.cards;
      }
    } catch (error) {
      console.error('Error drawing cards to hand:', error);
      throw error;
    }
  }
  
  updateDeckCounter() {
    // Find any visual deck elements that need updating
    const deckElement = document.querySelector('.card-shoe .deck');
    if (deckElement) {
      // Update visual counter if needed
      deckElement.setAttribute('data-count', this.remaining);
      // If there's a counter showing in pseudo-element or other UI element
      deckElement.style.setProperty('--count', this.remaining);
    }
  }
  
  render() {
    const styles = `
      .card-deck {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
      }
      
      .deck {
        width: var(--card-width, 12vw);
        height: var(--card-height, calc(12vw * 1.4));
        background: url('card_design_images/card_back.jpg') center/cover;
        border-radius: var(--card-border-radius, 1vw);
        border: var(--card-border, 0.25vw solid #000000);
        box-shadow: 0 0.5vw 0.5vw rgba(0,0,0,0.3);
        position: relative;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }
      
      .deck.shuffling {
        animation: shuffleCard 0.5s ease-in-out infinite;
      }
      
      .deck.shuffling-animation {
        animation: shuffleDeck 1s ease-in-out infinite;
        box-shadow: 0 0.8vw 1vw rgba(255,215,0,0.6);
      }
      
      @keyframes shuffleCard {
        0% { transform: translate(0, 0) rotate(0deg); }
        25% { transform: translate(5px, -5px) rotate(5deg); }
        50% { transform: translate(-5px, 5px) rotate(-5deg); }
        75% { transform: translate(5px, 5px) rotate(3deg); }
        100% { transform: translate(0, 0) rotate(0deg); }
      }
      
      @keyframes shuffleDeck {
        0% { transform: translate(0, 0) rotate(0deg) scale(1); }
        20% { transform: translate(-10px, -5px) rotate(-8deg) scale(1.05); }
        40% { transform: translate(12px, 3px) rotate(10deg) scale(1.05); }
        60% { transform: translate(-8px, 5px) rotate(-5deg) scale(1.02); }
        80% { transform: translate(8px, -3px) rotate(5deg) scale(1.02); }
        100% { transform: translate(0, 0) rotate(0deg) scale(1); }
      }
      
      .deck::after {
        content: "${this.remaining}";
        position: absolute;
        top: -10px;
        right: -10px;
        background: red;
        color: white;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: bold;
        font-family: var(--system-ui);
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      }
    `;
    
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <div class="card-deck">
        <div class="deck"></div>
      </div>
    `;
  }
}

// 4. CardHand Component
class CardHand extends HTMLElement {
  constructor() {
    super();
    this.cards = [];
    
    // Create shadow DOM
    this.attachShadow({ mode: 'open' });
  }
  
  connectedCallback() {
    this.render();
  }
  
  addCard(cardData, faceUp = true) {
    // Create and add a new playing card
    const card = document.createElement('playing-card');
    
    // Make sure to convert suit and value correctly
    // API returns uppercase suit, convert to proper case
    const suit = cardData.suit.charAt(0) + cardData.suit.slice(1).toLowerCase();
    
    card.setAttribute('suit', suit);
    card.setAttribute('value', cardData.value);
    card.setAttribute('code', cardData.code);
    card.setAttribute('image', cardData.image);
    
    if (faceUp) {
      card.setAttribute('face-up', '');
    }
    
    this.cards.push({ element: card, data: cardData });
    this.shadowRoot.querySelector('.hand-container').appendChild(card);
    
    // Add drawing animation
    setTimeout(() => {
      if (card.addDrawingClass) {
        card.addDrawingClass();
      }
    }, 10);
    
    return card;
  }
  
  removeCard(index) {
    if (index >= 0 && index < this.cards.length) {
      const card = this.cards[index];
      card.element.remove();
      this.cards.splice(index, 1);
    }
  }
  
  clear() {
    this.cards = [];
    this.shadowRoot.querySelector('.hand-container').innerHTML = '';
  }
  
  render() {
    const styles = `
      .hand-container {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 10px;
        padding: 10px;
        min-height: calc(var(--card-height, calc(12vw * 1.4)) + 20px);
        min-width: var(--card-width, 12vw);
      }
    `;
    
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <div class="hand-container"></div>
    `;
  }
}

// Main game controller
class CardGameController {
  constructor() {
    this.deck = null;
    this.playerHand = null;
    this.dealerHand = null;
    this.gameState = {
      deck_id: null,
      remaining: 0,
      isPlayerTurn: true,
      isGameOver: false
    };
  }
  
  async initialize() {
    // Set up card deck
    console.log('CardGameController initializing...');
    this.deck = document.querySelector('card-deck');
    console.log('Found card-deck element?', !!this.deck);
    
    if (!this.deck) {
      console.log('Creating new card-deck element');
      this.deck = document.createElement('card-deck');
      // Properly append the card-deck to the card-shoe container
      const cardShoeDiv = document.querySelector('.card-shoe');
      console.log('Found card-shoe element?', !!cardShoeDiv);
      
      if (cardShoeDiv) {
        // Clear existing content
        cardShoeDiv.innerHTML = '';
        // Add card-deck element
        cardShoeDiv.appendChild(this.deck);
        console.log('Appended card-deck to card-shoe');
      } else {
        console.error("Couldn't find .card-shoe element");
      }
    }
    
    // Set up player and dealer hands
    this.playerHand = document.querySelector('.hand');
    this.dealerHand = document.querySelector('.dealer');
    
    // Set up event listeners
    document.getElementById('hit-button').addEventListener('click', () => this.handleHit());
    document.getElementById('stand-button').addEventListener('click', () => this.handleStand());
    document.getElementById('restart-button').addEventListener('click', () => this.restartGame());
    
    // Add event listener for the Deal button
    const dealButton = document.getElementById('deal-button');
    if (dealButton) {
      console.log('Found deal button, adding event listener');
      dealButton.addEventListener('click', () => {
        console.log('Deal button clicked');
        this.restartGame();
      });
    } else {
      console.error('Deal button not found in DOM');
    }
    
    // Set up animation listeners
    document.addEventListener('deck-shuffled', () => this.onDeckShuffled());
    document.addEventListener('card-drawn', (e) => this.onCardDrawn(e.detail.card));
    
    // Initialize game
    await this.restartGame();
  }
  
  async restartGame() {
    try {
      console.log('Starting new game/deal');
      
      // Clear hands
      this.playerHand.innerHTML = '';
      this.dealerHand.innerHTML = '';
      
      // Reset game state
      this.gameState = {
        deck_id: this.deck ? this.deck.deckId : null,
        remaining: this.deck ? this.deck.remaining : 0,
        isPlayerTurn: true,
        isGameOver: false
      };
      
      // If we don't have a deck or cards are running low, create a new shuffled deck
      if (!this.deck || !this.deck.deckId || this.deck.remaining < 15) {
        console.log('Creating and shuffling a new deck');
        if (this.deck) {
          await this.deck.createDeck();
          await this.deck.handleShuffleRequest();
          
          // Wait for shuffle animation
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      } else {
        console.log('Using existing deck with', this.deck.remaining, 'cards remaining');
      }
      
      // Deal initial cards
      await this.dealInitialCards();
      
    } catch (error) {
      console.error('Error restarting game:', error);
    }
  }
  
  async dealInitialCards() {
    try {
      console.log("Starting initial deal...");
      
      // Deal 2 cards to player (face up)
      console.log("Dealing cards to player...");
      const playerCards = await this.deck.drawToHand(this.playerHand, 2, true);
      console.log("Player cards dealt:", playerCards);
      
      // Deal 2 cards to dealer (1 face down, 1 face up)
      console.log("Dealing cards to dealer...");
      const dealerCards = await this.deck.drawToHand(this.dealerHand, 2, false);
      console.log("Dealer cards dealt:", dealerCards);
      
      // Flip the second dealer card
      const dealerCardElements = this.dealerHand.querySelectorAll('playing-card');
      console.log("Dealer card elements:", dealerCardElements);
      
      if (dealerCardElements.length >= 2) {
        setTimeout(() => {
          console.log("Flipping second dealer card to face up");
          dealerCardElements[1].setFaceUp(true);
        }, 500);
      }
    } catch (error) {
      console.error('Error dealing initial cards:', error);
    }
  }
  
  async handleHit() {
    console.log('Hit button clicked. Game state:', this.gameState);
    
    if (!this.gameState.isPlayerTurn || this.gameState.isGameOver) {
      console.log('Cannot hit: Player turn is over or game is over');
      return;
    }
    
    try {
      // Play draw sound
      const drawSound = document.getElementById('draw-sound');
      if (drawSound) {
        drawSound.currentTime = 0;
        drawSound.play();
      }
      
      console.log('Drawing a card for the player...');
      
      // Draw a card for the player
      const cardResult = await this.deck.drawToHand(this.playerHand, 1, true);
      console.log('Card drawn result:', cardResult);
      
      // Check if player has bust (would need card value calculation in a real game)
      // For now, we'll just continue
    } catch (error) {
      console.error('Error handling hit:', error);
    }
  }
  
  async handleStand() {
    console.log('Stand button clicked');
    
    try {
      // Show the palm animation immediately, regardless of game state
      const palm = document.getElementById('palm');
      console.log('Found palm element?', !!palm);
      
      if (palm) {
        // Direct style manipulation for maximum reliability
        palm.style.opacity = "1";
        palm.style.visibility = "visible";
        console.log('Palm styles applied directly:', palm.style.opacity, palm.style.visibility);
        
        // Also add the class for good measure
        palm.classList.add('palm-visible');
        console.log('Palm-visible class added');
        
        // Remove the palm animation after a delay
        setTimeout(() => {
          palm.style.opacity = "0";
          palm.style.visibility = "hidden";
          palm.classList.remove('palm-visible');
          console.log('Palm hidden');
        }, 2000);
      } else {
        console.error('Palm element not found');
      }
      
      // Only proceed with game logic if it's player's turn and game isn't over
      if (!this.gameState.isPlayerTurn || this.gameState.isGameOver) {
        console.log('Game actions skipped: Player turn is over or game is over');
        return;
      }
      
      // End player's turn
      this.gameState.isPlayerTurn = false;
      
      // Reveal dealer's first card
      const dealerCardElements = this.dealerHand.querySelectorAll('playing-card');
      if (dealerCardElements.length > 0) {
        dealerCardElements[0].setFaceUp(true);
      }
      
      // End the game after the palm animation
      setTimeout(() => {
        this.gameState.isGameOver = true;
      }, 2000);
      
    } catch (error) {
      console.error('Error handling stand:', error);
    }
  }
  
  onDeckShuffled() {
    console.log('Deck has been shuffled');
  }
  
  onCardDrawn(cardData) {
    console.log('Card drawn:', cardData);
  }
}

// Initialize the components
customElements.define('playing-card', PlayingCard);
customElements.define('card-shoe', CardShoe);
customElements.define('card-deck', CardDeck);
customElements.define('card-hand', CardHand);

// Initialize the game on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  // Fix sound paths if needed
  const shuffleSound = document.getElementById('shuffle-sound');
  const drawSound = document.getElementById('draw-sound');
  
  if (shuffleSound && shuffleSound.src.includes('../sounds/')) {
    shuffleSound.src = shuffleSound.src.replace('../sounds/', 'sounds/');
  }
  
  if (drawSound && drawSound.src.includes('../sounds/')) {
    drawSound.src = drawSound.src.replace('../sounds/', 'sounds/');
  }
  
  const game = new CardGameController();
  game.initialize();
  
  // Initialize deck counter display
  setTimeout(() => {
    if (game.deck) {
      game.deck.updateDeckCounter();
    }
  }, 1000); // Give time for the deck to be created
  
  // Add direct event listener for the shuffle button
  const directShuffleButton = document.getElementById('direct-shuffle-button');
  if (directShuffleButton) {
    console.log('Found direct shuffle button, adding event listener');
    directShuffleButton.addEventListener('click', () => {
      console.log('Direct shuffle button clicked');
      if (game.deck) {
        console.log('Calling handleShuffleRequest directly');
        game.deck.handleShuffleRequest();
      } else {
        console.error('No deck available for direct shuffle');
      }
    });
  } else {
    console.error('Direct shuffle button not found in DOM');
  }
});

