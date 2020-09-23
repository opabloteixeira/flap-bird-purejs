
function newElement(tagName, className){
   const element = document.createElement(tagName);
   element.className = className;

   return element;
} 

function Barrier(reverse = false){
   this.element = newElement('div', 'barrier');

   const edge = newElement('div', 'edge');
   const corps = newElement('div', 'corps');
   this.element.appendChild(reverse ? corps : edge);
   this.element.appendChild(reverse ? edge : corps);

   this.setHeight = height => corps.style.height = `${height}px`
}

function PairOfBarriers( height, opening, x){
   this.element = newElement('div', 'pair-of-barriers');

   this.barUp = new Barrier(true);
   this.barDown = new Barrier(false);

   this.element.appendChild(this.barUp.element);
   this.element.appendChild(this.barDown.element);

   this.sortOpening = () => {
      const heightTop = Math.random() * (height - opening);
      const heightDown = height - opening - heightTop;

      this.barUp.setHeight(heightTop);
      this.barDown.setHeight(heightDown);
   }

   this.getX = () => parseInt(this.element.style.left.split('px')[0]);
   this.setX = x => this.element.style.left = `${x}px`;
   this.getWidth = () => this.element.clientWidth;

   this.sortOpening()
   this.setX(x)
}

function Barriers(height, width, opening, space, notifyScore) {
   this.pairs = [
      new PairOfBarriers(height, opening, width),
      new PairOfBarriers(height, opening, width + space),
      new PairOfBarriers(height, opening, width + space * 2),
      new PairOfBarriers(height, opening, width + space * 3)
   ]

   const movement = 3;

   this.animation = () => {
      this.pairs.forEach(pair => {
         pair.setX(pair.getX() - movement)
         // quando o element sair da área do jogo
         if (pair.getX() < -pair.getWidth()) {
            pair.setX(pair.getX() + space * this.pairs.length)
            pair.sortOpening()
         }

         const middle = width / 2
         const crossMiddle = pair.getX() + movement >= middle
         && pair.getX() < middle
         if(crossMiddle) notifyScore();
      })
   }
}

function Bird(heightGame) {
   let flying = false;

   this.element = newElement('img', 'bird')
   this.element.src = './img/bird.png'

   this.getY = () => parseInt(this.element.style.bottom.split('px')[0])
   this.setY = y => this.element.style.bottom = `${y}px`

   window.onkeydown = e => flying = true
   window.onkeyup = e => flying = false

   this.animation = () => {
      const newY = this.getY() + (flying ? 8 : -5)
      const maxHidth = heightGame - this.element.clientHeight

      if (newY <= 0) {
            this.setY(0)
         } else if (newY >= maxHidth) {
            this.setY(maxHidth)
         } else {
            this.setY(newY)
      }
   }

   this.setY(heightGame / 2)
}

function Progress() {
   this.element = newElement('span', 'progress')
   this.updateScore = score => {
      this.element.innerHTML = score
   }
   this.updateScore(0)
}
//estao sobrepostos?
function overlapping(elementA, elementB) {
   const a = elementA.getBoundingClientRect()
   const b = elementB.getBoundingClientRect()

   const horizontal = a.left + a.width >= b.left
      && b.left + b.width >= a.left
   const vertical = a.top + a.height >= b.top
      && b.top + b.height >= a.top
   return horizontal && vertical
}

function collision(bird, barriers) {
   let collided = false
   barriers.pairs.forEach(pairOfBarriers => {
      if (!collided) {
         const top = pairOfBarriers.barUp.element;
         const down = pairOfBarriers.barDown.element;
         collided = overlapping(bird.element, top)
            || overlapping(bird.element, down)
      }
   })
   return collided;
}



function FlappyBird() {    
   let score = 0;

   const gameArea = document.querySelector('[container-game]');
   const height = gameArea.clientHeight;
   const width = gameArea.clientWidth;

   const progress = new Progress();
   const barriers = new Barriers(
      height, 
      width, 
      200, 
      400,
      () => progress.updateScore(++score)
   )
   const bird = new Bird(height);

   gameArea.appendChild(progress.element);
   gameArea.appendChild(bird.element);
   barriers.pairs.forEach(pair => gameArea.appendChild(pair.element));

   this.start = () => {
      const timer = setInterval(() => {
         barriers.animation();
         bird.animation();

         if(collision(bird, barriers)){
            clearInterval(timer)
         }
      }, 20);
   };
}

new FlappyBird().start();
