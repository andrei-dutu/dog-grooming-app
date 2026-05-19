## Setup local

1. In terminal  run: `npm install`
2. Open Docker and run: `docker run --name dog-grooming-db -e POSTGRES_PASSWORD=parola -e POSTGRES_DB=dog_grooming_dev -p 5432:5432 -d postgres`
3. In the `/server` folder create a file named: `.env.local` and inside put: `DIRECT_URL="postgresql://postgres:parola@localhost:5432/dog_grooming_dev"`
4. Then run: `npm run db:push:local` for creating the tables in the docker database
5. For starting the app on localhost run: `npm run dev`
6. From now on, if you make changes to the database through prisma and want to push them you have to sync both databases so use: `npm run db:push:local` and `npm run db:push:prod`

## .env setup
1. Please add `JWT_SECRET="dog_grooming_secret_key_foarte_lunga_si_sigura"` in both you .env files
2. Please add `FRONTEND_URL=http://localhost:5173` in your .env.local file
3. Please add `FRONTEND_URL=trebuie stabilit :)` in yout .env file (after we have a domain)
