// components/Footer.tsx
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-12 pt-6 pb-6 border-t border-stone-200 text-center text-sm text-stone-500">
      <p>© {currentYear} Beer Chronicles. All rights reserved.</p>
      <p className="mt-1">
        Built with 🍻 by Martin Schmidt
      </p>
    </footer>
  );
}
