# Simple Dairy Records Manager

### A simple dairy records manager built with express.js and sequelize orm

### Features

- Manage users
- Manage milk records
- Manage payment rates
- Generate reports

### To get started,

1. Clone this repo and `cd simple-dairy-record-manager`
2. Run `yarn install`
3. Create a .env file in your project root directory with the following (replace the database values with your own)
  ```
  DB_HOST=
  DB_NAME=
  DB_USER=
  DB_PASSWORD=
  DB_DIALECT=mariadb
  PORT=3000
  NODE_ENV=development
  ```
4. Run `yarn start`
   
### User roles
####Admin
Can manage all users, milk records, rates and generate reports.
To create an admin user, enter `localhost:3000/accounts/register` and register as a farmer. You can then use a tool like phpmyadmin to access the database and change the role to admin.
Enter `localhost:3000/admin/login` in your browser to login as an admin

####Milk collector
Can manage milk records.
To create a milk collector, login as an admin and create a user with milk collector role.
Enter `loalhost:3000/account/login` to login as a farmer.

####Farmer
Can view their own milk records. To create as a farmer, enter `localhost:3000` and register as a farmer.   
Enter `loalhost:3000/account/login` to login as a farmer.

