# CSS Classes Overview for Blackjack Game

## Layout Classes
- `.dealer`: Container for the dealer’s cards.
- `.hand`: Container for the player's hand of cards.
- `.controls`: Section containing the control buttons (Start, Hit, Stand, Restart).

## Card Classes
- `.card.face`: Displays the front of a playing card using the `--card-face` CSS custom property.

- `.card.back`: Displays the back of a card

- `.card.face:hover`: Tilts the card slightly on hover for visual feedback.

- `.card-drawn`: Applies an animation when a card is drawn


## Button Classes
- `.button`: Base style for all game buttons (green background, yellow borders, hover and click effects).

- `.controls`: Container that holds all control buttons with hover zoom effect.


## Animations

- `.shuffle`: Class to trigger shuffling visual effect on cards

- `.card-drawn`: Animation for when cards are drawn

- `@keyframes shuffle`: defines shuffle movement animation for cards.

- `@keyframes drawCard`: Defines how a card slides into place when dealt.



## Special Effects
- `#palm`: Dealer's hand image that appears from the bottom when the player presses the Stand button.
- `.palm-visible`: Makes the palm image rise and become visible for a short time.

---

- `.card-shoe`: Placeholder div styled to represent the card shoe (where dealer draws cards from).
- 

# Notes for JavaScript Team

- **Drawing cards**:
  Add cards inside the `.dealer` div (dealer’s area) or `.hand` div (player’s area).
  
- **Applying shuffle animation**:
  You can add the `.shuffle` class manually if you want card-shuffling effects


-----
  
- **Applying shuffle animation**:
  You can add the `.shuffle` class manually if you want card-shuffling effects

-----
