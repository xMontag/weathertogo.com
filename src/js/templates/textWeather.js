const headerText = document.querySelector('.header-visual__text');
const textWeatherArr = {
  textWeather: 'Сейчас за окном',
  viewWeather: ['катастрофический мороз', 'чрезвычайно сильный мороз', 'сильный мороз', 'умеренный мороз', 'мороз', 'слабый мороз', 'холодно', 'прохладно', 'тепло', 'очень тепло', 'жара', 'сильная жара', 'чрезвычайно сильная погода (вероятны тепловые удары)', 'катастрофическая жара'],
  clothesWeather: ['одевайся теплее', 'одевайся теплее, не забывай шапку, шарф и перчатки', 'одевай курточку', 'одевайся теплее и не забудь зонтик','одевай кофту', 'одевай кофту и не забудь зонтик', 'не забудь зонтик']
}
function textWeather () {
  headerTemplate();
  let description = weather.now.description.toLowerCase();
  if (weather.now.temperature < -50) {
    headerText.textContent = `${textWeatherArr.textWeather} ${textWeatherArr.viewWeather[0]}, ${description} - ${textWeatherArr.clothesWeather[1]}`;
  }
  if (weather.now.temperature >= -50 && weather.now.temperature <= -40) {
    headerText.textContent = `${textWeatherArr.textWeather} ${textWeatherArr.viewWeather[1]}, ${description} - ${textWeatherArr.clothesWeather[1]}`;
  }
  if (weather.now.temperature >= -39 && weather.now.temperature <= -30) {
    headerText.textContent = `${textWeatherArr.textWeather} ${textWeatherArr.viewWeather[2]}, ${description} - ${textWeatherArr.clothesWeather[1]}`;
  }
  if (weather.now.temperature >= -29 && weather.now.temperature <= -20) {
    headerText.textContent = `${textWeatherArr.textWeather} ${textWeatherArr.viewWeather[3]}, ${description} - ${textWeatherArr.clothesWeather[1]}`;
  }
  if (weather.now.temperature >= -19 && weather.now.temperature <= -10) {
    headerText.textContent = `${textWeatherArr.textWeather} ${textWeatherArr.viewWeather[4]}, ${description} - ${textWeatherArr.clothesWeather[1]}`;
  }
  if (weather.now.temperature >= -9 && weather.now.temperature <= 0) {
    headerText.textContent = `${textWeatherArr.textWeather} ${textWeatherArr.viewWeather[5]}, ${description} - ${textWeatherArr.clothesWeather[1]}`;
  }
  if (weather.now.temperature >= 1 && weather.now.temperature <= 8) {
    headerText.textContent = `${textWeatherArr.textWeather} ${textWeatherArr.viewWeather[6]}, ${description} - ${textWeatherArr.clothesWeather[0]}`;
  }
  if (weather.now.temperature >= 1 && weather.now.temperature <= 8 && weather.now.icon === "wind") {
    headerText.textContent = `${textWeatherArr.textWeather} ${textWeatherArr.viewWeather[6]}, ${description} - ${textWeatherArr.clothesWeather[2]}`;
  }
  if (weather.now.temperature >= 1 && weather.now.temperature <= 8 && weather.now.icon === "rain") {
    headerText.textContent = `${textWeatherArr.textWeather} ${textWeatherArr.viewWeather[6]}, ${description} - ${textWeatherArr.clothesWeather[3]}`;
  }
  if (weather.now.temperature >= 9 && weather.now.temperature <= 16) {
    headerText.textContent = `${textWeatherArr.textWeather} ${textWeatherArr.viewWeather[7]}, ${description}`;
  }
  if (weather.now.temperature >= 9 && weather.now.temperature <= 16 && weather.now.icon === "wind") {
    headerText.textContent = `${textWeatherArr.textWeather} ${textWeatherArr.viewWeather[7]}, ${description} - ${textWeatherArr.clothesWeather[4]}`;
  }
  if (weather.now.temperature >= 9 && weather.now.temperature <= 16 && weather.now.icon === "rain") {
    headerText.textContent = `${textWeatherArr.textWeather} ${textWeatherArr.viewWeather[7]}, ${description} - ${textWeatherArr.clothesWeather[5]}`;
  }
  if (weather.now.temperature >= 17 && weather.now.temperature <= 24) {
    headerText.textContent = `${textWeatherArr.textWeather} ${textWeatherArr.viewWeather[8]}, ${description}`;
  }
  if (weather.now.temperature >= 17 && weather.now.temperature <= 24 && weather.now.icon === "rain") {
    headerText.textContent = `${textWeatherArr.textWeather} ${textWeatherArr.viewWeather[8]}, ${description} - ${textWeatherArr.clothesWeather[6]}`;
  }
  if (weather.now.temperature >= 25 && weather.now.temperature <= 32) {
    headerText.textContent = `${textWeatherArr.textWeather} ${textWeatherArr.viewWeather[9]}, ${description}`;
  }
  if (weather.now.temperature >= 25 && weather.now.temperature <= 32 && weather.now.icon === "rain") {
    headerText.textContent = `${textWeatherArr.textWeather} ${textWeatherArr.viewWeather[9]}, ${description} - ${textWeatherArr.clothesWeather[6]}`;
  }
  if (weather.now.temperature >= 33 && weather.now.temperature <= 40) {
    headerText.textContent = `${textWeatherArr.textWeather} ${textWeatherArr.viewWeather[10]}, ${description}`;
  }
  if (weather.now.temperature >= 41 && weather.now.temperature <= 48) {
    headerText.textContent = `${textWeatherArr.textWeather} ${textWeatherArr.viewWeather[11]}, ${description}`;
  }
  if (weather.now.temperature >= 49 && weather.now.temperature <= 56) {
    headerText.textContent = `${textWeatherArr.textWeather} ${textWeatherArr.viewWeather[12]}, ${description}`;
  }
  if (weather.now.temperature >= 57) {
    headerText.textContent = `${textWeatherArr.textWeather} ${textWeatherArr.viewWeather[13]}, ${description}`;
  }

}
textWeather();
