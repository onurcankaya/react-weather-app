import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Image from 'react-bootstrap/Image';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import styles from './App.scss';
import {
  capitalize,
  convertCelsiusToFahrenheit,
  convertEpochToHumanReadable,
} from './utils';

const WEATHER_API_KEY = process.env.REACT_APP_WEATHER_API_KEY;

const githubIcon = faGithub as IconProp;

type Weather = {
  location: string;
  temperatureFahrenheit: number;
  temperatureCelsius: number;
  description: string;
  icon: string;
  humidity: number;
  sunrise: Date;
  sunset: Date;
};

export function App(): JSX.Element | null {
  const [weather, setWeather] = useState<Weather | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const URL_BASE = 'https://api.openweathermap.org/data/2.5/onecall';
      fetch(
        `${URL_BASE}?lat=${position.coords.latitude}&lon=${position.coords.longitude}&units=metric&exclude=hourly,daily,minutely&appid=${WEATHER_API_KEY}`,
      )
        .then((res) => res.json())
        .then((response) => {
          const weatherData = {
            location: response.timezone,
            temperatureFahrenheit: convertCelsiusToFahrenheit(
              response.current.temp,
            ),
            temperatureCelsius: Math.floor(response.current.temp),
            // index 0 contains the primary weather condition
            description: capitalize(response.current.weather[0].description),
            icon: response.current.weather[0].icon,
            humidity: response.current.humidity,
            sunrise: convertEpochToHumanReadable(response.current.sunrise),
            sunset: convertEpochToHumanReadable(response.current.sunset),
          };
          setWeather(weatherData);
        })
        .catch((error: Error) => console.error('error', error));
    });
  }, []);

  if (!weather) return null;

  const {
    location,
    temperatureFahrenheit,
    temperatureCelsius,
    description,
    icon,
    humidity,
    sunrise,
    sunset,
  } = weather;

  return (
    <div>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand>React Weather App</Navbar.Brand>

          <OverlayTrigger
            placement="bottom"
            overlay={<Tooltip>See code on Github</Tooltip>}
          >
            <Nav.Link
              href="https://github.com/onurcankaya"
              target="_blank"
              rel="noopener"
            >
              <FontAwesomeIcon icon={githubIcon} size="2x" />
            </Nav.Link>
          </OverlayTrigger>
        </Container>
      </Navbar>
      <Container>
        <Card className={styles.card}>
          <Card.Body>
            <Card.Title>{location}</Card.Title>

            <Card.Text>
              <Image src={`https://openweathermap.org/img/wn/${icon}@2x.png`} />
              <span
                style={{ fontSize: '1.5em' }}
              >{`${temperatureCelsius}°C / ${temperatureFahrenheit}°F`}</span>
            </Card.Text>
            <Card.Text>{description}</Card.Text>
            <Card.Text>{`Humidity: ${humidity}%`}</Card.Text>
            <Card.Text>{`Sunrise: ${sunrise}`}</Card.Text>
            <Card.Text>{`Sunset: ${sunset}`}</Card.Text>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}
