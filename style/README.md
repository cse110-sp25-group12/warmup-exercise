# CSS Classes Overview for Blackjack Game

## Layout Classes
- `.dealer`: Container for the dealer’s cards.
- `.hand`: Container for the player's hand of cards.
- `.controls`: Section containing the control buttons (Start, Hit, Stand, Restart).

## Card Classes
- `.card.face`: Displays the front of a playing card using the `--card-face` CSS custom property.

- `.card.back`:

- `.card.face:hover`: Tilts the card slightly on hover for visual feedback.

## Button Classes
- `.button`: Base style for all game buttons (green background, yellow borders, hover and click effects).

## Animations
- `.shuffle`:

- `@keyframes shuffle` and `@keyframes fancy-shuffle`:

## Special Effects
- `#palm`: Dealer's hand image that appears from the bottom when the player presses the Stand button.
- `.palm-visible`: Makes the palm image rise and become visible for a short time.

---

# Notes for JavaScript Team

- **Drawing cards**:
  Add cards inside the `.dealer` div (dealer’s area) or `.hand` div (player’s area).
  
- **Applying shuffle animation**:
  You can add the `.shuffle` class manually if you want card-shuffling effects

-----