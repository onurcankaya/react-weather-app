import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import Image from 'react-bootstrap/Image';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Spinner from 'react-bootstrap/Spinner';
import Tooltip from 'react-bootstrap/Tooltip';

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
  sunrise: string;
  sunset: string;
};

export function App(): JSX.Element | null {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

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
        message = 'Unable to fetch weather data';
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
          setIsLoading(false);
          fetchWeatherData(position.coords.latitude, position.coords.longitude);
        },
        () => {
          setStatus('Unable to retrieve your location');
        },
      );
    }
  }, []);

  const fetchLocationData = useCallback(async (): Promise<void> => {
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
  }, [query]);

  const handleChangeQuery = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setQuery(e.target.value);
  };

  const handleSubmitQuery = useCallback(
    (e: React.FormEvent<HTMLFormElement>): void => {
      e.preventDefault();
      fetchLocationData();
    },
    [fetchLocationData],
  );

  const renderWeatherResult = useMemo(() => {
    if (!weather) {
      if (isLoading) {
        return (
          <Container className="flex justify-center items-center h-screen">
            <Spinner
              animation="border"
              role="status"
              className="text-stone-100"
            >
              <span className="visually-hidden" />
            </Spinner>
          </Container>
        );
      }
      return null;
    }

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
        <Container>
          <Form onSubmit={handleSubmitQuery} className="my-3">
            <FormControl
              type="search"
              placeholder="Search for a location..."
              aria-label="Search"
              onChange={handleChangeQuery}
              className="bg-stone-100"
            />
          </Form>
        </Container>
        <Container>
          {status && <Alert variant="danger">{status}</Alert>}
          <Card className="my-3 bg-stone-100">
            <Card.Body>
              <Card.Title className="mb-4 font-semibold">{location}</Card.Title>
              <Card.Text className="flex items-center mb-4">
                <div className="bg-slate-300 rounded-md mr-8">
                  <Image
                    src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
                  />
                </div>
                <span className="text-5xl font-semibold">{`${temperatureCelsius}°C / ${temperatureFahrenheit}°F`}</span>
              </Card.Text>
              <Card.Text className="mb-3 font-semibold">
                {description}
              </Card.Text>
              <Card.Text className="mb-3 font-semibold">{`Humidity — ${humidity}%`}</Card.Text>
              <Card.Text className="mb-3 font-semibold">{`Sunrise — ${sunrise}AM`}</Card.Text>
              <Card.Text className="mb-3 font-semibold">{`Sunset — ${sunset}PM`}</Card.Text>
            </Card.Body>
          </Card>
        </Container>
      </>
    );
  }, [weather, isLoading, status, handleSubmitQuery]);

  return (
    <>
      <Navbar variant="dark" expand="lg" className="mb-2 bg-slate-900">
        <Container>
          <Navbar.Brand className="text-slate-200">
            React Weather App
          </Navbar.Brand>
          <OverlayTrigger
            placement="bottom"
            overlay={<Tooltip>See code on Github</Tooltip>}
          >
            <Nav.Link
              href="https://github.com/onurcankaya/react-weather-app"
              target="_blank"
              rel="noopener"
              className="text-slate-200"
            >
              <FontAwesomeIcon icon={githubIcon} size="2x" />
            </Nav.Link>
          </OverlayTrigger>
        </Container>
      </Navbar>
      {renderWeatherResult}
    </>
  );
}
