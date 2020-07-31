import React, { useState, useEffect } from "react";
import { MenuItem, FormControl, Select, Card, CardContent } from "@material-ui/core";
import InfoBox from "./InfoBox";
import Map from "./Map";
import Table from "./Table";
import LineGraph from "./LineGraph";
import {sortData, prettyPrintStat} from "./util";
import "./App.css";
import "leaflet/dist/leaflet.css";

function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [casesType, setCasesType] = useState("cases");
  const [mapCenter, setMapCenter] = useState({lat: 34.80764, lng: -40.4796});
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
    .then((response) => response.json())
    .then((data) => {
      setCountryInfo(data);
    });

  }, []);

  //USEEFFECT = run a piece of code based on a given condition
  useEffect(() => {
    //The code inside here will run when the component loaded and not again
    //async --> send request to server, wait for it, do st

    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => ({
            name: country.country,
            value: country.countryInfo.iso2, //UK,USA,FR
          }));

          const sortedData = sortData(data);

          setTableData(sortedData);

          setMapCountries(data);

          setCountries(countries);
        });
    };

    getCountriesData();
  }, []);

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;

    const url = 
        countryCode === "worldwide" 
          ? "https://disease.sh/v3/covid-19/all" 
          : `https://disease.sh/v3/covid-19/countries/${countryCode}`;
    await fetch(url)
      .then(response => response.json())
      .then(data => {
        console.log(data);
        setCountry(countryCode);

        //all of the data from the country response
        setCountryInfo(data);

        setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
        setMapZoom(4);

      })
  };

  return (
    <div className="app">
      <div className="app__left">
        {/* {Header} */}
        {/* Title + select input dropdown field */}

        <div className="app__header">
          <h1>COVID-19 TRACKER</h1>

          <FormControl className="app__dropdown">
            <Select
              variant="outlined"
              onChange={onCountryChange}
              value={country}
            >
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {countries.map((country, index) => (
                <MenuItem key={index} value={country.value}>
                  {country.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        {/* {Infobox} */}
        {/* {Infobox} */}
        {/* {Infobox} */}

        <div className="app__stats">
          <InfoBox
            isRed
            active={casesType === "cases"}
            onClick={e => setCasesType('cases')}
            title="Coronavirus Cases" 
            cases={prettyPrintStat(countryInfo.todayCases)} 
            total={prettyPrintStat(countryInfo.cases)} />

          <InfoBox
            isGreen
            active={casesType === "recovered"}
            onClick={e => setCasesType('recovered')}
            title="Recovered" 
            cases={prettyPrintStat(countryInfo.todayRecovered)} 
            total={prettyPrintStat(countryInfo.recovered)} />

          <InfoBox
            isOrange
            active={casesType === "deaths"}
            onClick={e => setCasesType('deaths')}
            title="Deaths" 
            cases={prettyPrintStat(countryInfo.todayDeaths)} 
            total={prettyPrintStat(countryInfo.deaths)} />
        </div>       

        {/* {Map} */}
        <Map 
          countries={mapCountries} 
          casesType={casesType} 
          center={mapCenter} 
          zoom={mapZoom} 

        />
      </div>

      <Card className="app__right"> 
        <CardContent>
              {/* {Table} */}
              <h3>Live Cases by Country</h3>
              <Table countries={tableData} />

              {/* {Graph} */}
              <h3 className="app__graphTitle">Worldwide new {casesType}</h3>
              <LineGraph className="app__graph" casesType={casesType}/>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
