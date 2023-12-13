'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
// navigator.geolocation;
class workOut {
  clicks = 0;
  date = new Date();
  id = (Date.now() + '').slice(-10);
  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }
  // prettier-ignore
  //instance
  _setdescription(){
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 
    'October', 'November', 'December'];
    this._description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`
  }
  click() {
    this.clicks++;
  }
}
class running extends workOut {
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.type = 'running';
    this.calcPace();
    this._setdescription();
  }
  //instance
  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class cycling extends workOut {
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.type = 'cycling';
    this.calcSpeed();
    this._setdescription();
  }
  //instance
  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}
// const run1 = new running([32, 1], 21, 12, 30);
// console.log(run1);
class APP {
  //private field
  #map;
  #mapEvent;
  #workouts = [];
  #mapZoom = 13;
  constructor() {
    this._getPosition();
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField.bind(this));
    containerWorkouts.addEventListener('click', this._markerMove.bind(this));
    this._getLocalStorage();
  }
  //instance
  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('coudnt find your location');
        }
      );
    }
  }
  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const coords = [latitude, longitude];
    this.#map = L.map('map').setView(coords, this.#mapZoom);
    // console.log(this.#map);
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
    console.log(
      `https://www.google.com/maps/@${latitude},${longitude},13.42z?entry=ttu`
    );
    // console.log(this);
    this.#map.on('click', this._showForm.bind(this));
    //
    this.#workouts.forEach(work => {
      this.getWorkoutMarker(work);
    });
  }
  _showForm(mapE) {
    this.#mapEvent = mapE;
    // console.log(mapEvent);
    form.classList.remove('hidden');
    inputDistance.focus();
  }
  _hiddenform() {
    // Empty inputs
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';

    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }
  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }
  _newWorkout(e) {
    e.preventDefault();
    //  inputDistance inputDuration inputCadence inputElevation
    const vaildCheck = (...inputs) => inputs.every(inp => Number.isFinite(inp));
    const checkPositive = (...inputs) => inputs.every(inp => inp >= 0);
    // console.log(checkPositive(20, 10));
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const cadence = +inputCadence.value;
    const elevation = +inputElevation.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;
    //running
    if (type == 'running') {
      if (
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(cadence)
        !vaildCheck(distance, duration, cadence) ||
        !checkPositive(distance, duration, cadence)
      ) {
        return alert('positive numbers only valid');
      }
      workout = new running([lat, lng], distance, duration, cadence);
      this.#workouts.push(workout);
      console.log(workout);
      this.getWorkoutMarker(workout);
    }
    //cycling
    if (type == 'cycling') {
      if (
        !vaildCheck(distance, duration, elevation) ||
        !checkPositive(distance, duration)
      ) {
        return alert('positive numbers only valid');
      }
      workout = new cycling([lat, lng], distance, duration, elevation);
      this.#workouts.push(workout);
      console.log(workout);
      this.getWorkoutMarker(workout);
    }

    this._renderWorkout(workout);

    this._hiddenform();

    this._setLocalStorage();
  }

  getWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          closeOnClick: false,
          autoClose: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout._description}`
      )
      .openPopup();
  }
  _renderWorkout(workout) {
    //prettier-ignore
    let html =
    `<li class="workout workout--${workout.type}" data-id="${workout.id}">
    <h2 class="workout__title">${workout._description}</h2>
    <div class="workout__details">
      <span class="workout__icon">${workout.type==='running'?'🏃‍♂️':'🚴‍♀️'}</span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
    </div>`;
    if (workout.type === 'running') {
      html += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>`;
    }
    if (workout.type === 'cycling') {
      html += ` <div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.speed.toFixed(1)}</span>
      <span class="workout__unit">km/h</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⛰</span>
      <span class="workout__value">${workout.elevationGain}</span>
      <span class="workout__unit">m</span>
    </div>
  </li> 
      `;
    }
    form.insertAdjacentHTML('afterend', html);
  }
  _markerMove(e) {
    // console.log(e.target);
    const workoutEl = e.target.closest('.workout');
    //prettier-ignore
    if (!workoutEl) return;
    //prettier-ignore
    const workouts = this.#workouts.find( work => work.id === workoutEl.dataset.id);
    // console.log(workouts);
    this.#map.setView(workouts.coords, this.#mapZoom, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
    // wos.clicks();
  }

  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));

    if (!data) return;

    this.#workouts = data;

    this.#workouts.forEach(work => {
      this._renderWorkout(work);
    });
  }

  reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }
}
const app = new APP();
// let date = new Date();
// let id = Date.now();
// console.log(date);
// console.log(id);
