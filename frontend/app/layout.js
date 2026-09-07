import '../styles/globals.css';
import '../styles/header.css';
import '../styles/login.css';
import '../styles/register.css';
import '../styles/balance.css';

export const metadata = {
  title: 'Virtual Arcade',
  description: 'Virtual Credit Gaming Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body suppressHydrationWarning={true}>{children}</body>
    </html>
  );
}
