# NEMT Booking — Non-Emergency Medical Transportation

A multi-step booking wizard built with **Vite**, **React 18**, and **Material UI v6**.

## Features

- **Step 1 — Passenger Details**: First name, last name, email, phone, date of birth, optional member/policy ID
- **Step 2 — Service & Needs**: Ambulatory or Wheelchair selection, number of passengers, companions, and comments
- **Step 3 — Trips**: Add, edit, and remove trips with pagination. Each trip captures pick_up_address address, drop_off_address address, date, and appointment time
- **Step 4 — Confirmation**: Full review of all entered data before final submission
## Pagese natigation

**1. Booking**: http://localhost:3000/?uuid=dd1c4215-… — the 4-step wizard (Passenger → Service → Trips → Confirm). Submit gives the success screen with the booking reference.

2. **Booking → Confirmation**: the success screen's "Confirmation page" button goes to /confirmation and now keeps the query string, so the uuid (and any title/subtitle branding) survives.

3. **Confirmation directly**: http://localhost:3000/confirmation?uuid=dd1c4215-… — the passenger enters their booking reference and sees the status card: pending → (once dispatch marks it accepted) the Square payment form with the server's amount → confirmed after paying. This is the link a patient returns to later, since payment only opens after approval.




## Prerequisites

- **Node.js 18.20.5** (LTS) — [download here](https://nodejs.org/)
- **npm 10.x** (comes with Node.js)

Verify your installation:

```bash
node --version   # should print v18.20.5
npm --version    # should print 10.x
```

### Exact Versions Used

This project uses **locked dependency versions** to ensure consistent builds:

- **React**: 18.3.1
- **Material UI**: 6.1.10
- **Vite**: 5.4.11
- **Node.js**: 18.20.5 (specified in `.nvmrc`)

All dependencies are pinned (no `^` or `~`), and `package-lock.json` is included for deterministic installs.

## Getting Started

### 1. Extract the project

Unzip the downloaded archive:

```bash
unzip nemt-booking.zip
cd nemt-booking
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

The app will open automatically at **http://localhost:3000**

### 4. Build for production

```bash
npm run build
```

The optimized output will be in the `dist/` folder. You can preview it with:

```bash
npm run preview
```

## Project Structure

```
nemt-booking/
├── index.html                  # HTML entry point
├── package.json                # Dependencies and scripts
├── vite.config.js              # Vite configuration
├── README.md
└── src/
    ├── main.jsx                # React root with ThemeProvider
    ├── App.jsx                 # Wizard orchestrator + stepper + state
    ├── theme/
    │   └── theme.js            # MUI custom theme (palette, typography, components)
    └── components/
        ├── PassengerDetails.jsx   # Step 1
        ├── ServiceStep.jsx        # Step 2
        ├── TripsStep.jsx          # Step 3
        └── Confirmation.jsx       # Step 4
```

## Customization

- **Theme colors**: Edit `src/theme/theme.js` to change the primary/secondary palette
- **Service types**: Update the `SERVICES` array in `ServiceStep.jsx`
- **Trip fields**: Add or remove fields in `TripsStep.jsx` and update validation
- **Fonts**: Change the Google Fonts import in `index.html` and update `theme.js`
