class PolygonEditor extends HTMLElement {
  constructor() {
    super();
    this.vertices = [];
    this.firstPoint = null;
    this.secondPoint = null;
    this.clockwise = true;
    this.createPointsEnable = false;
    this.selectingPoint = null; // 'first' или 'second'
    this.attachShadow({mode: 'open'});
    this.shadowRoot.innerHTML = `
        <style>
          body {
          display: flex;
          margin: 0;
          font-family: Arial, sans-serif;
          /*background-color: #f0f0f0;*/
          background-color: #4D4D4D;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 99vh;
          border: solid rgba(45, 45, 45, 0.90);
          }
           canvas {
    cursor: crosshair;
  }

  .canvas-area {
    background-color: #999999;
    box-shadow: 0 0 10px rgba(1, 1, 1, 0.51);
    border: 1px solid rgba(45, 45, 45, 0.9);
  }

  .panel {
    width: 300px;
    padding: 20px;
    background-color: #4D4D4D;
    color: #f7f4f4;
    text-align: center;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(72, 83, 97, 0.75);
  }

  .panel h2 {
    margin: 0 0 20px 0;
    padding: 0;
    font-size: 24px;
    color: #f7f4f4;
  }

  .panel button {
    width: 100%;
    padding: 12px;
    margin: 8px 0;
    background-image: linear-gradient(to bottom, #949494, #949494, rgba(130, 130, 130, 0.5), rgba(128, 128, 128, 0));
    box-shadow: 0 4px 15px rgba(72, 83, 97, 0.75);
    color: #f7f4f4;
    border: 1px solid rgba(45, 45, 45, 0.9);
    border-radius: 10px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .panel button:hover {
    transform: scale(0.97);
    box-shadow: 0 2px 8px rgba(72, 83, 97, 0.5);
  }

  .panel button:active {
    transform: scale(0.95);
  }

  #firstPoint, #secondPoint {
    width: 48%;
  }

  #pointlabelf, #pointlabels {
    padding: 10px;
    width: 30%;
    display: inline-block;
    margin: 10px 0 10px 10px;
    color: #f7f4f4;
  }

  .panel .status {
    margin: 10px 0;
    font-weight: bold;
    text-align: right;
  }

  .panel .status.invalid {
    color: #ff4444;
  }

  .panel .status.valid {
    color: #44cc44;
  }

  .container {
    display: flex;
    gap: 20px;
  }
</style>
            <div class="container">
              <div class="container">
                <div class="canvas-area">
                <canvas width="800" height="600"></canvas>
                </div>

                <div class="panel">
                    <h2>Create polygon</h2>
                    <button id="createPoints">Create points</button>
                    <div id="pointsCount" class="status">Created 0 points</div>
                    <button id="drawPolygon" disabled>Draw polygon</button>
                    <h2>Create path</h2>

                    <div class="container"><button id="firstPoint" disabled>First point </button> <div id="pointlabelf">1</div></div>
                    <div class="container"><button id="secondPoint" disabled>Second point </button> <div id="pointlabels">2</div></div>

                    <button id="toggleDirection" disabled>Clockwise order</button>
                    <div class="container"><button id="clear" disabled>Clear</button>  <button id="clearStorage">Clear saved polygon</button></div>
                    <div id="pathInfo">Path: </div>

                </div>
              </div>
            </div>
        `;

    this.canvas = this.shadowRoot.querySelector('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.pointsCount = this.shadowRoot.querySelector('#pointsCount');
    this.createPointsButton = this.shadowRoot.querySelector('#createPoints');
    this.drawPolygonButton = this.shadowRoot.querySelector('#drawPolygon');
    this.firstPointButton = this.shadowRoot.querySelector('#firstPoint');
    this.secondPointButton = this.shadowRoot.querySelector('#secondPoint');
    this.toggleDirectionButton = this.shadowRoot.querySelector('#toggleDirection');
    this.clearButton = this.shadowRoot.querySelector('#clear');
    this.pathInfo = this.shadowRoot.querySelector('#pathInfo');
    this.firstPointLabel = this.shadowRoot.querySelector('#pointlabelf');
    this.secondPointLabel = this.shadowRoot.querySelector('#pointlabels');
    this.clearStorageButton = this.shadowRoot.querySelector('#clearStorage');

    this.createPointsButton.addEventListener('click', () => this.enablePointCreation());
    this.drawPolygonButton.addEventListener('click', () => this.drawPolygon());
    this.firstPointButton.addEventListener('click', () => this.startSelectingPoint('first'));
    this.secondPointButton.addEventListener('click', () => this.startSelectingPoint('second'));
    this.toggleDirectionButton.addEventListener('click', () => this.toggleDirection());
    this.clearButton.addEventListener('click', () => this.clear());
    this.canvas.addEventListener('click', this.handleCanvasClick.bind(this));
    this.clearStorageButton.addEventListener('click', () => this.clearStorage());
    // Загрузка сохраненного полигона
    this.loadPolygon();
  }

  enablePointCreation() {
    this.vertices = [];
    this.firstPoint = null;
    this.secondPoint = null;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.createPointsButton.disabled = false;
    this.createPointsEnable = true;
    this.drawPolygonButton.disabled = true;
    this.firstPointButton.disabled = true;
    this.secondPointButton.disabled = true;
    this.toggleDirectionButton.disabled = true;
    this.clearButton.disabled = true;
    this.pointsCount.textContent = 'Created 0 points';
    this.pointsCount.classList.remove('valid', 'invalid');
    this.pathInfo.textContent = 'Path: ';
    this.firstPointLabel.textContent = '';
    this.secondPointLabel.textContent = '';
    this.canvas.style.cursor = 'crosshair';
  }

  clear() {
    this.vertices = [];
    this.firstPoint = null;
    this.secondPoint = null;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.createPointsButton.disabled = false;
    this.createPointsEnable = false;
    this.drawPolygonButton.disabled = true;
    this.firstPointButton.disabled = true;
    this.secondPointButton.disabled = true;
    this.toggleDirectionButton.disabled = true;
    this.clearButton.disabled = true;
    this.pointsCount.textContent = 'Created 0 points';
    this.pointsCount.classList.remove('valid', 'invalid');
    this.pathInfo.textContent = 'Path: ';
    this.firstPointLabel.textContent = '';
    this.secondPointLabel.textContent = '';
    this.canvas.style.cursor = 'crosshair';
  }

  handleCanvasClick(event) {
    if (this.createPointsButton.disabled && !this.selectingPoint) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (this.selectingPoint) {
      const clickedPoint = this.findClosestVertex(x, y);
      if (clickedPoint) {
        const pointIndex = this.vertices.indexOf(clickedPoint);
        if (this.selectingPoint === 'first') {
          this.firstPoint = clickedPoint;
          this.firstPointLabel.textContent = `p${pointIndex + 1}`;
        } else if (this.selectingPoint === 'second') {
          this.secondPoint = clickedPoint;
          this.secondPointLabel.textContent = `p${pointIndex + 1}`;
        }
        this.selectingPoint = null;
        this.canvas.style.cursor = 'default';
        if (this.firstPoint && this.secondPoint) {
          this.drawPath();
        }
      }
    } else {
      if (this.createPointsEnable) {
        this.vertices.push({x, y});
        this.updatePointsCount();

        this.drawPolygonButton.disabled = !(this.vertices.length >= 3 && this.vertices.length <= 15);

        this.drawVertices();
      }
    }
  }

  findClosestVertex(x, y) {
    for (const vertex of this.vertices) {
      const distance = Math.sqrt((vertex.x - x) ** 2 + (vertex.y - y) ** 2);
      if (distance <= 10) { // 10px радиус для выбора точки
        return vertex;
      }
    }
    return null;
  }

  updatePointsCount() {
    this.pointsCount.textContent = `Created ${this.vertices.length} points`;
    if (this.vertices.length >= 3 && this.vertices.length <= 15) {
      this.pointsCount.classList.remove('invalid');
      this.pointsCount.classList.add('valid');
    } else {
      this.pointsCount.classList.remove('valid');
      this.pointsCount.classList.add('invalid');
    }
  }

  drawVertices() {
    this.ctx.fillStyle = 'white'; // Белый цвет заливки
    this.ctx.strokeStyle = 'black'; // Черный цвет границы
    this.ctx.lineWidth = 2; // Толщина границы

    for (let i = 0; i < this.vertices.length; i++) {
      const vertex = this.vertices[i];
      this.ctx.beginPath();
      this.ctx.arc(vertex.x, vertex.y, 5, 0, Math.PI * 2); // Рисуем круг
      this.ctx.fill(); // Заливаем белым
      this.ctx.stroke(); // Рисуем черную границу

      // Подпись точки
      this.ctx.fillStyle = 'black'; // Черный текст для подписей
      this.ctx.fillText(`p${i + 1}`, vertex.x + 10, vertex.y - 10);
      this.ctx.fillStyle = 'white'; // Возвращаем белый цвет заливки

    }
  }

  drawPolygon() {
    if (this.vertices.length < 3) return;

    this.ctx.strokeStyle = 'black';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(this.vertices[0].x, this.vertices[0].y);

    for (let i = 1; i < this.vertices.length; i++) {
      this.ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
    }

    this.ctx.closePath();
    this.ctx.stroke();

    this.createPointsButton.disabled = true;
    this.drawPolygonButton.disabled = true;
    this.firstPointButton.disabled = false;
    this.secondPointButton.disabled = false;
    this.toggleDirectionButton.disabled = false;
    this.clearButton.disabled = false;
    this.canvas.style.cursor = 'default';
    // Сохранение полигона в localStorage
    this.savePolygon();
  }

  startSelectingPoint(type) {
    this.selectingPoint = type;
    this.canvas.style.cursor = 'pointer';
  }

  toggleDirection() {
    this.clockwise = !this.clockwise;
    this.toggleDirectionButton.textContent = this.clockwise ? 'Clockwise order' : 'Counterclockwise order';
    if (this.firstPoint && this.secondPoint) {
      this.drawPath();
    }
  }

  drawPath() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawPolygon();

    if (this.firstPoint && this.secondPoint) {
      const firstIndex = this.vertices.indexOf(this.firstPoint);
      const secondIndex = this.vertices.indexOf(this.secondPoint);

      if (firstIndex === -1 || secondIndex === -1) return;

      this.ctx.strokeStyle = '#3399FF';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(this.firstPoint.x, this.firstPoint.y);

      const pathPoints = [];
      pathPoints.push(`p${firstIndex + 1}`);

      if (this.clockwise) {
        for (let i = firstIndex; i !== secondIndex; i = (i + 1) % this.vertices.length) {
          this.ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
          pathPoints.push(`p${(i + 1) % this.vertices.length + 1}`);
        }
      } else {
        for (let i = firstIndex; i !== secondIndex; i = (i - 1 + this.vertices.length) % this.vertices.length) {
          this.ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
          pathPoints.push(`p${(i - 1 + this.vertices.length) % this.vertices.length + 1}`);
        }
      }

      this.ctx.lineTo(this.secondPoint.x, this.secondPoint.y);
      this.ctx.stroke();

      this.pathInfo.textContent = `Path: ${pathPoints.join(' - ')}`;
    }

    this.drawVertices();
  }



  savePolygon() {
    // Сохраняем вершины полигона в localStorage
    localStorage.setItem('savedPolygon', JSON.stringify(this.vertices));
  }

  loadPolygon() {
    // Загружаем вершины полигона из localStorage
    const savedPolygon = localStorage.getItem('savedPolygon');
    if (savedPolygon) {
      this.vertices = JSON.parse(savedPolygon);
      this.updatePointsCount();
      this.drawPolygon();
      this.drawVertices();
    }
  }

  clearStorage() {
    // Очищаем localStorage
    localStorage.removeItem('savedPolygon');
    this.clear(); // Очищаем текущий полигон
  }

}

customElements.define('polygon-editor', PolygonEditor);
