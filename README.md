# smart-closet-submission

See Devpost for a detailed project description.

## Environment Variables

This project utilized Auth0 for authentication and requires a `.env` file to run.
Create a `.env` file in the `\smart-closet-submission\smart-closet` directory and populate the following variables with your Auth0 values:

```
REACT_APP_AUTH0_DOMAIN=your-auth0-domain
REACT_APP_AUTH0_CLIENT_ID=your-auth0-client-id
REACT_APP_AUTH0_CALLBACK_URL=http://localhost:3000/callback
```

## Citations

- React was used throughout the project as the frontend framework.
- Code written by Prof. Joe Hummel was utilized for prototyping and interaction with AWS services.
  - Code for submitting and retrieving data to remote databases.
  - General structure of Lambda function handlers.
- OpenAI models were used for general purpose coding assistance.
- OpenAI and Google Gemini models were used to implement the core functionality of the webapp, namely extracting information from and generating images.
- Example code from Auth0 was used for creating the React components used for page-loading animations and route guarding.
  - Source: https://developer.auth0.com/resources/guides/spa/react/basic-authentication?_gl=1*5f2v0p*_gcl_au*MTIzMTk0MjMwMS4xNzQzODg0MTQz*_ga*NjQ3MzQ3Mzc5LjE3NDM4ODQxNDQ.*_ga_QKMSDV5369*MTc0MzkwODY0OC40LjEuMTc0MzkwODc3Ni4xLjAuMA..
- Material UI was used for styling front-end React components.
