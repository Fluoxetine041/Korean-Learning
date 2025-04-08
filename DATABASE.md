# Database Setup and Troubleshooting

This document provides information about the database setup and common issues you might encounter.

## Starting the Application

We've created a convenient script to start the application with all the necessary services:

```bash
npm run start
```

This script will:
1. Stop and restart PostgreSQL and Adminer containers
2. Wait for the database to be ready
3. Generate the Prisma client
4. Start the Nuxt.js development server on port 64550

The application will be available at:
- **Frontend**: http://localhost:64550
- **Adminer**: http://localhost:64549

## File Permission Issues

If you encounter file permission errors related to the PostgreSQL data directory:

```
Error: EACCES: permission denied, watch '/path/to/postgres_data/pgdata'
```

These occur because Nuxt's file watcher (Chokidar) tries to monitor the PostgreSQL data directory, which has restricted permissions.

### Solutions

1. **Use Our Start Script**  
   The `npm run start` command uses optimized file watching settings.

2. **Manual Configuration**  
   If you need to start the app manually, you can:
   
   ```bash
   # Disable polling and increase the interval to reduce file system access
   export CHOKIDAR_USEPOLLING=0
   export CHOKIDAR_INTERVAL=1000
   npm run dev
   ```

3. **Nuxt Configuration**  
   Our `nuxt.config.ts` already includes settings to ignore PostgreSQL data directories:
   
   ```javascript
   vite: {
     server: {
       watch: {
         ignored: [
           '**/postgres_data/**',
           '**/node_modules/**',
           '**/.git/**'
         ]
       }
     }
   }
   ```

## Database Management

- **View/Edit Data**: Access Adminer at http://localhost:8080
- **Prisma Studio**: Run `npm run prisma:studio` to launch the visual database editor

## Docker Volume

The PostgreSQL data is stored in a named volume `english_learning_pg_data`, which persists your data between Docker restarts. 