# TODO: Fix Backend-Python Issues

- [x] Update requirements.txt to add jose and argon2-cffi
- [x] Fix imports in routers/auth.py (change ... to ..)
- [x] Create models/user.py with SQLModel User class
- [x] Create models/product.py with SQLModel Product class
- [x] Update security.py to add create_refresh_token function
- [x] Update routers/auth.py to use real refresh token and store in DB
- [x] Update main.py to use lifespan instead of on_event
- [x] Remove debug prints in config.py
- [x] Check and update models/refresh_token.py if needed
- [x] Install dependencies (attempted, but pip issues on Windows)
- [x] Create .env file
- [ ] Run the app
- [ ] Commit changes with git
