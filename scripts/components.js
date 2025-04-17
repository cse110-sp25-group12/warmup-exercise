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
