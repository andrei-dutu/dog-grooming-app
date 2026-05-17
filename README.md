## Setup local

1. In terminal  run: `npm install`
2. Open Docker and run: `docker run --name dog-grooming-db -e POSTGRES_PASSWORD=parola -e POSTGRES_DB=dog_grooming_dev -p 5432:5432 -d postgres`
3. In the `/server` folder create a file named: `.env.local` and inside put: `DIRECT_URL="postgresql://postgres:parola@localhost:5432/dog_grooming_dev"`
4. Then run: `npm run db:push:local` for creating the tables in the docker database
5. For starting the app on localhost run: `npm run dev`