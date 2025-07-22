-- Create application user with limited privileges
CREATE USER task_api_user WITH PASSWORD 'task_api_password';

-- Create databases
CREATE DATABASE task_api_test;

-- Grant privileges to the application user
GRANT ALL PRIVILEGES ON DATABASE task_api TO task_api_user;
GRANT ALL PRIVILEGES ON DATABASE task_api_test TO task_api_user;

-- Connect to databases and grant schema privileges
\connect task_api;
GRANT ALL ON SCHEMA public TO task_api_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO task_api_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO task_api_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO task_api_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO task_api_user;

\connect task_api_test;
GRANT ALL ON SCHEMA public TO task_api_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO task_api_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO task_api_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO task_api_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO task_api_user;