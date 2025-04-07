## Postman to Check User & Movie Functions

[<img src="https://run.pstmn.io/button.svg" alt="Run In Postman" style="width: 128px; height: 32px;">](https://app.getpostman.com/run-collection/41727814-50564607-e60e-4ae5-9ee4-907ee8fcc6c8?action=collection%2Ffork&source=rip_markdown&collection-url=entityId%3D41727814-50564607-e60e-4ae5-9ee4-907ee8fcc6c8%26entityType%3Dcollection%26workspaceId%3D92d281e7-9dab-409a-8c66-e779278043cc#?env%5BQuaifeRobert-HW3%5D=W3sia2V5IjoiSldUIiwidmFsdWUiOiIiLCJlbmFibGVkIjp0cnVlLCJ0eXBlIjoiYW55Iiwic2Vzc2lvblZhbHVlIjoiSldULi4uIiwiY29tcGxldGVTZXNzaW9uVmFsdWUiOiJKV1QgZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnBaQ0k2SWpZM1pEWm1NRGMyTVdJd01EWTVPV1ZrTURkalpHSTNaU0lzSW5WelpYSnVZVzFsSWpvaVltRjBiV0Z1TWlJc0ltbGhkQ0k2TVRjME1qRTFOalk1TUN3aVpYaHdJam94TnpReU1UWXdNamt3ZlEudGMtdUJlTnhKYk9fOE0yZTJKNngzMEJxY0h1Tm5KSzI1RFpTVWYtamM2ZyIsInNlc3Npb25JbmRleCI6MH0seyJrZXkiOiJtb3ZpZV9pZCIsInZhbHVlIjoiIiwiZW5hYmxlZCI6dHJ1ZSwidHlwZSI6ImFueSIsInNlc3Npb25WYWx1ZSI6IjY3ZDczMDM0NTBlMDRjZTY4N2M0OWU5YiIsImNvbXBsZXRlU2Vzc2lvblZhbHVlIjoiNjdkNzMwMzQ1MGUwNGNlNjg3YzQ5ZTliIiwic2Vzc2lvbkluZGV4IjoxfV0=)

## Postman for Review Functions
[<img src="https://run.pstmn.io/button.svg" alt="Run In Postman" style="width: 128px; height: 32px;">](https://app.getpostman.com/run-collection/41727814-0edfe93d-36b2-4d33-9f61-27ad21449032?action=collection%2Ffork&source=rip_markdown&collection-url=entityId%3D41727814-0edfe93d-36b2-4d33-9f61-27ad21449032%26entityType%3Dcollection%26workspaceId%3D92d281e7-9dab-409a-8c66-e779278043cc#?env%5BQuaifeRobert-HW3%5D=W3sia2V5IjoiSldUIiwidmFsdWUiOiIiLCJlbmFibGVkIjp0cnVlLCJ0eXBlIjoiYW55Iiwic2Vzc2lvblZhbHVlIjoiSldULi4uIiwiY29tcGxldGVTZXNzaW9uVmFsdWUiOiJKV1QgZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnBaQ0k2SWpZM1pEWm1NRGMyTVdJd01EWTVPV1ZrTURkalpHSTNaU0lzSW5WelpYSnVZVzFsSWpvaVltRjBiV0Z1TWlJc0ltbGhkQ0k2TVRjME16azRNRGcyTWl3aVpYaHdJam94TnpRek9UZzBORFl5ZlEuRzFPRVp0d2RERGJycG5sYUVnZFNJNFFBUFJZc3BQQ0gtSUNJVWlKMVhaWSIsInNlc3Npb25JbmRleCI6MH0seyJrZXkiOiJtb3ZpZV9pZCIsInZhbHVlIjoiIiwiZW5hYmxlZCI6dHJ1ZSwidHlwZSI6ImFueSIsInNlc3Npb25WYWx1ZSI6IjY3ZDc0MjhjNWQ5YmEyMWYyM2M1MWY3OCIsImNvbXBsZXRlU2Vzc2lvblZhbHVlIjoiNjdkNzQyOGM1ZDliYTIxZjIzYzUxZjc4Iiwic2Vzc2lvbkluZGV4IjoxfV0=)

## Explanation
This web service collects data on movies including specific info of each movie and the reviews for each movie.

### Create Account Sign-In
Register send the request and json body: https://webapi-assignment3.onrender.com/signup

Json Body Example:

<code>
{
    "name": "batman",
    "username": "batman2",
    "password": "penguin"
}
</code>

Sign-in request (be sure to save the JWT token): https://webapi-assignment3.onrender.com/signin

Json Body Example:

<code>
{
    "username": "batman2",
    "password": "penguin"
}
</code>


### Get Movies

***NOTE:*** be sure to add you JWT token to the header for most all requests. "Authorization": [Your JWT token from sign in]


Send request to: https://webapi-assignment3.onrender.com/movies

or with reviews:

https://webapi-assignment3.onrender.com/movies?reviews=true

### Get Specific Movie

Send request to: https://webapi-assignment3.onrender.com/movies/[Movie id i.e. "_id"]

or with reviews:

https://webapi-assignment3.onrender.com/movies/[Movie id i.e. "_id"]?reviews=true

### Insert Review Example
Send POST request to: https://webapi-assignment3.onrender.com/reviews

Example JSON Body:

<code>
{
    "username": "batman2",
    "movieId": "67d7432b5d9ba21f23c51f8e",
		"review": "Test",
		"rating": 5
  }
</code>

### Insert Movie Example
Send POST request to: https://webapi-assignment3.onrender.com/movies

Example JSON Body:

<code>
{
    "title": "Venom",
    "releaseDate": 2018,
    "genre": "Science Fiction",
    "actors": [
      {"actorName": "Tom Hardy", "characterName": "Eddie Brock / Venom"},
      {"actorName": "Michelle Williams", "characterName": "Anne Weying"},
      {"actorName": "Riz Ahmed", "characterName": "Carlton Drake / Riot"}
    ]
  }
</code>

## Environment Settings

DB = [Mongo Database Endpoint]

*For UNIQUE_KEY & SECRET_KEY You just need unique random text to generate JWT tokens.*

UNIQUE_KEY = examplekey

SECRET_KEY = examplesecretkey 

## Movie Routes

| Route | GET | POST | PUT | DELETE |
| --- | --- | --- | --- | --- |
| movies | Return all movies| save a single movie | FAIL | FAIL |
| movies/:movieparameter | Return a specific movie based on the :movieparameter | FAIL | Update the specific movie based on the :movieparameter in your case it’s the title | Delete the specific movie based on the :movieparamters your case it’s the title |*