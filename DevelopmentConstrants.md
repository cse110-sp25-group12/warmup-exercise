# Development Constraints

## Technical Constraints
- Do not use standard HTML, CSS, and JavaScript and should not use libraries or frameworks
- Implement all functionality using vanilla JavaScript with Web Components API
- Do not import any external libraries or dependencies
- Do not use any CSS preprocessors or frameworks
- Create only custom elements defined in the requirements

## Implementation Guidelines
1. For JavaScript:
   - Use ES6+ class syntax for Web Components
   - Utilize the native customElements API
   - Implement proper encapsulation of component logic
   - Handle events with native JavaScript methods
   - Use modern JavaScript features (template literals, arrow functions, etc.)

2. For CSS:
   - Use only vanilla CSS (no preprocessors)
   - Implement animations using CSS transitions and transforms
   - Create responsive layouts using flexbox or grid
   - Organize selectors to maintain component styling isolation

3. For HTML:
   - Use semantic HTML where appropriate
   - Keep markup minimal and let components generate necessary structure
   - Follow accessibility best practices

## Performance Considerations
- Optimize animations for smooth performance
- Minimize reflows and repaints during card interactions
- Consider memory usage when creating large card decks
