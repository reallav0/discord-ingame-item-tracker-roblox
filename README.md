# Discord Item Tracker & Notification API (Commissions)

A **Discord bot + Express backend** that lets users subscribe to in-game item rotations for a Roblox game.
Players can track specific items and receive instant notifications via **DM or Discord channel** when the items reappear in the shop — powered by a secure API used by the Roblox game server.

---

## Features

* `/track` and `/untrack` slash commands for players
* Choose between **DM** or **channel notifications**
* Real-time item rotation updates via API (`/game/noti`)
* JSON-based local database (`subscriber.json`)
* Handles failed DMs gracefully (fallbacks to channel ping)
* Simple to host with Node.js + Express

---

## Tech Stack

* Node.js
* Discord.js v14
* Express
* dotenv
* fs (local JSON persistence)

---

## Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/ReallAv0/discord-item-tracker.git
   cd discord-item-tracker
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create `.env` file**

   ```bash
   TOKEN=your_discord_bot_token
   ```

4. **Run the bot + API**

   ```bash
   node index.js
   ```

The bot will start and the API will listen on `http://localhost:3000`.

---

## Slash Commands

| Command    | Description                                    |
| ---------- | ---------------------------------------------- |
| `/track`   | Start tracking an item (choose DM or channel). |
| `/untrack` | Stop tracking an item.                         |

---

## API Endpoint

### POST `/game/noti`

Used by your Roblox game server to push item rotation data.

**Request Body Example**

```json
[
  {
    "item_name": "Golden Sword",
    "price": "750",
    "description": "A rare limited sword now back in shop!",
    "image_id": "123456789"
  }
]
```

**Response**

```json
{ "message": "Notifications processed." }
```

---

## Example Flow

1. User runs `/track item_name: Golden Sword type: dm`
2. Roblox backend calls `/game/noti` when "Golden Sword" appears
3. The bot sends a DM or channel embed notification to the subscribed user

---

## Folder Structure

```
discord-item-tracker/
│
├── index.js             # Main bot + API file
├── subscriber.json      # Local database for tracked users
├── package.json
└── .env
```

---

## License

MIT License © 2025 ReallAv0
