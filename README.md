# COLORS LAMP Web Application

## Project Description

COLORS is a full-stack web application built using the LAMP stack (Linux, Apache, MySQL, PHP). The application allows users to:

* Log in with valid credentials
* Search for colors associated with their account
* Add new colors to their personal color list

Each user has their own set of stored colors in the database. The application demonstrates full-stack integration including database design, API development, and frontend interaction using JavaScript and AJAX.

---

## Technologies Used

* **Linux (Ubuntu)** – Hosted on a DigitalOcean Droplet
* **Apache** – Web server
* **MySQL** – Relational database
* **PHP** – Backend API endpoints
* **HTML5** – Frontend structure
* **CSS3** – Styling
* **JavaScript (Vanilla JS)** – Client-side logic and API calls
* **MD5 Hashing** – Password hashing on login

---

## Project Structure

```
colors-lamp/
│
├── api/                # PHP API endpoints
│   ├── AddColor.php
│   ├── Login.php
│   └── SearchColors.php
│
├── public/             # Frontend files
│   ├── index.html
│   ├── color.html
│   ├── css/
│   ├── js/
│   └── images/
│
├── README.md
├── LICENSE.md
└── .gitignore
```

---

## Database Setup Instructions

1. Log into MySQL:

```
mysql -u root -p
```

2. Create the database:

```sql
CREATE DATABASE COP4331;
USE COP4331;
```

3. Create required tables:

```sql
CREATE TABLE Users (
  ID INT NOT NULL AUTO_INCREMENT,
  FirstName VARCHAR(50) NOT NULL DEFAULT '',
  LastName VARCHAR(50) NOT NULL DEFAULT '',
  Login VARCHAR(50) NOT NULL DEFAULT '',
  Password VARCHAR(50) NOT NULL DEFAULT '',
  PRIMARY KEY (ID)
);

CREATE TABLE Colors (
  ID INT NOT NULL AUTO_INCREMENT,
  Name VARCHAR(50) NOT NULL DEFAULT '',
  UserID INT NOT NULL DEFAULT 0,
  PRIMARY KEY (ID)
);
```

4. (Optional) Insert sample data:

```sql
INSERT INTO Users (FirstName,LastName,Login,Password)
VALUES ('Sam','Hill','SamH','Test');

INSERT INTO Colors (Name,UserID)
VALUES ('Blue',1);
```

5. Create a MySQL user for the application:

```sql
CREATE USER 'DB_USERNAME' IDENTIFIED BY 'DB_PASSWORD';
GRANT ALL PRIVILEGES ON COP4331.* TO 'DB_USERNAME'@'%';
FLUSH PRIVILEGES;
```

6. Update the database credentials inside the PHP API files to match your MySQL configuration:

```php
$conn = new mysqli("localhost", "yourUsername", "yourPassword", "yourDatabase");
```

---

## How to Run the Application

### Option 1: Local Environment (XAMPP / MAMP)

1. Place the project folder inside:

   * `htdocs` (XAMPP) or
   * `www` (MAMP)

2. Start Apache and MySQL.

3. Open a browser and navigate to:

```
http://localhost/colors-lamp/public/index.html
```

---

### Option 2: Remote LAMP Server (DigitalOcean)

1. Provision a LAMP droplet.
2. Upload frontend files to:

```
/var/www/html/
```

3. Upload API files to:

```
/var/www/html/api/
```

4. Ensure MySQL database is configured.
5. Access the site via:

```
http://your-domain-or-ip/index.html
```

---

## Application Features

* User authentication (valid and invalid login handling)
* Add new color tied to logged-in user
* Search for existing colors
* Persistent storage via MySQL
* JSON-based API communication

---

## Assumptions and Limitations

* Database credentials must be manually configured.
* The application assumes a working LAMP environment.
* Passwords are stored using MD5 hashing (not suitable for production security).
* No advanced authentication (sessions or tokens) is implemented.
* No input validation beyond basic server-side prepared statements.
* Designed for educational purposes only.

---

## AI Usage Disclosure

AI tools were used to help make this README.md file

---

## License

This project is licensed under the MIT License. See `LICENSE.md` for details.
