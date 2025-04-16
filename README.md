# warmup-exercise
Step1: Card Deck and Playing Card Web Components complete with animation of flip and/or shuffle (HTML, CSS, and very light JS)

# Card Deck Web Component Exercise

## Project Setup Instructions

### 1. Create Project Structure
- Create a main project folder named `warmup-exercise`
- Inside this folder, create the following:
  - `index.html` file (main entry point)
  - `styles` folder with `main.css` file
  - `scripts` folder with `components.js` file
  - `assets/images` folder (for any card images if needed)

### 2. HTML Structure (index.html)
- Set up a basic HTML5 document
- Include proper metadata and viewport settings
- Link to the CSS file in the head section
- Add a `<card-deck>` custom element in the body
- Include the JavaScript file at the end of the body

### 3. Web Components (components.js)
- Create a `PlayingCard` class that extends HTMLElement
  - Implement constructor with properties for suit, value, and face-up state
  - Add connectedCallback method to render the card
  - Create a flip method to handle animation when clicking a card
  - Add render method to generate HTML structure for each card

- Create a `CardDeck` class that extends HTMLElement
  - Include methods to create a standard deck (52 cards)
  - Implement a shuffle method with animation effects
  - Add render method to display all cards in the deck
  - Register event listeners for shuffle button

- Register both components using customElements.define()

### 4. Styling (main.css)
- Style the cards with appropriate dimensions and margins
- Create flip animation using CSS transforms and transitions
- Style the card front and back faces differently
- Format the overall deck layout with flexbox for responsive design
- Style the shuffle button and any other UI elements

### 5. Testing
- Open index.html in a browser
- Verify cards display correctly
- Test flip functionality by clicking cards
- Test shuffle animation by clicking shuffle button

### 6. Extensions (Optional)
- Add sound effects for card actions
- Implement drag-and-drop functionality
- Create game rules for a simple card game
