# Laboration 2.1 Ramverk

## [Render](https://lab2-2-nestjs-fastify.onrender.com/)
## `clone https://github.com/isasod2500/Moment-2---NestJS-Fastify.git`

Denna webbplats är skapad med hjälp av NestJS Fastify som backend ramverk och vanlig traditionell HTML/CSS med JavaScript för frontend. Webbplatsen är en kort lista över världens underverk där det från början finns sju stycken från antika världen.
Med formulär kan man lägga till sina egna, med validering för fälten. Dessa sparas i en MongoDB databas och hämtas ut med CRUD-förfrågningar.

## Användning

| Ändpunkt       | Metod      | Funktion |
| :--------- | :-------- | :------ |
| /api/wonder  | GET  | Hämtar samtliga underverk  |          
| /api/wonder/:id | GET  | Hämta specifikt underverk utefter id      |          
|   /api/wonder         |       POST    |   Skicka in nytt underverk      |          
|   /api/wonder/:id         |      PUT     |    Uppdatera specifikt underverk     |        
|     /api/wonder/:id       |    DELETE       |    Radera specifikt underverk     |          


Datastruktur vid lyckad GET:
````
{
  "success": true,
  "data": [
    {
      "_id": "6afd9ee4232e56c255491485",
      "country": "Egypt",
      "year": 280,
      "survived": false,
      "era": "BC",
      "name": "Great Lighthouse of Alexandria"
    }
}
  ````
