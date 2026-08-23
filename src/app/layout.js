import "./globals.css";

export const metadata = {
  title: "Huddle Ledger",
  description:
    "A Vibes TCG collection tracker and decklist manager — track owned cards, build decks, and see what's missing to complete each list.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🐧</text></svg>" />
      </head>
      <body>{children}</body>
    </html>
  );
}
