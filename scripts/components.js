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
//   * Creates front/back of card
//   * Shows appropriate side based on isFaceUp

// 2. CardDeck Component
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

// 3. Component Registration
// - Register components with customElements.define()
