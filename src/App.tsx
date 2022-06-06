import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import Image from 'react-bootstrap/Image';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import styles from './App.scss';
import {
  capitalize,
  convertCelsiusToFahrenheit,
  convertEpochToHumanReadableTime,
} from './utils';

const WEATHER_API_KEY = process.env.REACT_APP_WEATHER_API_KEY;
const MAPBOX_API_KEY = process.env.REACT_APP_MAPBOX_API_KEY;

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
  const [status, setStatus] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const fetchWeatherData = async (
    latitude: number,
    longitude: number,
    location?: string,
  ): Promise<void> => {
    try {
      const URL_BASE = 'https://api.openweathermap.org/data/2.5/onecall';
      const URL = `${URL_BASE}?lat=${latitude}&lon=${longitude}&units=metric&exclude=hourly,daily,minutely&appid=${WEATHER_API_KEY}`;
      const response = await fetch(URL);
      const data = await response.json();
      const weatherData = {
        location: location ?? data.timezone,
        temperatureFahrenheit: convertCelsiusToFahrenheit(data.current.temp),
        temperatureCelsius: Math.floor(data.current.temp),
        // index 0 contains the primary weather condition
        description: capitalize(data.current.weather[0].description),
        icon: data.current.weather[0].icon,
        humidity: data.current.humidity,
        sunrise: convertEpochToHumanReadableTime(data.current.sunrise),
        sunset: convertEpochToHumanReadableTime(data.current.sunset),
      };
      setWeather(weatherData);
    } catch (error) {
      let message = 'Unknown Error';
      if (error instanceof Error) {
        message = 'Unable to fetch weather data.';
      }
      setStatus(message);
    }
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus('Geolocation is not supported by your browser');
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setStatus(null);
          fetchWeatherData(position.coords.latitude, position.coords.longitude);
        },
        () => {
          setStatus('Unable to retrieve your location');
        },
      );
    }
  }, []);

  const fetchLocationData = async (): Promise<void> => {
    try {
      const URL_BASE = `https://api.mapbox.com/geocoding/v5/mapbox.places/`;
      const URL = `${URL_BASE}${query}.json?access_token=${MAPBOX_API_KEY}`;
      const response = await fetch(URL);
      const data = await response.json();
      const latitude = data.features[0].geometry.coordinates[1];
      const longitude = data.features[0].geometry.coordinates[0];
      const location = data.features[0].place_name;
      setStatus(null);
      fetchWeatherData(latitude, longitude, location);
    } catch (error) {
      let message = 'Unknown Error';
      if (error instanceof Error) {
        message =
          'No results to show. Please try again with a different search query.';
      }
      setStatus(message);
    }
  };

  const handleChangeQuery = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setQuery(e.target.value);
  };

  const handleSubmitQuery = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    fetchLocationData();
  };

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
    <>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand>React Weather App</Navbar.Brand>
          <OverlayTrigger
            placement="bottom"
            overlay={<Tooltip>See code on Github</Tooltip>}
          >
            <Nav.Link
              href="https://github.com/onurcankaya/react-weather-app"
              target="_blank"
              rel="noopener"
            >
              <FontAwesomeIcon icon={githubIcon} size="2x" />
            </Nav.Link>
          </OverlayTrigger>
        </Container>
      </Navbar>
      <Container>
        <Form onSubmit={handleSubmitQuery} style={{ margin: '1em 0' }}>
          <FormControl
            type="search"
            placeholder="Search for a location..."
            aria-label="Search"
            onChange={handleChangeQuery}
          />
        </Form>
      </Container>
      <Container>
        {status && <Alert variant="danger">{status}</Alert>}
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
    </>
  );
}
