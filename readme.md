# jwt-auth-service

Node.js microservice with OpenAPI v3 specs for authentication using JWT tokens on a MySQL backend

![Preview](https://github.com/dhruv-m-patel/jwt-auth-service/blob/master/openapi-spec.png)

### Setup

```
git clone git@github.com:dhruv-m-patel/jwt-auth-service.git
cd jwt-auth-service
cp .env.example .env # update environment variables with appropriate config to connect to mysql backend
npm ci
npm run build
npm run start-dev
```

Visit http://localhost:5000/api/docs/ to view OpenAPI Specs for the service

Try `requests.rest` (assuming you have REST Client extension installed) to fire api calls
