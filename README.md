# **[Competify](https://competify.vercel.app)**

Competify was founded on the belief that solving challenges together is not only more effective but also far more enjoyable than tackling them alone. Our goal was to create a platform that taps into our natural desire for connection and teamwork, making every challenge an opportunity to grow and succeed with others. Competify was designed to foster habit-building and motivate individuals to push their limits through engaging, friendly competitions. Whether you're looking to challenge friends, develop new skills, or simply stay accountable, Competify makes the journey fun and rewarding.

## **Features**

### 🔥 **Engaging Competitions**

- Create, join, and manage competitions tailored to your interests.
- Participate in challenges ranging from fitness and productivity to creative pursuits.
- Competitions can be set to repeat daily, weekly, or monthly to build consistent habits.
- Flexible rules allow for either numerical or qualitative submissions, making it adaptable to various types of challenges.

### 📈 **Track Progress**

- Submit achievements and track progress in real-time with detailed competition stats.
- Standings update dynamically to keep participants informed about their rankings.
- Preserve event histories, including priorities and policies, even if updated in the future.

### 🎯 **Build Habits**

- Focus on habit-building by participating in regular challenges.
- Set personal goals and push your limits within a supportive and competitive environment.

### 🤝 **Social Interaction**

- Invite friends using email or Discord to collaborate or compete in challenges.
- Manage team-based competitions or participate as an individual.
- Social features encourage interaction and foster a sense of community.

### 🛠️ **Customizable Challenges**

- Set custom rules, deadlines, and metrics for each competition.
- Choose from various submission types, including text, URLs, and images.
- Competitions support numerical and non-numerical scoring systems.

### 🌟 **Cross-Platform Compatibility**

- Log in seamlessly using Discord or a traditional email account.

### 📊 **Detailed Analytics**

- Gain insights into performance with analytics and visualizations.
- Identify strengths and areas for improvement.
- Celebrate milestones and track your growth over time.

### 🏆 **Event Management**

- Create and manage events within competitions, allowing for time-bound goals.
- Mark events as upcoming or previous to track historical data.
- Assign winners and preserve event-specific data, such as priorities and policies.

### 🎉 **Voting and Community Engagement**

- Allow participants to vote on submissions to decide winners in qualitative challenges.
- Encourage active engagement and fair judgment in competitions.

## **Getting Started**

### **Prerequisites**

To set up and run Competify, ensure you have the following installed:

- [Node.js](https://nodejs.org/)
- [PostgreSQL](https://www.theodinproject.com/lessons/nodejs-installing-postgresql)
- [Discord Developer Account](https://discord.com/developers/applications)

### **Installation**

1. Clone the repository:

```bash
git clone https://github.com/KKeySimon/competify.git
cd competify
```

2. Install server dependencies:

```bash
cd server
npm install
```

3. Configure server environment variables:

Create a `.env` file in the `server` directory and include the following:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/competify"
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret
CLIENT_URL=http://localhost:5173
SESSION_SECRET=any-generated-secret-key
AWS_S3_BUCKET=your-aws-s3-bucket (Not necessary)
MAILGUN_API_KEY=your-mailgun-api-key (Not necessary)
MAILGUN_DOMAIN=your-mailgun-domain (Not necessary)
```

4. Set up the database:

```bash
npx prisma migrate dev --name init
```

5. Install client dependencies:

```bash
cd ../client
npm install
```

6. Configure client environment variables:

Create a `.env` file in the `client` directory and include the following:

```env
VITE_SERVER_URL=http://localhost:3000
```

## Start the development environment:

- Start the server:

  ```bash
  cd ../server
  npm run dev
  ```

- Start the client:
  ```bash
  cd ../client
  npm run dev
  ```

## Access Competify:

Open your browser and navigate to `http://localhost:3000` for the server or `http://localhost:5173` (or another port if specified) for the client.

## **Technologies Used**

- **Frontend:** React, React Bootstrap, CSS Modules
- **Backend:** Node.js, Express, Passport.js
- **Database:** PostgreSQL, Prisma ORM
- **Authentication:** Passport Local and Discord OAuth2
- **File Storage:** AWS S3 (for profile pictures and other assets)

## **Contributing**

Contributions are welcome! Follow these steps to contribute:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Commit your changes and push them to your branch.
4. Create a pull request describing your changes.

## **Acknowledgments**

- Inspired by the drive to make personal growth fun and social.
- Built with love and a vision for a more motivated world.

## **Contact**

For inquiries, suggestions, or support, reach out via:

- Email: kkeysimon@gmail.com
- Discord: @kkey

Let’s build habits and grow together with **Competify**! 🚀
