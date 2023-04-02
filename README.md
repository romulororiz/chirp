# Chirp

Chirp is a social media application built with Next.js, trpc, TypeScript, and Tailwind CSS. (Not focused on styling)

## Features

- User authentication using [Clerk.dev](https://clerk.dev/) Github OAuth
- Posting functionality - Only emojis allowed 🐦🐦
- Deleting post functionality if current user is post owner
- Timeline displaying posts users
- Profile pages for each user, displaying their posts
- Responsive design using Tailwind CSS

## Tech Stack

- Next.js
- trpc
- TypeScript
- Tailwind CSS
- Clerk.dev
- Prisma
- Planetscale
- Upstash Redis

## Installation

1. Clone the repository:

```sh
git clone https://github.com/romulororiz/chirp.git
```

2. Navigate to the repository:

```sh
cd chirp
```

3. Install dependencies:

```sh
npm install
```

4. Set up environment variables. Rename the .env.example file to .env.local and fill in the required values:

```sh
# Prisma
# https://www.prisma.io/docs/reference/database-reference/connection-urls#env
DATABASE_URL=

# Clerk
# https://docs.clerk.dev/
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Upstash
# https://upstash.com/
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

5. Start the development server:

```sh
npm run dev
```

6. Navigate to http://localhost:3000 in your browser.

## Deployment

The application can be deployed using any cloud platform that supports Node.js applications. Some popular options include:

- [Vercel](https://vercel.com/)
- [Heroku](https://heroku.com/)
- [AWS Elastic Beanstalk](https://aws.amazon.com/pt/elasticbeanstalk/)
- [Google Cloud Platform](https://cloud.google.com/)

## Credits
This project was created by [T3.gg](https://twitter.com/t3dotgg) as a tutorial on the T3 Stack

## License
This project is licensed under the MIT License. See the LICENSE file for more information.
