# Room Management System

A comprehensive room management system built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## Features

- User authentication and role-based access control
- Block and room management
- Bed allocation and tracking
- Accommodation request handling
- Dashboard for different user roles (System Admin, Admin, Block Head)
- Real-time statistics and reporting

## Tech Stack

- Frontend: React.js, Redux Toolkit, React Bootstrap
- Backend: Node.js, Express.js
- Database: MongoDB
- Authentication: JWT

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd room-management-system
```

2. Install dependencies:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Create a `.env` file in the server directory with the following variables:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

4. Start the development servers:
```bash
# Start backend server (from server directory)
npm run dev

# Start frontend server (from client directory)
npm start
```

## Project Structure

```
├── client/                 # Frontend React application
│   ├── public/            # Static files
│   └── src/               # React source files
│       ├── components/    # Reusable components
│       ├── pages/         # Page components
│       ├── redux/         # Redux store and slices
│       └── services/      # API services
│
└── server/                # Backend Node.js application
    ├── controllers/       # Route controllers
    ├── middleware/        # Custom middleware
    ├── models/           # Database models
    ├── routes/           # API routes
    └── utils/            # Utility functions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Collaboration Guidelines

### Setting Up for Collaboration

1. **Clone the Repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/room-management-system.git
   cd room-management-system
   ```

2. **Set Up Remote**
   ```bash
   # Add the original repository as upstream
   git remote add upstream https://github.com/ORIGINAL_OWNER/room-management-system.git
   
   # Verify remotes
   git remote -v
   ```

3. **Keep Your Fork Updated**
   ```bash
   # Fetch changes from upstream
   git fetch upstream
   
   # Switch to main branch
   git checkout main
   
   # Merge upstream changes
   git merge upstream/main
   ```

### Best Practices for Collaboration

1. **Branch Management**
   - Create feature branches for new features
   - Create bugfix branches for bug fixes
   - Use descriptive branch names (e.g., `feature/user-authentication`, `bugfix/login-error`)

2. **Commit Messages**
   - Use clear and descriptive commit messages
   - Follow the format: `type(scope): description`
   - Example: `feat(auth): add user login functionality`

3. **Code Review Process**
   - Review code before submitting PRs
   - Ensure all tests pass
   - Update documentation if needed
   - Respond to review comments promptly

4. **Communication**
   - Use GitHub Issues for bug reports and feature requests
   - Use Pull Request comments for code-related discussions
   - Keep the team informed about major changes

5. **Development Workflow**
   - Pull latest changes before starting new work
   - Create new branches from updated main
   - Test changes locally before pushing
   - Keep PRs focused and manageable in size

### Getting Help

- Open an issue for bugs or feature requests
- Check existing issues before creating new ones
- Use the issue templates when available
- Tag relevant team members when needed

## License

This project is licensed under the MIT License. 